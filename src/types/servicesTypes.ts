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
}

export interface ClientStep {
  step: number;
  action: string;
  agency_action: string;
}

export interface ServiceFee {
  amount: string;
  description: string;
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
  clientSteps?: ClientStep[]; // { step, action, agency_action }
  fees?: ServiceFee; // { amount, description }
  processingTime?: string;
  personResponsible?: string[];

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
