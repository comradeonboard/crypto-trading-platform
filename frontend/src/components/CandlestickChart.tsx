import { useEffect, useRef } from 'react';
import { createChart, type IChartApi, type ISeriesApi, type CandlestickData, type HistogramData, type LineData } from 'lightweight-charts';
import { useTradingStore } from '@/store/useTradingStore';
import type { Candle } from '@/types/trading';

export function CandlestickChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const { coinData, selectedCoin } = useTradingStore();
  const coinState = coinData[selectedCoin];
  const candles = coinState?.candles ?? [];
  const indicators = coinState?.indicators;

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
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

    return () => {
      if (chartRef.current && typeof (chartRef.current as any).destroy === 'function') {
        (chartRef.current as any).destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current || !smaSeriesRef.current) return;

    const candleData: CandlestickData[] = candles.map((c) => ({
      time: c.time as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const volumeData: HistogramData[] = candles.map((c) => ({
      time: c.time as any,
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
        return { time: c.time as any, value: sum / 20 };
      }).filter((d): d is LineData => d !== null);

      smaSeriesRef.current.setData(smaData);
    }

    (chartRef.current as any)?.fitContent();
  }, [candles, indicators]);

  return (
    <div className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden relative">
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
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}