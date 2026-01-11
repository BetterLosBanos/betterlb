import { useMemo, useState } from 'react'; // Removed useEffect
import budgetData from '@/data/transparency/budgetData';
import { aggregateIncome, aggregateExpenditures } from '@/utils/budgetUtils';
import { FinancialQuarter } from '@/types/budgetTypes';

const getYear = (period: string) => period.split('-')[1];
const getQuarter = (period: string) => period.split('-')[0];

export function useFinancialData() {
  // 1. Determine available years
  const years = useMemo(
    () => Array.from(new Set(budgetData.map(q => getYear(q.period)))).sort(),
    []
  );

  // 2. State
  const [selectedYear, setSelectedYear] = useState(years[years.length - 1]);
  const [viewMode, setViewMode] = useState<'quarter' | 'year'>('quarter');

  // 3. Filter data for selected year
  const quartersInYear = useMemo(
    () => budgetData.filter(q => getYear(q.period) === selectedYear),
    [selectedYear]
  );

  // 4. Selected Quarter State
  // Initialize with the last available quarter of the latest year
  const [selectedQuarter, setSelectedQuarter] = useState<FinancialQuarter>(
    quartersInYear[quartersInYear.length - 1] || budgetData[0]
  );

  /**
   * Smart Year Change Handler
   * Attempts to keep the same quarter (e.g. Q2) when switching years.
   * If Q2 doesn't exist in the new year, falls back to the latest available.
   */
  const changeYear = (newYear: string) => {
    setSelectedYear(newYear);

    // Find all quarters for the NEW year
    const newYearData = budgetData.filter(q => getYear(q.period) === newYear);

    // Get the currently selected quarter string (e.g., "Q2")
    const currentQStr = getQuarter(selectedQuarter.period);

    // Try to find "Q2" in the new year
    const matchingQuarter = newYearData.find(
      q => getQuarter(q.period) === currentQStr
    );

    if (matchingQuarter) {
      setSelectedQuarter(matchingQuarter);
    } else {
      // Fallback: Use the last available quarter for that year
      setSelectedQuarter(newYearData[newYearData.length - 1]);
    }
  };

  // 5. Aggregate Data based on View Mode
  const displayedIncome = useMemo(
    () =>
      viewMode === 'year'
        ? aggregateIncome(quartersInYear.map(q => q.current_operating_income))
        : selectedQuarter.current_operating_income,
    [viewMode, quartersInYear, selectedQuarter]
  );

  const displayedExpenditure = useMemo(
    () =>
      viewMode === 'year'
        ? aggregateExpenditures(
            quartersInYear.map(q => q.current_operating_expenditures)
          )
        : selectedQuarter.current_operating_expenditures,
    [viewMode, quartersInYear, selectedQuarter]
  );

  const displayedFundSummary = useMemo(() => {
    if (viewMode === 'quarter') return selectedQuarter.fund_summary;
    const lastQ = quartersInYear[quartersInYear.length - 1];
    return lastQ?.fund_summary;
  }, [viewMode, selectedQuarter, quartersInYear]);

  // 6. Comparison Baseline logic
  const comparisonBaseline = useMemo(() => {
    const prevYear = (parseInt(selectedYear) - 1).toString();
    const prevYearData = budgetData.filter(q => getYear(q.period) === prevYear);

    if (prevYearData.length === 0) return undefined;

    let targetIncome = 0;
    let targetExpenditure = 0;
    let targetNet = 0;
    let targetFundEnd = 0;

    if (viewMode === 'quarter') {
      const qStr = getQuarter(selectedQuarter.period);
      const match = prevYearData.find(q => getQuarter(q.period) === qStr);
      // Comparison: If Q3 2025 is selected but Q3 2024 doesn't exist, comparison is undefined
      if (!match) return undefined;

      targetIncome =
        match.current_operating_income.total_current_operating_income;
      targetExpenditure =
        match.current_operating_expenditures
          .total_current_operating_expenditures;
      targetNet = match.net_operating_income_loss_from_current_operations;
      targetFundEnd = match.fund_summary?.fund_cash_balance_end || 0;
    } else {
      targetIncome = prevYearData.reduce(
        (acc, q) =>
          acc + q.current_operating_income.total_current_operating_income,
        0
      );
      targetExpenditure = prevYearData.reduce(
        (acc, q) =>
          acc +
          q.current_operating_expenditures.total_current_operating_expenditures,
        0
      );
      targetNet = prevYearData.reduce(
        (acc, q) => acc + q.net_operating_income_loss_from_current_operations,
        0
      );
      targetFundEnd =
        prevYearData[prevYearData.length - 1]?.fund_summary
          ?.fund_cash_balance_end || 0;
    }

    return {
      totalIncome: targetIncome,
      totalExpenditure: targetExpenditure,
      netIncome: targetNet,
      fundCashEnd: targetFundEnd,
    };
  }, [selectedYear, viewMode, selectedQuarter]);

  return {
    years,
    selectedYear,
    setSelectedYear: changeYear, // Return our smart handler instead of the raw setter
    viewMode,
    setViewMode,
    quartersInYear,
    selectedQuarter,
    setSelectedQuarter,
    displayedIncome,
    displayedExpenditure,
    displayedFundSummary,
    comparisonBaseline,
    getQuarter,
  };
}
