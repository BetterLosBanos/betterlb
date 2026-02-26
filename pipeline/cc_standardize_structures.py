"""
Standardize complex structures in Citizens Charter data.

This script handles:
1. Requirements with copies (standardize format)
2. supporting_documents_detail (standardize structure)
3. Client steps with sub_steps (standardize format)
4. Fees (convert all to dict format)
5. Fee schedules (keep for specific services)

Standardization Principles:
- Consistent structure across all services
- Remove deprecated fields (agency_action)
- Normalize formats (fees as dict only)
- Preserve all data while standardizing
"""

import json
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional, Literal


def create_backup(source_path: Path) -> Path:
    """Create a timestamped backup of the source file."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = source_path.parent / f"{source_path.stem}.backup_{timestamp}{source_path.suffix}"
    import shutil
    shutil.copy2(source_path, backup_path)
    print(f"Backup created: {backup_path}")
    return backup_path


def normalize_copies_field(copies_value: Any) -> str:
    """
    Normalize the copies field to a consistent string format.

    Args:
        copies_value: Current copies value (could be int, str, etc.)

    Returns:
        Normalized string value
    """
    if copies_value is None:
        return ""

    if isinstance(copies_value, int):
        return str(copies_value)

    if isinstance(copies_value, str):
        # Extract number if present
        match = re.search(r'\d+', copies_value)
        if match:
            return match.group(0)
        return copies_value.strip()

    return str(copies_value)


def standardize_requirement(requirement: Dict[str, Any]) -> Dict[str, Any]:
    """
    Standardize a single requirement to consistent format.

    Standard requirement structure:
    {
        "requirement": str,
        "where_to_secure": str,
        "copies": str (optional, empty string if not applicable)
    }

    Args:
        requirement: Requirement dictionary

    Returns:
        Standardized requirement dictionary
    """
    req = requirement.copy()

    # Normalize copies field
    if 'copies' in req:
        req['copies'] = normalize_copies_field(req['copies'])
        # Remove copies if it's empty after normalization
        if not req['copies'] or req['copies'] == '0' or req['copies'] == '1':
            del req['copies']
    else:
        # Add empty copies field for consistency (optional)
        # We'll remove it if not needed
        pass

    return req


def get_standard_supporting_documents_template() -> Dict[str, Any]:
    """
    Get the standard template for supporting_documents_detail.

    Standard structure:
    {
        "instruction": str (optional),
        "mandatory_requirements": {
            "instruction": str,
            "documents": [SupportingDocument]
        } (optional),
        "primary_documents": [SupportingDocument] (optional),
        "additional_documents": {
            "instruction": str,
            "documents": [SupportingDocument]
        } (optional),
        "conditional_requirements": {
            "instruction": str,
            "options": [ConditionalRequirement]
        } (optional),
        "note": str (optional)
    }
    """
    return {}


def standardize_supporting_document(doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Standardize a supporting document entry.

    Standard structure:
    {
        "document": str,
        "where_to_secure": str,
        "copies": str (optional),
        "note": str (optional)
    }
    """
    doc = doc.copy()

    # Ensure required fields
    if 'document' not in doc:
        doc['document'] = doc.get('requirement', '')

    # Normalize copies
    if 'copies' in doc:
        doc['copies'] = normalize_copies_field(doc['copies'])
        if not doc['copies'] or doc['copies'] == '0' or doc['copies'] == '1':
            del doc['copies']

    # Remove empty fields
    for key in list(doc.keys()):
        if key in ['note', 'copies'] and (not doc[key] or not str(doc[key]).strip()):
            del doc[key]

    return doc


