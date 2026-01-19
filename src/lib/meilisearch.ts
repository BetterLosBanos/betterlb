import { MeiliSearch } from 'meilisearch';

// 1. Configuration
const HOST =
  import.meta.env.VITE_MEILISEARCH_HOST || 'https://search2.bettergov.ph';
const KEY = import.meta.env.VITE_MEILISEARCH_API_KEY || '';

export const client = new MeiliSearch({
  host: HOST,
  apiKey: KEY,
});

export const INDICES = {
  PHILGEPS: 'philgeps',
  DPWH: 'dpwh',
  PHILGEPS_ORGS: 'philgeps_organizations',
} as const;

// 2. PhilGEPS Types
export interface PhilgepsDoc {
  id: string;
  reference_id: string;
  contract_no: string;
  award_title: string;
  notice_title: string;
  awardee_name: string;
  organization_name: string;
  area_of_delivery: string;
  business_category: string;
  contract_amount: number;
  award_date: string;
  award_status: string;
}

// 3. DPWH Complete Types (Matched to Full API Response)

export interface ProjectComponent {
  componentId: string;
  description: string;
  infraType: string;
  typeOfWork: string;
  region: string;
  province: string;
  coordinates?: {
    latitude: number;
    longitude: number;
    source?: string;
    locationVerified?: boolean;
  };
}

export interface ProjectBidder {
  name: string;
  pcabId?: string;
  participation: number;
  isWinner: boolean;
}

export interface DPWHProject {
  // Identification
  contractId: string;
  description: string;
  category: string;
  programName: string;
  status: string;
  infraType: string;
  sourceOfFunds: string;

  // Financials
  budget: number;
  amountPaid: number;
  progress: number;

  // Location
  location: {
    region: string;
    province: string;
    municipality?: string;
    barangay?: string;
    infraType: string;
    coordinates: {
      latitude: number;
      longitude: number;
      verified: boolean;
    };
  };
  latitude?: number;
  longitude?: number;

  // Timeline
  infraYear: number | string; // API might return string or number
  startDate?: string;
  completionDate?: string;
  contractEffectivityDate?: string;
  expiryDate?: string;
  nysReason?: string; // Reason for Not Yet Started

  // Contractor & Bidding
  contractor: string;
  winnerNames?: string;
  bidders?: ProjectBidder[];

  procurement?: {
    contractName: string;
    abc: string;
    status: string;
    fundingInstrument: string;
    advertisementDate: string;
    bidSubmissionDeadline: string;
    dateOfAward: string;
    awardAmount: string;
  };

  // Verification & Media
  isVerifiedByDpwh: boolean;
  isVerifiedByPublic: boolean;
  isLive: boolean;
  livestreamUrl?: string;
  livestreamVideoId?: string;
  livestreamDetectedAt?: string;
  hasSatelliteImage?: boolean;

  imageSummary?: {
    totalImages: number;
    latestImageDate: string;
    hasImages: boolean;
  };

  // Components
  components?: ProjectComponent[];
  componentCategories?: string[];

  // Documentation
  links?: {
    advertisement?: string;
    contractAgreement?: string;
    noticeOfAward?: string;
    noticeToProceed?: string;
    programOfWork?: string;
    engineeringDesign?: string;
  };

  // Metadata
  reportCount: number;
}
