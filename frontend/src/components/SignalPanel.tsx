import { useTradingStore } from '@/store/useTradingStore';

export function SignalPanel() {
  const { selectedCoin, coinData } = useTradingStore();
  const coinState = coinData[selectedCoin];
  const signal = coinState?.signal;
  const indicators = coinState?.indicators;

  if (!signal) {
    return (
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-4">
        <h3 className="text-cyan-400 font-mono text-sm font-bold mb-3">SIGNALS</h3>
        <p className="text-gray-500 font-mono text-xs">Waiting for data...</p>
      </div>
    );
  }

  const typeColor = signal.type === 'BUY' ? 'text-green-400' : signal.type === 'SELL' ? 'text-red-400' : 'text-gray-400';
  const strengthColor = signal.strength === 'Strong' ? 'text-green-400' : signal.strength === 'Medium' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-4 space-y-3">
      <h3 className="text-cyan-400 font-mono text-sm font-bold mb-3">SIGNALS</h3>

      <div className="flex items-center justify-between">
        <span className="text-gray-400 font-mono text-xs">TYPE</span>
        <span className={`font-mono text-lg font-bold ${typeColor}`}>{signal.type}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-gray-400 font-mono text-xs">STRENGTH</span>
        <span className={`font-mono text-sm font-bold ${strengthColor}`}>{signal.strength}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-gray-400 font-mono text-xs">CONFIDENCE</span>
        <span className="font-mono text-sm text-cyan-400">{signal.confidence}%</span>
      </div>

      <div className="border-t border-[#1a1a1a] pt-3 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500 font-mono text-xs">ENTRY</span>
          <span className="font-mono text-xs text-cyan-400">${signal.entryPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 font-mono text-xs">TARGET</span>
          <span className={`font-mono text-xs ${signal.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>${signal.targetPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 font-mono text-xs">STOP LOSS</span>
          <span className={`font-mono text-xs ${signal.type === 'BUY' ? 'text-red-400' : 'text-green-400'}`}>${signal.stopLoss.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-[#1a1a1a] pt-3">
        <span className="text-gray-500 font-mono text-xs">REASON</span>
        <p className="text-gray-300 font-mono text-xs mt-1">{signal.reason}</p>
      </div>

      <div className="border-t border-[#1a1a1a] pt-3 space-y-1">
        <span className="text-gray-500 font-mono text-xs">INDICATORS</span>
        <div className="flex justify-between">
          <span className="text-gray-400 font-mono text-xs">SMA20</span>
          <span className="font-mono text-xs text-cyan-400">{indicators?.sma20?.toFixed(2) ?? 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400 font-mono text-xs">RSI14</span>
          <span className={`font-mono text-xs ${indicators?.rsi14 !== null && indicators.rsi14! < 30 ? 'text-green-400' : indicators?.rsi14 !== null && indicators.rsi14! > 70 ? 'text-red-400' : 'text-cyan-400'}`}>{indicators?.rsi14?.toFixed(2) ?? 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400 font-mono text-xs">MACD</span>
          <span className={`font-mono text-xs ${indicators?.macd !== null && indicators.macd! > 0 ? 'text-green-400' : indicators?.macd !== null && indicators.macd! < 0 ? 'text-red-400' : 'text-cyan-400'}`}>{indicators?.macd?.toFixed(4) ?? 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400 font-mono text-xs">MACD Signal</span>
          <span className="font-mono text-xs text-cyan-400">{indicators?.macdSignal?.toFixed(4) ?? 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}