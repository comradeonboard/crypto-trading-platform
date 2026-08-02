import { Router } from 'express';
import axios from 'axios';
import { calculateSMA, calculateRSI, calculateMACD } from '../utils/indicators';

const router = Router();
const BINANCE_BASE = 'https://api.binance.com/api/v3';

function calculateSupportResistance(candles: any[]): { support: number; resistance: number } {
  const lows = candles.slice(-50).map((c: any) => c.low);
  const highs = candles.slice(-50).map((c: any) => c.high);

  const sortedLows = [...lows].sort((a: number, b: number) => a - b);
  const sortedHighs = [...highs].sort((a: number, b: number) => b - a);

  const support = sortedLows.slice(0, 5).reduce((a: number, b: number) => a + b, 0) / 5;
  const resistance = sortedHighs.slice(0, 5).reduce((a: number, b: number) => a + b, 0) / 5;

  return { support, resistance };
}

function predictPrices(candles: any[]): any[] {
  if (candles.length < 20) {
    return [
      { timeframe: '1h', direction: 'Sideways', probability: 50, confidence: 0, predictedPrice: 0, supportLevel: 0, resistanceLevel: 0 },
      { timeframe: '4h', direction: 'Sideways', probability: 50, confidence: 0, predictedPrice: 0, supportLevel: 0, resistanceLevel: 0 },
      { timeframe: '24h', direction: 'Sideways', probability: 50, confidence: 0, predictedPrice: 0, supportLevel: 0, resistanceLevel: 0 },
    ];
  }

  const closes = candles.map((c: any) => c.close);
  const lastClose = closes[closes.length - 1];
  const { support, resistance } = calculateSupportResistance(candles);

  const recentTrend = closes.slice(-10);
  const trendSlope = (recentTrend[recentTrend.length - 1] - recentTrend[0]) / recentTrend.length;

  const rsiValues = calculateRSI(closes, 14);
  const lastRsi = rsiValues.filter((v: number | null) => v !== null).pop() ?? 50;

  const macdResult = calculateMACD(closes);
  const lastMacd = macdResult.macd.filter((v: number | null) => v !== null).pop() ?? 0;
  const lastMacdSignal = macdResult.signal.filter((v: number | null) => v !== null).pop() ?? 0;

  const timeframes = [
    { label: '1h', multiplier: 0.001, lookback: 5 },
    { label: '4h', multiplier: 0.003, lookback: 10 },
    { label: '24h', multiplier: 0.01, lookback: 20 },
  ];

  return timeframes.map((tf: any) => {
    const recentCloses = closes.slice(-tf.lookback);
    const recentTrendLocal = (recentCloses[recentCloses.length - 1] - recentCloses[0]) / recentCloses.length;

    const trendScore = recentTrendLocal / (Math.abs(lastClose) || 1);
    const rsiFactor = (lastRsi - 50) / 50;
    const macdFactor = lastMacd - lastMacdSignal;
    const macdFactorNorm = macdFactor / (Math.abs(lastClose) || 1);
    const combinedScore = trendScore * 0.4 + rsiFactor * 0.3 + macdFactorNorm * 0.3;

    let direction: string;
    let probability: number;

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

    const confidence = Math.min(95, Math.round(40 + Math.abs(combinedScore) * 300 + (closes.length > 50 ? 15 : 0)));
    const predictedPrice = lastClose * (1 + trendSlope * tf.multiplier * 100);

    return {
      timeframe: tf.label,
      direction,
      probability,
      confidence,
      predictedPrice: parseFloat(predictedPrice.toFixed(2)),
      supportLevel: parseFloat(support.toFixed(2)),
      resistanceLevel: parseFloat(resistance.toFixed(2)),
    };
  });
}

router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const binanceSymbol = symbol.toUpperCase() + 'USDT';

    const klinesRes = await axios.get(`${BINANCE_BASE}/klines`, {
      params: { symbol: binanceSymbol, interval: '1m', limit: 100 },
      timeout: 10000,
    });

    const candles = klinesRes.data.map((k: any) => ({
      time: k[0] / 1000,
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));

    const predictions = predictPrices(candles);

    res.json({ symbol, predictions });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
});

export { router as predictionRouter };