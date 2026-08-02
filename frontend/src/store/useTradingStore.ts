import { create } from 'zustand';
import type { CoinConfig, CoinState, TradingState } from '@/types/trading';

const COINS: CoinConfig[] = [
  { symbol: 'BTC', name: 'Bitcoin', binanceSymbol: 'BTCUSDT', icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', binanceSymbol: 'ETHUSDT', icon: 'Ξ' },
  { symbol: 'SOL', name: 'Solana', binanceSymbol: 'SOLUSDT', icon: '◎' },
  { symbol: 'LTC', name: 'Litecoin', binanceSymbol: 'LTCUSDT', icon: 'Ł' },
  { symbol: 'DOGE', name: 'Dogecoin', binanceSymbol: 'DOGEUSDT', icon: 'Ð' },
  { symbol: 'XRP', name: 'Ripple', binanceSymbol: 'XRPUSDT', icon: 'Ξ' },
  { symbol: 'ADA', name: 'Cardano', binanceSymbol: 'ADAUSDT', icon: '₳' },
  { symbol: 'AVAX', name: 'Avalanche', binanceSymbol: 'AVAXUSDT', icon: '◈' },
  { symbol: 'MATIC', name: 'Polygon', binanceSymbol: 'MATICUSDT', icon: '◈' },
  { symbol: 'BNB', name: 'BNB', binanceSymbol: 'BNBUSDT', icon: '⬜' },
];

interface TradingStore extends TradingState {
  selectCoin: (symbol: string) => void;
  setCoinData: (symbol: string, data: Partial<CoinState>) => void;
  setConnected: (connected: boolean) => void;
  setLastUpdate: (timestamp: number) => void;
}

const initialState: TradingState = {
  coins: COINS,
  selectedCoin: 'BTC',
  coinData: {},
  connected: false,
  lastUpdate: 0,
};

export const useTradingStore = create<TradingStore>((set) => ({
  ...initialState,
  selectCoin: (symbol: string) => set({ selectedCoin: symbol }),
  setCoinData: (symbol: string, data: Partial<CoinState>) =>
    set((state) => ({
      coinData: {
        ...state.coinData,
        [symbol]: {
          ...state.coinData[symbol],
          config: COINS.find((c) => c.symbol === symbol) ?? state.coinData[symbol]?.config,
          ...data,
        },
      },
    })),
  setConnected: (connected: boolean) => set({ connected }),
  setLastUpdate: (timestamp: number) => set({ lastUpdate: timestamp }),
}));