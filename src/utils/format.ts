export function formatPeso(value: number | undefined | null): string {
  if (value == null) return '₱0.00 M';
  return `₱${value.toFixed(2)} M`;
}

export function calcPercent(
  value: number | undefined | null,
  total: number | undefined | null
): string {
  if (!value || !total) return '0.0%';
  return ((value / total) * 100).toFixed(1) + '%';
}
