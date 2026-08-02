import { describe, it, expect } from 'vitest';
import { calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands } from './indicators';

describe('calculateSMA', () => {
  it('calculates SMA correctly', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = calculateSMA(data, 5);
    expect(result[4]).toBe(3);
    expect(result[9]).toBe(8);
  });

  it('returns null for indices before period', () => {
    const data = [1, 2, 3];
    const result = calculateSMA(data, 5);
    expect(result[0]).toBeNull();
    expect(result[1]).toBeNull();
    expect(result[2]).toBeNull();
  });
});

describe('calculateRSI', () => {
  it('returns null for indices before period', () => {
    const data = [1, 2, 3];
    const result = calculateRSI(data, 14);
    expect(result[0]).toBeNull();
  });

  it('returns 100 when there are only gains', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const result = calculateRSI(data, 14);
    expect(result[14]).toBe(100);
  });
});

describe('calculateMACD', () => {
  it('returns arrays of the same length as input', () => {
    const data = Array.from({ length: 30 }, (_, i) => Math.sin(i * 0.1) * 10 + 100);
    const result = calculateMACD(data);
    expect(result.macd.length).toBe(data.length);
    expect(result.signal.length).toBeLessThanOrEqual(data.length);
    expect(result.histogram.length).toBe(data.length);
  });
});

describe('calculateBollingerBands', () => {
  it('returns arrays of the same length as input', () => {
    const data = Array.from({ length: 30 }, (_, i) => Math.sin(i * 0.1) * 10 + 100);
    const result = calculateBollingerBands(data, 20);
    expect(result.upper.length).toBe(data.length);
    expect(result.middle.length).toBe(data.length);
    expect(result.lower.length).toBe(data.length);
  });
});