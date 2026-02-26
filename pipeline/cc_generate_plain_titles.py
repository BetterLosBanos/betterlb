"""
Generate plain_language_name from service_name following UK GOV.UK plain language principles.

Title transformation rules:
1. Start with an action verb - "Get", "Apply for", "Pay", "Renew"
2. Remove bureaucratic language - "Issuance of" → "Get", "Request for" → "Apply for"
3. Use simple words - "Certification" → "Certificate"
4. Remove parenthetical qualifiers - Move to description if needed
5. Be specific but concise - Under 65 characters where possible
6. Address the user directly - "Get your barangay clearance" (not "Obtaining of...")
"""

import json
import re
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


# Title transformation patterns
ISSUANCE_PATTERNS = [
    (r'^Issuance of\s+(?:a\s+)?(.+)', lambda m: f"Get a {m.group(1)}"),
    (r'^Issuance\s+(?:of\s+)?(.+)', lambda m: f"Get {m.group(1)}"),
]

REQUEST_PATTERNS = [
    (r'^Request for\s+(?:a\s+)?(.+)', lambda m: f"Apply for a {m.group(1)}"),
    (r'^Request\s+(?:for\s+)?(.+)', lambda m: f"Apply for {m.group(1)}"),
]

COLLECTION_PATTERNS = [
    (r'^Collection of\s+(?:a\s+)?(.+)', lambda m: f"Pay {m.group(1)}"),
    (r'^Collection\s+(?:of\s+)?(.+)', lambda m: f"Pay {m.group(1)}"),
]

# Service type to action mapping
SERVICE_TYPE_ACTIONS = {
    'clearance': ('Get', 'a'),
    'certificate': ('Get', 'a'),
    'certification': ('Get', 'a'),
    'permit': ('Get', 'a'),
    'license': ('Get', 'a'),
    'registration': ('Renew your', ''),  # Often renewal
    'application': ('Apply for', 'a'),
    'issuance': ('Get', 'a'),
    'request': ('Apply for', 'a'),
    'collection': ('Pay', ''),
    'payment': ('Pay', ''),
}


def extract_core_service(service_name: str) -> str:
    """
    Extract the core service name from the full name.

    Removes parenthetical qualifiers and extracts the main service.
    """
    # Remove parenthetical content
    core = re.sub(r'\s*\([^)]*\)', '', service_name).strip()
    return core


def detect_service_type(service_name: str) -> Tuple[Optional[str], str]:
    """
    Detect the type of service from its name.

    Returns:
        Tuple of (service_type, core_name_without_type)
    """
    lower = service_name.lower()

    # Check for renewal
    if 'renewal' in lower or 'renew' in lower:
        core = extract_core_service(service_name)
        # Remove "renewal" or "renew" from core
        core = re.sub(r'\brenewal?\b', '', core, flags=re.IGNORECASE).strip()
        core = re.sub(r'\bregistration\b', 'registration', core, flags=re.IGNORECASE)
        return 'renewal', core

    # Check for application
    if 'application' in lower or 'apply' in lower:
        core = extract_core_service(service_name)
        core = re.sub(r'\bapplication\b', '', core, flags=re.IGNORECASE).strip()
        return 'application', core

    # Check for issuance
    if service_name.startswith('Issuance'):
        core = extract_core_service(service_name)
        core = re.sub(r'^Issuance\s+(?:of\s+)?(?:a\s+)?', '', core, flags=re.IGNORECASE).strip()
        return 'issuance', core

    # Check for request
    if service_name.startswith('Request'):
        core = extract_core_service(service_name)
        core = re.sub(r'^Request\s+(?:for\s+)?(?:a\s+)?', '', core, flags=re.IGNORECASE).strip()
        return 'request', core

    # Check for collection
    if service_name.startswith('Collection'):
        core = extract_core_service(service_name)
        core = re.sub(r'^Collection\s+(?:of\s+)?(?:a\s+)?', '', core, flags=re.IGNORECASE).strip()
        return 'collection', core

    # Check for common service types
    for service_type in ['clearance', 'certificate', 'certification', 'permit', 'license']:
        if service_type in lower:
            core = extract_core_service(service_name)
            # Remove the service type from core
            core = re.sub(r'\b' + service_type + r'\b', '', core, flags=re.IGNORECASE).strip()
            return service_type, core

    return None, extract_core_service(service_name)