def standardize_supporting_documents_detail(sdd: Dict[str, Any]) -> Dict[str, Any]:
    """
    Standardize supporting_documents_detail structure.

    Args:
        sdd: Supporting documents detail dictionary

    Returns:
        Standardized supporting documents detail
    """
    if not sdd or not isinstance(sdd, dict):
        return {}

    result = {}

    # Standardize instruction
    if 'instruction' in sdd and sdd['instruction']:
        result['instruction'] = sdd['instruction'].strip()

    # Standardize mandatory_requirements
    if 'mandatory_requirements' in sdd:
        mr = sdd['mandatory_requirements']
        if mr and isinstance(mr, dict):
            result['mandatory_requirements'] = {
                'instruction': mr.get('instruction', '').strip(),
                'documents': [
                    standardize_supporting_document(doc)
                    for doc in mr.get('documents', [])
                ]
            }

    # Standardize primary_documents
    if 'primary_documents' in sdd:
        result['primary_documents'] = [
            standardize_supporting_document(doc)
            for doc in sdd['primary_documents']
        ]

    # Standardize additional_documents
    if 'additional_documents' in sdd:
        ad = sdd['additional_documents']
        if ad and isinstance(ad, dict):
            result['additional_documents'] = {
                'instruction': ad.get('instruction', '').strip(),
                'documents': [
                    standardize_supporting_document(doc)
                    for doc in ad.get('documents', [])
                ]
            }

    # Standardize conditional_requirements
    if 'conditional_requirements' in sdd:
        cr = sdd['conditional_requirements']
        if cr and isinstance(cr, dict):
            result['conditional_requirements'] = {
                'instruction': cr.get('instruction', '').strip(),
                'options': [
                    {
                        'condition': opt.get('condition', '').strip(),
                        'document': opt.get('document', opt.get('requirement', '')).strip(),
                        'where_to_secure': opt.get('where_to_secure', '').strip(),
                        'copies': normalize_copies_field(opt.get('copies')) if opt.get('copies') else None,
                        'note': opt.get('note', '').strip() if opt.get('note') else None,
                        'if_unavailable': opt.get('if_unavailable', []) if opt.get('if_unavailable') else None
                    }
                    for opt in cr.get('options', [])
                ]
            }

    # Standardize note
    if 'note' in sdd and sdd['note']:
        result['note'] = sdd['note'].strip()

    return result


def standardize_client_step(step: Dict[str, Any]) -> Dict[str, Any]:
    """
    Standardize a single client step.

    Standard structure:
    {
        "step": int,
        "action": str,
        "sub_steps": [
            {
                "letter": str (A, B, C...),
                "action": str,
                "details": [str] (optional)
            }
        ] (optional),
        "url": str (optional),
        "processing_time": str (optional)
    }

    Note: agency_action is removed (deprecated)
    """
    step = step.copy()

    # Remove deprecated agency_action
    step.pop('agency_action', None)

    # Standardize action (already handled by cc_standardize_steps.py)
    if 'action' in step:
        step['action'] = step['action'].strip()

    # Standardize sub_steps
    if 'sub_steps' in step and step['sub_steps']:
        standardized_sub_steps = []
        for ss in step['sub_steps']:
            sub_step = ss.copy()
            sub_step['letter'] = sub_step['letter'].upper().strip()
            sub_step['action'] = sub_step['action'].strip()

            # Standardize details to list of strings
            if 'details' in sub_step and sub_step['details']:
                if isinstance(sub_step['details'], list):
                    sub_step['details'] = [str(d).strip() for d in sub_step['details'] if d and str(d).strip()]
                elif isinstance(sub_step['details'], str):
                    sub_step['details'] = [sub_step['details'].strip()]
                # Remove if empty
                if not sub_step['details']:
                    sub_step.pop('details', None)
            else:
                sub_step.pop('details', None)

            # Remove empty optional fields
            for key in list(sub_step.keys()):
                if key in ['note', 'copies'] and (not sub_step[key] or not str(sub_step[key]).strip()):
                    del sub_step[key]

            standardized_sub_steps.append(sub_step)

        step['sub_steps'] = standardized_sub_steps

    # Remove empty optional fields
    for key in ['url', 'processing_time']:
        if key in step and (not step[key] or not str(step[key]).strip()):
            step.pop(key, None)

    return step


