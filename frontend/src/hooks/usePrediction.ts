import { useMemo } from 'react';
import { predictPrices } from '@/utils/prediction';
import type { Candle, Prediction } from '@/types/trading';

export function usePrediction(candles: Candle[]): Prediction[] {
  return useMemo(() => {
    return predictPrices(candles);
  }, [candles]);
}