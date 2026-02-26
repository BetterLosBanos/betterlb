#!/usr/bin/env python3
"""
Detect duplicate services in Citizens Charter data.

This script identifies potential duplicates between:
- Authoritative services (categories 1-8): Manually verified, detailed service tables
- Unverified services (categories 9+): May contain duplicates of authoritative services

Algorithm:
1. Group unverified services by normalized office_division for efficient comparison
2. Compare each authoritative service only with unverified services from the same office
3. Use difflib.SequenceMatcher for fuzzy string matching
4. Calculate confidence scores based on similarity percentage

Output:
- duplicates-report.md: Human-readable report with recommendations
- duplicates-scan.json: Machine-readable format for automation
"""

import json
import re
from dataclasses import dataclass, field
from datetime import datetime
from difflib import SequenceMatcher
from pathlib import Path
from collections import defaultdict
from typing import Any


# Paths
PROJECT_ROOT = Path(__file__).parent.parent
CITIZENS_CHARTER_PATH = PROJECT_ROOT / "src" / "data" / "citizens-charter" / "citizens-charter.json"
OUTPUT_DIR = PROJECT_ROOT / "src" / "data" / "citizens-charter"
REPORT_PATH = OUTPUT_DIR / "duplicates-report.md"
SCAN_JSON_PATH = OUTPUT_DIR / "duplicates-scan.json"

# Confidence thresholds
HIGH_CONFIDENCE_THRESHOLD = 0.95
LOW_CONFIDENCE_THRESHOLD = 0.85


@dataclass
class DuplicateMatch:
    """Represents a potential duplicate match"""
    authoritative_service: dict
    unverified_service: dict
    similarity: float
    confidence: str


@dataclass
class ScanResult:
    """Container for scan results"""
    high_confidence: list[DuplicateMatch] = field(default_factory=list)
    medium_confidence: list[DuplicateMatch] = field(default_factory=list)
    low_confidence: list[DuplicateMatch] = field(default_factory=list)
    total_authoritative: int = 0
    total_unverified: int = 0
    scan_timestamp: str = ""


def load_json(path: Path) -> Any:
    """Load JSON file"""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(data: Any, path: Path) -> None:
    """Save JSON file with pretty formatting"""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def normalize_service_name(name: str) -> str:
    """Normalize service name for comparison.

    Transformations:
    - Convert to lowercase
    - Remove extra whitespace
    - Normalize punctuation
    - Handle common variants (CO-OPERATIVES → cooperatives)
    """
    if not name:
        return ""

    # Convert to lowercase
    normalized = name.lower()

    # Remove extra whitespace
    normalized = re.sub(r'\s+', ' ', normalized)

    # Normalize punctuation
    normalized = re.sub(r'[–—]', '-', normalized)  # En/em dashes to hyphen
    normalized = re.sub(r'[/_]', ' ', normalized)  # Slashes/underscores to space
    normalized = re.sub(r'[^\w\s-]', '', normalized)  # Remove other punctuation

    # Remove extra whitespace again after punctuation changes
    normalized = re.sub(r'\s+', ' ', normalized).strip()

    # Handle common variants
    replacements = {
        'co-operatives': 'cooperatives',
        'co-operative': 'cooperative',
        'seedlings': 'seedling',
        'seedling/seedlings': 'seedling',
    }

    for old, new in replacements.items():
        normalized = normalized.replace(old, new)

    return normalized


def normalize_office_division(office: str) -> str:
    """Normalize office division names for comparison.

    Handles naming variations like:
    - "MUNICIPAL PLANNING AND DEVELOPMENT OFFICE"
    - "MUNICIPAL PLANNING AND DEVELOPMENT COORDINATOR (MPDC)"
    Both refer to the same office.

    Returns:
        Normalized office name for grouping
    """
    if not office:
        return "Unknown"

    # Convert to uppercase for consistency
    normalized = office.upper()

    # Remove parenthetical abbreviations
    normalized = re.sub(r'\s*\([^)]*\)', '', normalized)

    # Normalize common variations
    office_mappings = {
        "MUNICIPAL PLANNING AND DEVELOPMENT COORDINATOR": "MUNICIPAL PLANNING AND DEVELOPMENT OFFICE",
        "MUNICIPAL PLANNING AND DEVELOPMENT OFFICE": "MUNICIPAL PLANNING AND DEVELOPMENT OFFICE",
    }

    # Remove extra whitespace
    normalized = re.sub(r'\s+', ' ', normalized).strip()

    # Apply mappings
    for variant, standard in office_mappings.items():
        if variant in normalized:
            return standard

    return normalized


