/**
 * Citizen's Charter Service Types
 *
 * Types for the Citizen's Charter service data extracted from
 * raw_data/citizens_charter2026.pdf
 */

/**
 * A single requirement for a service
 */
export interface Requirement {
  /** Name of the requirement */
  requirement: string;
  /** Source office or agency where to secure the requirement */
  where_to_secure: string;
  /** Number of copies required */
  copies?: string;
  /** Optional: Link to related service page if this requirement is itself a service */
  serviceSlug?: string;
}

/**
 * A single supporting document with details
 */
export interface SupportingDocument {
  /** Name of the document */
  document: string;
  /** Source office or agency where to secure the document */
  where_to_secure: string;
  /** Number of copies required */
  copies?: string;
  /** Additional notes about the document */
  note?: string;
}

/**
 * Detailed supporting documents structure for complex requirements
 */
export interface SupportingDocumentsDetail {
  /** Main instruction for submitting documents */
  instruction: string;
  /** Optional: Mandatory requirements that must be submitted */
  mandatory_requirements?: {
    /** Instruction for mandatory requirements */
    instruction: string;
    /** List of mandatory documents */
    documents: SupportingDocument[];
  };
  /** Optional: Primary documents to choose from */
  primary_documents?: SupportingDocument[];
  /** Optional: Additional documents that may be required */
  additional_documents?: {
    /** Instruction for additional documents */
    instruction: string;
    /** List of additional documents */
    documents: SupportingDocument[];
  };
  /** Optional: Conditional requirements based on situation */
  conditional_requirements?: {
    /** Instruction for conditional requirements */
    instruction: string;
    /** List of conditional options */
    options: ConditionalRequirement[];
  };
  /** Note about processor determination */
  note?: string;
}

/**
 * A conditional requirement option (choose based on situation)
 */
export interface ConditionalRequirement {
  /** Condition when this option applies */
  condition: string;
  /** Document name */
  document: string;
  /** Source office or agency where to secure the document */
  where_to_secure: string;
  /** Number of copies required */
  copies?: string;
  /** Additional notes or business types */
  note?: string;
  /** Alternatives if this document is unavailable */
  if_unavailable?: string[];
}

/**
 * A step in the client service process
 *
 * Follows UK GOV.UK plain language standard:
 * - Use imperative verbs: "Submit" (not "Submits"), "Pay" (not "Payment")
 * - Active voice: "Submit requirements" (not "Requirements are submitted")
 * - Address user as "you" where appropriate
 * - Be specific: "Pay fees and receive approval" (not "Payment and approval")
 */
export interface ClientStep {
  /** Step number */
  step: number;
  /** What the client does - must use imperative language (e.g., "Submit requirements") */
  action: string;
  /** Optional: Sub-steps with letter labels (A, B, C, etc.) */
  sub_steps?: {
    /** Letter label for the sub-step */
    letter: string;
    /** Action description */
    action: string;
    /** Optional: Detail items with roman numerals (i, ii, iii, etc.) */
    details?: string[];
  }[];
  /** Optional: URL for online portals */
  url?: string;
  /** Optional: Processing time for this step */
  processing_time?: string;
}

/**
 * Fee information for a service
 */
export interface Fee {
  /** Fee amount (e.g., "₱50.00", "Variable", "Free") */
  amount: string;
  /** Description of the fee (e.g., "per copy", "based on property assessment") */
  description: string;
  /** Whether this fee is required (optional, defaults to true) */
  required?: boolean;
}

/**
 * Fee item for fee schedule services (e.g., Collection of Other Payments)
 */
export interface FeeItem {
  /** Name of the fee/payment */
  name: string;
  /** Fee amount (e.g., "₱50.00", "Variable", "Free") */
  amount: string;
  /** Processing time for this specific fee/payment */
  processing_time?: string;
  /** Office responsible for collecting the fee */
  office?: string;
  /** Category/group of the fee (e.g., "Business Tax", "Regulatory Fees") */
  category?: string;
  /** URL for online payment (if applicable) */
  url?: string;
}

/**
 * A complete Citizen's Charter service entry
 *
 * Core required fields (12):
 * - service_number, service_name, plain_language_name
 * - office_division, classification, type_of_transaction
 * - who_may_avail, requirements, client_steps
 * - fees, processing_time
 *
 * Optional fields:
 * - turnaround_time (for complex services with waiting/approval periods)
 * - supporting_documents_detail, website, fee_schedule
 */
export interface CitizensCharterService {
  /** Service identifier (e.g., "1.1", "5.2") */
  service_number: string;
  /** Full name of the service (as it appears in the Citizens Charter document) */
  service_name: string;
  /**
   * Plain language name of the service
   *
   * A simplified, user-friendly version following UK GOV.UK plain language principles:
   * - Start with an action verb: "Get", "Apply for", "Pay", "Renew"
   * - Remove bureaucratic language: "Issuance of" → "Get"
   * - Use simple words: "Certification" → "Certificate"
   * - Be specific but concise: Under 65 characters where possible
   * - Address the user directly: "Get your barangay clearance"
   *
   * Examples:
   * - "Business Registration (Renewal) - Face to Face" → "Renew your business registration in person"
   * - "Issuance of Barangay Clearance" → "Get a barangay clearance"
   * - "Request for Police Clearance" → "Apply for a police clearance"
   */
  plain_language_name: string;
  /** Office or division responsible for the service */
  office_division: string;
  /** Service classification: "Simple" or "Complex" */
  classification: 'Simple' | 'Complex';
  /** Type of transaction: "G2C" or "G2B" */
  type_of_transaction: 'G2C' | 'G2B';
  /** Description of who may avail of the service */
  who_may_avail: string;
  /** Array of requirements with sources */
  requirements: Requirement[];
  /** Optional: Detailed supporting documents structure for complex requirements */
  supporting_documents_detail?: SupportingDocumentsDetail;
  /** Optional: Website/portal URL for online services */
  website?: string;
  /** Step-by-step client process - actions must use imperative language */
  client_steps: ClientStep[];
  /** Fee information - always a dict format with amount and optional description */
  fees: Fee;
  /** Optional: Fee schedule for services that are lists of fees (e.g., Collection of Other Payments) */
  fee_schedule?: FeeItem[];
  /**
   * In-person transaction time
   *
   * The time it takes to complete the transaction in person at the office.
   * Examples: "15 minutes", "2 hours", "4 hours"
   *
   * For simple services, this is the full service time.
   * For complex services, this excludes waiting/approval periods (see turnaround_time).
   */
  processing_time: string;
  /**
   * Total turnaround time (optional)
   *
   * Total time for complex services including waiting and approval periods.
   * Examples: "3-5 working days", "21-35 working days", "Varies by site inspection"
   *
   * For simple services with no waiting/approval period, this field can be empty.
   */
  turnaround_time?: string;
}

/**
 * Citizen's Charter data structure
 */
export interface CitizensCharterData {
  /** Array of all services */
  services: CitizensCharterService[];
}

/**
 * Search/filter options for Citizen's Charter services
 */
export interface ServiceFilterOptions {
  /** Filter by office/division */
  office?: string;
  /** Filter by classification (Simple/Complex) */
  classification?: 'Simple' | 'Complex';
  /** Filter by transaction type (G2C/G2B) */
  type_of_transaction?: string;
  /** Search query string (searches in service name and office) */
  search?: string;
}
