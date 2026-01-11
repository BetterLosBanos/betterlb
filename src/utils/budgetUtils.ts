import type {
  CurrentOperatingIncome,
  CurrentOperatingExpenditures,
  LocalSources,
  ExternalSources,
  SocialServices,
  TaxRevenue,
  NonTaxRevenue,
} from '@/types/budgetTypes';

/* ---------------- Totals for Summary Cards ---------------- */

/** Compute total income including all local & external sources */
export function computeTotalIncome(income?: CurrentOperatingIncome): number {
  if (!income) return 0;

  const local = income.local_sources ?? emptyLocalSources();
  const external = income.external_sources ?? emptyExternalSources();

  const taxRevenue =
    (local.tax_revenue?.real_property_tax?.total ?? 0) +
    (local.tax_revenue?.tax_on_business ?? 0) +
    (local.tax_revenue?.other_taxes ?? 0);

  const nonTaxRevenue = local.non_tax_revenue?.total_non_tax_revenue ?? 0;

  const localTotal = taxRevenue + nonTaxRevenue;

  const externalTotal =
    (external.national_tax_allotment ?? 0) +
    (external.other_shares_from_national_tax_collection ?? 0) +
    (external.inter_local_transfers ?? 0) +
    (external.extraordinary_receipts_grants_donations_aids ?? 0);

  return localTotal + externalTotal;
}

/** Compute total expenditure including all current operating costs */
export function computeTotalExpenditure(
  exp?: CurrentOperatingExpenditures
): number {
  if (!exp) return 0;

  const socialTotal = exp.social_services?.total_social_services ?? 0;
  return (
    (exp.general_public_services ?? 0) +
    socialTotal +
    (exp.economic_services ?? 0) +
    (exp.debt_service_interest_expense ?? 0)
  );
}

/** Compute net income */
export function computeNetIncome(
  income?: CurrentOperatingIncome,
  expenditure?: CurrentOperatingExpenditures
): number {
  return computeTotalIncome(income) - computeTotalExpenditure(expenditure);
}

/* ---------------- Empty Objects ---------------- */

export const emptyTaxRevenue = (): TaxRevenue => ({
  real_property_tax: { general_fund: 0, special_education_fund: 0, total: 0 },
  tax_on_business: 0,
  other_taxes: 0,
  total_tax_revenue: 0,
});

export const emptyNonTaxRevenue = (): NonTaxRevenue => ({
  regulatory_fees: 0,
  service_user_charges: 0,
  receipts_from_economic_enterprises: 0,
  other_receipts: 0,
  total_non_tax_revenue: 0,
});

export const emptyLocalSources = (): LocalSources => ({
  tax_revenue: emptyTaxRevenue(),
  non_tax_revenue: emptyNonTaxRevenue(),
  total_local_sources: 0,
});

export const emptyExternalSources = (): ExternalSources => ({
  national_tax_allotment: 0,
  other_shares_from_national_tax_collection: 0,
  inter_local_transfers: 0,
  extraordinary_receipts_grants_donations_aids: 0,
  total_external_sources: 0,
});

export const emptySocialServices = (): SocialServices => ({
  education_culture_sports_manpower_development: 0,
  health_nutrition_population_control: 0,
  labor_and_employment: 0,
  housing_and_community_development: 0,
  social_services_and_social_welfare: 0,
  total_social_services: 0,
});

export const emptyCurrentOperatingIncome = (): CurrentOperatingIncome => ({
  local_sources: emptyLocalSources(),
  external_sources: emptyExternalSources(),
  total_current_operating_income: 0,
});

export const emptyCurrentOperatingExpenditures =
  (): CurrentOperatingExpenditures => ({
    general_public_services: 0,
    social_services: emptySocialServices(),
    economic_services: 0,
    debt_service_interest_expense: 0,
    total_current_operating_expenditures: 0,
  });

/* ---------------- Aggregate Functions ---------------- */

