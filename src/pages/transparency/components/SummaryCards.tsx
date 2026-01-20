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
import { formatPesoAdaptive } from '@/lib/format';

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

// --- Stat Card Component ---
const StatCard = ({
  title,
  value,
  prevValue,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: number;
  prevValue?: number;
  icon: LucideIcon;
  colorClass: string;
}) => {
  const yoy = calculateYoY(value, prevValue);
  const isPositive = yoy ? yoy.diff >= 0 : true;
  const trendColor = isPositive ? 'text-emerald-600' : 'text-rose-600';
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className='border-slate-200 shadow-sm transition-shadow duration-200 hover:shadow-md'>
      <CardContent className='flex items-start justify-between p-5'>
        <div>
          <p className='mb-1 text-sm font-medium text-slate-500'>{title}</p>
          <div className='text-2xl font-bold tracking-tight text-slate-900'>
            {formatPesoAdaptive(value, 2, true).fullString}
          </div>
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

// --- Summary Cards Component ---
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

  const cards = [
    {
      title: 'Total Revenue',
      value: totalIncome,
      prevValue: prevYear?.totalIncome,
      icon: Landmark,
      colorClass: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Total Expenditure',
      value: totalExpenditure,
      prevValue: prevYear?.totalExpenditure,
      icon: ReceiptText,
      colorClass: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Net Operating Income',
      value: netIncome,
      prevValue: prevYear?.netIncome,
      icon: Scale,
      colorClass: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Treasury Balance',
      value: fundBalance,
      prevValue: prevYear?.fundCashEnd,
      icon: Vault,
      colorClass: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {cards.map(card => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
