"""
PDF Parser for Legislative Documents

Extracts metadata and content from legislative PDFs with:
- Robust text extraction (with OCR fallback)
- Attendance parsing (absent-only model)
- Date extraction from multiple sources
- Comprehensive error logging
- Failed parse tracking for manual review
"""

import pandas as pd
import os
import re
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, asdict

# Local imports
from utils import match_councilor_id, get_term_info
from text_extractor import extract_with_retry, clean_text, ExtractionError, ExtractionResult

# Configuration
DATA_DIR = Path(__file__).parent / "data"
DOCS_CSV = DATA_DIR / "documents.csv"
MEMBERS_CSV = DATA_DIR / "term_members.csv"
PDF_DIR = DATA_DIR / "pdfs"
TEXT_DIR = DATA_DIR / "texts"  # New: Directory for saved text files
ERRORS_DIR = DATA_DIR / "errors"
LOGS_DIR = Path("pipeline/logs")

# Ensure directories exist
ERRORS_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Name parsing prefixes
PREFIXES = [
    "Hon.", "S.B. Member", "Municipal Vice Mayor", "Presiding Officer",
    "Ms.", "Mr.", "City", "Mayor", "Vice", "Secretary", "Councilor"
]

# Logging setup
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOGS_DIR / "parse.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


@dataclass
class ParseStats:
    """Track parsing statistics"""
    processed: int = 0
    skipped: int = 0
    skipped_reextract: int = 0  # Used cached text files
    dates_from_csv: int = 0
    dates_from_pdf: int = 0
    ocr_triggered: int = 0
    ocr_high_confidence: int = 0
    ocr_low_confidence: int = 0
    extraction_failures: int = 0
    absences_found: int = 0
    perfect_attendance: int = 0
    date_fallbacks: int = 0

    def print_summary(self):
        print("\n📊 === PROCESSING STATISTICS ===")
        print(f"   Documents Processed:       {self.processed}")
        print(f"   Files Skipped (complete):  {self.skipped}")
        print(f"   Used Cached Text:          {self.skipped_reextract}")
        print(f"   Dates Found in CSV Text:   {self.dates_from_csv}")
        print(f"   OCR Pages Processed:       {self.ocr_triggered}")
        print(f"   └─ High Confidence (>70%): {self.ocr_high_confidence}")
        print(f"   └─ Low Confidence (<70%):  {self.ocr_low_confidence}")
        print(f"   Dates Recovered via PDF:   {self.dates_from_pdf}")
        print(f"   Extraction Failures:       {self.extraction_failures}")
        print(f"   Attendance Logs Found:     {self.absences_found}")
        print(f"   Perfect Attendance Logs:   {self.perfect_attendance}")
        print(f"   Date Fallbacks to Title:   {self.date_fallbacks}")
        print("=" * 29 + "\n")


def clean_name_string(line: str) -> str:
    """Extract clean name from attendance line"""
    if not line:
        return ""

    parts = re.split(r'\s{2,}', line.strip())
    name_part = parts[0]

    for prefix in PREFIXES:
        name_part = name_part.replace(prefix, "")

    return name_part.strip().strip(',').strip()


def normalize_date(date_str: str) -> Optional[str]:
    """Normalize various date formats to ISO 8601 (YYYY-MM-DD)"""
    if not date_str:
        return None

    date_str = str(date_str).strip().replace("\n", " ").replace(",", "").replace(".", "")

    formats = [
        "%B %d %Y", "%b %d %Y", "%m/%d/%Y",
        "%m/%d/%y", "%Y-%m-%d", "%d day of %B %Y",
        "%B %d %Y", "%B %d, %Y", "%b %d, %Y",
        "%d %B %Y", "%d %b %Y"
    ]

    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue

    return None


def find_date_in_string(text: str) -> Optional[str]:
    """Extract date from text using regex patterns"""
    if not isinstance(text, str):
        return None

    # Try MM/DD/YYYY format
    match = re.search(r'\b(\d{1,2}/\d{1,2}/\d{2,4})\b', text)
    if match:
        return normalize_date(match.group(1))

    # Try Month DD, YYYY format
    match = re.search(r'\b([A-Z][a-z]{2,9}\.?\s+\d{1,2},?\s+\d{4})\b', text)
    if match:
        return normalize_date(match.group(1))

    return None


