import raw from './sre.json';

// --- Types ---

export interface LocationInfo {
  region: string;
  province: string;
  lgu_name: string;
  lgu_type: string;
}

export interface TaxRevenue {
  real_property_tax: {
    general_fund: number;
    special_education_fund: number;
    total: number;
  };
  tax_on_business: number;
  other_taxes: number;
  total_tax_revenue: number;
}

export interface NonTaxRevenue {
  regulatory_fees: number;
  service_user_charges: number;
  receipts_from_economic_enterprises: number;
  other_receipts: number;
  total_non_tax_revenue: number;
}

export interface LocalSources {
  tax_revenue: TaxRevenue;
  non_tax_revenue: NonTaxRevenue;
  total_local_sources: number;
}

export interface ExternalSources {
  national_tax_allotment: number;
  other_shares_from_national_tax_collection: number;
  inter_local_transfers: number;
  extraordinary_receipts_grants_donations_aids: number;
  total_external_sources: number;
}

export interface CurrentOperatingIncome {
  local_sources: LocalSources;
  external_sources: ExternalSources;
  total_current_operating_income: number;
}

// --- Expenditures ---

export interface SocialServices {
  education_culture_sports_manpower_development: number;
  health_nutrition_population_control: number;
  labor_and_employment: number;
  housing_and_community_development: number;
  social_services_and_social_welfare: number;
  total_social_services: number;
}

export interface CurrentOperatingExpenditures {
  general_public_services: number;
  social_services: SocialServices;
  economic_services: number;
  debt_service_interest_expense: number;
  total_current_operating_expenditures: number;
}

// --- Fund Summary ---

export interface FundSummary {
  fund_cash_balance_end: number;
  net_increase_decrease_in_funds?: number;
  add_cash_balance_beginning?: number;
  fund_cash_available?: number;
  less_payment_of_prior_years_accounts_payable?: number;
  continuing_appropriation?: number;
}

// --- Financial Quarter ---

export interface FinancialQuarter {
  period: string;
  location_info: LocationInfo;
  current_operating_income: CurrentOperatingIncome;
  current_operating_expenditures: CurrentOperatingExpenditures;
  net_operating_income_loss_from_current_operations: number;
  non_income_receipts: Record<string, number>;
  non_operating_expenditures: Record<string, number>;
  fund_summary?: FundSummary;
}

// --- Empty helpers ---

export const emptyTaxRevenue: TaxRevenue = {
  real_property_tax: { general_fund: 0, special_education_fund: 0, total: 0 },
  tax_on_business: 0,
  other_taxes: 0,
  total_tax_revenue: 0,
};

export const emptyNonTaxRevenue: NonTaxRevenue = {
  regulatory_fees: 0,
  service_user_charges: 0,
  receipts_from_economic_enterprises: 0,
  other_receipts: 0,
  total_non_tax_revenue: 0,
};

export const emptyLocalSources: LocalSources = {
  tax_revenue: emptyTaxRevenue,
  non_tax_revenue: emptyNonTaxRevenue,
  total_local_sources: 0,
};

export const emptyExternalSources: ExternalSources = {
  national_tax_allotment: 0,
  other_shares_from_national_tax_collection: 0,
  inter_local_transfers: 0,
  extraordinary_receipts_grants_donations_aids: 0,
  total_external_sources: 0,
};

export const emptyCurrentOperatingIncome: CurrentOperatingIncome = {
  local_sources: emptyLocalSources,
  external_sources: emptyExternalSources,
  total_current_operating_income: 0,
};

export const emptySocialServices: SocialServices = {
  education_culture_sports_manpower_development: 0,
  health_nutrition_population_control: 0,
  labor_and_employment: 0,
  housing_and_community_development: 0,
  social_services_and_social_welfare: 0,
  total_social_services: 0,
};

export const emptyCurrentOperatingExpenditures: CurrentOperatingExpenditures = {
  general_public_services: 0,
  social_services: emptySocialServices,
  economic_services: 0,
  debt_service_interest_expense: 0,
  total_current_operating_expenditures: 0,
};

// --- Convert raw JSON to typed financials ---

const budgetData: FinancialQuarter[] = raw.map(q => ({
  period: q.period,
  location_info: q.location_info,
  current_operating_income:
    q.current_operating_income ?? emptyCurrentOperatingIncome,
  current_operating_expenditures:
    q.current_operating_expenditures ?? emptyCurrentOperatingExpenditures,
  net_operating_income_loss_from_current_operations:
    q.net_operating_income_loss_from_current_operations ?? 0,
  non_income_receipts: q.non_income_receipts ?? {},
  non_operating_expenditures: q.non_operating_expenditures ?? {},
  fund_summary: q.fund_summary ?? undefined,
}));

export default budgetData;