def normalize_fee_to_dict(fee: Any, service_name: str = "") -> Dict[str, str]:
    """
    Normalize any fee format to standard dict format.

    Standard format:
    {
        "amount": str,
        "description": str
    }

    Args:
        fee: Fee value (dict, list, string, or None)
        service_name: Service name for context in error messages

    Returns:
        Normalized fee dict
    """
    if isinstance(fee, dict):
        # Already a dict - ensure it has the right structure
        return {
            'amount': str(fee.get('amount', '')),
            'description': str(fee.get('description', ''))
        }

    if isinstance(fee, list) and fee:
        # List format - combine first item as amount, rest as description
        if len(fee) == 1:
            first = fee[0]
            if isinstance(first, dict):
                return {
                    'amount': str(first.get('amount', '')),
                    'description': str(first.get('description', ''))
                }
            return {'amount': str(first), 'description': ''}
        else:
            amounts = []
            descriptions = []
            for item in fee:
                if isinstance(item, dict):
                    if item.get('amount'):
                        amounts.append(str(item['amount']))
                    if item.get('description'):
                        descriptions.append(str(item['description']))
                else:
                    amounts.append(str(item))
            return {
                'amount': ', '.join(amounts) if amounts else '',
                'description': ', '.join(descriptions) if descriptions else ''
            }

    if isinstance(fee, str):
        # String format - use as amount if it looks like a fee, otherwise as description
        fee_stripped = fee.strip()
        if re.match(r'^₱\d', fee_stripped) or re.match(r'^\d+(\.\d+)?\s*(php|pesos)?', fee_stripped, re.IGNORECASE):
            return {'amount': fee_stripped, 'description': ''}
        return {'amount': '', 'description': fee_stripped}

    # None or empty
    return {'amount': '', 'description': ''}


def standardize_fee_schedule_item(item: Dict[str, Any]) -> Dict[str, Any]:
    """
    Standardize a fee schedule item.

    Standard structure:
    {
        "name": str,
        "amount": str,
        "processing_time": str (optional),
        "office": str (optional),
        "category": str (optional),
        "url": str (optional)
    }
    """
    item = item.copy()

    # Ensure required fields
    if 'name' not in item:
        item['name'] = item.get('fee_name', item.get('description', ''))

    # Clean up empty optional fields
    for key in ['processing_time', 'office', 'category', 'url']:
        if key in item and (not item[key] or not str(item[key]).strip()):
            del item[key]

    return item


def should_have_fee_schedule(service: Dict[str, Any]) -> bool:
    """
    Determine if a service should have a fee_schedule.

    Fee schedules are for services that are essentially lists of fees
    rather than a single service with a single fee.

    Currently only: Collection of Other Payments (1.6)
    """
    service_name = service.get('service_name', '').lower()
    service_number = service.get('service_number', '')

    # Collection services
    if 'collection' in service_name and 'payment' in service_name:
        return True

    # Known fee schedule services
    if service_number == '1.6':
        return True

    return False


