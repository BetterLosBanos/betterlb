import { useState } from 'react';

import {
  Building2,
  DollarSign,
  Landmark,
  PieChart as PieIcon,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Badge } from '@/components/ui/Badge';

import ariData from '@/data/statistics/ari.json';

export default function MunicipalIncomePage() {
  const data = ariData[0];
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown'>(
    'overview'
  );

  const formatMillions = (val: number) => `₱${val.toFixed(2)}M`;
  const formatPercent = (val: string) => val;

  // Income Sources for Pie Chart
  const incomeSources = [
    {
      name: 'National Tax Allotment',
      value: data.other_income_sources.national_tax_allotment,
      color: '#0066eb',
    },
    {
      name: 'Locally Sourced Revenue',
      value: data.locally_sourced_revenue.total_locally_sourced_revenue,
      color: '#cc3e00',
    },
    {
      name: 'Other Shares from National Tax',
      value: data.other_shares_from_national_tax_collection.total_other_shares,
      color: '#059669',
    },
    {
      name: 'Interest Income',
      value: data.other_income_sources.interest_income,
      color: '#64748b',
    },
  ];

  // Tax Revenue Breakdown
  const taxRevenueData = [
    {
      name: 'Real Property Tax',
      value:
        data.locally_sourced_revenue.tax_revenue.real_property_tax_general_fund,
    },
    {
      name: 'Business Tax',
      value: data.locally_sourced_revenue.tax_revenue.tax_on_business,
    },
    {
      name: 'Other Taxes',
      value: data.locally_sourced_revenue.tax_revenue.other_taxes,
    },
  ];

  // Non-Tax Revenue Breakdown
  const nonTaxRevenueData = [
    {
      name: 'Regulatory Fees',
      value: data.locally_sourced_revenue.non_tax_revenue.regulatory_fees,
    },
    {
      name: 'Service Charges',
      value: data.locally_sourced_revenue.non_tax_revenue.service_user_charges,
    },
    {
      name: 'Economic Enterprises',
      value:
        data.locally_sourced_revenue.non_tax_revenue
          .receipts_from_economic_enterprises,
    },
  ];

  // Other Shares Breakdown (filtering out zero values)
  const otherSharesData = [
    {
      name: 'Economic Zone',
      value:
        data.other_shares_from_national_tax_collection.share_from_economic_zone,
    },
    {
      name: 'EVAT',
      value: data.other_shares_from_national_tax_collection.share_from_evat,
    },
    {
      name: 'National Wealth',
      value:
        data.other_shares_from_national_tax_collection
          .share_from_national_wealth,
    },
    {
      name: 'PAGCOR/PCSO',
      value:
        data.other_shares_from_national_tax_collection
          .share_from_pagcor_pcso_lotto,
    },
    {
      name: 'Tobacco Excise',
      value:
        data.other_shares_from_national_tax_collection
          .share_from_tobacco_excise_tax,
    },
    {
      name: 'Others',
      value: data.other_shares_from_national_tax_collection.others,
    },
  ].filter(item => item.value > 0);

  return (
    <div className='space-y-8'>
      {/* Hero Header */}
      <div className='relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white'>
        <div className='relative z-10 space-y-2'>
          <Badge variant='primary' dot>
            {data.period} Audit
          </Badge>
          <h2 className='text-3xl font-extrabold tracking-tight'>
            Municipal Income Profile
          </h2>
          <p className='max-w-xl text-sm text-slate-400'>
            Annual Regular Income (ARI) and Revenue Source Breakdown for{' '}
            {data.location_info.lgu_name}, {data.location_info.province}.
          </p>
        </div>
        <Wallet className='absolute right-[-20px] bottom-[-20px] h-48 w-48 -rotate-12 text-white/5' />
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='border-primary-600 space-y-2 rounded-2xl border-b-4 bg-white p-6 shadow-sm'>
          <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
            Total Regular Income
          </p>
          <div className='text-3xl font-black text-slate-900'>
            {formatMillions(data.summary_indicators.annual_regular_income)}
          </div>
          <p className='text-xs font-medium text-slate-400'>
            Annual Regular Income (ARI)
          </p>
        </div>

        <div className='border-secondary-600 space-y-2 rounded-2xl border-b-4 bg-white p-6 shadow-sm'>
          <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
            Locally Sourced Revenue
          </p>
          <div className='text-3xl font-black text-slate-900'>
            {formatMillions(
              data.locally_sourced_revenue.total_locally_sourced_revenue
            )}
          </div>
          <p className='text-xs font-medium text-slate-400'>
            {formatPercent(
              data.summary_indicators.dependency_rates.lsr_dependency
            )}{' '}
            of Total Income
          </p>
        </div>

        <div className='space-y-2 rounded-2xl border-b-4 border-slate-900 bg-white p-6 shadow-sm'>
          <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
            NTA Dependency
          </p>
          <div className='text-3xl font-black text-slate-900'>
            {formatPercent(
              data.summary_indicators.dependency_rates.nta_dependency
            )}
          </div>
          <p className='text-xs font-medium text-slate-400'>
            National Tax Allotment Share
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex gap-1 rounded-xl bg-slate-100 p-1'>
        {(['overview', 'breakdown'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`min-h-[44px] flex-1 rounded-lg py-2 text-xs font-bold tracking-widest uppercase transition-all ${
              activeTab === tab
                ? 'text-primary-700 bg-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'overview' ? (
              <PieIcon className='mr-2 inline h-3 w-3' />
            ) : (
              <Building2 className='mr-2 inline h-3 w-3' />
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' ? (
        <div className='rounded-2xl border border-slate-100 bg-slate-50 p-6'>
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
            {/* Income Sources Pie Chart */}
            <div className='space-y-4'>
              <h3 className='flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                <PieIcon className='text-primary-600 h-4 w-4' /> Income
                Composition
              </h3>
              <div className='h-[320px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={incomeSources}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey='value'
                      label={entry =>
                        `${((entry.value / data.summary_indicators.annual_regular_income) * 100).toFixed(1)}%`
                      }
                    >
                      {incomeSources.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => formatMillions(value)}
                    />
                    <Legend
                      iconType='circle'
                      wrapperStyle={{
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Summary Cards */}
            <div className='space-y-4'>
              <h3 className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                Revenue Summary
              </h3>
              <div className='space-y-3'>
                <div className='rounded-xl border border-slate-100 bg-white p-4 shadow-sm'>
                  <div className='mb-2 flex items-start justify-between'>
                    <Landmark className='text-primary-600 h-5 w-5' />
                    <span className='text-lg font-black text-slate-900'>
                      {formatMillions(
                        data.other_income_sources.national_tax_allotment
                      )}
                    </span>
                  </div>
                  <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                    National Tax Allotment
                  </p>
                  <p className='mt-1 text-xs text-slate-500'>
                    {formatPercent(
                      data.summary_indicators.dependency_rates.nta_dependency
                    )}{' '}
                    dependency
                  </p>
                </div>

                <div className='rounded-xl border border-slate-100 bg-white p-4 shadow-sm'>
                  <div className='mb-2 flex items-start justify-between'>
                    <Building2 className='text-secondary-600 h-5 w-5' />
                    <span className='text-lg font-black text-slate-900'>
                      {formatMillions(
                        data.locally_sourced_revenue
                          .total_locally_sourced_revenue
                      )}
                    </span>
                  </div>
                  <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                    Locally Sourced Revenue
                  </p>
                  <div className='mt-2 flex gap-4'>
                    <div>
                      <p className='text-[9px] font-bold text-slate-400 uppercase'>
                        Tax Revenue
                      </p>
                      <p className='text-xs font-black text-slate-900'>
                        {formatMillions(
                          data.locally_sourced_revenue.tax_revenue
                            .total_tax_revenue
                        )}
                      </p>
                    </div>
                    <div>
                      <p className='text-[9px] font-bold text-slate-400 uppercase'>
                        Non-Tax Revenue
                      </p>
                      <p className='text-xs font-black text-slate-900'>
                        {formatMillions(
                          data.locally_sourced_revenue.non_tax_revenue
                            .total_non_tax_revenue
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='rounded-xl border border-slate-100 bg-white p-4 shadow-sm'>
                  <div className='mb-2 flex items-start justify-between'>
                    <DollarSign className='h-5 w-5 text-emerald-600' />
                    <span className='text-lg font-black text-slate-900'>
                      {formatMillions(
                        data.other_shares_from_national_tax_collection
                          .total_other_shares
                      )}
                    </span>
                  </div>
                  <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                    Other National Shares
                  </p>
                  <p className='mt-1 text-xs text-slate-500'>
                    {formatPercent(
                      data.summary_indicators.dependency_rates
                        .other_shares_from_national_tax_dependency
                    )}{' '}
                    of income
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='space-y-6'>
          {/* Tax Revenue Breakdown */}
          <div className='rounded-2xl border border-slate-100 bg-slate-50 p-6'>
            <h3 className='mb-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
              Tax Revenue Breakdown
            </h3>
            <div className='h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={taxRevenueData} margin={{ left: 0 }}>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    vertical={false}
                    stroke='#e2e8f0'
                  />
                  <XAxis
                    dataKey='name'
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    tickFormatter={val => `₱${val}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => formatMillions(value)}
                  />
                  <Bar dataKey='value' fill='#cc3e00' radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className='mt-4 text-center'>
              <span className='text-xs font-bold text-slate-500 uppercase'>
                Total Tax Revenue:{' '}
              </span>
              <span className='text-sm font-black text-slate-900'>
                {formatMillions(
                  data.locally_sourced_revenue.tax_revenue.total_tax_revenue
                )}
              </span>
            </div>
          </div>

          {/* Non-Tax Revenue Breakdown */}
          <div className='rounded-2xl border border-slate-100 bg-slate-50 p-6'>
            <h3 className='mb-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
              Non-Tax Revenue Breakdown
            </h3>
            <div className='h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={nonTaxRevenueData} margin={{ left: 0 }}>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    vertical={false}
                    stroke='#e2e8f0'
                  />
                  <XAxis
                    dataKey='name'
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    tickFormatter={val => `₱${val}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => formatMillions(value)}
                  />
                  <Bar dataKey='value' fill='#0066eb' radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className='mt-4 text-center'>
              <span className='text-xs font-bold text-slate-500 uppercase'>
                Total Non-Tax Revenue:{' '}
              </span>
              <span className='text-sm font-black text-slate-900'>
                {formatMillions(
                  data.locally_sourced_revenue.non_tax_revenue
                    .total_non_tax_revenue
                )}
              </span>
            </div>
          </div>

          {/* Other National Shares - Only show if there's data */}
          {otherSharesData.length > 0 && (
            <div className='rounded-2xl border border-slate-100 bg-slate-50 p-6'>
              <h3 className='mb-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                Other Shares from National Tax Collection
              </h3>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {otherSharesData.map((item, idx) => (
                  <div
                    key={idx}
                    className='rounded-xl border border-slate-100 bg-white p-4 shadow-sm'
                  >
                    <p className='mb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                      {item.name}
                    </p>
                    <p className='text-xl font-black text-slate-900'>
                      {formatMillions(item.value)}
                    </p>
                  </div>
                ))}
              </div>
              <div className='mt-4 text-center'>
                <span className='text-xs font-bold text-slate-500 uppercase'>
                  Total Other Shares:{' '}
                </span>
                <span className='text-sm font-black text-slate-900'>
                  {formatMillions(
                    data.other_shares_from_national_tax_collection
                      .total_other_shares
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <p className='text-center text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
        Source:{' '}
        <a
          href='https://data.bettergov.ph/datasets/9/resources/31'
          target='_blank'
          rel='noopener noreferrer'
          className='hover:text-primary-600 underline'
        >
          BLFG via BetterGov.ph Open Data Portal
        </a>
      </p>
    </div>
  );
}
