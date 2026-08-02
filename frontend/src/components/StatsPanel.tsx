import { useTradingStore } from '@/store/useTradingStore';

export function StatsPanel() {
  const { selectedCoin, coinData } = useTradingStore();
  const coinState = coinData[selectedCoin];
  const priceData = coinState?.priceData;

  if (!priceData) {
    return (
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-4">
        <h3 className="text-cyan-400 font-mono text-sm font-bold mb-3">24H STATS</h3>
        <p className="text-gray-500 font-mono text-xs">Waiting for data...</p>
      </div>
    );
  }

  const changeNum = parseFloat(priceData.priceChangePercent);
  const changeColor = changeNum >= 0 ? 'text-green-400' : 'text-red-400';
  const changeBg = changeNum >= 0 ? 'bg-green-400/10' : 'bg-red-400/10';

  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-4 space-y-2">
      <h3 className="text-cyan-400 font-mono text-sm font-bold mb-3">24H STATS</h3>

      <div className="flex justify-between items-center">
        <span className="text-gray-400 font-mono text-xs">Price</span>
        <span className="font-mono text-sm text-cyan-400">${parseFloat(priceData.price).toLocaleString()}</span>
      </div>

      <div className={`flex justify-between items-center px-2 py-1 rounded ${changeBg}`}>
        <span className="text-gray-400 font-mono text-xs">24h Change</span>
        <span className={`font-mono text-sm font-bold ${changeColor}`}>
          {changeNum >= 0 ? '+' : ''}{priceData.priceChangePercent}%
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-400 font-mono text-xs">24h High</span>
        <span className="font-mono text-xs text-green-400">${parseFloat(priceData.high24h).toLocaleString()}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-400 font-mono text-xs">24h Low</span>
        <span className="font-mono text-xs text-red-400">${parseFloat(priceData.low24h).toLocaleString()}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-400 font-mono text-xs">Volume</span>
        <span className="font-mono text-xs text-cyan-400">{parseFloat(priceData.volume).toLocaleString()}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-400 font-mono text-xs">Bid</span>
        <span className="font-mono text-xs text-gray-300">${parseFloat(priceData.bidPrice).toLocaleString()}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-400 font-mono text-xs">Ask</span>
        <span className="font-mono text-xs text-gray-300">${parseFloat(priceData.askPrice).toLocaleString()}</span>
      </div>

      <div className="border-t border-[#1a1a1a] pt-2 flex justify-between">
        <span className="text-gray-500 font-mono text-xs">Last Update</span>
        <span className="font-mono text-xs text-gray-500">
          {new Date(priceData.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}