def standardize_service(service: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Standardize all structures in a single service.

    Args:
        service: Service dictionary

    Returns:
        Tuple of (standardized_service, list_of_changes)
    """
    service = service.copy()
    changes = []

    # Normalize type_of_transaction to G2C/G2B
    if 'type_of_transaction' in service:
        original = service['type_of_transaction']
        trans_type = original.strip()
        if 'G2B' in trans_type or 'Business' in trans_type:
            service['type_of_transaction'] = 'G2B'
        elif 'G2C' in trans_type or 'Citizen' in trans_type:
            service['type_of_transaction'] = 'G2C'
        if service['type_of_transaction'] != original:
            changes.append(f'type_of_transaction normalized: "{original}" → "{service["type_of_transaction"]}"')

    # Standardize requirements
    if 'requirements' in service and service['requirements']:
        original_count = len(service['requirements'])
        service['requirements'] = [
            standardize_requirement(req)
            for req in service['requirements']
        ]
        if len(service['requirements']) != original_count:
            changes.append(f'Requirements standardized')

    # Standardize supporting_documents_detail
    if 'supporting_documents_detail' in service:
        original_sdd = service['supporting_documents_detail']
        if original_sdd:
            service['supporting_documents_detail'] = standardize_supporting_documents_detail(original_sdd)
            changes.append('Supporting documents detail standardized')

    # Standardize client_steps
    if 'client_steps' in service and service['client_steps']:
        service['client_steps'] = [
            standardize_client_step(step)
            for step in service['client_steps']
        ]
        # Check if agency_action was removed
        for step in service['client_steps']:
            if 'agency_action' in step:
                del step['agency_action']
                changes.append('Removed deprecated agency_action field')
                break

    # Standardize fees
    if 'fees' in service:
        original_fees = service['fees']
        original_type = type(original_fees).__name__
        service['fees'] = normalize_fee_to_dict(original_fees, service.get('service_name', ''))
        if original_type != 'dict':
            changes.append(f'Fees converted from {original_type} to dict')

    # Standardize fee_schedule if present
    if 'fee_schedule' in service and service['fee_schedule']:
        service['fee_schedule'] = [
            standardize_fee_schedule_item(item)
            for item in service['fee_schedule']
        ]
        changes.append('Fee schedule standardized')

    # Remove deprecated person_responsible
    if 'person_responsible' in service:
        del service['person_responsible']
        changes.append('Removed deprecated person_responsible field')

    return service, changes


def standardize_all_services(
    data: Dict[str, Any]
) -> Tuple[Dict[str, Any], Dict[str, List[str]]]:
    """
    Standardize all structures across all services.

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
        standardized, changes = standardize_service(service)

        if changes:
            changes_by_service[service_number] = changes

        result['services'].append(standardized)

    return result, changes_by_service


def print_standardization_summary(
    changes_by_service: Dict[str, List[str]],
    original_data: Dict[str, Any],
    updated_data: Dict[str, Any]
):
    """Print a summary of standardization changes."""
    print("\n" + "=" * 70)
    print("STRUCTURE STANDARDIZATION SUMMARY")
    print("=" * 70)

    if not changes_by_service:
        print("\nNo changes needed - all structures are already standardized!")
    else:
        print(f"\nServices modified: {len(changes_by_service)}")
        print(f"Total changes: {sum(len(c) for c in changes_by_service.values())}")

        # Count by change type
        change_counts = {}
        for changes in changes_by_service.values():
            for change in changes:
                change_counts[change] = change_counts.get(change, 0) + 1

        print("\nChanges by type:")
        for change, count in sorted(change_counts.items(), key=lambda x: -x[1]):
            print(f"  {change}: {count}")

        # Show services with most changes
        sorted_services = sorted(changes_by_service.items(), key=lambda x: len(x[1]), reverse=True)
        if sorted_services:
            print(f"\nServices with most changes:")
            for service_number, changes in sorted_services[:5]:
                print(f"  {service_number}: {len(changes)} changes")

    # Structure statistics
    print("\n" + "-" * 70)
    print("STRUCTURE STATISTICS")

    # Requirements with copies
    req_with_copies = sum(
        1 for s in updated_data['services']
        for r in s.get('requirements', [])
        if r.get('copies')
    )
    print(f"Requirements with copies: {req_with_copies}")

    # Supporting documents detail
    sdd_count = sum(1 for s in updated_data['services'] if s.get('supporting_documents_detail'))
    print(f"Services with supporting_documents_detail: {sdd_count}")

    # Sub-steps
    steps_with_substeps = sum(
        1 for s in updated_data['services']
        if any(st.get('sub_steps') for st in s.get('client_steps', []))
    )
    print(f"Services with sub_steps: {steps_with_substeps}")

    # Fee schedules
    fee_sched_count = sum(1 for s in updated_data['services'] if s.get('fee_schedule'))
    print(f"Services with fee_schedule: {fee_sched_count}")

    # Fee formats
    fee_types = {}
    for s in updated_data['services']:
        ft = type(s.get('fees')).__name__
        fee_types[ft] = fee_types.get(ft, 0) + 1
    print(f"Fee formats: {fee_types}")

    # Deprecated fields
    with_person_responsible = sum(1 for s in updated_data['services'] if s.get('person_responsible'))
    with_agency_action = sum(
        1 for s in updated_data['services']
        if any(st.get('agency_action') for st in s.get('client_steps', []))
    )
    print(f"Services with person_responsible (deprecated): {with_person_responsible}")
    print(f"Services with agency_action in steps (deprecated): {with_agency_action}")

    print("=" * 70)


def main(
    input_path: str = 'src/data/citizens-charter/citizens-charter.json',
    output_path: str = None,
    dry_run: bool = True
):
    """
    Main function to standardize structures.

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

    # Standardize structures
    updated_data, changes_by_service = standardize_all_services(data)

    # Print summary
    print_standardization_summary(changes_by_service, data, updated_data)

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
        description='Standardize complex structures in Citizens Charter data'
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
