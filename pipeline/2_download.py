import pandas as pd
import requests
import os
import urllib3
from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

CSV_PATH = "pipeline/data/documents.csv"
PDF_DIR = "pipeline/data/pdfs"
MAX_WORKERS = 10
HEADERS = {"User-Agent": "Mozilla/5.0"}

def download_file(item):
    url = item.get('pdf_url')
    filename = item.get('filename') # Use original filename
    doc_type = item.get('type')

    if not url or not filename or "javascript:" in url: return

    folder = f"{PDF_DIR}/{doc_type}s"
    os.makedirs(folder, exist_ok=True)
    
    filepath = os.path.join(folder, filename)

    if os.path.exists(filepath): return

    try:
        with requests.Session() as s:
            r = s.get(url, headers=HEADERS, verify=False, timeout=60)
            if r.status_code == 200:
                with open(filepath, 'wb') as f:
                    f.write(r.content)
    except Exception: pass

def download_all():
    if not os.path.exists(CSV_PATH): return
    df = pd.read_csv(CSV_PATH)
    valid_rows = df[df['pdf_url'].notna() & (df['filename'].notna())].to_dict('records')
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        list(tqdm(executor.map(download_file, valid_rows), total=len(valid_rows), unit="file"))

if __name__ == "__main__":
    download_all()