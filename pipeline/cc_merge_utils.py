"""
Utilities for merging extracted Citizens Charter data into main JSON.
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

from cc_schema_validator import validate_service_data, normalize_service_data


def load_citizens_charter(json_path: str) -> Dict[str, Any]:
    """Load the main citizens-charter.json file."""
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_citizens_charter(data: Dict[str, Any], json_path: str, backup: bool = True):
    """
    Save citizens-charter.json with optional backup.

    Args:
        data: The complete citizens charter data structure
        json_path: Path to save the file
        backup: If True, create a backup before saving
    """
    json_path = Path(json_path)

    # Create backup if requested
    if backup and json_path.exists():
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_path = json_path.parent / f"{json_path.stem}.backup_{timestamp}{json_path.suffix}"
        import shutil
        shutil.copy2(json_path, backup_path)
        print(f"Backup created: {backup_path}")

    # Ensure parent directory exists
    json_path.parent.mkdir(parents=True, exist_ok=True)

    # Save with proper formatting
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def load_verification_queue(queue_path: str) -> Dict[str, Any]:
    """Load the verification queue file."""
    queue_file = Path(queue_path)
    if queue_file.exists():
        with open(queue_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"pending": [], "completed": []}


def save_verification_queue(queue: Dict[str, Any], queue_path: str):
    """Save the verification queue file."""
    queue_file = Path(queue_path)
    queue_file.parent.mkdir(parents=True, exist_ok=True)

    with open(queue_file, 'w', encoding='utf-8') as f:
        json.dump(queue, f, indent=2, ensure_ascii=False)


def remove_from_queue(service_number: str, queue_path: str) -> bool:
    """
    Remove a service from the verification queue.

    Args:
        service_number: Service number to remove (e.g., "1.1")
        queue_path: Path to verification-queue.json

    Returns:
        True if service was found and removed, False otherwise
    """
    queue = load_verification_queue(queue_path)

    original_pending = len(queue['pending'])
    queue['pending'] = [
        item for item in queue['pending']
        if item.get('serviceNumber') != service_number
    ]

    if len(queue['pending']) < original_pending:
        # Add to completed list
        queue['completed'].append({
            "serviceNumber": service_number,
            "completedAt": datetime.now().isoformat()
        })
        save_verification_queue(queue, queue_path)
        return True

    return False


def merge_service_data(
    extracted_services: List[Dict[str, Any]],
    target_json_path: str,
    queue_path: Optional[str] = None,
    validate: bool = True,
    backup: bool = True
) -> Dict[str, Any]:
    """
    Merge extracted service data into main citizens-charter.json.

    Args:
        extracted_services: List of extracted service dictionaries
        target_json_path: Path to citizens-charter.json
        queue_path: Optional path to verification-queue.json
        validate: If True, validate services before merging
        backup: If True, create backup before modifying

    Returns:
        Dictionary with merge results
    """
    results = {
        "total_extracted": len(extracted_services),
        "merged": 0,
        "skipped": 0,
        "failed": 0,
        "errors": []
    }

    # Load existing data
    data = load_citizens_charter(target_json_path)
    existing_by_number = {s['service_number']: s for s in data['services']}

    # Process each extracted service
    for extracted in extracted_services:
        service_num = extracted.get('service_number')

        if not service_num:
            results['skipped'] += 1
            results['errors'].append(f"Service missing service_number: {extracted.get('service_name', 'Unknown')}")
            continue

        # Normalize and validate
        try:
            normalized = normalize_service_data(extracted)

            if validate:
                is_valid, errors = validate_service_data(normalized)
                if not is_valid:
                    results['failed'] += 1
                    results['errors'].append(f"{service_num}: {', '.join(errors)}")
                    continue
        except Exception as e:
            results['failed'] += 1
            results['errors'].append(f"{service_num}: Validation error - {str(e)}")
            continue

        # Merge with existing or add new
        if service_num in existing_by_number:
            # Update existing service
            existing_by_number[service_num].update(normalized)
            results['merged'] += 1
        else:
            # Add new service
            existing_by_number[service_num] = normalized
            results['merged'] += 1

        # Remove from verification queue if path provided
        if queue_path:
            remove_from_queue(service_num, queue_path)

    # Rebuild services list
    data['services'] = list(existing_by_number.values())
    # Sort by service_number
    data['services'].sort(key=lambda s: s['service_number'])

    # Save updated data
    save_citizens_charter(data, target_json_path, backup=backup)

    return results


def merge_from_file(
    extracted_json_path: str,
    target_json_path: str,
    queue_path: Optional[str] = None,
    backup: bool = True
) -> Dict[str, Any]:
    """
    Load extracted services from a file and merge into main citizens-charter.json.

    Args:
        extracted_json_path: Path to file containing extracted services
        target_json_path: Path to citizens-charter.json
        queue_path: Optional path to verification-queue.json
        backup: If True, create backup before modifying

    Returns:
        Dictionary with merge results
    """
    with open(extracted_json_path, 'r', encoding='utf-8') as f:
        extracted_data = json.load(f)

    # Handle different file formats
    if isinstance(extracted_data, dict) and 'services' in extracted_data:
        extracted_services = extracted_data['services']
    elif isinstance(extracted_data, list):
        extracted_services = extracted_data
    else:
        raise ValueError(f"Invalid JSON format in {extracted_json_path}")

    return merge_service_data(
        extracted_services,
        target_json_path,
        queue_path=queue_path,
        backup=backup
    )


def print_merge_summary(results: Dict[str, Any]):
    """Print a formatted summary of merge results."""
    print("\n" + "=" * 60)
    print("MERGE SUMMARY")
    print("=" * 60)
    print(f"Total extracted: {results['total_extracted']}")
    print(f"Merged:          {results['merged']}")
    print(f"Skipped:         {results['skipped']}")
    print(f"Failed:          {results['failed']}")
    print("=" * 60)

    if results['errors']:
        print("\nErrors:")
        for error in results['errors'][:10]:
            print(f"  - {error}")
        if len(results['errors']) > 10:
            print(f"  ... and {len(results['errors']) - 10} more errors")
    else:
        print("\nNo errors!")
