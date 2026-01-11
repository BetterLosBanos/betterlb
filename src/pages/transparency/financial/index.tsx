import { BarChart2Icon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import SummaryCards from '@/pages/transparency/components/SummaryCards';
import IncomeSourcesChart from '@/pages/transparency/components/IncomeSourcesChart';
import ExpendituresChart from '@/pages/transparency/components/ExpendituresChart';
import QuarterToggle from '@/pages/transparency/components/QuarterToggle';

import budgetData, { FinancialQuarter } from '@/data/transparency/budgetData';
import { aggregateIncome, aggregateExpenditures } from '@/utils/budgetUtils';

/* ---------------- Helpers ---------------- */
const getYear = (period: string) => period.split('-')[1];
const getQuarter = (period: string) => period.split('-')[0];

export default function FinancialPage() {
  /* ---------------- Years ---------------- */
  const years = useMemo(
    () => Array.from(new Set(budgetData.map(q => getYear(q.period)))).sort(),
    []
  );
  const latestYear = years[years.length - 1];

  /* ---------------- State ---------------- */
  const [selectedYear, setSelectedYear] = useState(latestYear);
  const [viewMode, setViewMode] = useState<'quarter' | 'year'>('quarter');

  /* ---------------- Quarters (selected year) ---------------- */
  const quarters = useMemo(
    () => budgetData.filter(q => getYear(q.period) === selectedYear),
    [selectedYear]
  );

  const [selectedQuarter, setSelectedQuarter] = useState<FinancialQuarter>(
    quarters[quarters.length - 1]
  );

  useEffect(() => {
    setSelectedQuarter(quarters[quarters.length - 1]);
  }, [quarters]);

  /* ---------------- Previous year ---------------- */
  const previousYear = years[years.indexOf(selectedYear) - 1];

  /* ---------------- Previous YEAR aggregate ---------------- */
  const prevYearAggregate = useMemo(() => {
    if (!previousYear) return undefined;
    const prevYearQuarters = budgetData.filter(
      q => getYear(q.period) === previousYear
    );
    return prevYearQuarters.reduce(
      (acc, q) => {
        acc.totalIncome +=
          q.current_operating_income.total_current_operating_income || 0;
        acc.totalExpenditure +=
          q.current_operating_expenditures
            .total_current_operating_expenditures || 0;
        acc.netIncome +=
          q.net_operating_income_loss_from_current_operations || 0;
        acc.fundCashEnd += q.fund_summary?.fund_cash_balance_end || 0;
        return acc;
      },
      { totalIncome: 0, totalExpenditure: 0, netIncome: 0, fundCashEnd: 0 }
    );
  }, [previousYear]);

  /* ---------------- Previous QUARTER aggregate ---------------- */
  const prevQuarterAggregate = useMemo(() => {
    if (!previousYear || !selectedQuarter) return undefined;
    const match = budgetData.find(
      q =>
        getYear(q.period) === previousYear &&
        getQuarter(q.period) === getQuarter(selectedQuarter.period)
    );
    if (!match) return undefined;
    return {
      totalIncome:
        match.current_operating_income.total_current_operating_income || 0,
      totalExpenditure:
        match.current_operating_expenditures
          .total_current_operating_expenditures || 0,
      netIncome: match.net_operating_income_loss_from_current_operations || 0,
      fundCashEnd: match.fund_summary?.fund_cash_balance_end || 0,
    };
  }, [previousYear, selectedQuarter]);

  /* ---------------- Year aggregates ---------------- */
  const yearIncome = useMemo(
    () => aggregateIncome(quarters.map(q => q.current_operating_income)),
    [quarters]
  );

  const yearExpenditures = useMemo(
    () =>
      aggregateExpenditures(
        quarters.map(q => q.current_operating_expenditures)
      ),
    [quarters]
  );

  const yearNetIncome = useMemo(
    () =>
      quarters.reduce(
        (sum, q) =>
          sum + (q.net_operating_income_loss_from_current_operations || 0),
        0
      ),
    [quarters]
  );

  const yearFundSummary = useMemo(
    () =>
      quarters.reduce(
        (acc, q) => {
          if (!q.fund_summary) return acc;
          acc.net_increase_decrease_in_funds +=
            q.fund_summary.net_increase_decrease_in_funds || 0;
          acc.add_cash_balance_beginning +=
            q.fund_summary.add_cash_balance_beginning || 0;
          acc.fund_cash_available += q.fund_summary.fund_cash_available || 0;
          acc.less_payment_of_prior_years_accounts_payable +=
            q.fund_summary.less_payment_of_prior_years_accounts_payable || 0;
          acc.continuing_appropriation +=
            q.fund_summary.continuing_appropriation || 0;
          acc.fund_cash_balance_end +=
            q.fund_summary.fund_cash_balance_end || 0;
          return acc;
        },
        {
          net_increase_decrease_in_funds: 0,
          add_cash_balance_beginning: 0,
          fund_cash_available: 0,
          less_payment_of_prior_years_accounts_payable: 0,
          continuing_appropriation: 0,
          fund_cash_balance_end: 0,
        }
      ),
    [quarters]
  );

  /* ---------------- Display data ---------------- */
  const incomeData =
    viewMode === 'year' ? yearIncome : selectedQuarter.current_operating_income;
  const expenditureData =
    viewMode === 'year'
      ? yearExpenditures
      : selectedQuarter.current_operating_expenditures;
  const netIncome =
    viewMode === 'year'
      ? yearNetIncome
      : selectedQuarter.net_operating_income_loss_from_current_operations;
  const fundSummary =
    viewMode === 'year' ? yearFundSummary : selectedQuarter.fund_summary;
  const comparisonBaseline =
    viewMode === 'year' ? prevYearAggregate : prevQuarterAggregate;

  /* ---------------- Render ---------------- */
  return (
    <div className='space-y-6 p-4 md:p-6'>
      {/* Header Card */}
      <div className='bg-white rounded-lg shadow p-4 md:p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6'>
        {/* Title + subtitle */}
        <div>
          <h1 className='text-2xl font-bold flex items-center gap-2'>
            <BarChart2Icon className='w-6 h-6 text-green-600' />
            Financial Report
          </h1>
          <p className='text-gray-600 mt-1'>
            Statement of Receipts & Expenditures
          </p>
          <p className='text-gray-500 text-sm mt-1'>
            FY {selectedYear} {viewMode === 'quarter' ? 'quarterly' : 'yearly'}{' '}
            financial performance
          </p>
        </div>

        {/* QuarterToggle */}
        <QuarterToggle
          quarters={quarters.map(q => getQuarter(q.period))}
          years={years}
          viewMode={viewMode}
          selectedYear={selectedYear}
          selectedQuarter={
            selectedQuarter ? getQuarter(selectedQuarter.period) : ''
          }
          onYearChange={y => setSelectedYear(y)}
          onViewModeChange={mode => setViewMode(mode)}
          onQuarterChange={q => {
            const selected = quarters.find(x => getQuarter(x.period) === q);
            if (selected) setSelectedQuarter(selected);
          }}
        />
      </div>

      {/* Summary Cards */}
      <SummaryCards
        totalIncome={incomeData.total_current_operating_income || 0}
        totalExpenditure={
          expenditureData.total_current_operating_expenditures || 0
        }
        netIncome={netIncome}
        fundSummary={fundSummary}
        prevYear={comparisonBaseline}
      />

      {/* Charts */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <IncomeSourcesChart
          data={
            viewMode === 'year'
              ? quarters.map(q => q.current_operating_income)
              : [selectedQuarter.current_operating_income]
          }
        />

        <ExpendituresChart
          data={
            viewMode === 'year'
              ? quarters.map(q => q.current_operating_expenditures)
              : [selectedQuarter.current_operating_expenditures]
          }
        />
      </div>
    </div>
  );
}
