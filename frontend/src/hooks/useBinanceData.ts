import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useTradingStore } from '@/store/useTradingStore';
import type { Candle, Kline, PriceData } from '@/types/trading';

const BINANCE_BASE = 'https://api.binance.com/api/v3';

function klineToCandle(k: Kline): Candle {
  return {
    time: k.openTime / 1000,
    open: parseFloat(k.open),
    high: parseFloat(k.high),
    low: parseFloat(k.low),
    close: parseFloat(k.close),
    volume: parseFloat(k.volume),
  };
}

async function fetchKlines(symbol: string): Promise<Candle[]> {
  const res = await axios.get<Kline[]>(`${BINANCE_BASE}/klines`, {
    params: { symbol, interval: '1m', limit: 100 },
    timeout: 10000,
  });
  return res.data.map(klineToCandle);
}

async function fetchPrice(symbol: string): Promise<string> {
  const res = await axios.get<{ symbol: string; price: string }>(
    `${BINANCE_BASE}/ticker/price`,
    { params: { symbol }, timeout: 10000 }
  );
  return res.data.price;
}

async function fetch24hr(symbol: string): Promise<{
  price: string;
  priceChange: string;
  priceChangePercent: string;
  high24h: string;
  low24h: string;
  volume: string;
  bidPrice: string;
  askPrice: string;
}> {
  const res = await axios.get<{
    symbol: string;
    price: string;
    priceChange: string;
    priceChangePercent: string;
    high24h: string;
    low24h: string;
    volume: string;
    bidPrice: string;
    askPrice: string;
  }>(`${BINANCE_BASE}/ticker/24hr`, {
    params: { symbol },
    timeout: 10000,
  });
  const d = res.data;
  return {
    price: d.price,
    priceChange: d.priceChange,
    priceChangePercent: d.priceChangePercent,
    high24h: d.high24h,
    low24h: d.low24h,
    volume: d.volume,
    bidPrice: d.bidPrice,
    askPrice: d.askPrice,
  };
}

export function useBinanceData() {
  const { selectedCoin, coinData, setCoinData, setConnected, setLastUpdate } = useTradingStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchData = async () => {
    try {
      const config = useTradingStore.getState().coins.find((c) => c.symbol === selectedCoin);
      if (!config) return;

      const [klines, price24hr] = await Promise.all([
        fetchKlines(config.binanceSymbol),
        fetch24hr(config.binanceSymbol),
      ]);

      const currentPrice = price24hr.price;

      setCoinData(selectedCoin, {
        priceData: {
          symbol: config.symbol,
          price: currentPrice,
          priceChange: price24hr.priceChange,
          priceChangePercent: price24hr.priceChangePercent,
          high24h: price24hr.high24h,
          low24h: price24hr.low24h,
          volume: price24hr.volume,
          bidPrice: price24hr.bidPrice,
          askPrice: price24hr.askPrice,
          timestamp: Date.now(),
        },
        candles: klines,
        loading: false,
        error: null,
      });

      setConnected(true);
      setLastUpdate(Date.now());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setCoinData(selectedCoin, {
        loading: false,
        error: `Failed to fetch data: ${msg}`,
      });
      setConnected(false);
    }
  };

  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const config = useTradingStore.getState().coins.find((c) => c.symbol === selectedCoin);
    if (!config) return;

    const wsUrl = `wss://stream.binance.com:9443/ws/${config.binanceSymbol.toLowerCase()}@ticker`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setConnected(true);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const currentPrice = data.c;

          setCoinData(selectedCoin, {
            priceData: {
              ...(useTradingStore.getState().coinData[selectedCoin]?.priceData ?? {
                symbol: config.symbol,
                price: '',
                priceChange: '',
                priceChangePercent: '',
                high24h: '',
                low24h: '',
                volume: '',
                bidPrice: '',
                askPrice: '',
                timestamp: Date.now(),
              }),
              price: currentPrice,
              bidPrice: data.b,
              askPrice: data.a,
              timestamp: Date.now(),
            },
          });
          setLastUpdate(Date.now());
        } catch {
          // ignore parse errors from WS
        }
      };

      wsRef.current.onerror = () => {
        setConnected(false);
      };

      wsRef.current.onclose = () => {
        setConnected(false);
      };
    } catch {
      setConnected(false);
    }
  };

  useEffect(() => {
    fetchData();
    connectWebSocket();

    intervalRef.current = setInterval(() => {
      fetchData();
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedCoin]);

  return { fetchData, connected: useTradingStore((s) => s.connected) };
}