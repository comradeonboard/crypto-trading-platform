export interface CoinConfig {
  symbol: string;
  name: string;
  binanceSymbol: string;
  icon: string;
  iconUrl: string;
}

export interface Kline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PriceData {
  symbol: string;
  price: string;
  priceChange: string;
  priceChangePercent: string;
  high24h: string;
  low24h: string;
  volume: string;
  bidPrice: string;
  askPrice: string;
  timestamp: number;
}

export interface IndicatorValues {
  sma20: number | null;
  rsi14: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
}

export interface Signal {
  type: 'BUY' | 'SELL' | 'HOLD';
  strength: 'Strong' | 'Medium' | 'Weak';
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  reason: string;
}

export interface Prediction {
  timeframe: '1h' | '4h' | '24h';
  direction: 'Up' | 'Down' | 'Sideways';
  probability: number;
  confidence: number;
  predictedPrice: number;
  supportLevel: number;
  resistanceLevel: number;
}

export interface CoinState {
  config: CoinConfig;
  priceData: PriceData | null;
  candles: Candle[];
  indicators: IndicatorValues;
  signal: Signal;
  predictions: Prediction[];
  loading: boolean;
  error: string | null;
}

export interface TradingState {
  coins: CoinConfig[];
  selectedCoin: string;
  coinData: Record<string, CoinState>;
  connected: boolean;
  lastUpdate: number;
}