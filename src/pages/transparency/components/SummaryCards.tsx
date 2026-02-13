import { Landmark, ReceiptText, Scale, Vault } from 'lucide-react';

import { StatsCard } from '@/components/data-display/StatsUI';

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
      label: 'Total Revenue',
      value: totalIncome,
      prevValue: prevYear?.totalIncome,
      icon: Landmark,
      variant: 'primary' as const,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Total Expenditure',
      value: totalExpenditure,
      prevValue: prevYear?.totalExpenditure,
      icon: ReceiptText,
      variant: 'secondary' as const,
      iconBg: 'bg-rose-50 text-rose-600',
    },
    {
      label: 'Net Operating Income',
      value: netIncome,
      prevValue: prevYear?.netIncome,
      icon: Scale,
      variant: 'primary' as const,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Treasury Balance',
      value: fundBalance,
      prevValue: prevYear?.fundCashEnd,
      icon: Vault,
      variant: 'slate' as const,
      iconBg: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {cards.map(card => (
        <StatsCard key={card.label} {...card} hover={true} />
      ))}
    </div>
  );
}
