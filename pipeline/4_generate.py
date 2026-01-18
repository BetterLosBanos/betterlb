import pandas as pd
import json
import os
import shutil
from slugify import slugify

DOCS_CSV = "pipeline/data/documents.csv"
MEMBERS_CSV = "pipeline/data/term_members.csv"
OUT_DIR = "src/data/legislation" 

def generate():
    if not os.path.exists(DOCS_CSV) or not os.path.exists(MEMBERS_CSV):
        print("❌ Missing CSVs")
        return

    df_docs = pd.read_csv(DOCS_CSV).fillna("")
    df_members = pd.read_csv(MEMBERS_CSV).fillna("")

    print(f"🏭 Generating Data...")

    # --- 1. GENERATE DOCUMENTS ---
    for index, row in df_docs.iterrows():
        term_folder = row['term_id'] if row['term_id'] != "unknown_term" else "legacy"
        
        # Build Session ID: "term_date" (e.g., sb_12_2025-01-01)
        # We use this to link the document to the session we will create below
        if row['date_enacted']:
            session_id = f"{row['term_id']}_{row['date_enacted']}"
        else:
            session_id = ""

        # Folder structure
        folder = f"{OUT_DIR}/documents/{term_folder}/{row['type']}s"
        os.makedirs(folder, exist_ok=True)
        
        item = {
            "id": row['id'],
            "type": row['type'],
            "number": row['number'],
            "title": row['title'],
            "session_id": session_id,
            "author_ids": str(row.get('clean_author_ids', '')).split(',') if row.get('clean_author_ids') else [],
            "status": row['status'],
            "date_enacted": row['date_enacted'],
            "link": row['pdf_url'],
            "subjects": []
        }
        
        with open(f"{folder}/{row['id']}.json", "w", encoding="utf-8") as f:
            json.dump(item, f, indent=2)

    # --- 2. GENERATE SESSIONS ---
    # We group documents by (Term + Date) to create unique sessions
    # Filter out EOs or docs without dates
    df_leg = df_docs[
        (df_docs['type'].isin(['resolution', 'ordinance'])) & 
        (df_docs['date_enacted'] != "") & 
        (df_docs['term_id'] != "unknown_term")
    ]

    # Group by Term and Date
    sessions_grouped = df_leg.groupby(['term_id', 'date_enacted'])

    for (term_id, date), group in sessions_grouped:
        session_id = f"{term_id}_{date}"
        
        # A. Get Full Roster for this Term
        roster = df_members[df_members['term_id'] == term_id]['person_id'].tolist()
        
        # B. Determine Absences
        # We look at all docs from this session. If ANY doc lists someone as absent, 
        # we consider them absent for the session (simplification).
        # OR: We prioritize the first document's record.
        
        absent_set = set()
        for abs_str in group['absent_ids']:
            if abs_str:
                absent_set.update(abs_str.split(','))
        
        absent_list = list(absent_set)
        
        # C. Calculate Present
        # Present = Roster - Absent
        present_list = [p for p in roster if p not in absent_list]

        # D. Session Object
        session_item = {
            "id": session_id,
            "term_id": term_id,
            "number": 0, # Optional: Needs complex logic to calculate sequential ID
            "type": "Regular", # Default, hard to detect Special without OCR
            "date": date,
            "present": present_list,
            "absent": absent_list,
            "ordinal_number": "" # Can be calculated in frontend or by sorting
        }

        # E. Save
        folder = f"{OUT_DIR}/sessions/{term_id}"
        os.makedirs(folder, exist_ok=True)
        
        with open(f"{folder}/{session_id}.json", "w", encoding="utf-8") as f:
            json.dump(session_item, f, indent=2)

    print("✅ Generation Complete.")

if __name__ == "__main__":
    generate()