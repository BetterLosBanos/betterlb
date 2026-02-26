"""
Data quality fixes for Citizens Charter data.

Fixes:
1. Truncated requirements (detect patterns: "(if", "(for", ", ", " or ")
2. Missing where_to_secure (smart inference, default to "Contact the office")
3. Fee format unification (list -> dict, string -> dict, null -> dict)
4. Processing time standardization
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


# Truncation patterns
TRUNCATION_PATTERNS = [
    r'\(if$',          # Ends with "(if"
    r'\(for$',         # Ends with "(for"
    r',\s*$',          # Ends with comma
    r'\s+or\s*$',      # Ends with " or "
    r'\s+and\s*$',     # Ends with " and "
]

# Office abbreviation expansions
OFFICE_ABBREVIATIONS = {
    'DTI': 'Department of Trade and Industry',
    'SEC': 'Securities and Exchange Commission',
    'BIR': 'Bureau of Internal Revenue',
    'SSS': 'Social Security System',
    'PhilHealth': 'Philippine Health Insurance Corporation',
    'Pag-IBIG': 'Pag-IBIG Fund',
    'DOST': 'Department of Science and Technology',
    'DENR': 'Department of Environment and Natural Resources',
    'BFP': 'Bureau of Fire Protection',
    'PNP': 'Philippine National Police',
    'NBI': 'National Bureau of Investigation',
    'LTO': 'Land Transportation Office',
}


def is_requirement_truncated(requirement: str) -> bool:
    """
    Check if a requirement appears to be truncated.

    Args:
        requirement: Requirement text

    Returns:
        True if requirement appears truncated
    """
    if not requirement or not requirement.strip():
        return False

    text = requirement.strip()

    for pattern in TRUNCATION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True

    return False


def infer_where_to_secure(requirement: str) -> Tuple[Optional[str], float]:
    """
    Infer where_to_secure from requirement text.

    Args:
        requirement: Requirement text

    Returns:
        Tuple of (inferred_where_to_secure, confidence)
        Confidence is 0.0-1.0
    """
    if not requirement or not requirement.strip():
        return None, 0.0

    text = requirement.lower()

    # Check for government agencies
    for abbrev, full_name in OFFICE_ABBREVIATIONS.items():
        if abbrev.lower() in text:
            return full_name, 0.9

    # Check for common patterns
    if 'barangay' in text:
        if 'clearance' in text:
            return 'Barangay Hall', 0.85
        return 'Barangay Hall', 0.75

    if 'mayor' in text:
        return "Mayor's Office", 0.85

    if 'court' in text:
        return 'Regional Trial Court', 0.8

    if 'fiscal' in text:
        return "Prosecutor's Office", 0.85

    if 'police' in text:
        return 'Philippine National Police', 0.85

    if 'nbi' in text or 'national bureau' in text:
        return 'National Bureau of Investigation', 0.9

    if 'bir' in text or 'tax' in text:
        return 'Bureau of Internal Revenue', 0.8

    if 'sss' in text:
        return 'Social Security System', 0.9

    if 'philhealth' in text:
        return 'Philippine Health Insurance Corporation', 0.9

    if 'pag-ibig' in text:
        return 'Pag-IBIG Fund', 0.9

    if 'dti' in text:
        return 'Department of Trade and Industry', 0.9

    if 'sec' in text:
        return 'Securities and Exchange Commission', 0.9

    # Default: low confidence
    return None, 0.0


def normalize_fee(fee: Any) -> Dict[str, str]:
    """
    Normalize fee to dict format.

    Args:
        fee: Fee value (dict, list, string, or None)

    Returns:
        Normalized fee dict with 'amount' and 'description'
    """
    if isinstance(fee, dict):
        # Already a dict - ensure it has the right structure
        return {
            'amount': fee.get('amount', ''),
            'description': fee.get('description', '')
        }

    if isinstance(fee, list) and fee:
        # List format - convert to dict with description
        if len(fee) == 1:
            return {'amount': str(fee[0]), 'description': ''}
        else:
            return {
                'amount': str(fee[0]) if fee else '',
                'description': ', '.join(str(f) for f in fee[1:]) if len(fee) > 1 else ''
            }

    if isinstance(fee, str):
        # String format
        return {'amount': fee, 'description': ''}

    # None or empty
    return {'amount': '', 'description': ''}


def fix_requirement(requirement: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Fix issues with a single requirement.

    Args:
        requirement: Requirement dictionary

    Returns:
        Tuple of (fixed_requirement, list_of_issues)
    """
    req = requirement.copy()
    issues = []

    # Check for truncation
    req_text = req.get('requirement', '')
    if is_requirement_truncated(req_text):
        issues.append(f"Truncated: '{req_text[:50]}...'")

    # Fix missing where_to_secure
    where = req.get('where_to_secure', '')
    if not where or not where.strip():
        inferred, confidence = infer_where_to_secure(req_text)
        if inferred and confidence >= 0.7:
            req['where_to_secure'] = inferred
            issues.append(f"Inferred where_to_secure: '{inferred}' (confidence: {confidence:.2f})")
        else:
            req['where_to_secure'] = 'Contact the office'
            issues.append(f"Missing where_to_secure: set to 'Contact the office'")

    return req, issues


