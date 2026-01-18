import { useMemo } from 'react';

import { Coins, Landmark, Wallet } from 'lucide-react';

import {
  StatsFooter,
  StatsHero,
  StatsKPICard,
} from '@/components/data-display/StatsUI';
import { DetailSection } from '@/components/layout/PageLayouts';

import FinancialPieChart from '@/pages/transparency/components/FinancialPieChart';

import { formatMillions } from '@/lib/format';

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
    <div className='animate-in fade-in space-y-10 pb-20 duration-500'>
      <StatsHero
        title='Municipal Income'
        description='Detailed analysis of revenue sources, fiscal autonomy, and national tax dependency.'
        badge={data.period}
        icon={Wallet}
      />

      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <StatsKPICard
          label='Total Income'
          value={formatMillions(data.summary_indicators.annual_regular_income)}
          subtext='Annual Revenue'
          variant='primary'
        />
        <StatsKPICard
          label='Local Sufficiency'
          value={data.summary_indicators.dependency_rates.lsr_dependency}
          subtext='LSR Share'
          variant='secondary'
        />
        <StatsKPICard
          label='NTA Dependency'
          value={data.summary_indicators.dependency_rates.nta_dependency}
          subtext='National Allotment'
          variant='slate'
        />
      </div>

      <FinancialPieChart
        title='Revenue Composition'
        icon={Landmark}
        data={drillDownIncomeData}
        colors={[COLORS.national, COLORS.local, COLORS.special, COLORS.other]}
      />

      <DetailSection title='Full Financial Itemization' icon={Coins}>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          <div className='space-y-4'>
            <h4 className='text-secondary-600 border-b pb-2 text-[10px] font-black tracking-widest uppercase'>
              Local Tax
            </h4>
            <div className='space-y-2 text-sm font-bold text-slate-700'>
              <div className='flex justify-between rounded-lg bg-slate-50 p-2'>
                <span>Real Property</span>
                <span>
                  {formatMillions(
                    data.locally_sourced_revenue.tax_revenue
                      .real_property_tax_general_fund
                  )}
                </span>
              </div>
              <div className='flex justify-between rounded-lg bg-slate-50 p-2'>
                <span>Business Tax</span>
                <span>
                  {formatMillions(
                    data.locally_sourced_revenue.tax_revenue.tax_on_business
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className='space-y-4'>
            <h4 className='text-primary-600 border-b pb-2 text-[10px] font-black tracking-widest uppercase'>
              Non-Tax
            </h4>
            <div className='space-y-2 text-sm font-bold text-slate-700'>
              <div className='flex justify-between rounded-lg bg-slate-50 p-2'>
                <span>Fees</span>
                <span>
                  {formatMillions(
                    data.locally_sourced_revenue.non_tax_revenue.regulatory_fees
                  )}
                </span>
              </div>
              <div className='flex justify-between rounded-lg bg-slate-50 p-2'>
                <span>Enterprises</span>
                <span>
                  {formatMillions(
                    data.locally_sourced_revenue.non_tax_revenue
                      .receipts_from_economic_enterprises
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className='space-y-4'>
            <h4 className='border-b pb-2 text-[10px] font-black tracking-widest text-emerald-600 uppercase'>
              External
            </h4>
            <div className='space-y-2 text-sm font-bold text-slate-700'>
              <div className='flex justify-between rounded-lg bg-slate-50 p-2'>
                <span>Allotment</span>
                <span>
                  {formatMillions(
                    data.other_income_sources.national_tax_allotment
                  )}
                </span>
              </div>
              <div className='flex justify-between rounded-lg bg-slate-50 p-2'>
                <span>Other Shares</span>
                <span>
                  {formatMillions(
                    data.other_shares_from_national_tax_collection
                      .total_other_shares
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DetailSection>

      <StatsFooter
        source='Bureau of Local Government Finance (BLGF)'
        sourceUrl='https://data.bettergov.ph/datasets/9/resources/31'
      />
    </div>
  );
}
