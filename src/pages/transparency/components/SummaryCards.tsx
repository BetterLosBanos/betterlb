import { Card, CardContent } from '@/components/ui/Card';
import { calculateYoY } from '@/utils/budgetUtils';
import {
  computeTotalIncome,
  computeTotalExpenditure,
  computeNetIncome,
} from '@/utils/budgetUtils';
import {
  Landmark,
  ReceiptText,
  Scale,
  Vault,
  ArrowUpRight,
  ArrowDownRight,
  LucideIcon,
} from 'lucide-react';
import type {
  CurrentOperatingIncome,
  CurrentOperatingExpenditures,
  FundSummary,
} from '@/types/budgetTypes';
import { formatPesoParts } from '@/utils/format';

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
    <div className='flex items-baseline font-bold text-2xl text-slate-900 tracking-tight'>
      <span className='text-lg text-slate-400 mr-1 font-medium'>{symbol}</span>
      {integer}
      <span className='text-lg text-slate-400 font-medium'>
        {decimal}
        {fraction}
      </span>
      {/* Added Unit Indicator */}
      <span className='ml-1 text-sm text-slate-500 font-semibold'>{unit}</span>
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
    <Card className='border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200'>
      <CardContent className='p-5 flex items-start justify-between'>
        <div>
          <p className='text-sm font-medium text-slate-500 mb-1'>{title}</p>
          <CurrencyDisplay value={value} />

          {yoy && (
            <div
              className={`flex items-center mt-2 text-xs font-medium ${trendColor}`}
            >
              <TrendIcon className='w-3 h-3 mr-1' />
              <span>{Math.abs(yoy.pct).toFixed(1)}%</span>
              <span className='text-slate-400 ml-1 font-normal'>
                vs last year
              </span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className='w-6 h-6' />
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
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
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
