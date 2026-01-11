import type {
  CurrentOperatingIncome,
  CurrentOperatingExpenditures,
} from '@/data/transparency/budgetData';

export const emptySocialServices =
  (): CurrentOperatingExpenditures['social_services'] => ({
    education_culture_sports_manpower_development: 0,
    health_nutrition_population_control: 0,
    labor_and_employment: 0,
    housing_and_community_development: 0,
    social_services_and_social_welfare: 0,
    total_social_services: 0,
  });

export const emptyExpenditures = (): CurrentOperatingExpenditures => ({
  general_public_services: 0,
  social_services: emptySocialServices(),
  economic_services: 0,
  debt_service_interest_expense: 0,
  total_current_operating_expenditures: 0,
});

// Aggregate multiple CurrentOperatingIncome objects
export function aggregateIncome(
  data: CurrentOperatingIncome[]
): CurrentOperatingIncome {
  return data.reduce<CurrentOperatingIncome>(
    (acc, cur) => {
      acc.local_sources.total_local_sources +=
        cur.local_sources?.total_local_sources || 0;
      acc.local_sources.tax_revenue +=
        cur.local_sources?.tax_revenue?.total_tax_revenue || 0;
      acc.local_sources.non_tax_revenue +=
        cur.local_sources?.non_tax_revenue?.total_non_tax_revenue || 0;

      acc.external_sources.total_external_sources +=
        cur.external_sources?.total_external_sources || 0;
      acc.external_sources.national_tax_allotment +=
        cur.external_sources?.national_tax_allotment || 0;
      acc.external_sources.other_shares_from_national_tax_collection +=
        cur.external_sources?.other_shares_from_national_tax_collection || 0;
      acc.external_sources.extraordinary_receipts_grants_donations_aids +=
        cur.external_sources?.extraordinary_receipts_grants_donations_aids || 0;

      acc.total_current_operating_income +=
        cur.total_current_operating_income || 0;
      return acc;
    },
    {
      local_sources: {
        total_local_sources: 0,
        tax_revenue: 0,
        non_tax_revenue: 0,
      },
      external_sources: {
        total_external_sources: 0,
        national_tax_allotment: 0,
        other_shares_from_national_tax_collection: 0,
        extraordinary_receipts_grants_donations_aids: 0,
      },
      total_current_operating_income: 0,
    }
  );
}

// Aggregate multiple TotalCurrentOperatingExpenditures objects
export function aggregateExpenditures(
  data: CurrentOperatingExpenditures[]
): CurrentOperatingExpenditures {
  const aggregated = data.reduce((acc, cur) => {
    const social = cur.social_services || emptySocialServices();

    acc.general_public_services += cur.general_public_services || 0;
    acc.economic_services += cur.economic_services || 0;
    acc.debt_service_interest_expense += cur.debt_service_interest_expense || 0;

    for (const key of Object.keys(social) as (keyof typeof social)[]) {
      acc.social_services[key] += social[key] || 0;
    }

    return acc;
  }, emptyExpenditures());

  // Recompute total_current_operating_expenditures as sum of components
  aggregated.total_current_operating_expenditures =
    aggregated.general_public_services +
    aggregated.social_services.total_social_services +
    aggregated.economic_services +
    aggregated.debt_service_interest_expense;

  return aggregated;
}
