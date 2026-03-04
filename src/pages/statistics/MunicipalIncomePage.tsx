import { useMemo } from 'react';

import { Coins, Landmark, Wallet } from 'lucide-react';

import { StatGrid } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { DetailSection } from '@/components/layout/PageLayouts';
import { PageHero } from '@/components/layout/PageLayouts';

import FinancialPieChart from '@/pages/transparency/components/FinancialPieChart';

import { formatPesoAdaptive } from '@/lib/format';

import ariData from '@/data/statistics/ari.json';

const COLORS = {
  national: '#0066eb',
  local: '#cc3e00',
  special: '#059669',
  other: '#64748b',
};

export default function MunicipalIncomePage() {
  const data = ariData[0];

  const drillDownIncomeData = useMemo(
    () => [
      {
        name: 'National Tax Allotment',
        value: data.other_income_sources.national_tax_allotment,
        color: COLORS.national,
      },
      {
        name: 'Locally Sourced Revenue',
        value: data.locally_sourced_revenue.total_locally_sourced_revenue,
        color: COLORS.local,
        details: [
          {
            name: 'Tax Revenue',
            value: data.locally_sourced_revenue.tax_revenue.total_tax_revenue,
          },
          {
            name: 'Non-Tax Revenue',
            value:
              data.locally_sourced_revenue.non_tax_revenue
                .total_non_tax_revenue,
          },
        ],
      },
      {
        name: 'Other National Shares',
        value:
          data.other_shares_from_national_tax_collection.total_other_shares,
        color: COLORS.special,
      },
      {
        name: 'Interest Income',
        value: data.other_income_sources.interest_income,
        color: COLORS.other,
      },
    ],
    [data]
  );

  return (
    <>
      {/* PageHero - documented pattern for layout headers */}
      <PageHero
        title='Municipal Income'
        description='Detailed analysis of revenue sources, fiscal autonomy, and national tax dependency.'
      >
        <div className='flex flex-wrap justify-center gap-2'>
          <Badge variant='primary' dot>
            {data.period}
          </Badge>
          <Badge variant='slate'>BLGF Data</Badge>
        </div>
      </PageHero>

      {/* KPI Cards - using StatGrid with StatCard */}
      <div className='mb-kapwa-lg'>
        <StatGrid
          columns={3}
          stats={[
            {
              label: 'Total Income',
              value: formatPesoAdaptive(
                data.summary_indicators.annual_regular_income * 1_000_000
              ).fullString,
              subtext: 'Annual Revenue',
              variant: 'primary',
            },
            {
              label: 'Local Sufficiency',
              value: `${data.summary_indicators.dependency_rates.lsr_dependency}`,
              subtext: 'LSR Share',
              variant: 'secondary',
            },
            {
              label: 'NTA Dependency',
              value: `${data.summary_indicators.dependency_rates.nta_dependency}`,
              subtext: 'National Allotment',
              variant: 'slate',
              icon: Wallet,
            },
          ]}
        />
      </div>

      {/* Chart wrapped in DetailSection */}
      <div className='mb-kapwa-lg'>
        <DetailSection title='Revenue Composition' icon={Landmark}>
          <div className='flex justify-center'>
            <FinancialPieChart
              title='Overview'
              icon={Landmark}
              data={drillDownIncomeData}
              colors={[
                COLORS.national,
                COLORS.local,
                COLORS.special,
                COLORS.other,
              ]}
            />
          </div>
        </DetailSection>
      </div>

      {/* Full Financial Itemization */}
      <DetailSection title='Full Financial Itemization' icon={Coins}>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          <div className='space-y-4'>
            <h4 className='text-kapwa-text-accent-orange border-b pb-2 text-[10px] font-black tracking-widest uppercase'>
              Local Tax
            </h4>
            <div className='text-kapwa-text-support space-y-2 text-sm font-bold'>
              <div className='bg-kapwa-bg-surface-raised flex justify-between rounded-lg p-2'>
                <span>Real Property</span>
                <span>
                  {
                    formatPesoAdaptive(
                      data.locally_sourced_revenue.tax_revenue
                        .real_property_tax_general_fund
                    ).fullString
                  }
                </span>
              </div>
              <div className='bg-kapwa-bg-surface-raised flex justify-between rounded-lg p-2'>
                <span>Business Tax</span>
                <span>
                  {
                    formatPesoAdaptive(
                      data.locally_sourced_revenue.tax_revenue.tax_on_business
                    ).fullString
                  }
                </span>
              </div>
            </div>
          </div>
          <div className='space-y-4'>
            <h4 className='text-kapwa-text-brand border-b pb-2 text-[10px] font-black tracking-widest uppercase'>
              Non-Tax
            </h4>
            <div className='text-kapwa-text-support space-y-2 text-sm font-bold'>
              <div className='bg-kapwa-bg-surface-raised flex justify-between rounded-lg p-2'>
                <span>Fees</span>
                <span>
                  {
                    formatPesoAdaptive(
                      data.locally_sourced_revenue.non_tax_revenue
                        .regulatory_fees
                    ).fullString
                  }
                </span>
              </div>
              <div className='bg-kapwa-bg-surface-raised flex justify-between rounded-lg p-2'>
                <span>Enterprises</span>
                <span>
                  {
                    formatPesoAdaptive(
                      data.locally_sourced_revenue.non_tax_revenue
                        .receipts_from_economic_enterprises
                    ).fullString
                  }
                </span>
              </div>
            </div>
          </div>
          <div className='space-y-4'>
            <h4 className='border-b pb-2 text-[10px] font-black tracking-widest text-kapwa-text-success uppercase'>
              External
            </h4>
            <div className='text-kapwa-text-support space-y-2 text-sm font-bold'>
              <div className='bg-kapwa-bg-surface-raised flex justify-between rounded-lg p-2'>
                <span>Allotment</span>
                <span>
                  {
                    formatPesoAdaptive(
                      data.other_income_sources.national_tax_allotment
                    ).fullString
                  }
                </span>
              </div>
              <div className='bg-kapwa-bg-surface-raised flex justify-between rounded-lg p-2'>
                <span>Other Shares</span>
                <span>
                  {
                    formatPesoAdaptive(
                      data.other_shares_from_national_tax_collection
                        .total_other_shares
                    ).fullString
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </DetailSection>

      {/* Footer */}
      <footer className='border-kapwa-border-weak space-y-4 border-t pt-10 text-center'>
        <div className='bg-kapwa-bg-success-weak text-kapwa-text-success mx-auto flex h-6 w-6 items-center justify-center rounded-full'>
          <svg
            className='h-4 w-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
        </div>
        <div className='space-y-1'>
          <p className='text-kapwa-text-strong text-[10px] font-bold tracking-widest uppercase'>
            Verified Data Audit
          </p>
          <p className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
            Source:{' '}
            <a
              href='https://data.bettergov.ph/datasets/9/resources/31'
              target='_blank'
              rel='noreferrer'
              className='hover:text-kapwa-text-brand underline'
            >
              Bureau of Local Government Finance (BLGF)
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
