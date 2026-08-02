import { describe, it, expect } from 'vitest';
import { predictPrices } from './prediction';
import type { Candle } from '@/types/trading';

function createMockCandles(count: number, basePrice: number = 100): Candle[] {
  return Array.from({ length: count }, (_, i) => ({
    time: i,
    open: basePrice + i * 0.5,
    high: basePrice + i * 0.5 + 1,
    low: basePrice + i * 0.5 - 1,
    close: basePrice + i * 0.5,
    volume: 1000 + i * 10,
  }));
}

describe('predictPrices', () => {
  it('returns default predictions when there is insufficient data', () => {
    const candles: Candle[] = [];
    const predictions = predictPrices(candles);
    expect(predictions).toHaveLength(3);
    predictions.forEach((p) => {
      expect(p.direction).toBe('Sideways');
      expect(p.probability).toBe(50);
      expect(p.confidence).toBe(0);
    });
  });

  it('returns default predictions when candles < 20', () => {
    const candles = createMockCandles(10);
    const predictions = predictPrices(candles);
    expect(predictions).toHaveLength(3);
    predictions.forEach((p) => {
      expect(p.direction).toBe('Sideways');
    });
  });

  it('returns predictions with valid structure for sufficient data', () => {
    const candles = createMockCandles(50);
    const predictions = predictPrices(candles);
    expect(predictions).toHaveLength(3);

    const timeframes = predictions.map((p) => p.timeframe);
    expect(timeframes).toContain('1h');
    expect(timeframes).toContain('4h');
    expect(timeframes).toContain('24h');

    predictions.forEach((p) => {
      expect(['Up', 'Down', 'Sideways']).toContain(p.direction);
      expect(p.probability).toBeGreaterThanOrEqual(0);
      expect(p.probability).toBeLessThanOrEqual(100);
      expect(p.confidence).toBeGreaterThanOrEqual(0);
      expect(p.confidence).toBeLessThanOrEqual(95);
      expect(p.predictedPrice).toBeGreaterThan(0);
      expect(p.supportLevel).toBeGreaterThan(0);
      expect(p.resistanceLevel).toBeGreaterThan(0);
    });
  });
});