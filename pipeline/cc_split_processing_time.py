"""
Split processing_time into in-person processing_time and turnaround_time.

The processing_time field currently contains mixed data:
- In-person transaction times: "15 Minutes", "2 Hours & 45 Minutes", "4 Hours"
- Turnaround times: "3 Working Days", "3-5 working days", "21-35 working days"
- Complex notes: "1 day (document review) + BFP Site Inspection + 10 minutes (payment)"

This script splits them correctly:
- processing_time = In-person transaction time (minutes/hours)
- turnaround_time = Total time including waiting/approval (working days)
"""

import json
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Tuple, Optional


def create_backup(source_path: Path) -> Path:
    """Create a timestamped backup of the source file."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = source_path.parent / f"{source_path.stem}.backup_{timestamp}{source_path.suffix}"
    import shutil
    shutil.copy2(source_path, backup_path)
    print(f"Backup created: {backup_path}")
    return backup_path


def extract_time_components(processing_time: str) -> Tuple[str, str]:
    """
    Split processing_time into in-person time and turnaround time.

    Args:
        processing_time: Original processing_time string

    Returns:
        Tuple of (processing_time, turnaround_time)
        - processing_time: In-person transaction time (minutes/hours)
        - turnaround_time: Total time including waiting/approval (working days)

    Examples:
        "15 Minutes" -> ("15 Minutes", "")
        "3-5 working days" -> ("", "3-5 working days")
        "1 day (document review) + BFP Site Inspection + 10 minutes (payment)" -> ("10 minutes", "1 day + BFP Site Inspection")
    """
    if not processing_time or not processing_time.strip():
        return "", ""

    original = processing_time.strip()
    lower = original.lower()

    # Pattern 1: Contains "working day" or "calendar" or "posting" -> pure turnaround
    if re.search(r'working\s+day|calendar|posting', lower):
        # Extract any in-person time (minutes/hours) from the string
        time_match = re.search(r'(\d+(?:\s*&?\s*\d+)?\s*(?:minutes?|hours?|hrs?))', original, re.IGNORECASE)
        if time_match:
            in_person = time_match.group(1)
            # Remove the in-person time from the turnaround time
            turnaround = re.sub(r'\s*[\+•]\s*' + re.escape(time_match.group(0)) + r'\s*', ' ', original, flags=re.IGNORECASE)
            turnaround = re.sub(r'\s*\+\s*', ' + ', turnaround)  # Normalize plus signs
            return in_person.strip(), turnaround.strip()
        return "", original

    # Pattern 2: Contains "day" but not "working day" -> might be mixed
    day_match = re.search(r'(\d+(?:\s*-\s*\d+)?\s+days?)', original, re.IGNORECASE)
    if day_match:
        # Look for minutes/hours in the same string
        time_match = re.search(r'(\d+(?:\s*&?\s*\d+)?\s*(?:minutes?|hours?|hrs?))', original, re.IGNORECASE)
        if time_match:
            in_person = time_match.group(1)
            # Build turnaround from the day portion and any notes
            turnaround = original.replace(time_match.group(0), '').strip()
            turnaround = re.sub(r'\s*[\+•]\s*', ' + ', turnaround)
            turnaround = re.sub(r'\s*\+\s*\+\s*', ' + ', turnaround)  # Fix double plus
            return in_person.strip(), turnaround.strip()
        return "", original

    # Pattern 3: Only minutes/hours -> pure in-person
    if re.search(r'minutes?|hours?|hrs?', lower):
        return original, ""

    # Pattern 4: "Varies" or similar -> turnaround
    if re.search(r'varies|depends|inspection|review', lower, re.IGNORECASE):
        return "", original

    # Default: keep in processing_time
    return original, ""


def standardize_time_format(time_str: str) -> str:
    """
    Standardize time format for consistency.

    Args:
        time_str: Time string to standardize

    Returns:
        Standardized time string

    Examples:
        "15 Minutes" -> "15 minutes"
        "2 Hours & 45 Minutes" -> "2 hours & 45 minutes"
        "3-5 working days" -> "3-5 working days"
    """
    if not time_str or not time_str.strip():
        return ""

    # Common standardizations
    time_str = time_str.strip()

    # Capitalize first letter only
    if time_str:
        time_str = time_str[0].upper() + time_str[1:].lower()

    # Fix common abbreviations
    time_str = re.sub(r'\bmins?\b', 'minutes', time_str, flags=re.IGNORECASE)
    time_str = re.sub(r'\bhrs?\b', 'hours', time_str, flags=re.IGNORECASE)
    time_str = re.sub(r'&', ' & ', time_str)  # Ensure spaces around &

    # Clean up extra spaces
    time_str = re.sub(r'\s+', ' ', time_str)

    return time_str.strip()


def split_service_processing_time(service: Dict[str, Any]) -> Dict[str, Any]:
    """
    Split processing_time for a single service.

    Args:
        service: Service dictionary

    Returns:
        Updated service dictionary with processing_time and turnaround_time
    """
    service = service.copy()

    current_processing_time = service.get('processing_time', '')
    new_processing_time, turnaround_time = extract_time_components(current_processing_time)

    service['processing_time'] = standardize_time_format(new_processing_time)
    service['turnaround_time'] = standardize_time_format(turnaround_time)

    return service


def split_all_processing_times(
    data: Dict[str, Any],
    dry_run: bool = True
) -> Dict[str, Any]:
    """
    Split processing_time for all services.

    Args:
        data: Citizens Charter data with services array
        dry_run: If True, don't modify the original data

    Returns:
        Updated data with split processing times
    """
    result = data.copy()
    result['services'] = []

    for service in data['services']:
        updated = split_service_processing_time(service)
        result['services'].append(updated)

    return result


def print_split_summary(original_data: Dict[str, Any], updated_data: Dict[str, Any]):
    """Print a summary of the split results."""
    print("\n" + "=" * 70)
    print("PROCESSING TIME SPLIT SUMMARY")
    print("=" * 70)

    in_person_count = 0
    turnaround_count = 0
    mixed_count = 0

    for orig, upd in zip(original_data['services'], updated_data['services']):
        orig_time = orig.get('processing_time', '')
        new_time = upd.get('processing_time', '')
        turnaround = upd.get('turnaround_time', '')

        if new_time and turnaround:
            mixed_count += 1
            print(f"\n{upd['service_number']}: {upd['service_name'][:50]}")
            print(f"  Original: {orig_time[:60]}")
            print(f"  In-person: {new_time}")
            print(f"  Turnaround: {turnaround}")
        elif turnaround:
            turnaround_count += 1
            print(f"\n{upd['service_number']}: {upd['service_name'][:50]}")
            print(f"  Original: {orig_time[:60]}")
            print(f"  Turnaround: {turnaround}")
        elif new_time:
            in_person_count += 1

    print("\n" + "-" * 70)
    print(f"Pure in-person:  {in_person_count}")
    print(f"Pure turnaround: {turnaround_count}")
    print(f"Mixed:           {mixed_count}")
    print(f"Total services:  {len(original_data['services'])}")
    print("=" * 70)


def main(
    input_path: str = 'src/data/citizens-charter/citizens-charter.json',
    output_path: Optional[str] = None,
    dry_run: bool = True
):
    """
    Main function to split processing times.

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

    # Split processing times
    updated_data = split_all_processing_times(data, dry_run=False)

    # Print summary
    print_split_summary(data, updated_data)

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
        description='Split processing_time into in-person time and turnaround time'
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
