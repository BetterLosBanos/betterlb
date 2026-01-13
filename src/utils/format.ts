// Standard formatter
export const formatPeso = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Formatter with "M" suffix for charts/tooltips
export const formatMillions = (amount: number): string => {
  return formatPeso(amount) + ' M';
};

// Fancy formatter for the Summary Cards
export const formatPesoParts = (amount: number) => {
  const formatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  });
  const parts = formatter.formatToParts(amount);
  return {
    symbol: parts.find(p => p.type === 'currency')?.value ?? '₱',
    integer: parts
      .filter(p => p.type === 'group' || p.type === 'integer')
      .map(p => p.value)
      .join(''),
    decimal: parts.find(p => p.type === 'decimal')?.value ?? '.',
    fraction: parts.find(p => p.type === 'fraction')?.value ?? '00',
    unit: 'M', // Explicit unit
  };
};
