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

export interface QuickInfo {
  processingTime?: string;
  fee?: string;
  whoCanApply?: string;
  appointmentType?: string;
  validity?: string;
  documents?: string;
}

export interface Service {
  service: string;
  slug: string;
  type: ServiceType;
  description?: string;
  url?: string;
  officeSlug: string;
  category: ServiceCategory;
  steps?: string[];
  requirements?: string[];
  relatedServices?: string[];
  faqs?: { question: string; answer: string }[];
  quickInfo?: QuickInfo;
  updatedAt?: string | null;
  sources?: Source[];
}
