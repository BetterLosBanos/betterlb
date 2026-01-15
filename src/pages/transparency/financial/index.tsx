import {
  BarChart2Icon,
  Info,
  Landmark,
  ReceiptText,
  ShieldCheck,
} from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';
// UI Components
import { Badge } from '@/components/ui/Badge';

import FinancialPieChart, {
  ChartDataPoint,
} from '@/pages/transparency/components/FinancialPieChart';
import QuarterToggle from '@/pages/transparency/components/QuarterToggle';
import SummaryCards from '@/pages/transparency/components/SummaryCards';

import { useFinancialData } from '@/hooks/useFinancialData';

import { formatLabel } from '@/lib/budgetUtils';

export default function FinancialPage() {
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
  const calcPct = (val: number, total: number) => (total > 0 ? val / total : 0);

  // ---------------- INCOME DATA PREP ---------------- //
  const localTotal = displayedIncome.local_sources.total_local_sources;
  const externalTotal = displayedIncome.external_sources.total_external_sources;
  const grandTotalIncome =
    displayedIncome.total_current_operating_income ||
    localTotal + externalTotal;

  const incomeChartData: ChartDataPoint[] = [
    {
      name: 'Local Sources',
      value: localTotal,
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
      percent: calcPct(
        displayedExpenditure.general_public_services,
        grandTotalExp
      ),
    },
    {
      name: 'Social Services',
      value: socialTotal,
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
      percent: calcPct(displayedExpenditure.economic_services, grandTotalExp),
    },
    {
      name: 'Debt Service',
      value: displayedExpenditure.debt_service_interest_expense,
      percent: calcPct(
        displayedExpenditure.debt_service_interest_expense,
        grandTotalExp
      ),
    },
  ];

  return (
    <div className='animate-in fade-in mx-auto max-w-7xl space-y-6 pb-20 duration-500'>
      {/* 1. Standardized Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/transparency'>Transparency</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Financial Report</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 2. Unified Header with Controls */}
      <div className='flex flex-col gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm xl:flex-row xl:items-center xl:justify-between'>
        <div className='space-y-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='primary' dot>
              Verified Audit
            </Badge>
            <Badge variant='slate'>FY {selectedYear}</Badge>
            <div className='flex items-center gap-1.5 rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase'>
              <Info className='h-3.5 w-3.5 text-slate-400' />
              <span>Millions (PHP)</span>
            </div>
          </div>
          <h1 className='flex items-center gap-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl'>
            <BarChart2Icon className='h-8 w-8 text-emerald-600' />
            Financial Performance
          </h1>
          <p className='max-w-xl text-sm leading-relaxed font-medium text-slate-500'>
            Independent visualization of the municipal budget, including current
            operating income and expenditures.
          </p>
        </div>

        <div className='shrink-0 rounded-2xl border border-slate-100 bg-slate-50 p-4'>
          <QuarterToggle
            quarters={quartersInYear.map(q => getQuarter(q.period))}
            years={years}
            viewMode={viewMode}
            selectedYear={selectedYear}
            selectedQuarter={getQuarter(selectedQuarter.period)}
            onYearChange={setSelectedYear}
            onViewModeChange={setViewMode}
            onQuarterChange={q => {
              const found = quartersInYear.find(
                x => getQuarter(x.period) === q
              );
              if (found) setSelectedQuarter(found);
            }}
          />
        </div>
      </div>

      {/* 3. KPI Cards - Uses established card patterns inside SummaryCards */}
      <div role='region' aria-label='Financial Summary Cards'>
        <SummaryCards
          income={displayedIncome}
          expenditure={displayedExpenditure}
          fundSummary={displayedFundSummary}
          prevYear={comparisonBaseline}
        />
      </div>

      {/* 4. Charts Grid - Standardized Color Palettes */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <FinancialPieChart
          title='Income Composition'
          icon={Landmark}
          data={incomeChartData}
          // BetterGov: Emerald for local, Blue for national, Slate for others
          colors={['#059669', '#0066eb', '#64748b', '#94a3b8']}
        />

        <FinancialPieChart
          title='Expenditure Allocation'
          icon={ReceiptText}
          data={expenditureChartData}
          // BetterGov: Rose for services, Orange for economic, Amber for debt
          colors={['#dc2626', '#cc3e00', '#d97706', '#0066eb']}
        />
      </div>

      {/* 5. Accessibility Footer */}
      <footer className='pt-10 text-center'>
        <div className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm'>
          <ShieldCheck className='h-4 w-4 text-emerald-600' />
          <span className='text-[10px] font-bold tracking-widest text-slate-500 uppercase'>
            Source: LGU SRE via BLGF and Full Disclosure Policy Portal
          </span>
        </div>
      </footer>
    </div>
  );
}
