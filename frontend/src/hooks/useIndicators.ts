import { useMemo } from 'react';
import { calculateSMA, calculateRSI, calculateMACD } from '@/utils/indicators';
import type { Candle, IndicatorValues } from '@/types/trading';

export function useIndicators(candles: Candle[]): IndicatorValues {
  return useMemo(() => {
    if (candles.length < 20) {
      return { sma20: null, rsi14: null, macd: null, macdSignal: null, macdHistogram: null };
    }

    const closes = candles.map((c) => c.close);

    const smaValues = calculateSMA(closes, 20);
    const sma20 = smaValues[smaValues.length - 1] ?? null;

    const rsiValues = calculateRSI(closes, 14);
    const rsi14 = rsiValues[rsiValues.length - 1] ?? null;

    const macd = calculateMACD(closes);
    const lastMacd = macd.macd[macd.macd.length - 1] ?? null;
    const lastSignal = macd.signal[macd.signal.length - 1] ?? null;
    const lastHistogram = macd.histogram[macd.histogram.length - 1] ?? null;

    return {
      sma20,
      rsi14,
      macd: lastMacd,
      macdSignal: lastSignal,
      macdHistogram: lastHistogram,
    };
  }, [candles]);
}