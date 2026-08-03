import { useTradingStore } from '@/store/useTradingStore';

export function TradingViewChart() {
  const { selectedCoin, coinData } = useTradingStore();
  const coinState = coinData[selectedCoin];
  const priceData = coinState?.priceData;

  const binanceSymbol = `${selectedCoin}USDT`;
  const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${binanceSymbol}`;

  return (
    <div className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden relative flex flex-col min-h-0">
      <div className="absolute top-2 left-3 z-10 flex items-center gap-3">
        <span className="text-cyan-400 font-mono text-sm font-bold">
          {selectedCoin} / USDT
        </span>
        {priceData && (
          <span className={`font-mono text-sm ${parseFloat(priceData.priceChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceData.price} ({priceData.priceChangePercent}%)
          </span>
        )}
      </div>
      <div className="absolute top-2 right-3 z-10">
        <a
          href={tradingViewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-0.5 rounded font-mono text-xs border border-cyan-400/30 text-cyan-400 hover:bg-cyan-900/30 transition-colors"
        >
          Open in TradingView
        </a>
      </div>
      <iframe
        src={tradingViewUrl}
        className="flex-1 w-full border-0 min-h-[300px]"
        title={`TradingView chart for ${selectedCoin}USDT`}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
}