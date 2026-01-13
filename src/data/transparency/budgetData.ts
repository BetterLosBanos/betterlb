import raw from './sre.json';
import {
  FinancialQuarter,
  RawFinancialQuarter,
  NonIncomeReceipts,
  NonOperatingExpenditures,
  FundSummary,
  emptyCurrentOperatingIncome,
  emptyCurrentOperatingExpenditures,
  emptySocialServices,
  // Removed unused imports here
  emptyCapitalInvestmentReceipts,
  emptyReceiptsFromLoansAndBorrowings,
  emptyCapitalInvestmentExpenditures,
  emptyDebtServicePrincipalCost,
} from '@/types/budgetTypes';

// 1. Cast raw JSON to the Raw interface
const rawData = raw as unknown as RawFinancialQuarter[];

const budgetData: FinancialQuarter[] = rawData.map(q => {
  // ... (rest of the file remains exactly the same) ...
  // (I am omitting the body to save space, just copy the logic from previous response
  // but ensure the imports at the top match the list above)

  // --- A. Safe Income Processing ---
  const incomeRaw = q.current_operating_income ?? emptyCurrentOperatingIncome();
  const income = {
    ...emptyCurrentOperatingIncome(),
    ...incomeRaw,
    total_current_operating_income:
      (incomeRaw.local_sources?.total_local_sources ?? 0) +
      (incomeRaw.external_sources?.total_external_sources ?? 0),
  };

  // --- B. Safe Expenditure Processing ---
  const coeRaw =
    q.total_current_operating_expenditures ??
    emptyCurrentOperatingExpenditures();
  const socialRaw = coeRaw.social_services ?? emptySocialServices();

  const totalSocial =
    (socialRaw.education_culture_sports_manpower_development ?? 0) +
    (socialRaw.health_nutrition_population_control ?? 0) +
    (socialRaw.labor_and_employment ?? 0) +
    (socialRaw.housing_and_community_development ?? 0) +
    (socialRaw.social_services_and_social_welfare ?? 0);

  const expenditures = {
    general_public_services: coeRaw.general_public_services ?? 0,
    social_services: { ...socialRaw, total_social_services: totalSocial },
    economic_services: coeRaw.economic_services ?? 0,
    debt_service_interest_expense: coeRaw.debt_service_interest_expense ?? 0,
    total_current_operating_expenditures: 0,
  };

  expenditures.total_current_operating_expenditures =
    expenditures.general_public_services +
    expenditures.social_services.total_social_services +
    expenditures.economic_services +
    expenditures.debt_service_interest_expense;

  // --- C. Safe Non-Income Receipts (Deep Merge) ---
  const nirRaw = q.non_income_receipts;
  const nonIncomeReceipts: NonIncomeReceipts = {
    capital_investment_receipts: {
      ...emptyCapitalInvestmentReceipts(),
      ...(nirRaw?.capital_investment_receipts ?? {}),
    },
    receipts_from_loans_and_borrowings: {
      ...emptyReceiptsFromLoansAndBorrowings(),
      ...(nirRaw?.receipts_from_loans_and_borrowings ?? {}),
    },
    other_non_income_receipts: nirRaw?.other_non_income_receipts ?? 0,
    total_non_income_receipts: nirRaw?.total_non_income_receipts ?? 0,
  };

  // --- D. Safe Non-Operating Expenditures (Deep Merge) ---
  const noeRaw = q.non_operating_expenditures;
  const nonOperatingExpenditures: NonOperatingExpenditures = {
    capital_investment_expenditures: {
      ...emptyCapitalInvestmentExpenditures(),
      ...(noeRaw?.capital_investment_expenditures ?? {}),
    },
    debt_service_principal_cost: {
      ...emptyDebtServicePrincipalCost(),
      ...(noeRaw?.debt_service_principal_cost ?? {}),
    },
    other_non_operating_expenditures:
      noeRaw?.other_non_operating_expenditures ?? 0,
    total_non_operating_expenditures:
      noeRaw?.total_non_operating_expenditures ?? 0,
  };

  // --- E. Safe Fund Summary ---
  const fsRaw = q.fund_summary;
  const fundSummary: FundSummary | undefined = fsRaw
    ? {
        fund_cash_balance_end: fsRaw.fund_cash_balance_end ?? 0,
        net_increase_decrease_in_funds: fsRaw.net_increase_decrease_in_funds,
        add_cash_balance_beginning: fsRaw.add_cash_balance_beginning,
        fund_cash_available: fsRaw.fund_cash_available,
        less_payment_of_prior_years_accounts_payable:
          fsRaw.less_payment_of_prior_years_accounts_payable,
        continuing_appropriation: fsRaw.continuing_appropriation,
      }
    : undefined;

  return {
    period: q.period,
    location_info: q.location_info,
    current_operating_income: income,
    current_operating_expenditures: expenditures,
    net_operating_income_loss_from_current_operations:
      q.net_operating_income_loss_from_current_operations ?? 0,
    non_income_receipts: nonIncomeReceipts,
    non_operating_expenditures: nonOperatingExpenditures,
    fund_summary: fundSummary,
  };
});

export default budgetData;
