"""
Updated JSON schema validation for Citizens Charter service data.

New schema features:
- plain_language_name: required field (auto-generated from service_name)
- turnaround_time: optional field for complex services
- agency_action: removed from ClientStep (deprecated)
- person_responsible: removed (deprecated)
- fees: dict format only (no array or string)
- type_of_transaction: normalized to "G2C" or "G2B" (without parenthetical)
"""

import json
from typing import Dict, List, Tuple, Any, Optional
from pathlib import Path


# Citizens Charter service data schema
CITIZENS_CHARTER_SCHEMA = {
    "type": "object",
    "required": [
        "service_number",
        "service_name",
        "plain_language_name",
        "office_division",
        "classification",
        "type_of_transaction",
        "who_may_avail",
        "requirements",
        "client_steps",
        "fees",
        "processing_time"
    ],
    "properties": {
        "service_number": {
            "type": "string",
            "pattern": r"^\d+\.\d+$"  # e.g., "1.1", "29.5"
        },
        "service_name": {
            "type": "string",
            "minLength": 1
        },
        "plain_language_name": {
            "type": "string",
            "minLength": 1,
            "description": "Plain language version of service_name following UK GOV.UK standard"
        },
        "office_division": {
            "type": "string",
            "minLength": 1
        },
        "classification": {
            "type": "string",
            "enum": ["Simple", "Complex"]
        },
        "type_of_transaction": {
            "type": "string",
            "enum": ["G2C", "G2B"]
        },
        "who_may_avail": {
            "type": "string",
            "minLength": 1
        },
        "requirements": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["requirement", "where_to_secure"],
                "properties": {
                    "requirement": {"type": "string", "minLength": 1},
                    "where_to_secure": {"type": "string", "minLength": 1},
                    "copies": {"type": "string"},
                    "serviceSlug": {"type": "string"}
                }
            }
        },
        "client_steps": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["step", "action"],
                "properties": {
                    "step": {"type": "integer", "minimum": 1},
                    "action": {
                        "type": "string",
                        "minLength": 1,
                        "description": "Must use imperative language (e.g., 'Submit requirements')"
                    },
                    "sub_steps": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["letter", "action"],
                            "properties": {
                                "letter": {"type": "string", "pattern": r"^[A-Z]$"},
                                "action": {"type": "string", "minLength": 1},
                                "details": {"type": "array", "items": {"type": "string"}}
                            }
                        }
                    },
                    "url": {"type": "string", "format": "uri"},
                    "processing_time": {"type": "string"}
                }
            }
        },
        "fees": {
            "type": "object",
            "required": ["amount"],
            "properties": {
                "amount": {"type": "string"},
                "description": {"type": "string"}
            }
        },
        "fee_schedule": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["name", "amount"],
                "properties": {
                    "name": {"type": "string"},
                    "amount": {"type": "string"},
                    "processing_time": {"type": "string"},
                    "office": {"type": "string"},
                    "category": {"type": "string"},
                    "url": {"type": "string", "format": "uri"}
                }
            }
        },
        "processing_time": {
            "type": "string",
            "description": "In-person transaction time (e.g., '15 minutes', '2 hours')"
        },
        "turnaround_time": {
            "type": "string",
            "description": "Total time including waiting/approval (e.g., '3-5 working days')"
        },
        "website": {
            "type": "string",
            "format": "uri"
        },
        "supporting_documents_detail": {
            "type": "object",
            "properties": {
                "instruction": {"type": "string"},
                "mandatory_requirements": {
                    "type": "object",
                    "properties": {
                        "instruction": {"type": "string"},
                        "documents": {"type": "array"}
                    }
                },
                "primary_documents": {"type": "array"},
                "additional_documents": {
                    "type": "object",
                    "properties": {
                        "instruction": {"type": "string"},
                        "documents": {"type": "array"}
                    }
                },
                "conditional_requirements": {
                    "type": "object",
                    "properties": {
                        "instruction": {"type": "string"},
                        "options": {"type": "array"}
                    }
                },
                "note": {"type": "string"}
            }
        }
    }
}


