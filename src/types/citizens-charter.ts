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
  /** Optional: Link to related service page if this requirement is itself a service */
  serviceSlug?: string;
}

/**
 * A step in the client service process
 */
export interface ClientStep {
  /** Step number */
  step: number;
  /** What the client does */
  action: string;
  /** What the agency does in response */
  agency_action: string;
}

/**
 * Fee information for a service
 */
export interface Fee {
  /** Fee amount (e.g., "₱50.00", "Variable", "Free") */
  amount: string;
  /** Description of the fee (e.g., "per copy", "based on property assessment") */
  description: string;
}

/**
 * A complete Citizen's Charter service entry
 */
export interface CitizensCharterService {
  /** Service identifier (e.g., "1.1", "5.2") */
  service_number: string;
  /** Full name of the service */
  service_name: string;
  /** Office or division responsible for the service */
  office_division: string;
  /** Service classification: "Simple" or "Complex" */
  classification: 'Simple' | 'Complex';
  /** Type of transaction: "G2C (Government to Citizen)" or "G2B (Government to Business)" */
  type_of_transaction: string;
  /** Description of who may avail of the service */
  who_may_avail: string;
  /** Array of requirements with sources */
  requirements: Requirement[];
  /** Step-by-step client process */
  client_steps: ClientStep[];
  /** Fee information */
  fees: Fee;
  /** Expected processing time */
  processing_time: string;
  /** Positions responsible for the service */
  person_responsible: string[];
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