def calculate_similarity(name1: str, name2: str) -> float:
    """Calculate similarity between two service names using SequenceMatcher.

    Returns:
        Float between 0 and 1 representing similarity ratio
    """
    norm1 = normalize_service_name(name1)
    norm2 = normalize_service_name(name2)

    if not norm1 or not norm2:
        return 0.0

    return SequenceMatcher(None, norm1, norm2).ratio()


def get_confidence_level(similarity: float) -> str:
    """Determine confidence level based on similarity score.

    Levels:
    - HIGH (95%+): Near-identical names - definite duplicate
    - MEDIUM (85-94%): Similar names with variations - likely duplicate
    - LOW (<85%): Low similarity - probably distinct
    """
    if similarity >= HIGH_CONFIDENCE_THRESHOLD:
        return "HIGH"
    elif similarity >= LOW_CONFIDENCE_THRESHOLD:
        return "MEDIUM"
    else:
        return "LOW"


def get_category_number(service_number: str) -> int:
    """Extract the category number from a service number.

    Example: "1.6" → 1, "29.1" → 29
    """
    try:
        return int(service_number.split('.')[0])
    except (ValueError, IndexError, AttributeError):
        return 99


def group_by_office(services: list[dict]) -> dict[str, list[dict]]:
    """Group services by their normalized office_division field.

    Uses normalize_office_division() to handle naming variations
    (e.g., "MPDC" vs "MUNICIPAL PLANNING AND DEVELOPMENT OFFICE").

    Returns:
        Dict mapping normalized office_division to list of services
    """
    grouped = defaultdict(list)
    for service in services:
        office = normalize_office_division(service.get("office_division", "Unknown"))
        grouped[office].append(service)
    return dict(grouped)


def find_duplicates(
    authoritative: list[dict],
    unverified: list[dict]
) -> ScanResult:
    """Find potential duplicates between authoritative and unverified services.

    Strategy:
    1. Group unverified services by normalized office_division
    2. For each authoritative service, compare only with same-office unverified services
    3. Track matches by confidence level

    Returns:
        ScanResult with all potential duplicates grouped by confidence
    """
    result = ScanResult(
        total_authoritative=len(authoritative),
        total_unverified=len(unverified),
        scan_timestamp=datetime.now().isoformat()
    )

    # Group unverified services by normalized office for efficient comparison
    unverified_by_office = group_by_office(unverified)

    for auth_service in authoritative:
        # Normalize the authoritative service's office for comparison
        auth_office = normalize_office_division(auth_service.get("office_division", "Unknown"))

        # Only compare with unverified services from the same normalized office
        same_office_unverified = unverified_by_office.get(auth_office, [])

        for unverified_service in same_office_unverified:
            # Skip if comparing with self (shouldn't happen with category split)
            if auth_service == unverified_service:
                continue

            similarity = calculate_similarity(
                auth_service.get("service_name", ""),
                unverified_service.get("service_name", "")
            )

            # Only track if above minimum threshold
            if similarity >= LOW_CONFIDENCE_THRESHOLD:
                confidence = get_confidence_level(similarity)
                match = DuplicateMatch(
                    authoritative_service=auth_service,
                    unverified_service=unverified_service,
                    similarity=similarity,
                    confidence=confidence
                )

                if confidence == "HIGH":
                    result.high_confidence.append(match)
                elif confidence == "MEDIUM":
                    result.medium_confidence.append(match)
                else:
                    result.low_confidence.append(match)

    # Sort all results by similarity (descending)
    result.high_confidence.sort(key=lambda m: m.similarity, reverse=True)
    result.medium_confidence.sort(key=lambda m: m.similarity, reverse=True)
    result.low_confidence.sort(key=lambda m: m.similarity, reverse=True)

    return result


def match_to_dict(match: DuplicateMatch) -> dict:
    """Convert a DuplicateMatch to a dictionary for JSON output."""
    return {
        "similarity": round(match.similarity * 100, 2),
        "confidence": match.confidence,
        "authoritative": {
            "service_number": match.authoritative_service.get("service_number"),
            "service_name": match.authoritative_service.get("service_name"),
            "office_division": match.authoritative_service.get("office_division"),
            "category_number": get_category_number(match.authoritative_service.get("service_number", "")),
        },
        "unverified": {
            "service_number": match.unverified_service.get("service_number"),
            "service_name": match.unverified_service.get("service_name"),
            "office_division": match.unverified_service.get("office_division"),
            "category_number": get_category_number(match.unverified_service.get("service_number", "")),
        }
    }


