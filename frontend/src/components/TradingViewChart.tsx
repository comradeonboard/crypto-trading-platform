import { useEffect, useRef } from 'react';
import { useTradingStore } from '@/store/useTradingStore';

declare global {
  interface Window {
    TradingView: any;
  }
}

export function TradingViewChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const { selectedCoin } = useTradingStore();

  const binanceSymbol = `${selectedCoin}USDT`;
  const tvSymbol = `BINANCE:${binanceSymbol}`;

  useEffect(() => {
    if (!containerRef.current) return;

    if (!scriptRef.current) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
        renderWidget();
      };
      scriptRef.current = script;
      document.body.appendChild(script);
    } else {
      renderWidget();
    }

    function renderWidget() {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = '';

      if (typeof (window as any).TradingView !== 'undefined') {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: 'D',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#1a1a2e',
          enable_publishing: false,
          allow_symbol_change: false,
          container_id: containerRef.current.id,
          withdateranges: true,
          hide_side_toolbar: false,
          hide_legend: false,
          save_image: false,
          support_host: 'https://www.tradingview.com',
        });
      }
    }

    return () => {
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, [tvSymbol]);

  return (
    <div className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden relative flex flex-col min-h-0">
      <div className="absolute top-2 left-3 z-20 flex items-center gap-3">
        <span className="text-cyan-400 font-mono text-sm font-bold">
          {selectedCoin} / USDT
        </span>
      </div>
      <div
        id={`tv-chart-${selectedCoin}`}
        ref={containerRef}
        className="flex-1 w-full min-h-[300px]"
      />
    </div>
  );
}