import json
import os

def merge_services():
    input_dir = 'src/data/services/categories'
    output_file = 'src/data/services/services.json'
    combined = []

    for filename in sorted(os.listdir(input_dir)):
        if filename.endswith('.json'):
            with open(os.path.join(input_dir, filename), 'r', encoding='utf-8') as f:
                data = json.load(f)
                combined.extend(data)

    # Sort alphabetically by service name for consistency
    combined.sort(key=lambda x: x['service'])

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(combined, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully merged {len(combined)} services into one file.")

if __name__ == "__main__":
    merge_services()