def generate_markdown_report(result: ScanResult) -> str:
    """Generate a human-readable markdown report.

    Sections:
    1. Summary with statistics
    2. HIGH confidence duplicates (95%+)
    3. MEDIUM confidence duplicates (85-94%)
    4. LOW confidence matches (not duplicates, just similar names)
    5. Recommendations
    """
    lines = [
        "# Citizens Charter Duplicate Detection Report",
        "",
        f"**Generated:** {result.scan_timestamp}",
        "",
        "## Summary",
        "",
        f"- **Total services scanned:** {result.total_authoritative + result.total_unverified}",
        f"- **Authoritative services (categories 1-8):** {result.total_authoritative}",
        f"- **Unverified services (categories 9+):** {result.total_unverified}",
        f"- **Potential duplicates found:** {len(result.high_confidence) + len(result.medium_confidence)}",
        "",
        "### Confidence Levels",
        "",
        f"| Confidence | Count | Threshold |",
        f"|------------|-------|------------|",
        f"| HIGH | {len(result.high_confidence)} | 95%+ similarity |",
        f"| MEDIUM | {len(result.medium_confidence)} | 85-94% similarity |",
        f"| LOW | {len(result.low_confidence)} | Below 85% (not duplicates) |",
        "",
    ]

    # HIGH Confidence Section
    lines.extend([
        "---",
        "",
        "## HIGH Confidence Duplicates (95%+ similarity)",
        "",
        "These are definite duplicates. The unverified versions should be removed.",
        "",
    ])

    if result.high_confidence:
        lines.append("| Authoritative | Unverified | Similarity | Office |")
        lines.append("|---------------|------------|------------|--------|")

        for match in result.high_confidence:
            auth = match.authoritative_service
            unv = match.unverified_service
            lines.append(
                f"| **{auth.get('service_number')}** {auth.get('service_name')} | "
                f"**{unv.get('service_number')}** {unv.get('service_name')} | "
                f"{match.similarity * 100:.1f}% | {auth.get('office_division')} |"
            )
    else:
        lines.append("*No high confidence duplicates found.*")

    # MEDIUM Confidence Section
    lines.extend([
        "",
        "---",
        "",
        "## MEDIUM Confidence Duplicates (85-94% similarity)",
        "",
        "These are likely duplicates but may represent legitimate variations. Manual review needed.",
        "",
    ])

    if result.medium_confidence:
        lines.append("| Authoritative | Unverified | Similarity | Office |")
        lines.append("|---------------|------------|------------|--------|")

        for match in result.medium_confidence:
            auth = match.authoritative_service
            unv = match.unverified_service
            lines.append(
                f"| **{auth.get('service_number')}** {auth.get('service_name')} | "
                f"**{unv.get('service_number')}** {unv.get('service_name')} | "
                f"{match.similarity * 100:.1f}% | {auth.get('office_division')} |"
            )
    else:
        lines.append("*No medium confidence duplicates found.*")

    # LOW Confidence Section
    lines.extend([
        "",
        "---",
        "",
        "## LOW Confidence Matches (<85% similarity)",
        "",
        "These are probably distinct services with similar names. Grouped by office for reference.",
        "",
    ])

    if result.low_confidence:
        # Group by office
        low_by_office = defaultdict(list)
        for match in result.low_confidence:
            office = match.authoritative_service.get("office_division", "Unknown")
            low_by_office[office].append(match)

        for office, matches in sorted(low_by_office.items()):
            lines.extend([
                f"### {office}",
                "",
                "| Authoritative | Unverified | Similarity |",
                "|---------------|------------|------------|",
            ])
            for match in matches:
                auth = match.authoritative_service
                unv = match.unverified_service
                lines.append(
                    f"| **{auth.get('service_number')}** {auth.get('service_name')} | "
                    f"**{unv.get('service_number')}** {unv.get('service_name')} | "
                    f"{match.similarity * 100:.1f}% |"
                )
            lines.append("")
    else:
        lines.append("*No low confidence matches found.*")

    # Recommendations Section
    lines.extend([
        "---",
        "",
        "## Recommendations",
        "",
    ])

    if result.high_confidence:
        lines.extend([
            "### Immediate Actions (HIGH Confidence)",
            "",
            "Remove the following unverified service numbers from `citizens-charter.json`:",
            "",
        ])
        for match in result.high_confidence:
            lines.append(
                f"- **{match.unverified_service.get('service_number')}** "
                f"({match.unverified_service.get('service_name')}) - "
                f"Duplicate of {match.authoritative_service.get('service_number')}"
            )
        lines.append("")

    if result.medium_confidence:
        lines.extend([
            "### Manual Review Required (MEDIUM Confidence)",
            "",
            "Review the following pairs and decide if they are duplicates or distinct services:",
            "",
        ])
        for match in result.medium_confidence:
            lines.append(
                f"- **{match.unverified_service.get('service_number')}** vs "
                f"**{match.authoritative_service.get('service_number')}** "
                f"({match.similarity * 100:.1f}% similarity)"
            )
        lines.append("")

    lines.extend([
        "### Next Steps",
        "",
        "1. Remove confirmed duplicates from `citizens-charter.json`",
        "2. Re-run this script to verify cleanup",
        "3. Run `python3 scripts/merge_citizens_charter.py` to update merged output",
        "4. Commit changes with message: `refactor: remove duplicate Citizens Charter services`",
        "",
        "---",
        "",
        "*This report was auto-generated by `scripts/detect_citizens_charter_duplicates.py`*",
    ])

    return "\n".join(lines)


