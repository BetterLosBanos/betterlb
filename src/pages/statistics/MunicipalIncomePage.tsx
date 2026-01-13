import { useState } from 'react';
import {
  Wallet,
  PieChart as PieIcon,
  Building2,
  DollarSign,
  Landmark,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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
      <div className='overflow-hidden relative p-8 text-white rounded-2xl bg-slate-900'>
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
        <Wallet className='absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/5 -rotate-12' />
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='p-6 space-y-2 bg-white rounded-2xl border-b-4 shadow-sm border-primary-600'>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
            Total Regular Income
          </p>
          <div className='text-3xl font-black text-slate-900'>
            {formatMillions(data.summary_indicators.annual_regular_income)}
          </div>
          <p className='text-xs font-medium text-slate-400'>
            Annual Regular Income (ARI)
          </p>
        </div>

        <div className='p-6 space-y-2 bg-white rounded-2xl border-b-4 shadow-sm border-secondary-600'>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
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

        <div className='p-6 space-y-2 bg-white rounded-2xl border-b-4 shadow-sm border-slate-900'>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
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
      <div className='flex gap-1 p-1 rounded-xl bg-slate-100'>
        {(['overview', 'breakdown'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all min-h-[44px] ${
              activeTab === tab
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'overview' ? (
              <PieIcon className='inline mr-2 w-3 h-3' />
            ) : (
              <Building2 className='inline mr-2 w-3 h-3' />
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' ? (
        <div className='p-6 rounded-2xl border bg-slate-50 border-slate-100'>
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
            {/* Income Sources Pie Chart */}
            <div className='space-y-4'>
              <h3 className='text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2'>
                <PieIcon className='w-4 h-4 text-primary-600' /> Income
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
              <h3 className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                Revenue Summary
              </h3>
              <div className='space-y-3'>
                <div className='p-4 bg-white rounded-xl border shadow-sm border-slate-100'>
                  <div className='flex justify-between items-start mb-2'>
                    <Landmark className='w-5 h-5 text-primary-600' />
                    <span className='text-lg font-black text-slate-900'>
                      {formatMillions(
                        data.other_income_sources.national_tax_allotment
                      )}
                    </span>
                  </div>
                  <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                    National Tax Allotment
                  </p>
                  <p className='mt-1 text-xs text-slate-500'>
                    {formatPercent(
                      data.summary_indicators.dependency_rates.nta_dependency
                    )}{' '}
                    dependency
                  </p>
                </div>

                <div className='p-4 bg-white rounded-xl border shadow-sm border-slate-100'>
                  <div className='flex justify-between items-start mb-2'>
                    <Building2 className='w-5 h-5 text-secondary-600' />
                    <span className='text-lg font-black text-slate-900'>
                      {formatMillions(
                        data.locally_sourced_revenue
                          .total_locally_sourced_revenue
                      )}
                    </span>
                  </div>
                  <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                    Locally Sourced Revenue
                  </p>
                  <div className='flex gap-4 mt-2'>
                    <div>
                      <p className='text-[9px] text-slate-400 font-bold uppercase'>
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
                      <p className='text-[9px] text-slate-400 font-bold uppercase'>
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

                <div className='p-4 bg-white rounded-xl border shadow-sm border-slate-100'>
                  <div className='flex justify-between items-start mb-2'>
                    <DollarSign className='w-5 h-5 text-emerald-600' />
                    <span className='text-lg font-black text-slate-900'>
                      {formatMillions(
                        data.other_shares_from_national_tax_collection
                          .total_other_shares
                      )}
                    </span>
                  </div>
                  <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
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
          <div className='p-6 rounded-2xl border bg-slate-50 border-slate-100'>
            <h3 className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4'>
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
              <span className='text-xs font-bold uppercase text-slate-500'>
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
          <div className='p-6 rounded-2xl border bg-slate-50 border-slate-100'>
            <h3 className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4'>
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
              <span className='text-xs font-bold uppercase text-slate-500'>
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
            <div className='p-6 rounded-2xl border bg-slate-50 border-slate-100'>
              <h3 className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4'>
                Other Shares from National Tax Collection
              </h3>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {otherSharesData.map((item, idx) => (
                  <div
                    key={idx}
                    className='p-4 bg-white rounded-xl border shadow-sm border-slate-100'
                  >
                    <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2'>
                      {item.name}
                    </p>
                    <p className='text-xl font-black text-slate-900'>
                      {formatMillions(item.value)}
                    </p>
                  </div>
                ))}
              </div>
              <div className='mt-4 text-center'>
                <span className='text-xs font-bold uppercase text-slate-500'>
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

      <p className='text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
        Source:{' '}
        <a
          href='https://data.bettergov.ph/datasets/9/resources/31'
          target='_blank'
          rel='noopener noreferrer'
          className='underline hover:text-primary-600'
        >
          BLFG via BetterGov.ph Open Data Portal
        </a>
      </p>
    </div>
  );
}
