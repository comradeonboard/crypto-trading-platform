import { useTradingStore } from '@/store/useTradingStore';

export function PredictionPanel() {
  const { selectedCoin, coinData } = useTradingStore();
  const coinState = coinData[selectedCoin];
  const predictions = coinState?.predictions ?? [];

  if (predictions.length === 0) {
    return (
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-4">
        <h3 className="text-cyan-400 font-mono text-sm font-bold mb-3">PREDICTIONS</h3>
        <p className="text-gray-500 font-mono text-xs">Waiting for data...</p>
      </div>
    );
  }

  const directionColors = {
    Up: 'text-green-400',
    Down: 'text-red-400',
    Sideways: 'text-yellow-400',
  };

  const directionBg = {
    Up: 'bg-green-400/10 border-green-400/30',
    Down: 'bg-red-400/10 border-red-400/30',
    Sideways: 'bg-yellow-400/10 border-yellow-400/30',
  };

  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-4 space-y-3">
      <h3 className="text-cyan-400 font-mono text-sm font-bold mb-3">PREDICTIONS</h3>

      {predictions.map((pred) => (
        <div
          key={pred.timeframe}
          className={`border rounded-lg p-3 ${directionBg[pred.direction]}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 font-mono text-xs">{pred.timeframe}</span>
            <span className={`font-mono text-sm font-bold ${directionColors[pred.direction]}`}>
              {pred.direction}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-gray-500">Prob</span>
              <div className="text-cyan-400">{pred.probability}%</div>
            </div>
            <div>
              <span className="text-gray-500">Confidence</span>
              <div className="text-cyan-400">{pred.confidence}%</div>
            </div>
            <div>
              <span className="text-gray-500">Predicted</span>
              <div className="text-gray-200">${pred.predictedPrice.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-gray-500">Support</span>
              <div className="text-green-400">${pred.supportLevel.toFixed(2)}</div>
            </div>
          </div>

          <div className="mt-2 flex justify-between text-xs font-mono">
            <span className="text-gray-500">Resistance</span>
            <span className="text-red-400">${pred.resistanceLevel.toFixed(2)}</span>
          </div>

          <div className="mt-2 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${pred.direction === 'Up' ? 'bg-green-400' : pred.direction === 'Down' ? 'bg-red-400' : 'bg-yellow-400'}`}
              style={{ width: `${pred.probability}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}