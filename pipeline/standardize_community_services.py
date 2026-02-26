"""
Apply UK GOV.UK plain language standardization to community services in services.json

For community services, we:
1. Add plain_language_name for user-friendly titles
2. Standardize steps to use imperative language where applicable
3. Keep the original service name for reference
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Tuple


def create_backup(source_path: Path) -> Path:
    """Create a timestamped backup."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = source_path.parent / f"{source_path.stem}.backup_{timestamp}{source_path.suffix}"
    import shutil
    shutil.copy2(source_path, backup_path)
    print(f"Backup created: {backup_path}")
    return backup_path


def generate_plain_name_for_community(service_name: str) -> str:
    """
    Generate plain language name for community services.

    Patterns:
    - "Center" -> keep as is (already clear)
    - "Directory" -> "Find [what]" or keep as is
    - "Schedule" -> keep as is
    - "Locations" -> "Find [what]" or "Where to go"
    - "Assistance" -> "Get [what] assistance"
    """
    name = service_name.strip()

    # Keep informational services as-is (they're already clear)
    informational_keywords = ['Directory', 'Schedule', 'Locations']
    if any(kw in name for kw in informational_keywords):
        return name

    # "Treatment" services - keep clear
    if 'Treatment' in name:
        return name

    # "Inspection Certificate" -> "Get [certificate]"
    if 'Certificate' in name and 'Inspection' in name:
        # Fire Safety Inspection Certificate -> Get a Fire Safety Inspection Certificate
        return f"Get a {name}"

    # "Subsidy for" -> Keep as-is (already clear)
    if 'Subsidy' in name:
        return name

    # "Assistance" -> Keep mostly as-is, just simplify
    if 'Assistance' in name:
        return name

    # Default: return original
    return name


def standardize_step_action(action: str) -> str:
    """
    Standardize a step action to plain language.

    For community services, steps are often informational rather than instructional.
    Only convert when it makes sense.
    """
    if not action or not action.strip():
        return action

    action = action.strip()

    # Convert "Register as a..." to "Register as a..." (already good)
    # Convert "Submit requirements..." to "Submit requirements..." (already good)
    # Convert "Undergo interview..." to "Undergo interview..." (already good)

    # Fix common issues
    # "Verify if the..." -> "Check if the..."
    if action.startswith('Verify if '):
        return action.replace('Verify if ', 'Check if ', 1)

    # "Secure required..." -> "Get required..."
    if action.startswith('Secure required '):
        return action.replace('Secure required ', 'Get required ', 1)

    # "Prepare the..." -> "Prepare..." (remove "the" for conciseness)
    if action.startswith('Prepare the '):
        return action.replace('Prepare the ', 'Prepare ', 1)

    return action


def standardize_community_service(service: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Standardize a community service.

    Returns:
        Tuple of (standardized_service, list_of_changes)
    """
    service = service.copy()
    changes = []

    # Add plain_language_name
    if 'service' in service and 'plain_language_name' not in service:
        original_name = service['service']
        plain_name = generate_plain_name_for_community(original_name)
        if plain_name != original_name:
            service['plain_language_name'] = plain_name
            changes.append(f'Added plain_language_name: "{plain_name}"')
        else:
            service['plain_language_name'] = original_name
            changes.append('Added plain_language_name (same as original)')

    # Standardize steps
    if 'steps' in service and service['steps']:
        original_steps = service['steps'].copy()
        standardized_steps = []
        for step in original_steps:
            standardized = standardize_step_action(step)
            standardized_steps.append(standardized)
            if standardized != step:
                changes.append(f'Step: "{step[:40]}..." → "{standardized[:40]}..."')

        if standardized_steps != original_steps:
            service['steps'] = standardized_steps

    return service, changes


def standardize_all_services(data: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], Dict[str, List[str]]]:
    """
    Standardize all community services.
    """
    result = []
    changes_by_service = {}

    for service in data:
        # Process all services in services.json (they're all community services)
        # Only skip if explicitly tagged as citizens-charter source
        if service.get('source') == 'citizens-charter':
            result.append(service)
            continue

        standardized, changes = standardize_community_service(service)

        if changes:
            service_name = service.get('service', 'Unknown')
            changes_by_service[service_name] = changes

        result.append(standardized)

    return result, changes_by_service


def print_summary(changes_by_service: Dict[str, List[str]]):
    """Print summary of changes."""
    print("\n" + "=" * 70)
    print("COMMUNITY SERVICES PLAIN LANGUAGE STANDARDIZATION")
    print("=" * 70)

    if not changes_by_service:
        print("\nNo changes needed - all services already follow plain language guidelines!")
    else:
        print(f"\nServices updated: {len(changes_by_service)}")
        print(f"Total changes: {sum(len(c) for c in changes_by_service.values())}")

        print("\nChanges by service:")
        for service_name, changes in sorted(changes_by_service.items()):
            print(f"\n  {service_name}:")
            for change in changes[:5]:
                print(f"    - {change}")
            if len(changes) > 5:
                print(f"    ... and {len(changes) - 5} more changes")

    print("=" * 70)


def main(
    input_path: str = 'src/data/services/services.json',
    output_path: str = None,
    dry_run: bool = True
):
    """Main function."""
    input_file = Path(input_path)

    if not input_file.exists():
        print(f"Error: File not found: {input_path}")
        return 1

    print(f"Loading data from: {input_path}")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Loaded {len(data)} services")

    # All services in services.json are community services
    print(f"Community services to process: {len(data)}")

    # Standardize
    updated_data, changes = standardize_all_services(data)

    # Print summary
    print_summary(changes)

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
        description='Apply plain language standardization to community services'
    )
    parser.add_argument(
        'input',
        nargs='?',
        default='src/data/services/services.json',
        help='Path to services.json'
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
