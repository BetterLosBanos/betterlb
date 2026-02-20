"""
Plain language standardization for Citizens Charter client steps.

Follows UK GOV.UK plain language standard:
https://www.gov.uk/guidance/style-guide/a-to-z

Key principles:
1. Use imperative verbs: "Submit" (not "Submits"), "Pay" (not "Payment")
2. Active voice: "Submit requirements" (not "Requirements are submitted")
3. Address the user as "you" where appropriate
4. No need to say "please" in instructions
5. Be specific and clear - avoid vague terms
6. Use short words - 'buy' not 'purchase', 'help' not 'assist'
7. Write conversationally - as if talking one-to-one
"""

import json
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Tuple


def create_backup(source_path: Path) -> Path:
    """Create a timestamped backup of the source file."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = source_path.parent / f"{source_path.stem}.backup_{timestamp}{source_path.suffix}"
    import shutil
    shutil.copy2(source_path, backup_path)
    print(f"Backup created: {backup_path}")
    return backup_path


# Imperative verb conversion patterns
# Third-person singular -> Imperative
THIRD_PERSON_TO_IMPERATIVE = {
    r'\bSubmits?\b': 'Submit',
    r'\bPresents?\b': 'Present',
    r'\bPays?\b': 'Pay',
    r'\bReceives?\b': 'Receive',
    r'\bReviews?\b': 'Review',
    r'\bApproves?\b': 'Approve',
    r'\bProcesses?\b': 'Process',
    r'\bIssues?\b': 'Issue',
    r'\bSigns?\b': 'Sign',
    r'\bCompletes?\b': 'Complete',
    r'\bPrepares?\b': 'Prepare',
    r'\bAttaches?\b': 'Attach',
    r'\bDownloads?\b': 'Download',
    r'\bPrints?\b': 'Print',
    r'\bFills?\s+out\b': 'Fill out',
    r'\bFill\b(?!\s+out)': 'Fill',  # Match "Fill" but not "Fill out"
    r'\bEncodes?\b': 'Encode',
    r'\bRegisters?\b': 'Register',
    r'\bClaims?\b': 'Claim',
    r'\bAppears?\b': 'Appear',
}

# Passive voice -> Active voice patterns
PASSIVE_TO_ACTIVE = {
    r'\bRequirements?\s+(?:are|is)\s+(?:received|accepted|submitted|processed)\b': 'Submit requirements',
    r'\bDocuments?\s+(?:are|is)\s+(?:received|accepted|submitted|processed)\b': 'Submit documents',
    r'\bApplication?\s+(?:are|is)\s+(?:received|accepted|submitted|processed)\b': 'Submit application',
    r'\bFees?\s+(?:are|is)\s+(?:paid|collected)\b': 'Pay fees',
}

# Noun phrases -> Verb phrases
# NOTE: Patterns must be specific to avoid incorrect replacements
# Technical terms like "inspection", "evaluation", "approval" are already plain language
# when used in context. Only transform noun phrases that are clearly bureaucratic.
NOUN_TO_VERB = {
    r'\bPayment?\s+(?:of|for)\s+(?:fees?|charges?)?\b': 'Pay fees',
    r'\bSubmission?\s+(?:of|for)\s+(?:requirements?|documents?)?\b': 'Submit requirements',
    # REMOVED: r'\bEvaluation?\b': 'Evaluate' - Too broad, "evaluation" is already plain language
    # REMOVED: r'\bApproval?\b': 'Receive approval' - Too broad, can break phrases like "for approval"
    # REMOVED: r'\bInspection?\b': 'Complete inspection' - Creates double words!
}

# Vague terms to specific replacements
VAGUE_TO_SPECIFIC = {
    r'\bPayment\s+and\s+approval\b': 'Pay fees and receive approval',
    r'\bTransact\s+business\b': 'Complete your transaction',
    r'\bProceed\s+to\s+\w+\b': None,  # Will be handled by context
}


def standardize_action(action: str) -> Tuple[str, List[str]]:
    """
    Standardize a single client action to plain language.

    Args:
        action: Original action string

    Returns:
        Tuple of (standardized_action, list_of_changes_made)
    """
    if not action or not action.strip():
        return "", []

    original = action.strip()
    changes = []

    # Apply transformations in order
    result = original

    # 1. Third-person to imperative
    for pattern, replacement in THIRD_PERSON_TO_IMPERATIVE.items():
        new_result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
        if new_result != result:
            changes.append(f"Third-person to imperative: '{result[:30]}...' -> '{new_result[:30]}...'")
            result = new_result

    # 2. Passive to active
    for pattern, replacement in PASSIVE_TO_ACTIVE.items():
        new_result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
        if new_result != result:
            changes.append(f"Passive to active: '{result[:30]}...' -> '{new_result[:30]}...'")
            result = new_result

    # 3. Noun to verb
    for pattern, replacement in NOUN_TO_VERB.items():
        if replacement is None:
            continue
        new_result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
        if new_result != result:
            changes.append(f"Noun to verb: '{result[:30]}...' -> '{new_result[:30]}...'")
            result = new_result

    # 4. Vague to specific
    for pattern, replacement in VAGUE_TO_SPECIFIC.items():
        if replacement is None:
            continue
        new_result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
        if new_result != result:
            changes.append(f"Vague to specific: '{result[:30]}...' -> '{new_result[:30]}...'")
            result = new_result

    # 5. Common website/portal patterns
    # "Visit ebosslosbanos.com and..." -> "Go to ebosslosbanos.com and..."
    result = re.sub(
        r'\bVisit\s+(https?://[^\s]+|www\.[^\s]+|[^\s]+\.(?:com|ph|gov|org)[^\s]*)',
        r'Go to \1',
        result,
        flags=re.IGNORECASE
    )

    # 6. Remove "Please" prefix
    result = re.sub(r'^Please\s+', '', result, flags=re.IGNORECASE)

    # 7. Capitalize first letter
    if result:
        result = result[0].upper() + result[1:]

    # 8. Clean up extra spaces
    result = re.sub(r'\s+', ' ', result).strip()

    return result, changes


def standardize_step(step: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Standardize a single client step.

    Args:
        step: Step dictionary with action and optional sub_steps

    Returns:
        Tuple of (standardized_step, list_of_changes_made)
    """
    step = step.copy()
    all_changes = []

    # Standardize main action
    if 'action' in step:
        new_action, changes = standardize_action(step['action'])
        if changes:
            step['action'] = new_action
            all_changes.extend(changes)

    # Standardize sub-steps
    if 'sub_steps' in step and step['sub_steps']:
        for sub_step in step['sub_steps']:
            if 'action' in sub_step:
                new_action, changes = standardize_action(sub_step['action'])
                if changes:
                    sub_step['action'] = new_action
                    all_changes.extend([f"Sub-step: {c}" for c in changes])

    # Remove agency_action if present (deprecated field)
    if 'agency_action' in step:
        del step['agency_action']

    return step, all_changes