def fix_service_requirements(service: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Fix all requirements for a single service.

    Args:
        service: Service dictionary

    Returns:
        Tuple of (updated_service, list_of_issues)
    """
    service = service.copy()
    all_issues = []

    if 'requirements' not in service:
        return service, all_issues

    fixed_requirements = []
    for req in service['requirements']:
        fixed, issues = fix_requirement(req)
        fixed_requirements.append(fixed)
        all_issues.extend(issues)

    if all_issues:
        service['requirements'] = fixed_requirements

    return service, all_issues


def fix_service_fees(service: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Fix fee format for a single service.

    Args:
        service: Service dictionary

    Returns:
        Tuple of (updated_service, list_of_issues)
    """
    service = service.copy()
    issues = []

    if 'fees' not in service:
        return service, issues

    current_fees = service['fees']
    normalized = normalize_fee(current_fees)

    # Check if format was changed
    if type(current_fees) != type(normalized):
        if isinstance(current_fees, list):
            issues.append(f"Fees: list -> dict")
        elif isinstance(current_fees, str):
            issues.append(f"Fees: string -> dict")
        elif current_fees is None:
            issues.append(f"Fees: null -> dict")

    service['fees'] = normalized
    return service, issues


def standardize_processing_time(time_str: str) -> str:
    """
    Standardize processing time format.

    Args:
        time_str: Processing time string

    Returns:
        Standardized time string
    """
    if not time_str or not time_str.strip():
        return ""

    time_str = time_str.strip()

    # Capitalize first letter only
    if time_str:
        time_str = time_str[0].upper() + time_str[1:].lower()

    # Fix common abbreviations
    time_str = re.sub(r'\bmins?\b', 'minutes', time_str, flags=re.IGNORECASE)
    time_str = re.sub(r'\bhrs?\b', 'hours', time_str, flags=re.IGNORECASE)
    time_str = re.sub(r'&', ' & ', time_str)

    # Clean up extra spaces
    time_str = re.sub(r'\s+', ' ', time_str)

    return time_str.strip()


def fix_service(service: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Fix all quality issues for a single service.

    Args:
        service: Service dictionary

    Returns:
        Tuple of (updated_service, list_of_issues)
    """
    service = service.copy()
    all_issues = []

    # Fix requirements
    service, req_issues = fix_service_requirements(service)
    all_issues.extend(req_issues)

    # Fix fees
    service, fee_issues = fix_service_fees(service)
    all_issues.extend(fee_issues)

    # Standardize processing time
    if 'processing_time' in service:
        original = service['processing_time']
        standardized = standardize_processing_time(original)
        if standardized != original:
            service['processing_time'] = standardized
            all_issues.append(f"Processing time standardized: '{original}' -> '{standardized}'")

    # Remove deprecated person_responsible if present
    if 'person_responsible' in service:
        del service['person_responsible']

    return service, all_issues


def fix_all_services(
    data: Dict[str, Any]
) -> Tuple[Dict[str, Any], Dict[str, List[str]]]:
    """
    Fix all quality issues across all services.

    Args:
        data: Citizens Charter data with services array

    Returns:
        Tuple of (updated_data, issues_by_service)
    """
    result = data.copy()
    result['services'] = []
    issues_by_service = {}

    for service in data['services']:
        service_number = service.get('service_number', 'UNKNOWN')
        updated, issues = fix_service(service)

        if issues:
            issues_by_service[service_number] = issues

        result['services'].append(updated)

    return result, issues_by_service


def print_fix_summary(issues_by_service: Dict[str, List[str]]):
    """Print a summary of fixes applied."""
    print("\n" + "=" * 70)
    print("DATA QUALITY FIX SUMMARY")
    print("=" * 70)

    if not issues_by_service:
        print("\nNo issues found - all data is clean!")
    else:
        print(f"\nServices with issues: {len(issues_by_service)}")
        print(f"Total fixes applied: {sum(len(i) for i in issues_by_service.values())}")

        # Count by fix type
        truncation_count = sum(
            1 for issues in issues_by_service.values()
            for issue in issues
            if 'Truncated' in issue
        )
        missing_where_count = sum(
            1 for issues in issues_by_service.values()
            for issue in issues
            if 'Missing where_to_secure' in issue
        )
        inferred_where_count = sum(
            1 for issues in issues_by_service.values()
            for issue in issues
            if 'Inferred where_to_secure' in issue
        )
        fee_fix_count = sum(
            1 for issues in issues_by_service.values()
            for issue in issues
            if 'Fees:' in issue
        )
        time_fix_count = sum(
            1 for issues in issues_by_service.values()
            for issue in issues
            if 'Processing time' in issue
        )

        print(f"\nFix breakdown:")
        print(f"  Truncated requirements:     {truncation_count}")
        print(f"  Missing where_to_secure:    {missing_where_count}")
        print(f"  Inferred where_to_secure:   {inferred_where_count}")
        print(f"  Fee format fixes:           {fee_fix_count}")
        print(f"  Processing time fixes:      {time_fix_count}")

        # Show services with most issues
        sorted_services = sorted(issues_by_service.items(), key=lambda x: len(x[1]), reverse=True)
        if sorted_services:
            print(f"\nServices with most issues:")
            for service_number, issues in sorted_services[:5]:
                print(f"  {service_number}: {len(issues)} issues")

    print("=" * 70)


def main(
    input_path: str = 'src/data/citizens-charter/citizens-charter.json',
    output_path: str = None,
    dry_run: bool = True
):
    """
    Main function to fix data quality issues.

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

    # Count total requirements
    total_reqs = sum(len(s.get('requirements', [])) for s in data['services'])
    print(f"Total requirements: {total_reqs}")

    # Fix issues
    updated_data, issues_by_service = fix_all_services(data)

    # Print summary
    print_fix_summary(issues_by_service)

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
        description='Fix data quality issues in Citizens Charter data'
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
