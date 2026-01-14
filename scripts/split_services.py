import json
import os

def split_services():
    input_file = 'src/data/services/services.json'
    output_dir = 'src/data/services/categories'
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    with open(input_file, 'r', encoding='utf-8') as f:
        services = json.load(f)

    # Group by category slug
    categories = {}
    for service in services:
        slug = service['category']['slug']
        if slug not in categories:
            categories[slug] = []
        categories[slug].append(service)

    # Write individual files
    for slug, items in categories.items():
        file_path = os.path.join(output_dir, f"{slug}.json")
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(items, f, indent=2, ensure_ascii=False)
        print(f"✅ Created {slug}.json ({len(items)} services)")

if __name__ == "__main__":
    split_services()