def parse_absent_from_text(text: str) -> List[str]:
    """
    Parse absent councilors from session text.

    Returns list of absent names (cleaned but not matched to IDs yet)
    """
    if not text:
        return []

    text_upper = text.upper()
    idx_absent = text_upper.find("ABSENT")

    if idx_absent == -1:
        return []

    # Find the end of the absent section
    idx_body = -1
    for marker in [
        "RESOLUTION NO", "ORDINANCE NO", "EXCERPTS FROM",
        "WHEREAS", "VISITORS", "GUESTS", "UNANIMOUSLY",
        "BE IT RESOLVED", "BE IT ORDAINED"
    ]:
        idx = text_upper.find(marker, idx_absent + 6)
        if idx != -1:
            idx_body = idx
            break

    end = idx_body if idx_body != -1 else len(text)
    block = text[idx_absent:end]

    # Remove the "ABSENT:" prefix
    block = re.sub(r'ABSENT\s*:?', '', block, flags=re.IGNORECASE).strip()

    # Check for "NONE" or empty
    if "NONE" in block.upper() or len(block) < 3:
        return []

    # Parse names from the block
    absent_names = []
    for line in block.split('\n'):
        clean = clean_name_string(line)
        if len(clean) > 3:
            absent_names.append(clean)

    return absent_names


def extract_session_date(pdf_text: str) -> Optional[str]:
    """Extract session date from PDF text"""
    if not pdf_text:
        return None

    # Look for "HELD ON January 15, 2024" pattern
    patterns = [
        r'HELD\s+ON\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})',
        r'HELD\s+this\s+(\d{1,2})(?:st|nd|rd|th)?\s+day\s+of\s+([A-Za-z]+),?\s+(\d{4})',
        r'Meeting\s+of\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})',
    ]

    for pattern in patterns:
        match = re.search(pattern, pdf_text, re.IGNORECASE | re.DOTALL)
        if match:
            date_str = match.group(1) if match.lastindex == 1 else f"{match.group(1)} {match.group(2)} {match.group(3)}"
            clean = normalize_date(date_str.replace('\n', ' '))
            if clean:
                return clean

    return None


def log_extraction_error(filename: str, doc_type: str, pdf_url: str, result: ExtractionResult):
    """Log failed extraction for manual review"""
    error = ExtractionError(
        filename=filename,
        doc_type=doc_type,
        pdf_url=pdf_url,
        error_type="extraction_failure" if not result.success else "low_quality",
        error_message=result.error or "Low OCR confidence",
        timestamp=datetime.now().isoformat(),
        attempted_methods=[result.method_used],
        pages_processed=result.pages_processed
    )
    error.save()
    logger.error(f"Logged extraction error for {filename}")


