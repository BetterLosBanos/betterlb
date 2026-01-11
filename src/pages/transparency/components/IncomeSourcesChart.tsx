import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { formatPeso } from '@/utils/format';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { CurrentOperatingIncome } from '@/data/transparency/budgetData';
import { aggregateIncome } from '@/utils/budgetUtils';

const COLORS = ['#10b981', '#0ea5e9'];

interface IncomeSourcesChartProps {
  data: CurrentOperatingIncome | CurrentOperatingIncome[];
}

const formatLabel = (str: string) =>
  str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function IncomeSourcesChart({ data }: IncomeSourcesChartProps) {
  const incomeArray = Array.isArray(data) ? data : [data];

  const aggregated = incomeArray.length
    ? aggregateIncome(incomeArray)
    : {
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
      };

  const chartData = [
    {
      name: 'Local Sources',
      value: aggregated.local_sources.total_local_sources,
      details: [
        { name: 'tax_revenue', value: aggregated.local_sources.tax_revenue },
        {
          name: 'non_tax_revenue',
          value: aggregated.local_sources.non_tax_revenue,
        },
      ],
    },
    {
      name: 'External Sources',
      value: aggregated.external_sources.total_external_sources,
      details: [
        {
          name: 'national_tax_allotment',
          value: aggregated.external_sources.national_tax_allotment,
        },
        {
          name: 'other_shares_from_national_tax_collection',
          value:
            aggregated.external_sources
              .other_shares_from_national_tax_collection,
        },
        {
          name: 'extraordinary_receipts_grants_donations_aids',
          value:
            aggregated.external_sources
              .extraordinary_receipts_grants_donations_aids,
        },
      ],
    },
  ];

  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <Card>
      <CardHeader className='flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <TrendingUp className='w-5 h-5 text-green-600' />
          <span className='font-semibold text-gray-800'>Income Sources</span>
        </div>

        <Button size='sm' onClick={() => setShowBreakdown(!showBreakdown)}>
          {showBreakdown ? 'Hide Breakdown' : 'Show Breakdown'}
        </Button>
      </CardHeader>

      <CardContent>
        {/* Pie chart */}
        <div className='h-[260px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={chartData}
                dataKey='value'
                innerRadius={70}
                outerRadius={100}
                paddingAngle={4}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(1)}%`
                }
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatPeso(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown below chart */}
        {showBreakdown && (
          <div className='mt-4 space-y-2 text-sm'>
            {chartData.map(group => (
              <div
                key={group.name}
                className='p-2 border rounded-md bg-gray-50'
              >
                <div className='font-semibold flex justify-between'>
                  <span>{group.name}</span>
                  <span>{formatPeso(group.value)}</span>
                </div>

                {group.details.length > 0 && (
                  <div className='mt-1 space-y-1'>
                    {group.details.map(d => {
                      const percent = ((d.value / group.value) * 100).toFixed(
                        1
                      );
                      return (
                        <div
                          key={d.name}
                          className='flex justify-between text-xs text-gray-600'
                        >
                          <span>{formatLabel(d.name)}</span>
                          <span>
                            {formatPeso(d.value)} ({percent}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