def validate_service_data(service_json: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate extracted service data against schema.

    Args:
        service_json: Dictionary containing service data

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []

    # Check required fields exist
    required_fields = [
        'service_number', 'service_name', 'plain_language_name', 'office_division',
        'classification', 'type_of_transaction', 'who_may_avail',
        'requirements', 'client_steps', 'fees', 'processing_time'
    ]

    for field in required_fields:
        if field not in service_json:
            errors.append(f"Missing required field: {field}")
            continue

        # Type checks
        if field == 'service_number':
            if not isinstance(service_json[field], str):
                errors.append("service_number must be a string")
            elif not _is_valid_service_number(service_json[field]):
                errors.append(f"Invalid service_number format: {service_json[field]}")

        elif field == 'plain_language_name':
            if not isinstance(service_json[field], str) or not service_json[field].strip():
                errors.append(f"plain_language_name must be a non-empty string")
            else:
                # Check if it follows plain language principles
                plain_name = service_json[field]
                if plain_name.startswith('Issuance') or plain_name.startswith('Request'):
                    errors.append(f"plain_language_name should not start with 'Issuance' or 'Request': '{plain_name}'")

        elif field == 'classification':
            if service_json[field] not in ['Simple', 'Complex']:
                errors.append(f"Invalid classification: {service_json[field]}")

        elif field == 'type_of_transaction':
            # Normalize to G2C/G2B
            trans_type = service_json[field].strip()
            valid_types = ['G2C', 'G2B']
            if trans_type not in valid_types:
                errors.append(f"Invalid type_of_transaction: {service_json[field]} (must be 'G2C' or 'G2B')")

        elif field == 'requirements':
            if not isinstance(service_json[field], list):
                errors.append("requirements must be an array")
            else:
                for i, req in enumerate(service_json[field]):
                    if not isinstance(req, dict):
                        errors.append(f"requirements[{i}] must be an object")
                        continue
                    if 'requirement' not in req or not req['requirement']:
                        errors.append(f"requirements[{i}] missing 'requirement' field or empty")
                    if 'where_to_secure' not in req or not req['where_to_secure']:
                        errors.append(f"requirements[{i}] missing 'where_to_secure' field or empty")

        elif field == 'client_steps':
            if not isinstance(service_json[field], list):
                errors.append("client_steps must be an array")
            else:
                if not service_json[field]:
                    errors.append("client_steps cannot be empty")
                else:
                    for i, step in enumerate(service_json[field]):
                        if not isinstance(step, dict):
                            errors.append(f"client_steps[{i}] must be an object")
                            continue
                        if 'step' not in step:
                            errors.append(f"client_steps[{i}] missing 'step' field")
                        if 'action' not in step or not step['action']:
                            errors.append(f"client_steps[{i}] missing 'action' field or empty")

                        # Check for deprecated agency_action
                        if 'agency_action' in step:
                            errors.append(f"client_steps[{i}] contains deprecated field 'agency_action'")

        elif field == 'fees':
            if not isinstance(service_json[field], dict):
                errors.append("fees must be an object (dict), not array or string")
            else:
                if 'amount' not in service_json[field]:
                    errors.append("fees missing 'amount' field")

        # Check for deprecated person_responsible field
        if 'person_responsible' in service_json:
            errors.append("Service contains deprecated field 'person_responsible'")

    # Validate step sequence
    if 'client_steps' in service_json and isinstance(service_json['client_steps'], list):
        steps = service_json['client_steps']
        for i, step in enumerate(steps):
            if isinstance(step, dict) and 'step' in step:
                expected_step = i + 1
                if step['step'] != expected_step:
                    errors.append(f"client_steps[{i}] has step number {step['step']}, expected {expected_step}")

    return len(errors) == 0, errors


def _is_valid_service_number(number: str) -> bool:
    """Check if service number matches pattern X.Y (e.g., '1.1', '29.5')"""
    import re
    return bool(re.match(r'^\d+\.\d+$', number))


def normalize_service_data(service_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize service data to fix common issues.

    Args:
        service_json: Raw extracted service data

    Returns:
        Normalized service data
    """
    normalized = service_json.copy()

    # Normalize classification
    if 'classification' in normalized:
        classification = normalized['classification'].strip().title()
        if classification == 'Simple':
            normalized['classification'] = 'Simple'
        elif classification == 'Complex':
            normalized['classification'] = 'Complex'

    # Normalize type_of_transaction to G2C/G2B
    if 'type_of_transaction' in normalized:
        trans_type = normalized['type_of_transaction'].strip()
        if 'G2B' in trans_type or 'Business' in trans_type:
            normalized['type_of_transaction'] = 'G2B'
        elif 'G2C' in trans_type or 'Citizen' in trans_type:
            normalized['type_of_transaction'] = 'G2C'

    # Ensure arrays exist
    if 'requirements' not in normalized or not isinstance(normalized['requirements'], list):
        normalized['requirements'] = []
    if 'client_steps' not in normalized or not isinstance(normalized['client_steps'], list):
        normalized['client_steps'] = []

    # Ensure fees object exists
    if 'fees' not in normalized or not isinstance(normalized['fees'], dict):
        normalized['fees'] = {'amount': '', 'description': ''}

    # Remove deprecated fields
    normalized.pop('person_responsible', None)
    for step in normalized.get('client_steps', []):
        step.pop('agency_action', None)

    # Remove empty or placeholder values
    if 'processing_time' not in normalized or not normalized['processing_time']:
        normalized['processing_time'] = ''

    # Generate plain_language_name if missing
    if 'plain_language_name' not in normalized or not normalized['plain_language_name']:
        if 'service_name' in normalized:
            # Use service_name as fallback
            normalized['plain_language_name'] = normalized['service_name']

    # Clean up empty requirements
    normalized['requirements'] = [
        req for req in normalized['requirements']
        if isinstance(req, dict) and req.get('requirement') and req.get('requirement').strip()
    ]

    # Clean up empty steps
    normalized['client_steps'] = [
        step for step in normalized['client_steps']
        if isinstance(step, dict) and step.get('action') and step.get('action').strip()
    ]

    # Re-sequence steps
    for i, step in enumerate(normalized['client_steps']):
        step['step'] = i + 1

    return normalized


def validate_batch(services: List[Dict[str, Any]]) -> Tuple[int, List[Tuple[str, List[str]]]]:
    """
    Validate multiple services and return summary.

    Args:
        services: List of service dictionaries

    Returns:
        Tuple of (valid_count, list_of_(service_number, errors))
    """
    valid_count = 0
    all_errors = []

    for service in services:
        service_number = service.get('service_number', 'UNKNOWN')
        is_valid, errors = validate_service_data(service)

        if is_valid:
            valid_count += 1
        else:
            all_errors.append((service_number, errors))

    return valid_count, all_errors


def save_validation_report(
    services: List[Dict[str, Any]],
    output_path: str,
    report_name: str = "validation_report"
):
    """Save validation report to JSON file."""
    valid_count, errors = validate_batch(services)

    report = {
        "report_name": report_name,
        "total_services": len(services),
        "valid_count": valid_count,
        "invalid_count": len(services) - valid_count,
        "errors": [
            {
                "service_number": service_num,
                "issues": issue_list
            }
            for service_num, issue_list in errors
        ]
    }

    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, 'w') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    return report


if __name__ == "__main__":
    # Test with example data
    example_service = {
        "service_number": "1.1",
        "service_name": "Business Registration (Renewal) - Face to Face",
        "plain_language_name": "Renew your business registration in person",
        "office_division": "BUSINESS PERMIT AND LICENSING OFFICE (BPLO)",
        "classification": "Simple",
        "type_of_transaction": "G2B",
        "who_may_avail": "All Business Owner (New and Renewal)",
        "requirements": [
            {"requirement": "Document", "where_to_secure": "Office"}
        ],
        "client_steps": [
            {"step": 1, "action": "Submit requirements"}
        ],
        "fees": {"amount": "₱50.00", "description": "per copy"},
        "processing_time": "15 minutes",
        "turnaround_time": ""
    }

    is_valid, errors = validate_service_data(example_service)
    print(f"Valid: {is_valid}")
    print(f"Errors: {errors}")
