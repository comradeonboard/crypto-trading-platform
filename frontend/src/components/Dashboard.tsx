import { CoinSelector } from './CoinSelector';
import { CandlestickChart } from './CandlestickChart';
import { SignalPanel } from './SignalPanel';
import { PredictionPanel } from './PredictionPanel';
import { StatsPanel } from './StatsPanel';
import { TickerTape } from './TickerTape';
import { ErrorBoundary } from './ErrorBoundary';
import { useBinanceData } from '@/hooks/useBinanceData';
import { useIndicators } from '@/hooks/useIndicators';
import { useSignals } from '@/hooks/useSignals';
import { usePrediction } from '@/hooks/usePrediction';
import { useTradingStore } from '@/store/useTradingStore';
import { useEffect } from 'react';

export function Dashboard() {
  useBinanceData();
  const { selectedCoin, coinData } = useTradingStore();
  const coinState = coinData[selectedCoin];
  const candles = coinState?.candles ?? [];

  const indicators = useIndicators(candles);
  const signal = useSignals(candles, indicators);
  const predictions = usePrediction(candles);

  useEffect(() => {
    if (candles.length > 0) {
      const store = useTradingStore.getState();
      store.setCoinData(selectedCoin, { indicators, signal, predictions });
    }
  }, [candles, indicators, signal, predictions, selectedCoin]);

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] text-cyan-400 font-mono">
      <header className="h-12 bg-[#0d0d0d] border-b border-[#1a1a1a] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-bold text-lg">⛏</span>
          <h1 className="text-cyan-400 font-mono font-bold text-sm tracking-wider">CRYPTO TRADING DASHBOARD</h1>
        </div>
        <div className="flex items-center gap-4">
          <StatusIndicator />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <ErrorBoundary>
          <CoinSelector />
        </ErrorBoundary>

        <main className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
          <ErrorBoundary>
            <CandlestickChart />
          </ErrorBoundary>
        </main>

        <aside className="w-80 bg-[#0d0d0d] border-l border-[#1a1a1a] flex flex-col p-3 gap-3 overflow-y-auto">
          <ErrorBoundary>
            <StatsPanel />
          </ErrorBoundary>
          <ErrorBoundary>
            <SignalPanel />
          </ErrorBoundary>
          <ErrorBoundary>
            <PredictionPanel />
          </ErrorBoundary>
        </aside>
      </div>

      <ErrorBoundary>
        <TickerTape />
      </ErrorBoundary>
    </div>
  );
}

function StatusIndicator() {
  const connected = useTradingStore((s) => s.connected);
  const lastUpdate = useTradingStore((s) => s.lastUpdate);

  return (
    <>
      <span className={`font-mono text-xs ${connected ? 'text-green-400' : 'text-red-400'}`}>
        {connected ? '● LIVE' : '○ DISCONNECTED'}
      </span>
      <span className="font-mono text-xs text-gray-500">
        {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : '--:--:--'}
      </span>
    </>
  );
}