import { Router } from 'express';
import axios from 'axios';

const router = Router();
const BINANCE_BASE = 'https://api.binance.com/api/v3';

router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const binanceSymbol = symbol.toUpperCase() + 'USDT';

    const [klinesRes, priceRes, hrRes] = await Promise.all([
      axios.get(`${BINANCE_BASE}/klines`, {
        params: { symbol: binanceSymbol, interval: '1m', limit: 100 },
        timeout: 10000,
      }),
      axios.get(`${BINANCE_BASE}/ticker/price`, {
        params: { symbol: binanceSymbol },
        timeout: 10000,
      }),
      axios.get(`${BINANCE_BASE}/ticker/24hr`, {
        params: { symbol: binanceSymbol },
        timeout: 10000,
      }),
    ]);

    const klines = klinesRes.data;
    const candles = klines.map((k: any) => ({
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