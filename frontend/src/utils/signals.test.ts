import { describe, it, expect } from 'vitest';
import { generateSignal } from './signals';
import type { Candle, IndicatorValues } from '@/types/trading';

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

describe('generateSignal', () => {
  it('returns HOLD when there is insufficient data', () => {
    const candles: Candle[] = [];
    const indicators: IndicatorValues = { sma20: null, rsi14: null, macd: null, macdSignal: null, macdHistogram: null };
    const signal = generateSignal(candles, indicators);
    expect(signal.type).toBe('HOLD');
    expect(signal.strength).toBe('Weak');
    expect(signal.confidence).toBe(0);
  });

  it('returns HOLD when indicators are null', () => {
    const candles = createMockCandles(2);
    const indicators: IndicatorValues = { sma20: null, rsi14: null, macd: null, macdSignal: null, macdHistogram: null };
    const signal = generateSignal(candles, indicators);
    expect(signal.type).toBe('HOLD');
  });

  it('generates a BUY signal when price is above SMA and RSI is low', () => {
    const candles = createMockCandles(30, 100);
    const indicators: IndicatorValues = {
      sma20: 95,
      rsi14: 25,
      macd: 1.5,
      macdSignal: 0.5,
      macdHistogram: 1.0,
    };
    const signal = generateSignal(candles, indicators);
    expect(signal.type).toBe('BUY');
    expect(signal.confidence).toBeGreaterThan(0);
  });

  it('generates a SELL signal when price is below SMA and RSI is high', () => {
    const candles = createMockCandles(30, 100);
    const indicators: IndicatorValues = {
      sma20: 105,
      rsi14: 75,
      macd: -1.5,
      macdSignal: -0.5,
      macdHistogram: -1.0,
    };
    const signal = generateSignal(candles, indicators);
    expect(signal.type).toBe('SELL');
    expect(signal.confidence).toBeGreaterThan(0);
  });
});