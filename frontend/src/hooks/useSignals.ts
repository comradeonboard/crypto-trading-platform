import { useMemo } from 'react';
import { generateSignal } from '@/utils/signals';
import type { Candle, IndicatorValues, Signal } from '@/types/trading';

export function useSignals(candles: Candle[], indicators: IndicatorValues): Signal {
  return useMemo(() => {
    if (candles.length < 2) {
      return {
        type: 'HOLD',
        strength: 'Weak' as const,
        confidence: 0,
        entryPrice: 0,
        targetPrice: 0,
        stopLoss: 0,
        reason: 'Insufficient data',
      };
    }
    return generateSignal(candles, indicators);
  }, [candles, indicators]);
}