def standardize_service_steps(service: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Standardize all steps for a single service.

    Args:
        service: Service dictionary

    Returns:
        Tuple of (updated_service, list_of_changes_made)
    """
    service = service.copy()
    all_changes = []

    if 'client_steps' not in service:
        return service, all_changes

    standardized_steps = []
    for step in service['client_steps']:
        new_step, changes = standardize_step(step)
        standardized_steps.append(new_step)
        all_changes.extend(changes)

    if all_changes:
        service['client_steps'] = standardized_steps

    return service, all_changes


def standardize_all_steps(
    data: Dict[str, Any],
    verbose: bool = False
) -> Tuple[Dict[str, Any], Dict[str, List[str]]]:
    """
    Standardize all client steps across all services.

    Args:
        data: Citizens Charter data with services array
        verbose: If True, print detailed changes

    Returns:
        Tuple of (updated_data, changes_by_service)
    """
    result = data.copy()
    result['services'] = []
    changes_by_service = {}

    for service in data['services']:
        service_number = service.get('service_number', 'UNKNOWN')
        updated, changes = standardize_service_steps(service)

        if changes:
            changes_by_service[service_number] = changes

        result['services'].append(updated)

    return result, changes_by_service


def print_standardization_summary(changes_by_service: Dict[str, List[str]]):
    """Print a summary of standardization changes."""
    print("\n" + "=" * 70)
    print("PLAIN LANGUAGE STANDARDIZATION SUMMARY")
    print("=" * 70)

    if not changes_by_service:
        print("\nNo changes needed - all actions already follow plain language standard!")
    else:
        print(f"\nServices modified: {len(changes_by_service)}")
        print(f"Total changes: {sum(len(c) for c in changes_by_service.values())}")

        print("\nChanges by service:")
        for service_number, changes in sorted(changes_by_service.items()):
            print(f"\n{service_number}:")
            for change in changes[:5]:  # Show first 5 changes per service
                print(f"  - {change}")
            if len(changes) > 5:
                print(f"  ... and {len(changes) - 5} more changes")

    print("=" * 70)


def main(
    input_path: str = 'src/data/citizens-charter/citizens-charter.json',
    output_path: str = None,
    dry_run: bool = True,
    verbose: bool = False
):
    """
    Main function to standardize client steps to plain language.

    Args:
        input_path: Path to citizens-charter.json
        output_path: Path to write updated data (default: overwrite input)
        dry_run: If True, print summary without saving
        verbose: If True, print detailed changes
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

    # Count total steps
    total_steps = sum(len(s.get('client_steps', [])) for s in data['services'])
    print(f"Total client steps: {total_steps}")

    # Standardize steps
    updated_data, changes_by_service = standardize_all_steps(data, verbose=verbose)

    # Print summary
    print_standardization_summary(changes_by_service)

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
        description='Standardize client steps to UK GOV.UK plain language'
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
        '-v', '--verbose',
        action='store_true',
        help='Print detailed changes for each service'
    )

    args = parser.parse_args()

    exit(main(args.input, args.output, dry_run=not args.write, verbose=args.verbose))