def generate_plain_title(service_name: str) -> Tuple[str, float]:
    """
    Generate a plain language title from the service name.

    Args:
        service_name: Original service name

    Returns:
        Tuple of (plain_language_name, confidence_score)
        Confidence is 0.0-1.0, lower means manual review recommended
    """
    if not service_name or not service_name.strip():
        return "", 0.0

    original = service_name.strip()
    lower = original.lower()

    # Extract parenthetical qualifiers for context
    qualifiers = re.findall(r'\(([^)]+)\)', original)
    qualifier_str = ' '.join(qualifiers).lower()

    # Detect service type
    service_type, core = detect_service_type(original)

    # Generate title based on service type
    plain_title = ""
    confidence = 1.0

    if service_type == 'renewal':
        if 'business' in lower:
            plain_title = "Renew your business registration"
        elif 'permit' in lower:
            plain_title = "Renew your permit"
        else:
            plain_title = f"Renew your {core}" if core else "Renew your service"
            confidence = 0.8

    elif service_type == 'application':
        if 'business' in lower and 'permit' in lower:
            plain_title = "Apply for a business permit"
        elif 'building' in lower:
            plain_title = "Apply for a building permit"
        else:
            plain_title = f"Apply for {core}" if core else f"Apply for service"
            confidence = 0.8

    elif service_type == 'issuance':
        # "Issuance of X" -> "Get a X"
        plain_title = f"Get a {core}" if core else "Get certificate"
        # Fix articles
        plain_title = re.sub(r'\bGet a a\b', 'Get a', plain_title)
        plain_title = re.sub(r'\bGet a ([aeiou][a-z]+)', r'Get an \1', plain_title, flags=re.IGNORECASE)

    elif service_type == 'request':
        # "Request for X" -> "Apply for X"
        plain_title = f"Apply for {core}" if core else "Apply for service"
        # Fix articles
        plain_title = re.sub(r'\bApply for a a\b', 'Apply for a', plain_title)
        plain_title = re.sub(r'\bApply for a ([aeiou][a-z]+)', r'Apply for an \1', plain_title, flags=re.IGNORECASE)

    elif service_type == 'collection':
        # "Collection of X" -> "Pay X"
        plain_title = f"Pay {core}" if core else "Pay fees"

    elif service_type == 'clearance':
        if 'barangay' in lower:
            plain_title = "Get a barangay clearance"
        elif 'police' in lower:
            plain_title = "Apply for a police clearance"
        elif 'fiscal' in lower:
            plain_title = "Get a fiscal clearance"
        else:
            plain_title = f"Get a {core} clearance" if core else "Get clearance"

    elif service_type == 'certificate':
        if 'indigency' in lower:
            plain_title = "Get an indigency certificate"
        elif 'residency' in lower:
            plain_title = "Get a residency certificate"
        elif 'income' in lower:
            plain_title = "Get an income certificate"
        else:
            plain_title = f"Get a {core} certificate" if core else "Get certificate"

    elif service_type == 'permit':
        if 'business' in lower and 'mayor' in lower:
            plain_title = "Get a mayor's permit for your business"
        elif 'mayor' in lower:
            plain_title = "Get a mayor's permit"
        elif 'building' in lower:
            plain_title = "Get a building permit"
        else:
            plain_title = f"Get a {core} permit" if core else "Get permit"

    elif service_type == 'license':
        plain_title = f"Get a {core} license" if core else "Get license"

    else:
        # Default: use core as-is with "Get" prefix
        if core:
            plain_title = f"Get {core}"
            confidence = 0.6
        else:
            plain_title = original
            confidence = 0.4

    # Apply parenthetical context
    if qualifier_str:
        if 'face to face' in qualifier_str or 'in person' in qualifier_str:
            if not plain_title.endswith(' in person'):
                plain_title = f"{plain_title} in person"
        elif 'online' in qualifier_str:
            if not plain_title.endswith(' online'):
                plain_title = f"{plain_title} online"

    # Final cleanup
    plain_title = plain_title.strip()
    plain_title = re.sub(r'\s+', ' ', plain_title)

    # Check length
    if len(plain_title) > 80:
        confidence = min(confidence, 0.7)

    return plain_title, confidence


