import pandas as pd
import pdfplumber
import os
import re
from datetime import datetime
from slugify import slugify
from utils import match_councilor_id, get_term_info

# --- IMPORTS FOR OCR ---
import pytesseract
from pdf2image import convert_from_path

DOCS_CSV = "pipeline/data/documents.csv"
MEMBERS_CSV = "pipeline/data/term_members.csv"
PDF_DIR = "pipeline/data/pdfs"

PREFIXES = [
    "Hon.", "S.B. Member", "Municipal Vice Mayor", "Presiding Officer",
    "Ms.", "Mr.", "City", "Mayor", "Vice", "Secretary", "Councilor"
]

def clean_name_string(line):
    parts = re.split(r'\s{2,}', line.strip())
    name_part = parts[0]
    for prefix in PREFIXES:
        name_part = name_part.replace(prefix, "")
    return name_part.strip().strip(',').strip()

def normalize_date(date_str):
    if not date_str:
        return None
    date_str = str(date_str).strip().replace("\n", " ").replace(",", "").replace(".", "")
    formats = [
        "%B %d %Y", "%b %d %Y", "%m/%d/%Y",
        "%m/%d/%y", "%Y-%m-%d", "%d day of %B %Y"
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None

def find_date_in_string(text):
    if not isinstance(text, str):
        return None
    match = re.search(r'\b(\d{1,2}/\d{1,2}/\d{2,4})\b', text)
    if match:
        return normalize_date(match.group(1))
    match = re.search(r'\b([A-Z][a-z]{2,9}\.?\s+\d{1,2},?\s+\d{4})\b', text)
    if match:
        return normalize_date(match.group(1))
    return None

def parse_absent_from_text(text):
    text_upper = text.upper()
    idx_absent = text_upper.find("ABSENT")
    if idx_absent == -1:
        return []

    idx_body = -1
    for marker in [
        "RESOLUTION NO", "ORDINANCE NO", "EXCERPTS FROM",
        "WHEREAS", "VISITORS", "GUESTS", "UNANIMOUSLY"
    ]:
        idx = text_upper.find(marker, idx_absent + 6)
        if idx != -1:
            idx_body = idx
            break

    end = idx_body if idx_body != -1 else len(text)
    block = text[idx_absent:end]
    block = re.sub(r'ABSENT\s*:?', '', block, flags=re.IGNORECASE).strip()

    if "NONE" in block.upper() or len(block) < 3:
        return []

    absent_names = []
    for line in block.split('\n'):
        clean = clean_name_string(line)
        if len(clean) > 3:
            absent_names.append(clean)
    return absent_names

def get_pdf_text_smart(pdf_path):
    text = ""
    is_ocr = False

    try:
        with pdfplumber.open(pdf_path) as pdf:
            if len(pdf.pages) > 0:
                text = pdf.pages[0].extract_text() or ""
    except:
        pass

    if len(text) < 100:
        try:
            images = convert_from_path(
                pdf_path,
                first_page=1,
                last_page=1,
                dpi=300
            )
            if images:
                text = pytesseract.image_to_string(images[0])
                is_ocr = True
        except Exception:
            pass

    return text, is_ocr

def parse_pdfs():
    if not os.path.exists(DOCS_CSV) or not os.path.exists(MEMBERS_CSV):
        print("❌ Missing CSVs.")
        return

    df_docs = pd.read_csv(DOCS_CSV).fillna("")
    df_roster = pd.read_csv(MEMBERS_CSV).fillna("")

    stats = {
        "processed": 0,
        "skipped": 0,
        "dates_from_csv": 0,
        "dates_from_pdf": 0,
        "ocr_triggered": 0,
        "absences_found": 0,
        "perfect_attendance": 0
    }

    print("------------------------------------------------")
    print("🔍 Scanning PDFs (With OCR Fallback)...")

    if 'absent_ids' not in df_docs.columns:
        df_docs['absent_ids'] = ""

    for index, row in df_docs.iterrows():
        stats["processed"] += 1

        filename = row.get('filename')
        if not filename:
            continue

        # --- FAST SKIP IF ALREADY COMPLETE ---
        has_date = bool(row.get('date_enacted')) and row['date_enacted'] != "Check PDF"
        has_absent = isinstance(row.get('absent_ids'), str) and row['absent_ids'].strip() != ""
        if has_date and has_absent:
            stats["skipped"] += 1
            continue

        pdf_path = f"{PDF_DIR}/{row['type']}s/{filename}"

        final_date = None

        if row['date_enacted'] and row['date_enacted'] != "Check PDF":
            final_date = row['date_enacted']

        if not final_date:
            final_date = find_date_in_string(row['title'])
            if not final_date:
                final_date = find_date_in_string(row['raw_author_text'])
            if final_date:
                stats["dates_from_csv"] += 1

        pdf_text = ""
        should_read_pdf = (not final_date) or (row['type'] in ['resolution', 'ordinance'])

        if should_read_pdf and os.path.exists(pdf_path):
            pdf_text, was_ocr = get_pdf_text_smart(pdf_path)
            if was_ocr:
                stats["ocr_triggered"] += 1

            if not final_date:
                date_match = re.search(
                    r'HELD\s+ON\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})',
                    pdf_text,
                    re.IGNORECASE | re.DOTALL
                )
                if date_match:
                    clean = normalize_date(date_match.group(1).replace('\n', ' '))
                    if clean:
                        final_date = clean
                        stats["dates_from_pdf"] += 1

        if final_date:
            df_docs.at[index, 'date_enacted'] = final_date
            term_info = get_term_info(final_date)
            if term_info:
                df_docs.at[index, 'term_id'] = term_info['id']
                if row['type'] != 'executive_order':
                    df_docs.at[index, 'session_id'] = f"{term_info['id']}_{final_date}"

        current_term = df_docs.at[index, 'term_id']

        if pdf_text and row['type'] in ['resolution', 'ordinance'] and current_term != "unknown_term":
            raw_absent = parse_absent_from_text(pdf_text)
            absent_ids = []

            if raw_absent:
                term_roster = df_roster[df_roster['term_id'] == current_term]
                for name in raw_absent:
                    matched_id = match_councilor_id(name, term_roster)
                    if matched_id:
                        absent_ids.append(matched_id)

                if len(absent_ids) > 0:
                    stats["absences_found"] += 1
            else:
                stats["perfect_attendance"] += 1

            df_docs.at[index, 'absent_ids'] = ",".join(absent_ids)

        if index % 50 == 0:
            df_docs.to_csv(DOCS_CSV, index=False)
            print(
                f"   Processed {index} files "
                f"(skipped: {stats['skipped']})..."
            )

    df_docs.to_csv(DOCS_CSV, index=False)

    print("\n📊 === PROCESSING STATISTICS ===")
    print(f"   Documents Processed:     {stats['processed']}")
    print(f"   Files Skipped:           {stats['skipped']}")
    print(f"   Dates Found in CSV Text: {stats['dates_from_csv']}")
    print(f"   OCR Pages Processed:     {stats['ocr_triggered']}")
    print(f"   Dates Recovered via PDF: {stats['dates_from_pdf']}")
    print(f"   Attendance Logs Found:   {stats['absences_found']}")
    print(f"   Perfect Attendance Logs: {stats['perfect_attendance']}")
    print("=============================\n")

if __name__ == "__main__":
    parse_pdfs()