def main():
    """Main function to run duplicate detection."""
    print("Starting Citizens Charter duplicate detection...")
    print(f"Loading data from {CITIZENS_CHARTER_PATH}")

    # Load data
    cc_data = load_json(CITIZENS_CHARTER_PATH)
    all_services = cc_data.get("services", [])

    # Split into authoritative (1-8) and unverified (9+)
    authoritative = []
    unverified = []

    for service in all_services:
        service_number = service.get("service_number", "")
        category = get_category_number(service_number)
        if category <= 8:
            authoritative.append(service)
        else:
            unverified.append(service)

    print(f"  - Authoritative services (categories 1-8): {len(authoritative)}")
    print(f"  - Unverified services (categories 9+): {len(unverified)}")
    print()

    # Find duplicates
    print("Scanning for duplicates...")
    result = find_duplicates(authoritative, unverified)

    print(f"  - HIGH confidence (95%+): {len(result.high_confidence)}")
    print(f"  - MEDIUM confidence (85-94%): {len(result.medium_confidence)}")
    print(f"  - LOW confidence (<85%): {len(result.low_confidence)}")
    print()

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(exist_ok=True)

    # Generate markdown report
    print(f"Generating markdown report: {REPORT_PATH}")
    markdown = generate_markdown_report(result)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(markdown)

    # Generate JSON output
    print(f"Generating JSON scan results: {SCAN_JSON_PATH}")
    json_output = {
        "scanTimestamp": result.scan_timestamp,
        "summary": {
            "totalServices": result.total_authoritative + result.total_unverified,
            "authoritativeServices": result.total_authoritative,
            "unverifiedServices": result.total_unverified,
            "highConfidenceDuplicates": len(result.high_confidence),
            "mediumConfidenceDuplicates": len(result.medium_confidence),
            "lowConfidenceMatches": len(result.low_confidence),
        },
        "duplicates": {
            "high": [match_to_dict(m) for m in result.high_confidence],
            "medium": [match_to_dict(m) for m in result.medium_confidence],
            "low": [match_to_dict(m) for m in result.low_confidence],
        }
    }
    save_json(json_output, SCAN_JSON_PATH)

    print()
    print("Duplicate detection complete!")
    print(f"  - Report: {REPORT_PATH}")
    print(f"  - JSON: {SCAN_JSON_PATH}")

    # Show quick preview
    if result.high_confidence:
        print()
        print("HIGH confidence duplicates to review:")
        for match in result.high_confidence[:5]:  # Show first 5
            print(
                f"  - {match.unverified_service.get('service_number')} → "
                f"{match.authoritative_service.get('service_number')} "
                f"({match.similarity * 100:.1f}%)"
            )
        if len(result.high_confidence) > 5:
            print(f"  ... and {len(result.high_confidence) - 5} more")


if __name__ == "__main__":
    main()
