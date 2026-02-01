import pandas as pd
import json
import os
import shutil
from slugify import slugify
from pathlib import Path

DOCS_CSV = Path("data/documents.csv")
MEMBERS_CSV = Path("data/term_members.csv")
OUT_DIR_JSON = "../src/data/legislation"
OUT_DIR_SQL = "../db/migrations/data"

def ordinal(n):
    """Convert number to ordinal string (1st, 2nd, 3rd, etc.)"""
    if 11 <= (n % 100) <= 13:
        suffix = "th"
    else:
        suffix = {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
    return f"{n}{suffix}"

def generate_sql():
    """Generate SQL migration files from CSV data"""
    if not DOCS_CSV.exists():
        print("❌ Missing documents.csv")
        return

    df_docs = pd.read_csv(DOCS_CSV).fillna("")
    df_members = pd.read_csv(MEMBERS_CSV).fillna("") if MEMBERS_CSV.exists() else pd.DataFrame()

    print(f"🏭 Generating SQL files...")

    # Create output directory
    sql_dir = Path(OUT_DIR_SQL)
    sql_dir.mkdir(parents=True, exist_ok=True)

    # --- 1. GENERATE TERMS SQL ---
    terms = {
        'sb_9': {'term_number': 9, 'ordinal': '9th', 'name': '9th Sangguniang Bayan',
                'start_date': '2016-07-01', 'end_date': '2019-06-30', 'year_range': '2016-2019',
                'mayor': 'CAESAR P. PEREZ', 'vice_mayor': 'PROCOPIO A. ALIPON'},
        'sb_10': {'term_number': 10, 'ordinal': '10th', 'name': '10th Sangguniang Bayan',
                  'start_date': '2019-07-01', 'end_date': '2022-06-30', 'year_range': '2019-2022',
                  'mayor': 'CAESAR P. PEREZ', 'vice_mayor': 'ANTONIO L. KALAW'},
        'sb_11': {'term_number': 11, 'ordinal': '11th', 'name': '11th Sangguniang Bayan',
                  'start_date': '2022-07-01', 'end_date': '2025-06-30', 'year_range': '2022-2025',
                  'mayor': 'ANTHONY F. GENUINO', 'vice_mayor': 'JOSEPHINE S. EVANGELISTA'},
        'sb_12': {'term_number': 12, 'ordinal': '12th', 'name': '12th Sangguniang Bayan',
                  'start_date': '2025-07-01', 'end_date': '2028-06-30', 'year_range': '2025-2028',
                  'mayor': 'NIEL ANDREW N. NOCON', 'vice_mayor': 'MARLO PJ A. ALIPON'},
    }

    with open(sql_dir / "001_terms.sql", 'w') as f:
        f.write("-- Terms data\n")
        for term_id, term_data in terms.items():
            f.write(f"""INSERT INTO terms (id, term_number, ordinal, name, start_date, end_date, year_range, mayor, vice_mayor)
VALUES (
  '{term_id}',
  {term_data['term_number']},
  '{term_data['ordinal']}',
  '{term_data['name']}',
  '{term_data['start_date']}',
  '{term_data['end_date']}',
  '{term_data['year_range']}',
  '{term_data['mayor']}',
  '{term_data['vice_mayor']}'
)
ON CONFLICT(id) DO UPDATE SET
  term_number = excluded.term_number,
  ordinal = excluded.ordinal,
  name = excluded.name,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  year_range = excluded.year_range,
  mayor = excluded.mayor,
  vice_mayor = excluded.vice_mayor;

""")
    print(f"  ✅ Generated {sql_dir / '001_terms.sql'}")

    # --- 2. GENERATE SESSIONS SQL ---
    # Group documents by (Term + Date) to create unique sessions
    df_leg = df_docs[
        (df_docs['type'].isin(['resolution', 'ordinance'])) &
        (df_docs['date_enacted'] != "") &
        (df_docs['term_id'] != "unknown_term")
    ]

    # Group by Term and Date
    sessions_grouped = df_leg.groupby(['term_id', 'date_enacted'])

    # Collect all sessions with their dates
    all_sessions = []
    for (term_id, date), group in sessions_grouped:
        all_sessions.append({
            'term_id': term_id,
            'date': date,
            'id': f"{term_id}_{date}",
            'type': 'Regular'
        })

    # Sort by date and assign sequential numbers per term
    sessions_by_term = {}
    for session in all_sessions:
        term_id = session['term_id']
        if term_id not in sessions_by_term:
            sessions_by_term[term_id] = []
        sessions_by_term[term_id].append(session)

    for term_id in sessions_by_term:
        sessions_by_term[term_id].sort(key=lambda x: x['date'])

    with open(sql_dir / "006_sessions.sql", 'w') as f:
        f.write("-- Sessions\n")
        session_number = 0
        for term_id in sorted(sessions_by_term.keys()):
            for session in sessions_by_term[term_id]:
                session_number += 1
                ord_str = ordinal(session_number)
                f.write(f"""INSERT INTO sessions (id, term_id, number, type, date, ordinal_number)
VALUES (
  '{session['id']}',
  '{session['term_id']}',
  {session_number},
  '{session['type']}',
  '{session['date']}',
  '{ord_str}'
)
ON CONFLICT(id) DO UPDATE SET
  number = excluded.number,
  type = excluded.type,
  date = excluded.date,
  ordinal_number = excluded.ordinal_number;
""")
    print(f"  ✅ Generated {sql_dir / '006_sessions.sql'} ({session_number} sessions)")

    # --- 3. GENERATE SESSION ABSENCES SQL ---
    with open(sql_dir / "007_session_absences.sql", 'w') as f:
        f.write("-- Session Absences\n")
        absence_count = 0
        for (term_id, date), group in sessions_grouped:
            session_id = f"{term_id}_{date}"

            # Collect absent persons from documents
            absent_set = set()
            for abs_str in group['absent_ids']:
                if abs_str:
                    absent_set.update(abs_str.split(','))

            for person_id in absent_set:
                if person_id:
                    absence_id = f"{session_id}_{person_id}"
                    f.write(f"""INSERT INTO session_absences (id, session_id, person_id)
VALUES ('{absence_id}', '{session_id}', '{person_id}')
ON CONFLICT(id) DO NOTHING;
""")
                    absence_count += 1
    print(f"  ✅ Generated {sql_dir / '007_session_absences.sql'} ({absence_count} absences)")

    # --- 4. GENERATE DOCUMENTS SQL ---
    with open(sql_dir / "025_documents_final.sql", 'w') as f:
        f.write("-- Documents\n")
        for _, row in df_docs.iterrows():
            doc_id = row['id']
            doc_type = row.get('type', 'ordinance')
            number = str(row.get('number', '')).replace("'", "''")
            title = str(row.get('title', '')).replace("'", "''")
            session_id = row.get('session_id') or 'NULL'
            if session_id != 'NULL':
                session_id = f"'{session_id}'"

            date_enacted = row.get('date_enacted') or 'NULL'
            if date_enacted != 'NULL':
                date_enacted = f"'{date_enacted}'"

            pdf_url = str(row.get('pdf_url', '')).replace("'", "''")

            moved_by_val = row.get('moved_by') or ''
            if moved_by_val:
                moved_by = f"'{moved_by_val.replace(chr(39), chr(39)+chr(39))}'"
            else:
                moved_by = 'NULL'

            seconded_by_val = row.get('seconded_by') or ''
            if seconded_by_val:
                seconded_by = f"'{seconded_by_val.replace(chr(39), chr(39)+chr(39))}'"
            else:
                seconded_by = 'NULL'

            status = row.get('status', 'approved')

            f.write(f"""INSERT INTO documents (id, type, number, title, session_id, status, date_enacted, pdf_url, moved_by, seconded_by, source_type, needs_review, processed)
VALUES ('{doc_id}', '{doc_type}', '{number}', '{title}', {session_id}, '{status}', {date_enacted}, '{pdf_url}', {moved_by}, {seconded_by}, 'pdf', 0, 1)
ON CONFLICT(id) DO UPDATE SET
  type = excluded.type,
  number = excluded.number,
  title = excluded.title,
  session_id = excluded.session_id,
  status = excluded.status,
  date_enacted = excluded.date_enacted,
  pdf_url = excluded.pdf_url,
  moved_by = excluded.moved_by,
  seconded_by = excluded.seconded_by;
""")
    print(f"  ✅ Generated {sql_dir / '025_documents_final.sql'} ({len(df_docs)} documents)")

    # --- 5. GENERATE DOCUMENT AUTHORS SQL ---
    with open(sql_dir / "026_document_authors.sql", 'w') as f:
        f.write("-- Document Authors\n")
        author_count = 0
        for _, row in df_docs.iterrows():
            doc_id = row['id']
            author_ids = str(row.get('clean_author_ids', '')).split(',') if row.get('clean_author_ids') else []

            for i, author_id in enumerate(author_ids, 1):
                if author_id and author_id.strip():
                    f.write(f"""INSERT INTO document_authors (document_id, person_id, author_type, author_order)
VALUES ('{doc_id}', '{author_id.strip()}', 'primary', {i})
ON CONFLICT(document_id, person_id) DO UPDATE SET
  author_type = excluded.author_type,
  author_order = excluded.author_order;
""")
                    author_count += 1
    print(f"  ✅ Generated {sql_dir / '026_document_authors.sql'} ({author_count} author relationships)")

    print("✅ SQL Generation Complete.")

def generate_json():
    """Generate JSON files for frontend (original functionality)"""
    if not DOCS_CSV.exists() or not MEMBERS_CSV.exists():
        print("❌ Missing CSVs")
        return

    df_docs = pd.read_csv(DOCS_CSV).fillna("")
    df_members = pd.read_csv(MEMBERS_CSV).fillna("")

    print(f"🏭 Generating JSON files...")

    # --- 1. GENERATE DOCUMENTS ---
    for index, row in df_docs.iterrows():
        term_folder = row['term_id'] if row['term_id'] != "unknown_term" else "legacy"

        if row['date_enacted']:
            session_id = f"{row['term_id']}_{row['date_enacted']}"
        else:
            session_id = ""

        folder = f"{OUT_DIR_JSON}/documents/{term_folder}/{row['type']}s"
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
    df_leg = df_docs[
        (df_docs['type'].isin(['resolution', 'ordinance'])) &
        (df_docs['date_enacted'] != "") &
        (df_docs['term_id'] != "unknown_term")
    ]

    sessions_grouped = df_leg.groupby(['term_id', 'date_enacted'])

    for (term_id, date), group in sessions_grouped:
        session_id = f"{term_id}_{date}"

        roster = df_members[df_members['term_id'] == term_id]['person_id'].tolist()

        absent_set = set()
        for abs_str in group['absent_ids']:
            if abs_str:
                absent_set.update(abs_str.split(','))

        absent_list = list(absent_set)
        present_list = [p for p in roster if p not in absent_list]

        session_item = {
            "id": session_id,
            "term_id": term_id,
            "number": 0,
            "type": "Regular",
            "date": date,
            "present": present_list,
            "absent": absent_list,
            "ordinal_number": ""
        }

        folder = f"{OUT_DIR_JSON}/sessions/{term_id}"
        os.makedirs(folder, exist_ok=True)

        with open(f"{folder}/{session_id}.json", "w", encoding="utf-8") as f:
            json.dump(session_item, f, indent=2)

    print("✅ JSON Generation Complete.")

def generate():
    """Generate SQL migration files"""
    generate_sql()

if __name__ == "__main__":
    generate()
