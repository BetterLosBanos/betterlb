import {
  ArrowDownRight,
  ArrowUpRight,
  Landmark,
  LucideIcon,
  ReceiptText,
  Scale,
  Vault,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/Card';

import { calculateYoY } from '@/lib/budgetUtils';
import {
  computeNetIncome,
  computeTotalExpenditure,
  computeTotalIncome,
} from '@/lib/budgetUtils';
import { formatPesoParts } from '@/lib/format';

import type {
  CurrentOperatingExpenditures,
  CurrentOperatingIncome,
  FundSummary,
} from '@/types/budgetTypes';

// --- Types ---
interface SummaryCardsProps {
  income: CurrentOperatingIncome;
  expenditure: CurrentOperatingExpenditures;
  fundSummary?: Partial<FundSummary>;
  prevYear?: {
    totalIncome: number;
    totalExpenditure: number;
    netIncome: number;
    fundCashEnd: number;
  };
}

// --- Sub-component: Value Display ---
// Renders ₱ 1,200.00 with the .00 smaller and lighter
const CurrencyDisplay = ({ value }: { value: number }) => {
  const { symbol, integer, decimal, fraction, unit } = formatPesoParts(value);
  return (
    <div className='flex items-baseline text-2xl font-bold tracking-tight text-slate-900'>
      <span className='mr-1 text-lg font-medium text-slate-400'>{symbol}</span>
      {integer}
      <span className='text-lg font-medium text-slate-400'>
        {decimal}
        {fraction}
      </span>
      {/* Added Unit Indicator */}
      <span className='ml-1 text-sm font-semibold text-slate-500'>{unit}</span>
    </div>
  );
};

// --- Sub-component: Stat Card ---
const StatCard = ({
  title,
  value,
  prevValue,
  icon: Icon,
  colorClass, // e.g., "bg-emerald-100 text-emerald-600"
}: {
  title: string;
  value: number;
  prevValue?: number;
  icon: LucideIcon;
  colorClass: string;
}) => {
  const yoy = calculateYoY(value, prevValue);
  const isPositive = yoy ? yoy.diff >= 0 : true;

  // Determine trend color (Green is usually good, but for expenses, red might be "up")
  // For simplicity, we stick to standard financial logic: Green = Up, Red = Down
  const trendColor = isPositive ? 'text-emerald-600' : 'text-rose-600';
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className='border-slate-200 shadow-sm transition-shadow duration-200 hover:shadow-md'>
      <CardContent className='flex items-start justify-between p-5'>
        <div>
          <p className='mb-1 text-sm font-medium text-slate-500'>{title}</p>
          <CurrencyDisplay value={value} />

          {yoy && (
            <div
              className={`mt-2 flex items-center text-xs font-medium ${trendColor}`}
            >
              <TrendIcon className='mr-1 h-3 w-3' />
              <span>{Math.abs(yoy.pct).toFixed(1)}%</span>
              <span className='ml-1 font-normal text-slate-400'>
                vs last year
              </span>
            </div>
          )}
        </div>

        <div className={`rounded-xl p-3 ${colorClass}`}>
          <Icon className='h-6 w-6' />
        </div>
      </CardContent>
    </Card>
  );
};

export default function SummaryCards({
  income,
  expenditure,
  fundSummary,
  prevYear,
}: SummaryCardsProps) {
  const totalIncome = computeTotalIncome(income);
  const totalExpenditure = computeTotalExpenditure(expenditure);
  const netIncome = computeNetIncome(income, expenditure);
  const fundBalance = fundSummary?.fund_cash_balance_end ?? 0;

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      <StatCard
        title='Total Revenue'
        value={totalIncome}
        prevValue={prevYear?.totalIncome}
        icon={Landmark}
        colorClass='bg-emerald-50 text-emerald-600'
      />
      <StatCard
        title='Total Expenditure'
        value={totalExpenditure}
        prevValue={prevYear?.totalExpenditure}
        icon={ReceiptText}
        colorClass='bg-rose-50 text-rose-600'
      />
      <StatCard
        title='Net Operating Income'
        value={netIncome}
        prevValue={prevYear?.netIncome}
        icon={Scale}
        colorClass='bg-blue-50 text-blue-600'
      />
      <StatCard
        title='Treasury Balance'
        value={fundBalance}
        prevValue={prevYear?.fundCashEnd}
        icon={Vault}
        colorClass='bg-amber-50 text-amber-600'
      />
    </div>
  );
}
