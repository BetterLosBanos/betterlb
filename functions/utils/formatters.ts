/**
 * Formatters for derived D1 column values.
 * These replace DB-stored computed fields (ordinal, name, year_range, ordinal_number)
 * so the columns can be dropped without changing API response shape.
 */

/** 9 -> "9th", 21 -> "21st", 112 -> "112th" */
export function formatOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** 12 -> "12th Sangguniang Bayan" */
export function formatTermName(termNumber: number): string {
  return `${formatOrdinal(termNumber)} Sangguniang Bayan`;
}

/** "2016-07-01", "2019-06-30" -> "2016-2019" */
export function formatYearRange(startDate: string, endDate: string): string {
  const start = startDate?.substring(0, 4) ?? '';
  const end = endDate?.substring(0, 4) ?? '';
  return `${start}-${end}`;
}

/** 3, "Regular" -> "3rd Regular Session" */
export function formatSessionOrdinal(number: number, type: string): string {
  return `${formatOrdinal(number)} ${type} Session`;
}
