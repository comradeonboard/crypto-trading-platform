import { useTradingStore } from '@/store/useTradingStore';

export function TickerTape() {
  const { coinData, coins } = useTradingStore();

  return (
    <div className="w-full bg-[#0d0d0d] border-t border-[#1a1a1a] py-2 overflow-hidden">
      <div className="flex items-center gap-6 px-4 animate-ticker">
        {coins.map((coin) => {
          const state = coinData[coin.symbol];
          const price = state?.priceData?.price ?? '--';
          const change = state?.priceData?.priceChangePercent ?? '--';
          const changeNum = parseFloat(change);
          const changeColor = changeNum >= 0 ? 'text-green-400' : 'text-red-400';

          return (
            <div key={coin.symbol} className="flex items-center gap-2 font-mono text-xs whitespace-nowrap">
              <span className="text-gray-400 font-bold">{coin.symbol}</span>
              <span className="text-cyan-400">{price}</span>
              <span className={changeColor}>{change !== '--' ? `${changeNum >= 0 ? '+' : ''}${change}%` : ''}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}