"""
Migrate conditional requirements from Pattern 1 to Pattern 2.

Pattern 1 (current): Requirements array with conditional/condition fields
Pattern 2 (target): Conditional requirements in supporting_documents_detail

Migration:
1. Find requirements with "conditional": true
2. Extract them from requirements array
3. Add to supporting_documents_detail.conditional_requirements.options
4. Create supporting_documents_detail if needed
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional


def create_backup(source_path: Path) -> Path:
    """Create a timestamped backup of the source file."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = source_path.parent / f"{source_path.stem}.backup_{timestamp}{source_path.suffix}"
    import shutil
    shutil.copy2(source_path, backup_path)
    print(f"Backup created: {backup_path}")
    return backup_path


def migrate_conditional_requirements(service: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Migrate conditional requirements from requirements array to supporting_documents_detail.

    Args:
        service: Service dictionary

    Returns:
        Tuple of (migrated_service, list_of_changes)
    """
    service = service.copy()
    changes = []

    # Get current requirements
    requirements = service.get('requirements', [])
    if not requirements:
        return service, changes

    # Find conditional requirements
    conditional_reqs = []
    non_conditional_reqs = []

    for req in requirements:
        if req.get('conditional'):
            conditional_reqs.append(req)
            changes.append(f"Conditional requirement: {req.get('requirement', '')[:50]}")
        else:
            non_conditional_reqs.append(req)

    if not conditional_reqs:
        return service, changes

    # Update requirements (remove conditional ones)
    service['requirements'] = non_conditional_reqs

    # Get or create supporting_documents_detail
    sdd = service.get('supporting_documents_detail', {})

    # Build conditional_requirements structure
    options = []
    for req in conditional_reqs:
        option = {
            'condition': req.get('condition', 'May be required based on your situation').strip(),
            'document': req.get('requirement', '').strip(),
            'where_to_secure': req.get('where_to_secure', '').strip(),
        }

        # Add copies if present
        if req.get('copies'):
            option['copies'] = req['copies']

        # Add note if present
        if req.get('note'):
            option['note'] = req['note']

        # Add if_unavailable if present
        if req.get('if_unavailable'):
            option['if_unavailable'] = req['if_unavailable']

        options.append(option)

    # Create or merge conditional_requirements
    if 'conditional_requirements' not in sdd:
        sdd['conditional_requirements'] = {
            'instruction': 'Additional requirements that may apply based on your situation:',
            'options': options
        }
    else:
        # Merge with existing options
        existing_cr = sdd['conditional_requirements']
        existing_options = existing_cr.get('options', [])
        existing_cr['options'] = existing_options + options

    service['supporting_documents_detail'] = sdd

    changes.append(f"Migrated {len(conditional_reqs)} conditional requirement(s) to supporting_documents_detail")

    return service, changes


def migrate_all_services(
    data: Dict[str, Any]
) -> Tuple[Dict[str, Any], Dict[str, List[str]]]:
    """
    Migrate all services with Pattern 1 conditional requirements to Pattern 2.

    Args:
        data: Citizens Charter data with services array

    Returns:
        Tuple of (updated_data, changes_by_service)
    """
    result = data.copy()
    result['services'] = []
    changes_by_service = {}

    for service in data['services']:
        service_number = service.get('service_number', 'UNKNOWN')
        migrated, changes = migrate_conditional_requirements(service)

        if changes:
            changes_by_service[service_number] = changes

        result['services'].append(migrated)

    return result, changes_by_service


def print_migration_summary(
    changes_by_service: Dict[str, List[str]],
    before_data: Dict[str, Any],
    after_data: Dict[str, Any]
):
    """Print a summary of the migration."""
    print("\n" + "=" * 70)
    print("CONDITIONAL REQUIREMENTS MIGRATION SUMMARY")
    print("=" * 70)

    if not changes_by_service:
        print("\nNo migration needed - all services already use Pattern 2!")
    else:
        print(f"\nServices migrated: {len(changes_by_service)}")
        print(f"Total conditional requirements moved: {sum(len(c) for c in changes_by_service.values())}")

        print("\nServices with conditional requirements:")
        for service_number, changes in sorted(changes_by_service.items()):
            # Count actual migrations (last change has the count)
            migration_count = 0
            for change in changes:
                if 'Migrated' in change:
                    match = __import__('re').search(r'Migrated (\d+)', change)
                    if match:
                        migration_count = int(match.group(1))

            if migration_count > 0:
                # Get service name
                service = next((s for s in after_data['services'] if s['service_number'] == service_number), None)
                service_name = service['service_name'][:50] if service else 'Unknown'
                print(f"\n  {service_number}: {service_name}")
                print(f"    Migrated {migration_count} conditional requirement(s)")

    # Statistics
    print("\n" + "-" * 70)
    print("STATISTICS")

    # Before
    before_conditional_in_req = sum(
        1 for s in before_data['services']
        for r in s.get('requirements', [])
        if r.get('conditional')
    )
    before_sdd_conditional = sum(
        1 for s in before_data['services']
        if s.get('supporting_documents_detail', {}).get('conditional_requirements')
    )

    # After
    after_conditional_in_req = sum(
        1 for s in after_data['services']
        for r in s.get('requirements', [])
        if r.get('conditional')
    )
    after_sdd_conditional = sum(
        1 for s in after_data['services']
        if s.get('supporting_documents_detail', {}).get('conditional_requirements')
    )

    print(f"Conditional requirements in requirements array:")
    print(f"  Before: {before_conditional_in_req}")
    print(f"  After:  {after_conditional_in_req}")
    print(f"Services with supporting_documents_detail.conditional_requirements:")
    print(f"  Before: {before_sdd_conditional}")
    print(f"  After:  {after_sdd_conditional}")

    print("=" * 70)


def main(
    input_path: str = 'src/data/citizens-charter/citizens-charter.json',
    output_path: str = None,
    dry_run: bool = True
):
    """
    Main function to migrate conditional requirements.

    Args:
        input_path: Path to citizens-charter.json
        output_path: Path to write updated data (default: overwrite input)
        dry_run: If True, print summary without saving
    """
    input_file = Path(input_path)

    if not input_file.exists():
        print(f"Error: File not found: {input_path}")
        return 1

    # Load data
    print(f"Loading data from: {input_path}")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Loaded {len(data['services'])} services")

    # Migrate
    updated_data, changes_by_service = migrate_all_services(data)

    # Print summary
    print_migration_summary(changes_by_service, data, updated_data)

    # Save or dry run
    if dry_run:
        print("\n" + "=" * 70)
        print("DRY RUN - No files were modified")
        print("Run with --write to save changes")
        print("=" * 70)
        return 0

    # Create backup and save
    output_file = Path(output_path) if output_path else input_file
    create_backup(input_file)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(updated_data, f, indent=2, ensure_ascii=False)

    print(f"\nUpdated data saved to: {output_file}")
    return 0


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description='Migrate conditional requirements from Pattern 1 to Pattern 2'
    )
    parser.add_argument(
        'input',
        nargs='?',
        default='src/data/citizens-charter/citizens-charter.json',
        help='Path to citizens-charter.json'
    )
    parser.add_argument(
        '-o', '--output',
        help='Output path (default: overwrite input)'
    )
    parser.add_argument(
        '--write',
        action='store_true',
        help='Actually write changes (default is dry run)'
    )

    args = parser.parse_args()

    exit(main(args.input, args.output, dry_run=not args.write))
