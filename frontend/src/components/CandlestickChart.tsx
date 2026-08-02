import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, type IChartApi, type ISeriesApi, type CandlestickData, type HistogramData, type LineData, type Time } from 'lightweight-charts';
import { useTradingStore } from '@/store/useTradingStore';
import type { Candle } from '@/types/trading';

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;
type Timeframe = typeof TIMEFRAMES[number];

export function CandlestickChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const initializedRef = useRef(false);

  const { coinData, selectedCoin } = useTradingStore();
  const coinState = coinData[selectedCoin];
  const candles = coinState?.candles ?? [];
  const indicators = coinState?.indicators;

  const [timeframe, setTimeframe] = useState<Timeframe>('1m');
  const [chartReady, setChartReady] = useState(false);

  const handleTimeframeChange = useCallback((tf: Timeframe) => {
    setTimeframe(tf);
  }, []);

  const initChart = useCallback(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const width = container.clientWidth || container.parentElement?.clientWidth || 600;
    const height = container.clientHeight || container.parentElement?.clientHeight || 400;

    if (width < 10 || height < 10) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const chart = createChart(container, {
      width,
      height,
      layout: {
        background: { color: '#0a0a0a' },
        textColor: '#00ffff',
        fontFamily: 'Monaco, Courier New, monospace',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#1a1a1a' },
        horzLines: { color: '#1a1a1a' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#00ffff', width: 1, style: 2, labelBackgroundColor: '#0a0a0a' },
        horzLine: { color: '#00ffff', width: 1, style: 2, labelBackgroundColor: '#0a0a0a' },
      },
      rightPriceScale: {
        borderColor: '#1a1a1a',
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: '#1a1a1a',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00ff00',
      downColor: '#ff0000',
      borderUpColor: '#00ff00',
      borderDownColor: '#ff0000',
      wickUpColor: '#00ff00',
      wickDownColor: '#ff0000',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#00ffff',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const smaSeries = chart.addLineSeries({
      color: '#ffaa00',
      lineWidth: 1,
      priceScaleId: 'right',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;
    smaSeriesRef.current = smaSeries;
    initializedRef.current = true;
    setChartReady(true);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          chart.applyOptions({ width: w, height: h });
        }
      }
    });
    observer.observe(container);
    resizeObserverRef.current = observer;
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const raf = requestAnimationFrame(() => {
      initChart();
    });

    return () => {
      cancelAnimationFrame(raf);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (chartRef.current) {
        try {
          const chartObj = chartRef.current as any;
          if (typeof chartObj.destroy === 'function') {
            chartObj.destroy();
          }
        } catch {
          // ignore
        }
        chartRef.current = null;
      }
      initializedRef.current = false;
    };
  }, [initChart]);

  useEffect(() => {
    if (!chartReady || !candlestickSeriesRef.current || !volumeSeriesRef.current || !smaSeriesRef.current) return;

    const candleData: CandlestickData[] = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const volumeData: HistogramData[] = candles.map((c) => ({
      time: c.time as Time,
      value: c.volume,
      color: c.close >= c.open ? '#00ff00' : '#ff0000',
    }));

    candlestickSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);

    if (indicators?.sma20 !== null && indicators.sma20 !== undefined && candles.length >= 20) {
      const smaData: LineData[] = candles.map((c, i) => {
        if (i < 19) return null;
        let sum = 0;
        for (let j = i - 19; j <= i; j++) sum += candles[j].close;
        return { time: c.time as Time, value: sum / 20 };
      }).filter((d): d is LineData => d !== null);

      smaSeriesRef.current.setData(smaData);
    }

    chartRef.current?.timeScale().fitContent();
  }, [candles, indicators, chartReady]);

  return (
    <div className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden relative flex flex-col min-h-0">
      <div className="absolute top-2 left-3 z-10 flex items-center gap-3">
        <span className="text-cyan-400 font-mono text-sm font-bold">
          {selectedCoin} / USDT
        </span>
        {coinState?.priceData && (
          <span className={`font-mono text-sm ${parseFloat(coinState.priceData.priceChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {coinState.priceData.price} ({coinState.priceData.priceChangePercent}%)
          </span>
        )}
      </div>
      <div className="absolute top-2 right-3 z-10 flex gap-1">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => handleTimeframeChange(tf)}
            className={`px-2 py-0.5 rounded font-mono text-xs border transition-colors ${
              timeframe === tf
                ? 'bg-cyan-900/30 text-cyan-400 border-cyan-400/30'
                : 'text-gray-500 border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-gray-300'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
      <div ref={chartContainerRef} className="flex-1 w-full min-h-[300px]" />
      {!chartReady && candles.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500 font-mono text-sm animate-pulse">Loading chart...</div>
        </div>
      )}
    </div>
  );
}