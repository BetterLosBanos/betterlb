/**
 * Currency flag emoji mappings
 * Maps ISO 4217 currency codes to flag emojis
 */
export const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇺🇸', // United States Dollar
  EUR: '🇪🇺', // Euro
  GBP: '🇬🇧', // British Pound
  JPY: '🇯🇵', // Japanese Yen
  AUD: '🇦🇺', // Australian Dollar
  CAD: '🇨🇦', // Canadian Dollar
  CHF: '🇨🇭', // Swiss Franc
  CNY: '🇨🇳', // Chinese Yuan
  SEK: '🇸🇪', // Swedish Krona
  NZD: '🇳🇿', // New Zealand Dollar
  MXN: '🇲🇽', // Mexican Peso
  SGD: '🇸🇬', // Singapore Dollar
  HKD: '🇭🇰', // Hong Kong Dollar
  NOK: '🇳🇴', // Norwegian Krone
  KRW: '🇰🇷', // South Korean Won
  TRY: '🇹🇷', // Turkish Lira
  RUB: '🇷🇺', // Russian Ruble
  INR: '🇮🇳', // Indian Rupee
  BRL: '🇧🇷', // Brazilian Real
  ZAR: '🇿🇦', // South African Rand
  DKK: '🇩🇰', // Danish Krone
  PLN: '🇵🇱', // Polish Zloty
  TWD: '🇹🇼', // Taiwan Dollar
  THB: '🇹🇭', // Thai Baht
  MYR: '🇲🇾', // Malaysian Ringgit
  IDR: '🇮🇩', // Indonesian Rupiah
  VND: '🇻🇳', // Vietnamese Dong
  CZK: '🇨🇿', // Czech Koruna
  HUF: '🇭🇺', // Hungarian Forint
  ILS: '🇮🇱', // Israeli Shekel
  CLP: '🇨🇱', // Chilean Peso
  PEN: '🇵🇪', // Peruvian Sol
  COP: '🇨🇴', // Colombian Peso
  BHD: '🇧🇭', // Bahraini Dinar
  KWD: '🇰🇼', // Kuwaiti Dinar
  SAR: '🇸🇦', // Saudi Riyal
  AED: '🇦🇪', // UAE Dirham
  BND: '🇧🇳', // Brunei Dollar
  PHP: '🇵🇭', // Philippine Peso
};

/**
 * Get flag emoji for currency code
 * @param code - ISO 4217 currency code
 * @returns Flag emoji or default flag
 */
export function getCurrencyFlag(code: string): string {
  return CURRENCY_FLAGS[code] || '🏴';
}
