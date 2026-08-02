import { create } from 'zustand';
import type { CoinConfig, CoinState, TradingState } from '@/types/trading';

const COINS: CoinConfig[] = [
  { symbol: 'BTC', name: 'Bitcoin', binanceSymbol: 'BTCUSDT', icon: '₿', iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png' },
  { symbol: 'ETH', name: 'Ethereum', binanceSymbol: 'ETHUSDT', icon: 'Ξ', iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
  { symbol: 'SOL', name: 'Solana', binanceSymbol: 'SOLUSDT', icon: '◎', iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png' },
  { symbol: 'LTC', name: 'Litecoin', binanceSymbol: 'LTCUSDT', icon: 'Ł', iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2.png' },
  { symbol: 'DOGE', name: 'Dogecoin', binanceSymbol: 'DOGEUSDT', icon: 'Ð', iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/74.png' },
  { symbol: 'XRP', name: 'Ripple', binanceSymbol: 'XRPUSDT', icon: 'Ξ', iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/52.png' },
  { symbol: 'ADA', name: 'Cardano', binanceSymbol: 'ADAUSDT', icon: '₳', iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png' },
  { symbol: 'AVAX', name: 'Avalanche', binanceSymbol: 'AVAXUSDT', icon: '◈', iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png' },
  { symbol: 'MATIC', name: 'Polygon', binanceSymbol: 'MATICUSDT', icon: '◈', iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png' },
  { symbol: 'BNB', name: 'BNB', binanceSymbol: 'BNBUSDT', icon: '⬜', iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png' },
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