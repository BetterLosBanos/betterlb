import { describe, it, expect } from 'vitest';
import {
  formatPeso,
  formatPesoAdaptive,
  formatPesoAdaptiveString,
} from './format';

describe('formatPeso() - standard currency formatter', () => {
  it('formats zero pesos', () => {
    const result = formatPeso(0);
    expect(result).toBe('₱0.00');
  });

  it('formats small amount', () => {
    const result = formatPeso(100);
    expect(result).toBe('₱100.00');
  });

  it('formats thousands', () => {
    const result = formatPeso(1500);
    expect(result).toBe('₱1,500.00');
  });

  it('formats millions', () => {
    const result = formatPeso(1500000);
    expect(result).toBe('₱1,500,000.00');
  });

  it('formats billions', () => {
    const result = formatPeso(2500000000);
    expect(result).toBe('₱2,500,000,000.00');
  });

  it('handles decimal amounts', () => {
    const result = formatPeso(1234.56);
    expect(result).toBe('₱1,234.56');
  });

  it('handles negative amounts', () => {
    const result = formatPeso(-500);
    expect(result).toBe('-₱500.00');
  });
});

describe('formatPesoAdaptive() - adaptive currency formatter', () => {
  it('returns correct structure for small amounts', () => {
    const result = formatPesoAdaptive(500);
    expect(result).toEqual({
      scaledValue: 500,
      unit: '',
      fullString: '₱500.00',
      raw: '₱500.00',
    });
  });

  it('scales millions to M unit', () => {
    const result = formatPesoAdaptive(1500000);
    expect(result.unit).toBe('M');
    expect(result.scaledValue).toBe(1.5);
    expect(result.fullString).toMatch(/M$/);
    expect(result.raw).toBe('₱1,500,000.00');
  });

  it('scales billions to B unit', () => {
    const result = formatPesoAdaptive(2500000000);
    expect(result.unit).toBe('B');
    expect(result.scaledValue).toBe(2.5);
    expect(result.fullString).toMatch(/B$/);
    expect(result.raw).toBe('₱2,500,000,000.00');
  });

  it('handles alreadyInMillions flag', () => {
    const result = formatPesoAdaptive(1.5, 2, true);
    expect(result.unit).toBe('M');
    expect(result.scaledValue).toBe(1.5);
    expect(result.raw).toBe('₱1,500,000.00');
  });

  it('respects custom fraction digits', () => {
    const result = formatPesoAdaptive(1500000, 1);
    expect(result.fullString).toMatch(/₱1\.5 M/);
  });

  it('handles negative amounts', () => {
    const result = formatPesoAdaptive(-1500000);
    expect(result.scaledValue).toBe(-1.5);
    expect(result.unit).toBe('M');
  });

  it('handles zero', () => {
    const result = formatPesoAdaptive(0);
    expect(result.scaledValue).toBe(0);
    expect(result.unit).toBe('');
    expect(result.fullString).toBe('₱0.00');
  });

  it('chooses B over M for billions', () => {
    const result = formatPesoAdaptive(1500000000);
    expect(result.unit).toBe('B');
    expect(result.scaledValue).toBe(1.5);
  });
});

describe('formatPesoAdaptiveString() - string shorthand', () => {
  it('returns formatted string for small amounts', () => {
    const result = formatPesoAdaptiveString(500);
    expect(result).toBe('₱500.00');
  });

  it('returns formatted string with M suffix for millions', () => {
    const result = formatPesoAdaptiveString(1500000);
    expect(result).toMatch(/M$/);
  });

  it('returns formatted string with B suffix for billions', () => {
    const result = formatPesoAdaptiveString(2500000000);
    expect(result).toMatch(/B$/);
  });

  it('handles custom fraction digits', () => {
    const result = formatPesoAdaptiveString(1500000, 1);
    expect(result).toMatch(/₱1\.5 M/);
  });

  it('handles alreadyInMillions flag', () => {
    const result = formatPesoAdaptiveString(1.5, 2, true);
    expect(result).toMatch(/M$/);
  });
});
