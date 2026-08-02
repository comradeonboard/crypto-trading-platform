import type { Candle } from '@/types/trading';

export function calculateSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j];
    }
    result.push(sum / period);
  }
  return result;
}

export function calculateRSI(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  if (data.length < period + 1) {
    return data.map(() => null);
  }

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(null);
      continue;
    }

    let avgGain = 0;
    let avgLoss = 0;
    for (let j = i - period + 1; j <= i; j++) {
      avgGain += gains[j - 1];
      avgLoss += losses[j - 1];
    }
    avgGain /= period;
    avgLoss /= period;

    if (avgLoss === 0) {
      result.push(100);
    } else {
      const rs = avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
    }
  }

  return result;
}

export function calculateMACD(
  data: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] } {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  const macdLine: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (fastEMA[i] === null || slowEMA[i] === null) {
      macdLine.push(null);
    } else {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
  }

  const signalLine = calculateEMA(
    macdLine.filter((v): v is number => v !== null),
    signalPeriod
  );

  const histogram: (number | null)[] = [];
  let signalIdx = 0;
  for (let i = 0; i < data.length; i++) {
    if (macdLine[i] === null) {
      histogram.push(null);
    } else {
      while (signalIdx < signalLine.length && signalLine[signalIdx] === null) {
        signalIdx++;
      }
      const sig = signalIdx < signalLine.length ? signalLine[signalIdx] : null;
      histogram.push(macdLine[i]! - sig);
      signalIdx++;
    }
  }

  return { macd: macdLine, signal: signalLine, histogram };
}

function calculateEMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const k = 2 / (period + 1);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[j];
      }
      result.push(sum / period);
      continue;
    }
    const prev = result[i - 1];
    if (prev === null) {
      result.push(null);
    } else {
      result.push(data[i] * k + prev * (1 - k));
    }
  }

  return result;
}

export function calculateSupportResistance(candles: Candle[]): { support: number; resistance: number } {
  if (candles.length < 20) {
    return { support: candles[0]?.low ?? 0, resistance: candles[0]?.high ?? 0 };
  }

  const lows = candles.slice(-50).map((c) => c.low);
  const highs = candles.slice(-50).map((c) => c.high);

  const sortedLows = [...lows].sort((a, b) => a - b);
  const sortedHighs = [...highs].sort((a, b) => b - a);

  const support = sortedLows.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
  const resistance = sortedHighs.slice(0, 5).reduce((a, b) => a + b, 0) / 5;

  return { support, resistance };
}

export function calculateBollingerBands(
  data: number[],
  period: number = 20,
  multiplier: number = 2
): { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] } {
  const sma = calculateSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (sma[i] === null) {
      upper.push(null);
      lower.push(null);
      continue;
    }

    let sumSqDiff = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sumSqDiff += Math.pow(data[j] - sma[i]!, 2);
    }
    const stdDev = Math.sqrt(sumSqDiff / period);

    upper.push(sma[i]! + multiplier * stdDev);
    lower.push(sma[i]! - multiplier * stdDev);
  }

  return { upper, middle: sma, lower };
}