import { Router } from 'express';
import axios from 'axios';

interface BinanceKline {
  0: number;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: number;
  7: string;
  8: string;
  9: number;
  10: string;
  11: number;
}

interface BinanceTicker {
  symbol: string;
  price: string;
}

interface Binance24hr {
  symbol: string;
  high24h: string;
  low24h: string;
  volume: string;
}

const router = Router();
const BINANCE_BASE = 'https://api.binance.com/api/v3';

router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const binanceSymbol = symbol.toUpperCase() + 'USDT';

    const [klinesRes, priceRes, hrRes] = await Promise.all([
      axios.get<BinanceKline[]>(`${BINANCE_BASE}/klines`, {
        params: { symbol: binanceSymbol, interval: '1m', limit: 100 },
        timeout: 10000,
      }),
      axios.get<BinanceTicker>(`${BINANCE_BASE}/ticker/price`, {
        params: { symbol: binanceSymbol },
        timeout: 10000,
      }),
      axios.get<Binance24hr>(`${BINANCE_BASE}/ticker/24hr`, {
        params: { symbol: binanceSymbol },
        timeout: 10000,
      }),
    ]);

    const klines = klinesRes.data;
    const candles = klines.map((k) => ({
      time: k[0] / 1000,
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));

    res.json({
      symbol,
      price: priceRes.data.price,
      high24h: hrRes.data.high24h,
      low24h: hrRes.data.low24h,
      volume: hrRes.data.volume,
      candles,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
});

export { router as priceRouter };