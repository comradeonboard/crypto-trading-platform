import { useState } from 'react';
import { CoinSelector } from './CoinSelector';
import { TradingViewChart } from './TradingViewChart';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [asideOpen, setAsideOpen] = useState(false);
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
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-cyan-400 hover:text-white p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-cyan-400 font-bold text-lg">⛏</span>
          <h1 className="text-cyan-400 font-mono font-bold text-sm tracking-wider hidden sm:block">CRYPTO TRADING DASHBOARD</h1>
          <h1 className="text-cyan-400 font-mono font-bold text-xs tracking-wider sm:hidden">TRADING</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAsideOpen(!asideOpen)}
            className="lg:hidden text-cyan-400 hover:text-white p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
          <StatusIndicator />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <div
          className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:z-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="w-64 bg-[#0d0d0d] border-r border-[#1a1a1a] h-full overflow-y-auto lg:w-48">
            <ErrorBoundary>
              <CoinSelector />
            </ErrorBoundary>
          </div>
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 flex flex-col p-2 sm:p-3 gap-2 sm:gap-3 overflow-hidden min-w-0">
          <ErrorBoundary>
            <TradingViewChart />
          </ErrorBoundary>
        </main>

        <div
          className={`fixed inset-y-0 right-0 z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:z-auto ${
            asideOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="w-72 bg-[#0d0d0d] border-l border-[#1a1a1a] h-full overflow-y-auto lg:w-80 p-3 flex flex-col gap-3">
            <ErrorBoundary>
              <StatsPanel />
            </ErrorBoundary>
            <ErrorBoundary>
              <SignalPanel />
            </ErrorBoundary>
            <ErrorBoundary>
              <PredictionPanel />
            </ErrorBoundary>
          </div>
        </div>

        {asideOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setAsideOpen(false)}
          />
        )}
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
      <span className="font-mono text-xs text-gray-500 hidden sm:inline">
        {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : '--:--:--'}
      </span>
    </>
  );
}