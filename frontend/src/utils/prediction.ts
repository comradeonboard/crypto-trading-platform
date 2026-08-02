import type { Candle, Prediction } from '@/types/trading';
import { calculateSMA, calculateRSI, calculateMACD, calculateSupportResistance } from './indicators';

export function predictPrices(candles: Candle[]): Prediction[] {
  if (candles.length < 20) {
    return [
      { timeframe: '1h', direction: 'Sideways', probability: 50, confidence: 0, predictedPrice: 0, supportLevel: 0, resistanceLevel: 0 },
      { timeframe: '4h', direction: 'Sideways', probability: 50, confidence: 0, predictedPrice: 0, supportLevel: 0, resistanceLevel: 0 },
      { timeframe: '24h', direction: 'Sideways', probability: 50, confidence: 0, predictedPrice: 0, supportLevel: 0, resistanceLevel: 0 },
    ];
  }

  const closes = candles.map((c) => c.close);
  const lastClose = closes[closes.length - 1];
  const { support, resistance } = calculateSupportResistance(candles);

  const recentTrend = closes.slice(-10);
  const trendSlope = (recentTrend[recentTrend.length - 1] - recentTrend[0]) / recentTrend.length;

  const rsiValues = calculateRSI(closes, 14);
  const lastRsi = rsiValues.filter((v): v is number => v !== null).pop() ?? 50;

  const macdResult = calculateMACD(closes);
  const lastMacd = macdResult.macd.filter((v): v is number => v !== null).pop() ?? 0;
  const lastMacdSignal = macdResult.signal.filter((v): v is number => v !== null).pop() ?? 0;

  const predictions: Prediction[] = [];

  const timeframes = [
    { label: '1h' as const, multiplier: 0.001, lookback: 5 },
    { label: '4h' as const, multiplier: 0.003, lookback: 10 },
    { label: '24h' as const, multiplier: 0.01, lookback: 20 },
  ];

  for (const tf of timeframes) {
    const recentCloses = closes.slice(-tf.lookback);
    const recentTrendLocal = (recentCloses[recentCloses.length - 1] - recentCloses[0]) / recentCloses.length;

    let direction: 'Up' | 'Down' | 'Sideways';
    let probability: number;

    const trendScore = recentTrendLocal / (Math.abs(lastClose) || 1);
    const rsiFactor = (lastRsi - 50) / 50;
    const macdFactor = lastMacd - lastMacdSignal;
    const macdFactorNorm = macdFactor / (Math.abs(lastClose) || 1);

    const combinedScore = trendScore * 0.4 + rsiFactor * 0.3 + macdFactorNorm * 0.3;

    if (combinedScore > 0.002) {
      direction = 'Up';
      probability = Math.min(85, Math.round(50 + Math.abs(combinedScore) * 500));
    } else if (combinedScore < -0.002) {
      direction = 'Down';
      probability = Math.min(85, Math.round(50 + Math.abs(combinedScore) * 500));
    } else {
      direction = 'Sideways';
      probability = Math.min(70, Math.round(40 + (1 - Math.abs(combinedScore) * 10)));
    }

    const confidence = Math.min(95, Math.round(40 + Math.abs(combinedScore) * 300 + (candles.length > 50 ? 15 : 0)));

    const predictedPrice = lastClose * (1 + trendSlope * tf.multiplier * 100);

    predictions.push({
      timeframe: tf.label,
      direction,
      probability,
      confidence,
      predictedPrice: parseFloat(predictedPrice.toFixed(2)),
      supportLevel: parseFloat(support.toFixed(2)),
      resistanceLevel: parseFloat(resistance.toFixed(2)),
    });
  }

  return predictions;
}