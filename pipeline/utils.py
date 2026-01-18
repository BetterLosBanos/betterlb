import pandas as pd
import urllib3
import os
from slugify import slugify
from thefuzz import process

# Disable SSL Warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

TERMS_CSV = "pipeline/data/terms.csv"
_TERMS_CACHE = None

def get_term_info(date_str):
    """
    Given a date (YYYY-MM-DD), returns a dictionary with term details:
    { 'id': 'sb_12', 'mayor': '...', 'vice_mayor': '...' }
    Returns None if no match or invalid date.
    """
    global _TERMS_CACHE
    
    # Load Cache
    if _TERMS_CACHE is None:
        if os.path.exists(TERMS_CSV):
            _TERMS_CACHE = pd.read_csv(TERMS_CSV)
            _TERMS_CACHE['start_date'] = pd.to_datetime(_TERMS_CACHE['start_date'])
            _TERMS_CACHE['end_date'] = pd.to_datetime(_TERMS_CACHE['end_date'])
        else:
            print(f"Warning: {TERMS_CSV} not found.")
            return None

    try:
        if not date_str or date_str == "Check PDF": return None
        target_date = pd.to_datetime(date_str)
    except:
        return None

    # Find the row where date fits in range
    match = _TERMS_CACHE[
        (_TERMS_CACHE['start_date'] <= target_date) & 
        (_TERMS_CACHE['end_date'] >= target_date)
    ]

    if not match.empty:
        # Return the first matching row as a dictionary
        return match.iloc[0].to_dict()
    
    return None

def generate_id(doc_type, term_id, number, title):
    base = number if number and len(number) > 2 else title[:30]
    clean_base = slugify(base)
    t_id = term_id if term_id else "legacy"
    return f"{doc_type}_{t_id}_{clean_base}"

def match_councilor_id(raw_name, councilor_df):
    """Fuzzy matches a name string to an ID in councilors.csv"""
    if not raw_name or councilor_df.empty: return None
    
    choices = councilor_df['full_name'].tolist()
    match = process.extractOne(raw_name, choices)
    
    if match and match[1] > 85: 
        row = councilor_df[councilor_df['full_name'] == match[0]].iloc[0]
        
        # --- FIX IS HERE ---
        # Check which column exists (handle both schema versions if needed)
        if 'person_id' in row:
            return row['person_id']
        elif 'id' in row:
            return row['id']
            
    return None