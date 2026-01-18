// Standardized BetterGov Chart Theme
export const CHART_THEME = {
  grid: '#f1f5f9', // slate-100
  text: '#94a3b8', // slate-400
  fontSize: 10,
  fontWeight: 700,
};

// Helper for Standard Axis Props
export const standardAxisProps = {
  axisLine: false,
  tickLine: false,
  tick: {
    fontSize: CHART_THEME.fontSize,
    fontWeight: CHART_THEME.fontWeight,
    fill: CHART_THEME.text,
  },
} as const;
