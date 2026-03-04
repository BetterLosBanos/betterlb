import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Convert phone number to tel: URI format (E.164)
 * Handles various formats:
 * - "530-2981 ext 3000" → "tel:+63495302981"
 * - "530-2981, 3000" → "tel:+63495302981"
 * - "049 536 7965" → "tel:+63495367965"
 * - "0927 509 1198" → "tel:+639275091198"
 */
export function toTelUri(phone: string | null): string | null {
  if (!phone) return null;

  // Remove extension keywords and everything after
  const mainNumber = phone
    .split(/(?:ext|ex|x|,)\s*/i)[0]
    .replace(/[^\d+]/g, ''); // Keep only digits

  if (!mainNumber) return null;

  // Handle different formats
  if (mainNumber.length === 7) {
    // Local: 5302981 → add 049 area code → +63495302981
    return `tel:+6349${mainNumber}`;
  } else if (mainNumber.length === 10 && mainNumber.startsWith('049')) {
    // With area code: 0495367965 → +63495367965 (remove leading 0)
    return `tel:+63${mainNumber.slice(1)}`;
  } else if (mainNumber.length === 11 && mainNumber.startsWith('0')) {
    // Mobile: 09275091198 → +639275091198
    return `tel:+63${mainNumber.slice(1)}`;
  }

  return null;
}
