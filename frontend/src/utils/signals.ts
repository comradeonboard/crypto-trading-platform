import type { Candle, IndicatorValues, Signal } from '@/types/trading';

export function generateSignal(
  candles: Candle[],
  indicators: IndicatorValues
): Signal {
  if (!indicators.sma20 || !indicators.rsi14 || !indicators.macd) {
    return {
      type: 'HOLD',
      strength: 'Weak',
      confidence: 0,
      entryPrice: 0,
      targetPrice: 0,
      stopLoss: 0,
      reason: 'Insufficient data',
    };
  }

  const lastClose = candles[candles.length - 1]?.close ?? 0;
  const prevClose = candles[candles.length - 2]?.close ?? lastClose;
  const sma20 = indicators.sma20;
  const rsi14 = indicators.rsi14;
  const macd = indicators.macd;
  const macdPrev = candles.length > 1 ? indicators.macd : macd;

  const priceAboveSma = lastClose > sma20;
  const priceBelowSma = lastClose < sma20;
  const rsiOversold = rsi14 < 30;
  const rsiOverbought = rsi14 > 70;
  const macdPositive = macd > 0;
  const macdNegative = macd < 0;
  const macdCrossingUp = macdPrev <= 0 && macd > 0;
  const macdCrossingDown = macdPrev >= 0 && macd < 0;

  let buyScore = 0;
  let sellScore = 0;
  const reasons: string[] = [];

  if (priceAboveSma) {
    buyScore += 1;
    reasons.push('Price above SMA20');
  } else if (priceBelowSma) {
    sellScore += 1;
    reasons.push('Price below SMA20');
  }

  if (rsiOversold) {
    buyScore += 2;
    reasons.push('RSI oversold (<30)');
  } else if (rsiOverbought) {
    sellScore += 2;
    reasons.push('RSI overbought (>70)');
  } else if (rsi14 < 50) {
    buyScore += 0.5;
    reasons.push('RSI in lower range');
  } else {
    sellScore += 0.5;
    reasons.push('RSI in upper range');
  }

  if (macdPositive || macdCrossingUp) {
    buyScore += 2;
    reasons.push(macdCrossingUp ? 'MACD bullish crossover' : 'MACD positive');
  } else if (macdNegative || macdCrossingDown) {
    sellScore += 2;
    reasons.push(macdCrossingDown ? 'MACD bearish crossover' : 'MACD negative');
  }

  const momentum = lastClose - prevClose;
  if (momentum > 0) {
    buyScore += 0.5;
    reasons.push('Positive momentum');
  } else if (momentum < 0) {
    sellScore += 0.5;
    reasons.push('Negative momentum');
  }

  const totalScore = buyScore + sellScore;
  const confidence = totalScore > 0 ? Math.min(95, Math.round((Math.max(buyScore, sellScore) / totalScore) * 100)) : 0;

  let type: 'BUY' | 'SELL' | 'HOLD';
  let strength: 'Strong' | 'Medium' | 'Weak';

  if (buyScore > sellScore && buyScore >= 3) {
    type = 'BUY';
    strength = buyScore >= 5 ? 'Strong' : buyScore >= 4 ? 'Medium' : 'Weak';
  } else if (sellScore > buyScore && sellScore >= 3) {
    type = 'SELL';
    strength = sellScore >= 5 ? 'Strong' : sellScore >= 4 ? 'Medium' : 'Weak';
  } else {
    type = 'HOLD';
    strength = 'Weak';
  }

  const volatility = candles.length > 1
    ? candles.slice(-10).reduce((acc, c) => acc + (c.high - c.low), 0) / 10
    : lastClose * 0.01;

  const entryPrice = lastClose;
  const targetPrice = type === 'BUY'
    ? entryPrice + volatility * 2
    : type === 'SELL'
    ? entryPrice - volatility * 2
    : entryPrice;
  const stopLoss = type === 'BUY'
    ? entryPrice - volatility * 1.5
    : type === 'SELL'
    ? entryPrice + volatility * 1.5
    : entryPrice;

  const reason = reasons.length > 0 ? reasons.join('; ') : 'No clear signal';

  return {
    type,
    strength,
    confidence,
    entryPrice: parseFloat(entryPrice.toFixed(2)),
    targetPrice: parseFloat(targetPrice.toFixed(2)),
    stopLoss: parseFloat(stopLoss.toFixed(2)),
    reason,
  };
}