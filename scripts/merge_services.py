import json
import os
import subprocess

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

    # Format with Prettier to match project style
    try:
        subprocess.run(['npx', 'prettier', '--write', output_file], check=True)
        print(f"Successfully merged and formatted {len(combined)} services into one file.")
    except subprocess.CalledProcessError:
        print(f"Successfully merged {len(combined)} services into one file (Prettier formatting skipped).")

if __name__ == "__main__":
    merge_services()