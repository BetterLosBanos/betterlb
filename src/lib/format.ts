// --- Types ---
export interface FormattedPeso {
  scaledValue: number; // e.g., 1.5
  unit: string; // e.g., "M", "B", ""
  fullString: string; // e.g., "₱1.50 M"
  raw: string; // e.g., "₱1,500,000.00"
}

// Standard formatter
export const formatPeso = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Adaptive formatter returning an object
export const formatPesoAdaptive = (
  amount: number,
  fractionDigits = 2,
  alreadyInMillions = false
): FormattedPeso => {
  // If data is already in millions, multiply back to get raw value
  const rawAmount = alreadyInMillions ? amount * 1_000_000 : amount;

  const abs = Math.abs(rawAmount);
  let scaled = rawAmount;
  let unit = '';

  if (abs >= 1_000_000_000) {
    scaled = rawAmount / 1_000_000_000;
    unit = 'B';
  } else if (abs >= 1_000_000) {
    scaled = rawAmount / 1_000_000;
    unit = 'M';
  }

  const formattedNumber = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(scaled);

  // Construct fullString with unit suffix
  const fullString = unit ? `${formattedNumber} ${unit}` : formattedNumber;

  const raw = formatPeso(rawAmount);

  return { scaledValue: scaled, unit, fullString, raw };
};

// Simple adaptive formatter for when you only need the string
export const formatPesoAdaptiveString = (
  amount: number,
  fractionDigits = 2,
  alreadyInMillions = false
): string => {
  return formatPesoAdaptive(amount, fractionDigits, alreadyInMillions)
    .fullString;
};
