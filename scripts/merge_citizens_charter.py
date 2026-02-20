#!/usr/bin/env python3
"""
Merge Citizens Charter data with existing services.json

This script:
1. Reads citizens-charter.json
2. Reads category-mapping.json
3. Generates slugs using service_number + kebab-case service name
4. Maps office divisions to categories
5. Flags incomplete data (check for "See document" values)
6. Writes verification-queue.json
7. Writes merged-services.json
8. Merges with existing services.json (tag with source: 'community')
"""

import json
import re
import os
from pathlib import Path
from typing import Any

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
CITIZENS_CHARTER_PATH = PROJECT_ROOT / "src" / "data" / "citizens-charter" / "citizens-charter.json"
CATEGORY_MAPPING_PATH = PROJECT_ROOT / "src" / "data" / "citizens-charter" / "category-mapping.json"
SERVICES_JSON_PATH = PROJECT_ROOT / "src" / "data" / "services" / "services.json"
OUTPUT_DIR = PROJECT_ROOT / "src" / "data" / "citizens-charter"
OUTPUT_PATH = OUTPUT_DIR / "merged-services.json"
VERIFICATION_QUEUE_PATH = OUTPUT_DIR / "verification-queue.json"


def load_json(path: Path) -> Any:
    """Load JSON file"""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(data: Any, path: Path) -> None:
    """Save JSON file with pretty formatting"""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def slugify(text: str) -> str:
    """Convert text to kebab-case slug"""
    # Convert to lowercase and replace non-alphanumeric with hyphens
    slug = re.sub(r'[^\w\s-]', '', text.lower())
    slug = re.sub(r'[\s_]+', '-', slug)
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    return slug


def generate_service_slug(service_number: str, service_name: str, existing_slugs: set[str]) -> str:
    """Generate a unique slug for a service

    Pattern: {section}-{service_number}-{kebab-case-name} for duplicates
    Example: 9-2-issuance-barangay-clearance
    """
    base_slug = slugify(service_name)

    # Check if base slug is unique
    if base_slug not in existing_slugs:
        return base_slug

    # Add service number prefix for uniqueness
    section = service_number.split('.')[0]
    slug_with_number = f"{section}-{service_number.replace('.', '-')}-{base_slug}"

    # If still duplicate, append incrementing number
    if slug_with_number not in existing_slugs:
        return slug_with_number

    counter = 1
    while True:
        new_slug = f"{slug_with_number}-{counter}"
        if new_slug not in existing_slugs:
            return new_slug
        counter += 1


def map_office_division_to_category(office_division: str, mapping_data: dict) -> dict:
    """Map office division to category

    Returns:
        {"name": str, "slug": str}
    """
    for mapping in mapping_data.get("mappings", []):
        if mapping["officeDivision"] == office_division:
            # Look up category name from slug
            category_slug = mapping["categorySlug"]
            # Map slugs to display names
            category_names = {
                "business-trade-investment": "Business, Trade & Investment",
                "taxation-payments": "Taxation & Payments",
                "infrastructure-public-works": "Infrastructure & Public Works",
                "certificates-vital-records": "Certificates & Vital Records",
                "agriculture-economic-development": "Agriculture & Economic Development",
                "public-safety-security": "Public Safety & Security",
                "education-scholarship": "Education & Scholarship",
                "health-wellness": "Health & Wellness",
                "social-services-assistance": "Social Services & Assistance",
                "environment-natural-resources": "Environment & Natural Resources",
            }
            return {
                "name": category_names.get(category_slug, mapping.get("subcategory", "Other Services")),
                "slug": category_slug
            }

    # Return default category if not found
    default = mapping_data.get("defaultCategory", {"name": "Infrastructure & Engineering", "slug": "infrastructure-engineering"})
    return {"name": default["name"], "slug": default["slug"]}


def is_incomplete_service(service: dict) -> bool:
    """Check if service has incomplete/placeholder data

    Returns True if service has "See document" placeholders
    """
    incomplete_indicators = ["See document", "See document for details", "for details"]

    # Check various fields for incomplete indicators
    fields_to_check = [
        service.get("classification", ""),
        service.get("type_of_transaction", ""),
        service.get("who_may_avail", ""),
    ]

    for field_value in fields_to_check:
        if any(indicator.lower() in str(field_value).lower() for indicator in incomplete_indicators):
            return True

    # Also check if service lacks detailed data
    has_requirements = "requirements" in service and len(service.get("requirements", [])) > 0
    has_client_steps = "client_steps" in service and len(service.get("client_steps", [])) > 0

    # Services 1-8 should have detailed tables
    service_number = service.get("service_number", "")
    section = int(service_number.split('.')[0]) if service_number.split('.')[0].isdigit() else 99

    if section <= 8 and not (has_requirements or has_client_steps):
        return True

    return False


