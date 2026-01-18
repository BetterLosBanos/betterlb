import pandas as pd
import os
import re
from datetime import datetime
from utils import generate_id, get_term_info

CSV_PATH = "pipeline/data/documents.csv"

# --- CONFIGURATION ---
ACRONYMS = [
    "LGU", "DILG", "PNP", "BFP", "BJMP", "DOH", "DepEd", "DSWD",
    "MDRRMC", "LDRRMO", "SK", "ABC", "SB", "LB", "PDAO", "GSO",
    "HRMO", "MOA", "MOU", "BFARMC", "TODA", "PWD", "OSCA", "ZOD",
    "MSWDO", "MENRO", "OBO"
]
SMALL_WORDS = ["of", "the", "and", "or", "in", "on", "at", "to", "for", "a", "an", "with", "by", "ng", "mga", "sa"]

AUTHOR_PREFIX_PATTERN = re.compile(
    r'(?i)'
    r'(councilor|councillor|councilwoman|councillwoman|'
    r'konsehala|konsehal|mayor|hon)'
    r'\s*\(s\)?\.?',
)




# --- HELPERS ---

def extract_date_from_text(text):
    if not isinstance(text, str):
        return None

    match = re.search(r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', text)
    if match:
        raw = match.group(1).replace('-', '/')
        try:
            if len(raw.split('/')[-1]) == 2:
                return datetime.strptime(raw, "%m/%d/%y").strftime("%Y-%m-%d")
            return datetime.strptime(raw, "%m/%d/%Y").strftime("%Y-%m-%d")
        except:
            pass

    match = re.search(r'([A-Z][a-z]+ \d{1,2},? \d{4})', text)
    if match:
        raw = match.group(1).replace(',', '')
        for fmt in ["%B %d %Y", "%b %d %Y"]:
            try:
                return datetime.strptime(raw, fmt).strftime("%Y-%m-%d")
            except:
                pass
    return None

def smart_title_case(text):
    if not text:
        return ""
    text = str(text)
    caps_count = sum(1 for c in text if c.isupper())
    if len(text) > 0 and (caps_count / len(text)) < 0.6:
        return text

    words = text.lower().split()
    new_words = []

    for i, word in enumerate(words):
        clean_word = re.sub(r'[^\w\s]', '', word)
        acronym_match = next((a for a in ACRONYMS if a.lower() == clean_word), None)

        if acronym_match:
            new_words.append(acronym_match)
        elif word in SMALL_WORDS and i != 0:
            new_words.append(word)
        else:
            new_words.append(word.capitalize())

    return " ".join(new_words)

def fix_encoding_errors(text):
    if not text:
        return ""
    text = str(text)

    def replacer(match):
        return match.group(0).replace("?", "Ñ" if match.group(0).isupper() else "ñ")

    text = re.sub(r'ba\?os', replacer, text, flags=re.IGNORECASE)
    text = re.sub(r'ca\?on', replacer, text, flags=re.IGNORECASE)
    text = re.sub(r'los banos', lambda m: m.group(0).replace("Banos", "Baños").replace("BANOS", "BAÑOS"), text, flags=re.IGNORECASE)
    return text

def clean_standard_number(val):
    if not val:
        return ""
    val = str(val)
    patterns = [
        r'\(OLD\)', r'\(NEW\)', r'Ordinance\s*No\.?', r'Resolution\s*No\.?',
        r'Res\.\s*No\.?', r'Ord\.\s*No\.?', r'Series\s*of'
    ]
    for pat in patterns:
        val = re.sub(pat, '', val, flags=re.IGNORECASE)
    return " ".join(val.replace('_', '-').replace(' - ', '-').split())

def format_eo_number(val):
    if not val:
        return ""
    val = str(val)
    year = re.search(r'\b(20\d{2})\b', val)
    number = re.search(r'\b(\d+)\b', val.replace(year.group(1), "") if year else val)
    if year and number:
        return f"{year.group(1)}-{number.group(1).zfill(3)}"
    return clean_standard_number(val)

def normalize_author_text(text):
    if not text:
        return ""

    text = fix_encoding_errors(text)
    text = re.sub(r'[\x00-\x1f]+', ' ', text)
    text = AUTHOR_PREFIX_PATTERN.sub('', text)

    text = re.sub(r'\band\b', ',', text, flags=re.IGNORECASE)
    names = re.split(r'[,\n]+', text)

    cleaned = []
    for n in names:
        n = n.strip()
        if len(n) > 3:
            cleaned.append(smart_title_case(n))

    return ", ".join(dict.fromkeys(cleaned))

def extract_author_from_title(title):
    if not title:
        return None
    match = re.search(r'\(Author\s*:\s*([^)]+)\)', title, flags=re.IGNORECASE)
    return match.group(1).strip() if match else None

# --- MAIN LOGIC ---

def normalize():
    if not os.path.exists(CSV_PATH):
        print("❌ No CSV found.")
        return

    df = pd.read_csv(CSV_PATH).fillna("")
    total_records = len(df)

    stats = {
        "rows_cleaned": 0,
        "dates_recovered": 0,
        "ids_updated": 0,
        "authors_cleaned": 0,
        "authors_extracted": 0
    }

    print("------------------------------------------------")
    print("🧹 Running Integrated Normalization & Repair...")

    cleaned_rows = []

    for _, row in df.iterrows():
        is_modified = False
        clean_row = row.copy()
        old_id = row['id']

        # 1. NUMBER
        num = format_eo_number(row['number']) if row['type'] == 'executive_order' else clean_standard_number(row['number'])
        if num != row['number']:
            clean_row['number'] = num
            is_modified = True

        # 2. TITLE
        fixed_title = smart_title_case(" ".join(fix_encoding_errors(row['title']).split()))
        if fixed_title != row['title']:
            clean_row['title'] = fixed_title
            is_modified = True

        # 3. AUTHOR FROM TITLE
        extracted_author = extract_author_from_title(row['title'])
        if extracted_author and not row.get('raw_author_text'):
            clean_row['raw_author_text'] = extracted_author
            stats["authors_extracted"] += 1
            is_modified = True

        # 4. CLEAN AUTHOR TEXT
        if clean_row.get('raw_author_text'):
            cleaned_author = normalize_author_text(clean_row['raw_author_text'])
            if cleaned_author != clean_row['raw_author_text']:
                clean_row['raw_author_text'] = cleaned_author
                stats["authors_cleaned"] += 1
                is_modified = True

        # 5. DATE & TERM
        current_date = str(row['date_enacted']).strip()
        if not current_date or current_date == "Check PDF":
            extracted_date = extract_date_from_text(row['title']) or extract_date_from_text(row.get('raw_author_text'))
            if extracted_date:
                clean_row['date_enacted'] = extracted_date
                stats["dates_recovered"] += 1
                term = get_term_info(extracted_date)
                if term:
                    clean_row['term_id'] = term['id']
                    clean_row['session_id'] = f"{term['id']}_{extracted_date}"
                is_modified = True

        # 6. ID
        term_for_id = clean_row['term_id'] if clean_row['term_id'] != "unknown_term" else "legacy"
        new_id = generate_id(clean_row['type'], term_for_id, clean_row['number'], clean_row['title'])
        if new_id != old_id:
            clean_row['id'] = new_id
            stats["ids_updated"] += 1
            is_modified = True

        if is_modified:
            stats["rows_cleaned"] += 1

        cleaned_rows.append(clean_row)

    df_clean = pd.DataFrame(cleaned_rows)

    if 'date_enacted' in df_clean.columns:
        df_clean.sort_values(by=['type', 'date_enacted', 'number'], ascending=[True, False, True], inplace=True)

    df_clean.to_csv(CSV_PATH, index=False)

    print("\n📊 === PIPELINE STATISTICS ===")
    print(f"   Total Records:           {total_records}")
    print(f"   Rows Optimized:          {stats['rows_cleaned']}")
    print(f"   Dates Recovered:         {stats['dates_recovered']}")
    print(f"   Authors Cleaned:         {stats['authors_cleaned']}")
    print(f"   Authors Extracted:       {stats['authors_extracted']}")
    print(f"   IDs Updated:             {stats['ids_updated']}")
    print("==================================\n")

if __name__ == "__main__":
    normalize()