def parse_pdfs():
    """Main parsing function"""

    # Validate inputs
    if not os.path.exists(DOCS_CSV):
        logger.error(f"Documents CSV not found: {DOCS_CSV}")
        return

    if not os.path.exists(MEMBERS_CSV):
        logger.error(f"Members CSV not found: {MEMBERS_CSV}")
        return

    # Load data
    df_docs = pd.read_csv(DOCS_CSV).fillna("")
    df_roster = pd.read_csv(MEMBERS_CSV).fillna("")

    # Ensure absent_ids column exists
    if 'absent_ids' not in df_docs.columns:
        df_docs['absent_ids'] = ""

    # Initialize stats
    stats = ParseStats()

    print("------------------------------------------------")
    print("🔍 Scanning PDFs (With OCR Fallback)...")

    for index, row in df_docs.iterrows():
        stats.processed += 1

        filename = row.get('filename')
        if not filename:
            continue

        # --- FAST SKIP IF ALREADY COMPLETE ---
        has_date = bool(row.get('date_enacted')) and row['date_enacted'] != "Check PDF"
        has_absent = isinstance(row.get('absent_ids'), str) and row['absent_ids'].strip() != ""

        # For resolutions and ordinances, check if we have both date and attendance
        # For executive orders, just check date
        needs_attendance = row['type'] in ['resolution', 'ordinance']

        if has_date and (not needs_attendance or has_absent):
            stats.skipped += 1
            continue

        pdf_path = f"{PDF_DIR}/{row['type']}s/{filename}"

        # --- DATE EXTRACTION ---
        final_date = None

        # 1. Check existing CSV value
        if row['date_enacted'] and row['date_enacted'] != "Check PDF":
            final_date = row['date_enacted']

        # 2. Try to find date in title/author text
        if not final_date:
            final_date = find_date_in_string(row.get('title', ''))
            if not final_date:
                final_date = find_date_in_string(row.get('raw_author_text', ''))
            if final_date:
                stats.dates_from_csv += 1

        # --- PDF TEXT EXTRACTION (if needed) ---
        pdf_text = ""
        should_read_pdf = (not final_date) or needs_attendance

        if should_read_pdf:
            # First, try to read from saved text file
            text_file_path = TEXT_DIR / f"{row['type']}s" / filename.rsplit('.', 1)[0] + '.txt'

            if text_file_path.exists():
                # Read from saved text file (fast, no OCR)
                pdf_text = text_file_path.read_text(encoding='utf-8')
                stats.skipped_reextract += 1  # Track that we used cached text
            elif os.path.exists(pdf_path):
                # No saved text - fall back to OCR (slow)
                try:
                    extraction_result = extract_with_retry(
                        pdf_path,
                        max_retries=2
                    )

                    if extraction_result.success:
                        pdf_text = extraction_result.text

                        # Track OCR stats
                        if extraction_result.method_used == "ocr":
                            stats.ocr_triggered += 1
                            if extraction_result.ocr_confidence:
                                if extraction_result.ocr_confidence > 70:
                                    stats.ocr_high_confidence += 1
                                else:
                                    stats.ocr_low_confidence += 1

                                    # Log low confidence for review
                                    if extraction_result.ocr_confidence < 50:
                                        log_extraction_error(
                                            filename,
                                            row['type'],
                                            row.get('pdf_url', ''),
                                            extraction_result
                                        )
                    else:
                        stats.extraction_failures += 1
                        log_extraction_error(
                            filename,
                            row['type'],
                            row.get('pdf_url', ''),
                            extraction_result
                        )

                except Exception as e:
                    logger.error(f"Error processing {filename}: {e}")
                    stats.extraction_failures += 1

        # --- DATE FROM PDF ---
        if not final_date and pdf_text:
            session_date = extract_session_date(pdf_text)
            if session_date:
                final_date = session_date
                stats.dates_from_pdf += 1

        # --- FALLBACK: Try harder to extract date from PDF ---
        if not final_date and pdf_text:
            # Try various date patterns
            for pattern in [
                r'\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b',
                r'\b(\d{1,2}/\d{1,2}/\d{4})\b',
            ]:
                match = re.search(pattern, pdf_text)
                if match:
                    final_date = normalize_date(match.group(1) if match.lastindex else match.group(0))
                    if final_date:
                        stats.dates_from_pdf += 1
                        stats.date_fallbacks += 1
                        break

        # --- UPDATE DATE AND TERM INFO ---
        if final_date:
            df_docs.at[index, 'date_enacted'] = final_date
            term_info = get_term_info(final_date)
            if term_info:
                df_docs.at[index, 'term_id'] = term_info['id']
                if row['type'] != 'executive_order':
                    df_docs.at[index, 'session_id'] = f"{term_info['id']}_{final_date}"

        current_term = df_docs.at[index, 'term_id']

        # --- ATTENDANCE PARSING (for resolutions/ordinances) ---
        if pdf_text and needs_attendance and current_term and current_term != "unknown_term":
            raw_absent = parse_absent_from_text(pdf_text)
            absent_ids = []

            if raw_absent:
                # Match names to IDs
                term_roster = df_roster[df_roster['term_id'] == current_term]
                for name in raw_absent:
                    matched_id = match_councilor_id(name, term_roster)
                    if matched_id:
                        absent_ids.append(matched_id)
                    else:
                        logger.warning(f"Could not match absent councilor: {name}")

                if len(absent_ids) > 0:
                    stats.absences_found += 1
                    df_docs.at[index, 'absent_ids'] = ",".join(absent_ids)
            else:
                stats.perfect_attendance += 1
                # Empty string means no absences (all present)
                df_docs.at[index, 'absent_ids'] = ""

        # --- PROGRESS UPDATE ---
        if index % 50 == 0:
            df_docs.to_csv(DOCS_CSV, index=False)
            logger.info(f"   Processed {index} files (skipped: {stats.skipped})...")

    # --- FINAL SAVE ---
    df_docs.to_csv(DOCS_CSV, index=False)

    # --- PRINT SUMMARY ---
    stats.print_summary()

    # --- ERROR SUMMARY ---
    error_files = list(ERRORS_DIR.glob("*.json"))
    if error_files:
        print(f"\n⚠️  {len(error_files)} files need manual review")
        print(f"    See: {ERRORS_DIR}/")


if __name__ == "__main__":
    parse_pdfs()
