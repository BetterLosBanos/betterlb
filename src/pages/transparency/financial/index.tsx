import { BarChart2Icon, Landmark, ReceiptText, Info } from 'lucide-react';
import SummaryCards from '@/pages/transparency/components/SummaryCards';
// ... rest of imports and component logic (no other changes needed)
import QuarterToggle from '@/pages/transparency/components/QuarterToggle';
import FinancialPieChart, {
  ChartDataPoint,
} from '@/pages/transparency/components/FinancialPieChart';
import { useFinancialData } from '@/hooks/useFinancialData';
import { formatLabel } from '@/utils/budgetUtils';

export default function FinancialPage() {
  // ... component implementation
  const {
    years,
    selectedYear,
    setSelectedYear,
    viewMode,
    setViewMode,
    quartersInYear,
    selectedQuarter,
    setSelectedQuarter,
    displayedIncome,
    displayedExpenditure,
    displayedFundSummary,
    comparisonBaseline,
    getQuarter,
  } = useFinancialData();

  // --- Transform Data for Charts ---

  // Helper: Safe Percentage Calculation (0.0 to 1.0)
  const calcPct = (val: number, total: number) => (total > 0 ? val / total : 0);

  // ---------------- INCOME DATA PREP ---------------- //

  const localTotal = displayedIncome.local_sources.total_local_sources;
  const externalTotal = displayedIncome.external_sources.total_external_sources;
  // FIX: Calculate Grand Total for Income to generate Tier 1 percentages
  const grandTotalIncome =
    displayedIncome.total_current_operating_income ||
    localTotal + externalTotal;

  const incomeChartData: ChartDataPoint[] = [
    {
      name: 'Local Sources',
      value: localTotal,
      // FIX: Add percent property here for Tier 1 Tooltip
      percent: calcPct(localTotal, grandTotalIncome),
      details: [
        {
          name: 'Real Property Tax',
          value:
            displayedIncome.local_sources.tax_revenue.real_property_tax.total,
          percent: calcPct(
            displayedIncome.local_sources.tax_revenue.real_property_tax.total,
            localTotal
          ),
        },
        {
          name: 'Business Tax',
          value: displayedIncome.local_sources.tax_revenue.tax_on_business,
          percent: calcPct(
            displayedIncome.local_sources.tax_revenue.tax_on_business,
            localTotal
          ),
        },
        {
          name: 'Other Taxes',
          value: displayedIncome.local_sources.tax_revenue.other_taxes,
          percent: calcPct(
            displayedIncome.local_sources.tax_revenue.other_taxes,
            localTotal
          ),
        },
        {
          name: 'Regulatory Fees',
          value: displayedIncome.local_sources.non_tax_revenue.regulatory_fees,
          percent: calcPct(
            displayedIncome.local_sources.non_tax_revenue.regulatory_fees,
            localTotal
          ),
        },
        {
          name: 'Economic Ent.',
          value:
            displayedIncome.local_sources.non_tax_revenue
              .receipts_from_economic_enterprises,
          percent: calcPct(
            displayedIncome.local_sources.non_tax_revenue
              .receipts_from_economic_enterprises,
            localTotal
          ),
        },
        {
          name: 'Service Charges',
          value:
            displayedIncome.local_sources.non_tax_revenue.service_user_charges,
          percent: calcPct(
            displayedIncome.local_sources.non_tax_revenue.service_user_charges,
            localTotal
          ),
        },
      ],
    },
    {
      name: 'External Sources',
      value: externalTotal,
      // FIX: Add percent property here for Tier 1 Tooltip
      percent: calcPct(externalTotal, grandTotalIncome),
      details: [
        {
          name: 'NTA',
          value: displayedIncome.external_sources.national_tax_allotment,
          percent: calcPct(
            displayedIncome.external_sources.national_tax_allotment,
            externalTotal
          ),
        },
        {
          name: 'Other Shares',
          value:
            displayedIncome.external_sources
              .other_shares_from_national_tax_collection,
          percent: calcPct(
            displayedIncome.external_sources
              .other_shares_from_national_tax_collection,
            externalTotal
          ),
        },
        {
          name: 'Grants/Aids',
          value:
            displayedIncome.external_sources
              .extraordinary_receipts_grants_donations_aids,
          percent: calcPct(
            displayedIncome.external_sources
              .extraordinary_receipts_grants_donations_aids,
            externalTotal
          ),
        },
      ],
    },
  ];

  // ---------------- EXPENDITURE DATA PREP ---------------- //

  const socialTotal =
    displayedExpenditure.social_services.total_social_services;
  // FIX: Calculate Grand Total for Expenditure
  const grandTotalExp =
    displayedExpenditure.total_current_operating_expenditures ||
    displayedExpenditure.general_public_services +
      socialTotal +
      displayedExpenditure.economic_services +
      displayedExpenditure.debt_service_interest_expense;

  const expenditureChartData: ChartDataPoint[] = [
    {
      name: 'General Public Services',
      value: displayedExpenditure.general_public_services,
      // FIX: Add percent
      percent: calcPct(
        displayedExpenditure.general_public_services,
        grandTotalExp
      ),
    },
    {
      name: 'Social Services',
      value: socialTotal,
      // FIX: Add percent
      percent: calcPct(socialTotal, grandTotalExp),
      details: Object.entries(displayedExpenditure.social_services)
        .filter(([key]) => key !== 'total_social_services')
        .map(([key, value]) => ({
          name: formatLabel(key),
          value,
          percent: calcPct(value, socialTotal),
        })),
    },
    {
      name: 'Economic Services',
      value: displayedExpenditure.economic_services,
      // FIX: Add percent
      percent: calcPct(displayedExpenditure.economic_services, grandTotalExp),
    },
    {
      name: 'Debt Service',
      value: displayedExpenditure.debt_service_interest_expense,
      // FIX: Add percent
      percent: calcPct(
        displayedExpenditure.debt_service_interest_expense,
        grandTotalExp
      ),
    },
  ];

  return (
    <div className='space-y-6 p-4 md:p-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow p-4 md:p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold flex items-center gap-2 text-slate-900'>
            <BarChart2Icon className='w-6 h-6 text-emerald-600' />
            Financial Report
          </h1>

          <div className='flex flex-wrap items-center gap-3 mt-2'>
            <p className='text-slate-500 text-sm'>
              FY {selectedYear} •{' '}
              {viewMode === 'quarter' ? 'Quarterly' : 'Annual'} Performance
            </p>

            <div className='flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600'>
              <Info className='w-3.5 h-3.5 text-slate-400' />
              <span>Figures in Million PHP (PHP)</span>
            </div>
          </div>
        </div>

        <QuarterToggle
          quarters={quartersInYear.map(q => getQuarter(q.period))}
          years={years}
          viewMode={viewMode}
          selectedYear={selectedYear}
          selectedQuarter={getQuarter(selectedQuarter.period)}
          onYearChange={setSelectedYear}
          onViewModeChange={setViewMode}
          onQuarterChange={q => {
            const found = quartersInYear.find(x => getQuarter(x.period) === q);
            if (found) setSelectedQuarter(found);
          }}
        />
      </div>

      {/* KPI Cards */}
      <SummaryCards
        income={displayedIncome}
        expenditure={displayedExpenditure}
        fundSummary={displayedFundSummary}
        prevYear={comparisonBaseline}
      />

      {/* Charts Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <FinancialPieChart
          title='Income Composition'
          icon={Landmark}
          data={incomeChartData}
          colors={['#10b981', '#0ea5e9', '#6366f1', '#64748b']}
        />

        <FinancialPieChart
          title='Expenditure Allocation'
          icon={ReceiptText}
          data={expenditureChartData}
          colors={['#f43f5e', '#f97316', '#eab308', '#3b82f6']}
        />
      </div>
    </div>
  );
}
