import pandas as pd
import requests
import os
import re
import urllib.parse
from bs4 import BeautifulSoup
from datetime import datetime
from utils import generate_id, get_term_info

os.makedirs("pipeline/data", exist_ok=True)

SOURCES = [
    {"type": "resolution", "url": "https://losbanos.gov.ph/municipal_resolutions"},
    {"type": "ordinance", "url": "https://losbanos.gov.ph/ordinance"},
    {"type": "executive_order", "url": "https://losbanos.gov.ph/executive"}
]

CSV_PATH = "pipeline/data/documents.csv"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}

def parse_date(date_str):
    if not date_str: return None
    date_str = date_str.strip()
    formats = ["%b %d, %Y", "%m/%d/%y", "%m/%d/%Y", "%Y-%m-%d"]
    for fmt in formats:
        try: return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError: continue
    return None

def scrape():
    new_data = []
    
    for source in SOURCES:
        print(f"Scraping {source['type']} from {source['url']}...")
        try:
            r = requests.get(source['url'], headers=HEADERS, verify=False, timeout=30)
            soup = BeautifulSoup(r.text, 'html.parser')
            
            table = soup.select_one('table#table1') or soup.select_one('table#dataTable') or soup.select_one('table.dataTable')
            if not table: continue

            rows = table.select('tbody tr')
            print(f"  ✅ Found {len(rows)} rows.")

            for row in rows:
                cols = row.find_all('td')
                if not cols or len(cols) < 2: continue

                doc_data = {
                    "type": source['type'],
                    "status": "active",
                    "subjects": "" 
                }

                raw_date = ""
                raw_author = ""
                
                try:
                    # 1. ORDINANCE
                    if source['type'] == 'ordinance':
                        if len(cols) < 6: continue
                        doc_data["number"] = cols[0].text.strip()
                        raw_date = cols[1].text.strip()
                        doc_data["title"] = cols[3].text.strip()
                        raw_author = cols[4].text.strip()
                        link = cols[5].find('a')

                    # 2. EXECUTIVE ORDER
                    elif source['type'] == 'executive_order':
                        if len(cols) < 4: continue
                        link_tag = cols[0].find('a')
                        raw_title_col = link_tag.text.strip() if link_tag else cols[0].text.strip()
                        doc_data["number"] = raw_title_col 
                        doc_data["title"] = cols[1].text.strip() 
                        raw_date = cols[2].text.strip()
                        raw_author = "Mayor"
                        link = cols[3].find('a')

                    # 3. RESOLUTION
                    else: 
                        if len(cols) < 4: continue
                        doc_data["number"] = cols[1].text.strip()
                        full_desc = cols[2].text.strip()
                        link = cols[3].find('a')

                        if "(Author:" in full_desc:
                            parts = full_desc.split("(Author:")
                            doc_data["title"] = parts[0].strip()
                            metadata = parts[1]
                            dm = re.search(r'(\d{2}/\d{2}/\d{2})', metadata)
                            if dm: raw_date = dm.group(1)
                            am = re.search(r'Hon\.\s*([^,)]+)', metadata)
                            raw_author = am.group(1) if am else ""
                        else:
                            doc_data["title"] = full_desc

                    # --- ENRICHMENT ---
                    clean_date = parse_date(raw_date)
                    doc_data["date_enacted"] = clean_date if clean_date else ""

                    term_info = get_term_info(clean_date)
                    if term_info:
                        doc_data["term_id"] = term_info['id']
                        if source['type'] == 'executive_order':
                            raw_author = f"Mayor {term_info['mayor']}"
                    else:
                        doc_data["term_id"] = "unknown_term"
                        if source['type'] == 'executive_order':
                            raw_author = "Office of the Mayor"

                    doc_data["raw_author_text"] = raw_author

                    # --- PDF & FILENAME HANDLING ---
                    if link and link.get('href'):
                        href = link.get('href')
                        full_url = href if href.startswith('http') else "https://losbanos.gov.ph/" + href.lstrip('/')
                        doc_data["pdf_url"] = full_url
                        
                        # Extract original filename (decode %20 to space)
                        original_name = os.path.basename(urllib.parse.unquote(full_url))
                        doc_data["filename"] = original_name
                    else:
                        doc_data["pdf_url"] = ""
                        doc_data["filename"] = ""

                    doc_data["id"] = generate_id(source['type'], doc_data["term_id"], doc_data["number"], doc_data["title"])
                    new_data.append(doc_data)
                
                except Exception: continue

        except Exception as e:
            print(f"  ❌ Error: {e}")

    # --- SAVE ---
    if new_data:
        df_new = pd.DataFrame(new_data)
        if os.path.exists(CSV_PATH) and os.path.getsize(CSV_PATH) > 0:
            try:
                df_old = pd.read_csv(CSV_PATH)
                df_combined = pd.concat([df_new, df_old]).drop_duplicates(subset=['id'], keep='last')
            except: df_combined = df_new
        else: df_combined = df_new

        if 'date_enacted' in df_combined.columns:
            df_combined.sort_values(by=['type', 'date_enacted'], ascending=[True, False], inplace=True)

        df_combined.to_csv(CSV_PATH, index=False)
        print(f"🎉 Success! Saved {len(df_combined)} records.")

if __name__ == "__main__":
    scrape()