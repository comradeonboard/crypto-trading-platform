import { useTradingStore } from '@/store/useTradingStore';

export function CoinSelector() {
  const { coins, selectedCoin, selectCoin } = useTradingStore();

  return (
    <div className="w-48 bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col p-3 gap-2 overflow-y-auto">
      <h2 className="text-cyan-400 font-mono text-sm font-bold mb-2 border-b border-[#1a1a1a] pb-2">
        COINS
      </h2>
      {coins.map((coin) => (
        <button
          key={coin.symbol}
          onClick={() => selectCoin(coin.symbol)}
          className={`flex items-center gap-2 px-3 py-2 rounded font-mono text-sm transition-colors ${
            selectedCoin === coin.symbol
              ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-400/30'
              : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200 border border-transparent'
          }`}
        >
          <img src={coin.iconUrl} alt={coin.symbol} className="w-5 h-5" />
          <div className="text-left">
            <div className="font-bold">{coin.symbol}</div>
            <div className="text-xs text-gray-500">{coin.name}</div>
          </div>
        </button>
      ))}
    </div>
  );
}