import { Card, CardContent } from '@/components/ui/Card';
import { formatPeso } from '@/utils/format';
import { BarChart, CreditCard, TrendingUp, Wallet } from 'lucide-react';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenditure: number;
  netIncome: number;
  fundSummary?: {
    fund_cash_balance_end: number;
  };
  prevYear?: {
    totalIncome: number;
    totalExpenditure: number;
    netIncome: number;
    fundCashEnd: number;
  };
}

const yoy = (current: number, previous?: number) => {
  if (!previous || previous === 0) return null;
  const diff = current - previous;
  const pct = (diff / previous) * 100;
  return { diff, pct };
};

const YoY = ({ value }: { value: ReturnType<typeof yoy> }) => {
  if (!value) return null;

  const positive = value.diff >= 0;
  return (
    <div className={`text-xs ${positive ? 'text-green-600' : 'text-red-600'}`}>
      {positive ? '▲' : '▼'} {formatPeso(Math.abs(value.diff))} (
      {Math.abs(value.pct).toFixed(1)}%)
    </div>
  );
};

export default function SummaryCards({
  totalIncome,
  totalExpenditure,
  netIncome,
  fundSummary,
  prevYear,
}: SummaryCardsProps) {
  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
      {/* Total Income */}
      <Card className='p-2 text-center'>
        <CardContent className='space-y-1'>
          <BarChart className='mx-auto w-6 h-6 text-green-600' />
          <div className='text-sm font-medium'>Total Income</div>
          <div className='font-bold text-lg'>{formatPeso(totalIncome)}</div>
          <YoY value={yoy(totalIncome, prevYear?.totalIncome)} />
        </CardContent>
      </Card>

      {/* Total Expenditure */}
      <Card className='p-2 text-center'>
        <CardContent className='space-y-1'>
          <CreditCard className='mx-auto w-6 h-6 text-red-600' />
          <div className='text-sm font-medium'>Total Expenditure</div>
          <div className='font-bold text-lg'>
            {formatPeso(totalExpenditure)}
          </div>
          <YoY value={yoy(totalExpenditure, prevYear?.totalExpenditure)} />
        </CardContent>
      </Card>

      {/* Net Income */}
      <Card className='p-2 text-center'>
        <CardContent className='space-y-1'>
          <TrendingUp className='mx-auto w-6 h-6 text-blue-600' />
          <div className='text-sm font-medium'>Net Income</div>
          <div className='font-bold text-lg'>{formatPeso(netIncome)}</div>
          <YoY value={yoy(netIncome, prevYear?.netIncome)} />
        </CardContent>
      </Card>

      {/* Fund Cash Balance (End) */}
      {fundSummary && (
        <Card className='p-2 text-center'>
          <CardContent className='space-y-1'>
            <Wallet className='mx-auto w-6 h-6 text-yellow-600' />
            <div className='text-sm font-medium'>Fund Balance (End)</div>
            <div className='font-bold text-lg'>
              {formatPeso(fundSummary.fund_cash_balance_end)}
            </div>
            <YoY
              value={yoy(
                fundSummary.fund_cash_balance_end,
                prevYear?.fundCashEnd
              )}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