def map_office_division_to_slug(office_division: str) -> str:
    """Map Citizens Charter office division name to officeSlug

    Uses the naming convention from departments.json
    """
    # Map CC office names to slugs used in departments.json
    office_mapping = {
        "BUSINESS PERMIT AND LICENSING OFFICE (BPLO)": "business-permit-and-licensing-office",
        "MUNICIPAL TREASURER'S OFFICE": "municipal-treasurers-office",
        "MUNICIPAL TREASURER'S OFFICE": "municipal-treasurers-office",
        "MUNICIPAL ASSESSOR'S OFFICE": "municipal-assessors-office",
        "MUNICIPAL ENGINEERING OFFICE": "municipal-engineering-office",
        "MUNICIPAL PLANNING AND DEVELOPMENT COORDINATOR (MPDC)": "municipal-planning-and-development-office",
        "MUNICIPAL PLANNING AND DEVELOPMENT OFFICE": "municipal-planning-and-development-office",
        "LOCAL CIVIL REGISTRY OFFICE": "local-civil-registry-office",
        "MUNICIPAL ECONOMIC ENTERPRISE - MARKET": "market",
        "MUNICIPAL ECONOMIC ENTERPRISE - SLAUGHTERHOUSE": "slaughterhouse",
        "MUNICIPAL AGRICULTURE OFFICE": "municipal-agriculture-office",
        "BARANGAY OFFICE": "barangay-office",
        "BIDS AND AWARDS COMMITTEE": "bids-and-awards-committee",
        "INFORMATION AND COMMUNICATION SYSTEMS OFFICE (ICSO)": "information-and-communication-systems-office",
        "LOCAL YOUTH AND DEVELOPMENT OFFICE": "local-youth-and-development-office",
        "MUNICIPAL ACCOUNTING OFFICE": "municipal-accounting-office",
        "MUNICIPAL DISASTER RISK REDUCTION AND MANAGEMENT OFFICE": "municipal-mdrrmo-office",
        "MUNICIPAL HEALTH OFFICE (MHO)": "municipal-health-office",
        "MUNICIPAL HUMAN RESOURCE MANAGEMENT OFFICE": "municipal-human-resource-management-office",
        "MUNICIPAL NUTRITION ACTION OFFICE": "municipal-nutrition-office",
        "MUNICIPAL RECORDS OFFICE": "municipal-general-services-office",
        "MUNICIPAL SOCIAL WELFARE AND DEVELOPMENT OFFICE": "municipal-social-welfare-development-office",
        "MUNICIPAL TOURISM OFFICE": "municipal-tourism-office",
        "MUNICIPAL URBAN DEVELOPMENT AND HOUSING OFFICE": "municipal-urban-development-and-housing-office",
        "PERSON WITH DISABILITY AFFAIRS OFFICE": "persons-with-disability-affairs-office",
        "PHILIPPINE NATIONAL POLICE (PNP) - LOS BAÑOS MPS": "municipal-police-station",
        "PUBLIC EMPLOYMENT SERVICE OFFICE": "public-employment-service-office",
        "SANGGUNIANG BAYAN": "12th-sangguniang-bayan",  # Legislative
        "MUNICIPAL MAYOR'S OFFICE": "office-of-the-mayor",  # Executive
        "MUNICIPAL VICE MAYOR'S OFFICE": "office-of-the-vice-mayor",  # Executive
        "PUBLIC ORDER AND SAFETY OFFICE/TRANSPORTATION AND REGULATION UNIT": "public-order-and-safety-office",
    }
    return office_mapping.get(office_division, "")


