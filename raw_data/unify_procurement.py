import pandas as pd
from bs4 import BeautifulSoup
import json

def parse_html_to_df(file_path, link_column_name):
    """
    Parses the HTML table from the text file and extracts data + PDF links.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    data = []
    table = soup.find('table')
    if not table:
        return pd.DataFrame()

    rows = table.find('tbody').find_all('tr')
    
    for row in rows:
        cols = row.find_all('td')
        if len(cols) < 5:
            continue
            
        # Extract basic text
        ref_no = cols[0].text.strip()
        title = cols[1].text.strip()
        contractor = cols[2].text.strip()
        abc = cols[3].text.strip().replace(',', '')
        price = cols[4].text.strip().replace(',', '')
        
        # Extract PDF link from the 'Action' column
        link_tag = cols[5].find('a', href=True)
        link = link_tag['href'] if link_tag else None
        
        data.append({
            "Reference No": ref_no,
            "Project Title": title,
            "Contractor": contractor,
            "ABC": pd.to_numeric(abc, errors='coerce'),
            "Contract Price": pd.to_numeric(price, errors='coerce'),
            link_column_name: link
        })
    
    return pd.DataFrame(data)

def unify_data():
    # 1. Parse the three files
    # Note: Ensure these filenames match your local files exactly
    df_noa = parse_html_to_df('noticeofaward.txt', 'noa_link')
    df_ntp = parse_html_to_df('noticetoproceed.txt', 'ntp_link')
    df_contract = parse_html_to_df('bidcontract.txt', 'contract_link')

    # 2. Merge DataFrames on 'Reference No'
    # We use an outer join to ensure we don't lose projects appearing in only one file
    unified_df = pd.merge(df_noa, df_ntp, on=["Reference No", "Project Title", "Contractor", "ABC", "Contract Price"], how="outer")
    unified_df = pd.merge(unified_df, df_contract, on=["Reference No", "Project Title", "Contractor", "ABC", "Contract Price"], how="outer")

    # 3. Clean up the Title (remove extra newlines/tabs common in HTML snippets)
    unified_df['Project Title'] = unified_df['Project Title'].str.replace(r'\s+', ' ', regex=True)

    # 4. Export to CSV
    unified_df.to_csv('unified_procurement.csv', index=False)
    print("Successfully created unified_procurement.csv")

    # 5. Export to JSON (Project-centric structure)
    # Convert dataframe to a list of dictionaries
    result = unified_df.to_dict(orient='records')
    
    # Optional: Group links into a 'documents' sub-object for a cleaner JSON
    formatted_json = []
    for entry in result:
        formatted_json.append({
            "reference_no": entry["Reference No"],
            "project_title": entry["Project Title"],
            "contractor": entry["Contractor"],
            "abc": entry["ABC"],
            "contract_price": entry["Contract Price"],
            "documents": {
                "noa": entry.get("noa_link"),
                "ntp": entry.get("ntp_link"),
                "contract": entry.get("contract_link")
            }
        })

    with open('unified_procurement.json', 'w', encoding='utf-8') as f:
        json.dump(formatted_json, f, indent=4)
    print("Successfully created unified_procurement.json")

if __name__ == "__main__":
    unify_data()