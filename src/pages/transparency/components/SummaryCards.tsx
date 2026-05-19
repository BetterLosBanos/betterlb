import { Landmark, ReceiptText, Scale, Vault } from 'lucide-react';

import { StatCard } from '@/components/ui/StatCard';

import {
  computeNetIncome,
  computeTotalExpenditure,
  computeTotalIncome,
} from '@/lib/budgetUtils';

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

// Helper to calculate YoY trend
const calculateTrend = (current: number, previous?: number) => {
  if (previous === undefined || previous === 0) return undefined;
  const diff = current - previous;
  const pct = (diff / previous) * 100;
  return { value: Math.abs(pct), positive: diff >= 0 };
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
      label: 'Total Revenue (M)',
      value: totalIncome,
      trend: calculateTrend(totalIncome, prevYear?.totalIncome),
      icon: Landmark,
      iconBg: 'bg-kapwa-green-50 text-kapwa-green-600',
    },
    {
      label: 'Total Expenditure (M)',
      value: totalExpenditure,
      trend: calculateTrend(totalExpenditure, prevYear?.totalExpenditure),
      icon: ReceiptText,
      iconBg: 'bg-kapwa-red-50 text-kapwa-red-600',
    },
    {
      label: 'Net Operating Income (M)',
      value: netIncome,
      trend: calculateTrend(netIncome, prevYear?.netIncome),
      icon: Scale,
      iconBg: 'bg-kapwa-bg-brand-weak text-kapwa-text-brand',
    },
    {
      label: 'Treasury Balance (M)',
      value: fundBalance,
      trend: calculateTrend(fundBalance, prevYear?.fundCashEnd),
      icon: Vault,
      iconBg: 'bg-kapwa-orange-50 text-kapwa-orange-600',
    },
  ];

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {cards.map(card => (
        <StatCard key={card.label} {...card} hover={true} />
      ))}
    </div>
  );
}