def convert_cc_service_to_service(cc_service: dict, category: dict, slug: str, mapping_data: dict) -> dict:
    """Convert a Citizens Charter service to the Service format

    Args:
        cc_service: Citizens Charter service object
        category: Category dict with name and slug
        slug: Generated unique slug
        mapping_data: Category mapping data

    Returns:
        Service object in the merged format
    """
    is_incomplete = is_incomplete_service(cc_service)

    service = {
        "service": cc_service["service_name"],
        "slug": slug,
        "serviceNumber": cc_service["service_number"],
        "source": "citizens-charter",
        "type": "transaction",  # Most CC services are transactional
        "officeDivision": cc_service["office_division"],
        "officeSlug": map_office_division_to_slug(cc_service["office_division"]),
        "category": category,
        "classification": cc_service.get("classification") if not is_incomplete else None,
        "typeOfTransaction": cc_service.get("type_of_transaction") if not is_incomplete else None,
        "whoMayAvail": cc_service.get("who_may_avail") if not is_incomplete else None,
        "dataComplete": not is_incomplete,
        "needsVerification": is_incomplete,
    }

    # Add detailed fields if available
    if "requirements" in cc_service and cc_service["requirements"]:
        service["detailedRequirements"] = cc_service["requirements"]

    if "supporting_documents_detail" in cc_service and cc_service["supporting_documents_detail"]:
        service["supportingDocumentsDetail"] = cc_service["supporting_documents_detail"]

    if "client_steps" in cc_service and cc_service["client_steps"]:
        service["clientSteps"] = cc_service["client_steps"]

    if "website" in cc_service and cc_service["website"]:
        service["website"] = cc_service["website"]

    if "fees" in cc_service and cc_service["fees"]:
        service["fees"] = cc_service["fees"]

    if "fee_schedule" in cc_service and cc_service["fee_schedule"]:
        service["feeSchedule"] = cc_service["fee_schedule"]

    if "processing_time" in cc_service and cc_service["processing_time"]:
        service["processingTime"] = cc_service["processing_time"]

    if "turnaround_time" in cc_service and cc_service["turnaround_time"]:
        service["turnaroundTime"] = cc_service["turnaround_time"]

    if "plain_language_name" in cc_service and cc_service["plain_language_name"]:
        service["plainLanguageName"] = cc_service["plain_language_name"]

    if "person_responsible" in cc_service and cc_service["person_responsible"]:
        service["personResponsible"] = cc_service["person_responsible"]

    return service


def main():
    """Main merge function"""
    print("Starting Citizens Charter merge...")

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(exist_ok=True)

    # Load data
    print(f"Loading Citizens Charter data from {CITIZENS_CHARTER_PATH}")
    cc_data = load_json(CITIZENS_CHARTER_PATH)

    print(f"Loading category mapping from {CATEGORY_MAPPING_PATH}")
    category_mapping = load_json(CATEGORY_MAPPING_PATH)

    print(f"Loading existing services from {SERVICES_JSON_PATH}")
    existing_services = load_json(SERVICES_JSON_PATH)

    # Track used slugs
    used_slugs = {s["slug"] for s in existing_services}

    # Process Citizens Charter services
    cc_services = []
    verification_queue = []

    for cc_service in cc_data.get("services", []):
        # Generate unique slug
        slug = generate_service_slug(
            cc_service["service_number"],
            cc_service["service_name"],
            used_slugs
        )
        used_slugs.add(slug)

        # Map to category (check for override first)
        if "category_override" in cc_service:
            # Use override category
            category_slug = cc_service["category_override"]
            category_names = {
                "business-trade-investment": "Business, Trade & Investment",
                "taxation-payments": "Taxation & Payments",
                "infrastructure-public-works": "Infrastructure & Public Works",
                "certificates-vital-records": "Certificates & Vital Records",
                "agriculture-economic-development": "Agriculture & Economic Development",
                "public-safety-security": "Public Safety & Security",
                "education-scholarship": "Education & Scholarship",
                "health-wellness": "Health & Wellness",
                "social-services-assistance": "Social Services & Assistance",
                "environment-natural-resources": "Environment & Natural Resources",
            }
            category = {
                "name": category_names.get(category_slug, "Other Services"),
                "slug": category_slug
            }
        else:
            category = map_office_division_to_category(cc_service["office_division"], category_mapping)

        # Convert to service format
        service = convert_cc_service_to_service(cc_service, category, slug, category_mapping)
        cc_services.append(service)

        # Add to verification queue if incomplete
        if is_incomplete_service(cc_service):
            verification_queue.append({
                "serviceNumber": cc_service["service_number"],
                "serviceName": cc_service["service_name"],
                "reason": "Placeholder data - needs requirements, steps, fees, and other details from Citizens Charter document",
                "priority": "high"
            })

    # Tag existing services as community source
    for service in existing_services:
        service["source"] = "community"

    # Merge services - CC services first, then community services
    merged_services = cc_services + existing_services

    # Sort by service name for better UX
    merged_services.sort(key=lambda s: s["service"].lower())

    # Save merged services
    print(f"Saving {len(merged_services)} merged services to {OUTPUT_PATH}")
    save_json(merged_services, OUTPUT_PATH)

    # Save verification queue
    print(f"Saving {len(verification_queue)} items to verification queue")
    save_json({"pending": verification_queue, "completed": []}, VERIFICATION_QUEUE_PATH)

    print(f"\nMerge complete!")
    print(f"  - Citizens Charter services: {len(cc_services)}")
    print(f"  - Community services: {len(existing_services)}")
    print(f"  - Total merged services: {len(merged_services)}")
    print(f"  - Services needing verification: {len(verification_queue)}")


if __name__ == "__main__":
    main()
