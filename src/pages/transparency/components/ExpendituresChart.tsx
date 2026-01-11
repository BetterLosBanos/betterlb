import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CreditCard } from 'lucide-react';
import { formatPeso } from '@/utils/format';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { CurrentOperatingExpenditures } from '@/data/transparency/budgetData';
import { aggregateExpenditures } from '@/utils/budgetUtils';

const COLORS = ['#f97316', '#e11d48', '#3b82f6', '#10b981'];

interface ExpendituresChartProps {
  data: CurrentOperatingExpenditures | CurrentOperatingExpenditures[];
}

const formatLabel = (str: string) =>
  str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function ExpendituresChart({ data }: ExpendituresChartProps) {
  const expendituresArray = Array.isArray(data) ? data : [data];

  const aggregated = expendituresArray.length
    ? aggregateExpenditures(expendituresArray)
    : {
        general_public_services: 0,
        social_services: {
          education_culture_sports_manpower_development: 0,
          health_nutrition_population_control: 0,
          labor_and_employment: 0,
          housing_and_community_development: 0,
          social_services_and_social_welfare: 0,
          total_social_services: 0,
        },
        economic_services: 0,
        debt_service_interest_expense: 0,
        total_current_operating_expenditures: 0,
      };

  const total = aggregated.total_current_operating_expenditures || 1;
  console.log('Expenditures Array:', expendituresArray);
  console.log('Aggregated:', aggregated);

  const chartData = [
    {
      name: 'General Public Services',
      value: aggregated.general_public_services,
      details: [],
    },
    {
      name: 'Social Services',
      value: aggregated.social_services.total_social_services,
      details: Object.entries(aggregated.social_services)
        .filter(([k]) => k !== 'total_social_services')
        .map(([name, value]) => ({
          name: formatLabel(name),
          value,
          percent: (value / total) * 100,
        })),
    },
    {
      name: 'Economic Services',
      value: aggregated.economic_services,
      details: [],
    },
    {
      name: 'Debt Service',
      value: aggregated.debt_service_interest_expense,
      details: [],
    },
  ];

  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <Card>
      <CardHeader className='flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <CreditCard className='w-5 h-5 text-gray-600' />
          <span className='font-semibold text-gray-800'>Expenditures</span>
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
                    {group.details.map(d => (
                      <div
                        key={d.name}
                        className='flex justify-between text-xs text-gray-600'
                      >
                        <span>{d.name}</span>
                        <span>
                          {formatPeso(d.value)} ({d.percent.toFixed(1)}%)
                        </span>
                      </div>
                    ))}
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
