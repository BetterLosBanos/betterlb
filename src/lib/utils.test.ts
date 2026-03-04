import { describe, it, expect } from 'vitest';
import {
  cn,
  formatDate,
  truncateText,
  getRandomNumber,
  toTelUri,
} from './utils';

describe('cn() - className merge utility', () => {
  it('merges class names correctly', () => {
    const result = cn('px-4', 'py-2');
    expect(result).toBe('px-4 py-2');
  });

  it('handles Tailwind conflicts by using later classes', () => {
    const result = cn('px-4', 'px-2');
    expect(result).toBe('px-2');
  });

  it('handles conditional classes', () => {
    const showConditional = false;
    const result = cn('base-class', showConditional && 'conditional-class');
    expect(result).toBe('base-class');
  });

  it('handles empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('handles arrays of classes', () => {
    const result = cn(['px-4', 'py-2'], 'bg-white');
    expect(result).toBe('px-4 py-2 bg-white');
  });

  it('merges conflicting Tailwind classes correctly', () => {
    const result = cn('p-4', 'p-2');
    expect(result).toBe('p-2');
  });
});

describe('formatDate() - date formatting', () => {
  it('formats date in Philippine locale format', () => {
    const date = new Date('2024-02-26');
    const result = formatDate(date);
    expect(result).toMatch(/February 26, 2024/);
  });

  it('handles different date correctly', () => {
    const date = new Date('2023-12-25');
    const result = formatDate(date);
    expect(result).toMatch(/December 25, 2023/);
  });

  it('handles leap year dates', () => {
    const date = new Date('2024-02-29');
    const result = formatDate(date);
    expect(result).toMatch(/February 29, 2024/);
  });
});

describe('truncateText() - text truncation', () => {
  it('returns text unchanged when shorter than max length', () => {
    const result = truncateText('Hello', 10);
    expect(result).toBe('Hello');
  });

  it('returns text unchanged when equal to max length', () => {
    const result = truncateText('Hello', 5);
    expect(result).toBe('Hello');
  });

  it('truncates text longer than max length and adds ellipsis', () => {
    const result = truncateText('Hello World', 8);
    expect(result).toBe('Hello Wo...');
  });

  it('handles empty string', () => {
    const result = truncateText('', 10);
    expect(result).toBe('');
  });

  it('handles single character', () => {
    const result = truncateText('A', 1);
    expect(result).toBe('A');
  });

  it('truncates to zero characters with ellipsis only', () => {
    const result = truncateText('Hello', 0);
    expect(result).toBe('...');
  });
});

describe('getRandomNumber() - random number generation', () => {
  it('returns number within specified range inclusive', () => {
    const result = getRandomNumber(1, 10);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(10);
  });

  it('returns same min and max value', () => {
    const result = getRandomNumber(5, 5);
    expect(result).toBe(5);
  });

  it('handles negative numbers', () => {
    const result = getRandomNumber(-10, -5);
    expect(result).toBeGreaterThanOrEqual(-10);
    expect(result).toBeLessThanOrEqual(-5);
  });

  it('handles zero range', () => {
    const result = getRandomNumber(0, 0);
    expect(result).toBe(0);
  });
});

describe('toTelUri() - phone number to tel: URI conversion', () => {
  it('converts local 7-digit number with area code 049', () => {
    const result = toTelUri('530-2981');
    expect(result).toBe('tel:+63495302981');
  });

  it('handles number with extension keyword', () => {
    const result = toTelUri('530-2981 ext 3000');
    expect(result).toBe('tel:+63495302981');
  });

  it('handles number with comma extension separator', () => {
    const result = toTelUri('530-2981, 3000');
    expect(result).toBe('tel:+63495302981');
  });

  it('converts 9-digit number starting with 049', () => {
    const result = toTelUri('049 536 7965');
    expect(result).toBe('tel:+63495367965');
  });

  it('converts 11-digit mobile number starting with 0', () => {
    const result = toTelUri('0927 509 1198');
    expect(result).toBe('tel:+639275091198');
  });

  it('handles various extension formats', () => {
    const result = toTelUri('530-2981 ex 3000');
    expect(result).toBe('tel:+63495302981');
  });

  it('handles "x" extension format', () => {
    const result = toTelUri('530-2981 x3000');
    expect(result).toBe('tel:+63495302981');
  });

  it('returns null for null input', () => {
    const result = toTelUri(null);
    expect(result).toBeNull();
  });

  it('returns null for empty string', () => {
    const result = toTelUri('');
    expect(result).toBeNull();
  });

  it('returns null for unrecognizable format', () => {
    const result = toTelUri('invalid');
    expect(result).toBeNull();
  });

  it('handles 7-digit number with spaces', () => {
    const result = toTelUri('530 2981');
    expect(result).toBe('tel:+63495302981');
  });

  it('handles 9-digit number with hyphens', () => {
    const result = toTelUri('049-536-7965');
    expect(result).toBe('tel:+63495367965');
  });

  it('handles mobile number with hyphens', () => {
    const result = toTelUri('0927-509-1198');
    expect(result).toBe('tel:+639275091198');
  });
});