/** Aggregate an array of CurrentOperatingIncome objects */
export function aggregateIncome(
  data: (CurrentOperatingIncome | undefined)[]
): CurrentOperatingIncome {
  return data.reduce<CurrentOperatingIncome>((acc, cur) => {
    if (!cur) return acc;

    const local = cur.local_sources ?? emptyLocalSources();
    const ext = cur.external_sources ?? emptyExternalSources();

    // Local Sources
    acc.local_sources.total_local_sources += local.total_local_sources || 0;

    // Tax Revenue
    acc.local_sources.tax_revenue.real_property_tax.general_fund +=
      local.tax_revenue?.real_property_tax?.general_fund || 0;
    acc.local_sources.tax_revenue.real_property_tax.special_education_fund +=
      local.tax_revenue?.real_property_tax?.special_education_fund || 0;
    acc.local_sources.tax_revenue.real_property_tax.total +=
      local.tax_revenue?.real_property_tax?.total || 0;
    acc.local_sources.tax_revenue.tax_on_business +=
      local.tax_revenue?.tax_on_business || 0;
    acc.local_sources.tax_revenue.other_taxes +=
      local.tax_revenue?.other_taxes || 0;
    acc.local_sources.tax_revenue.total_tax_revenue +=
      local.tax_revenue?.total_tax_revenue || 0;

    // Non-Tax Revenue
    acc.local_sources.non_tax_revenue.regulatory_fees +=
      local.non_tax_revenue?.regulatory_fees || 0;
    acc.local_sources.non_tax_revenue.service_user_charges +=
      local.non_tax_revenue?.service_user_charges || 0;
    acc.local_sources.non_tax_revenue.receipts_from_economic_enterprises +=
      local.non_tax_revenue?.receipts_from_economic_enterprises || 0;
    acc.local_sources.non_tax_revenue.other_receipts +=
      local.non_tax_revenue?.other_receipts || 0;
    acc.local_sources.non_tax_revenue.total_non_tax_revenue +=
      local.non_tax_revenue?.total_non_tax_revenue || 0;

    // External Sources
    acc.external_sources.total_external_sources +=
      ext.total_external_sources || 0;
    acc.external_sources.national_tax_allotment +=
      ext.national_tax_allotment || 0;
    acc.external_sources.other_shares_from_national_tax_collection +=
      ext.other_shares_from_national_tax_collection || 0;
    acc.external_sources.inter_local_transfers +=
      ext.inter_local_transfers || 0;
    acc.external_sources.extraordinary_receipts_grants_donations_aids +=
      ext.extraordinary_receipts_grants_donations_aids || 0;

    // Total Income
    acc.total_current_operating_income +=
      cur.total_current_operating_income || 0;

    return acc;
  }, emptyCurrentOperatingIncome());
}

/** Aggregate an array of CurrentOperatingExpenditures objects */
export function aggregateExpenditures(
  data: (CurrentOperatingExpenditures | undefined)[]
): CurrentOperatingExpenditures {
  const aggregated = data.reduce<CurrentOperatingExpenditures>((acc, cur) => {
    if (!cur) return acc;

    const social = cur.social_services ?? emptySocialServices();

    acc.general_public_services += cur.general_public_services || 0;
    acc.economic_services += cur.economic_services || 0;
    acc.debt_service_interest_expense += cur.debt_service_interest_expense || 0;

    // Sum social services
    for (const key of Object.keys(social) as (keyof SocialServices)[]) {
      acc.social_services[key] += social[key] || 0;
    }

    return acc;
  }, emptyCurrentOperatingExpenditures());

  // Recompute totals
  aggregated.social_services.total_social_services =
    aggregated.social_services.education_culture_sports_manpower_development +
    aggregated.social_services.health_nutrition_population_control +
    aggregated.social_services.labor_and_employment +
    aggregated.social_services.housing_and_community_development +
    aggregated.social_services.social_services_and_social_welfare;

  aggregated.total_current_operating_expenditures =
    aggregated.general_public_services +
    aggregated.social_services.total_social_services +
    aggregated.economic_services +
    aggregated.debt_service_interest_expense;

  return aggregated;
}

/**
 * Calculate Year-over-Year growth
 */
export const calculateYoY = (current: number, previous?: number) => {
  if (previous === undefined || previous === 0) return null;
  const diff = current - previous;
  const pct = (diff / previous) * 100;
  return { diff, pct };
};

/**
 * Format database keys to readable labels
 * e.g. "tax_revenue" -> "Tax Revenue"
 */
export const formatLabel = (str: string): string =>
  str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
