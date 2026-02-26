// --- Service Types ---
export interface ServiceCategory {
  name: string;
  slug: string;
}

export interface Source {
  name: string;
  url?: string;
}

export type ServiceType = 'transaction' | 'information';

// Service source type
export type ServiceSource = 'citizens-charter' | 'community';

export interface QuickInfo {
  processingTime?: string;
  fee?: string;
  whoCanApply?: string;
  appointmentType?: string;
  validity?: string;
  documents?: string;
}

// Citizens Charter specific types
export interface DetailedRequirement {
  requirement: string;
  where_to_secure: string;
  copies?: string;
}

export interface SupportingDocument {
  document: string;
  where_to_secure: string;
  copies?: string;
  note?: string;
}

export interface ConditionalRequirement {
  condition: string;
  document: string;
  where_to_secure: string;
  copies?: string;
  note?: string;
  if_unavailable?: string[];
}

export interface SupportingDocumentsDetail {
  instruction: string;
  mandatory_requirements?: {
    instruction: string;
    documents: SupportingDocument[];
  };
  primary_documents?: SupportingDocument[];
  additional_documents?: {
    instruction: string;
    documents: SupportingDocument[];
  };
  conditional_requirements?: {
    instruction: string;
    options: ConditionalRequirement[];
  };
  note?: string;
}

export interface ClientStep {
  step: number;
  action: string;
  sub_steps?: {
    letter: string;
    action: string;
    details?: string[];
  }[];
  url?: string;
  processing_time?: string;
}

export interface ServiceFee {
  amount: string;
  description: string;
  required?: boolean;
}

// Fee item for fee schedule services (e.g., Collection of Other Payments)
export interface FeeItem {
  name: string;
  amount: string;
  processing_time?: string;
  office?: string;
  category?: string;
  url?: string;
}

// Main Service interface - supports both Citizens Charter and community services
export interface Service {
  // Core fields (all services)
  service: string;
  slug: string;
  type: ServiceType;
  description?: string;
  url?: string;
  officeSlug: string | string[];
  category: ServiceCategory;
  steps?: string[];
  requirements?: string[];
  relatedServices?: string[];
  faqs?: { question: string; answer: string }[];
  quickInfo?: QuickInfo;
  updatedAt?: string | null;
  sources?: Source[];

  // NEW: Source tracking
  source?: ServiceSource;

  // NEW: Citizens Charter fields (optional - only for CC services)
  serviceNumber?: string; // e.g., "1.1", "9.2"
  officeDivision?: string; // Full office name from CC
  classification?: 'Simple' | 'Complex';
  typeOfTransaction?: string; // G2C, G2B, G2G
  whoMayAvail?: string;

  // NEW: Detailed data from Citizens Charter
  detailedRequirements?: DetailedRequirement[]; // { requirement, where_to_secure }
  clientSteps?: ClientStep[]; // { step, action, sub_steps?, url?, offices? }
  supportingDocumentsDetail?: SupportingDocumentsDetail; // Detailed supporting documents structure
  fees?: ServiceFee; // { amount, description } - dict format only after standardization
  feeSchedule?: FeeItem[]; // For services that are lists of fees
  processingTime?: string; // In-person transaction time
  turnaroundTime?: string; // Total time including waiting/approval (working days)
  personResponsible?: string[]; // DEPRECATED - use officeDivision instead
  website?: string; // Portal URL for online services

  // NEW: Plain language name (user-friendly version)
  plainLanguageName?: string; // Simplified name following UK GOV.UK plain language principles

  // NEW: Fee schedule for services that are lists of fees
  feeSchedule?: FeeItem[];

  // NEW: Data quality flags
  dataComplete?: boolean; // false if has "See document" placeholders
  needsVerification?: boolean; // flagged for manual review
}

// Service filter options
export interface ServiceFilterOptions {
  category?: string;
  officeDivision?: string;
  source?: ServiceSource | 'all';
  classification?: 'Simple' | 'Complex';
  search?: string;
}

// Verification queue item
export interface VerificationItem {
  serviceNumber: string;
  serviceName: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}