def generate_service_plain_title(service: Dict[str, Any]) -> Tuple[Dict[str, Any], str, float]:
    """
    Generate plain_language_name for a single service.

    Args:
        service: Service dictionary

    Returns:
        Tuple of (updated_service, plain_title, confidence)
    """
    service = service.copy()
    service_name = service.get('service_name', '')

    plain_title, confidence = generate_plain_title(service_name)

    # If service already has plain_language_name and it's good, keep it
    existing = service.get('plain_language_name', '')
    if existing and len(existing) > 10:
        # Validate existing
        existing_confidence = 1.0
        if existing.startswith('Issuance') or existing.startswith('Request'):
            existing_confidence = 0.5

        if existing_confidence >= confidence:
            return service, existing, existing_confidence

    service['plain_language_name'] = plain_title
    return service, plain_title, confidence


def generate_all_plain_titles(
    data: Dict[str, Any],
    force: bool = False
) -> Tuple[Dict[str, Any], List[Tuple[str, str, float]]]:
    """
    Generate plain_language_name for all services.

    Args:
        data: Citizens Charter data with services array
        force: If True, regenerate even if plain_language_name exists

    Returns:
        Tuple of (updated_data, list_of_(service_number, plain_title, confidence))
    """
    result = data.copy()
    result['services'] = []
    generated = []

    for service in data['services']:
        service_number = service.get('service_number', 'UNKNOWN')

        # Skip if already has plain_language_name and not forcing
        if not force and service.get('plain_language_name'):
            result['services'].append(service)
            continue

        updated, plain_title, confidence = generate_service_plain_title(service)
        result['services'].append(updated)
        generated.append((service_number, plain_title, confidence))

    return result, generated


def print_generation_summary(generated: List[Tuple[str, str, float]]):
    """Print a summary of generated plain language titles."""
    print("\n" + "=" * 70)
    print("PLAIN LANGUAGE TITLE GENERATION SUMMARY")
    print("=" * 70)

    if not generated:
        print("\nNo new titles generated (all services already have plain_language_name)")
        return

    print(f"\nTotal titles generated: {len(generated)}")

    # Count by confidence
    high_conf = sum(1 for _, _, c in generated if c >= 0.8)
    medium_conf = sum(1 for _, _, c in generated if 0.6 <= c < 0.8)
    low_conf = sum(1 for _, _, c in generated if c < 0.6)

    print(f"\nConfidence distribution:")
    print(f"  High (≥0.8):    {high_conf} - Ready to use")
    print(f"  Medium (0.6-0.8): {medium_conf} - Review recommended")
    print(f"  Low (<0.6):      {low_conf} - Manual review required")

    # Show low confidence examples
    low_conf_items = [(sn, t, c) for sn, t, c in generated if c < 0.6]
    if low_conf_items:
        print(f"\nLow confidence titles (manual review required):")
        for service_number, plain_title, confidence in low_conf_items:
            print(f"  {service_number}: {plain_title} (confidence: {confidence:.2f})")

    # Show high confidence examples
    high_conf_items = [(sn, t, c) for sn, t, c in generated if c >= 0.8][:10]
    if high_conf_items:
        print(f"\nHigh confidence titles (examples):")
        for service_number, plain_title, confidence in high_conf_items:
            print(f"  {service_number}: {plain_title}")

    print("=" * 70)


def main(
    input_path: str = 'src/data/citizens-charter/citizens-charter.json',
    output_path: str = None,
    dry_run: bool = True,
    force: bool = False
):
    """
    Main function to generate plain language titles.

    Args:
        input_path: Path to citizens-charter.json
        output_path: Path to write updated data (default: overwrite input)
        dry_run: If True, print summary without saving
        force: If True, regenerate even if plain_language_name exists
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

    # Count existing plain_language_name
    existing_count = sum(1 for s in data['services'] if s.get('plain_language_name'))
    print(f"Existing plain_language_name: {existing_count}")

    # Generate titles
    updated_data, generated = generate_all_plain_titles(data, force=force)

    # Print summary
    print_generation_summary(generated)

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
        description='Generate plain_language_name from service_name'
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
    parser.add_argument(
        '--force',
        action='store_true',
        help='Regenerate even if plain_language_name exists'
    )

    args = parser.parse_args()

    exit(main(args.input, args.output, dry_run=not args.write, force=args.force))
