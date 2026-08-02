import { create } from 'zustand';
import type { CoinConfig, CoinState, TradingState } from '@/types/trading';

const COINS: CoinConfig[] = [
  { symbol: 'BTC', name: 'Bitcoin', binanceSymbol: 'BTCUSDT', icon: '₿', iconUrl: 'https://raw.githubusercontent.com/cryptocurrency-icons/cryptocurrency-icons/master/32/color/btc.svg' },
  { symbol: 'ETH', name: 'Ethereum', binanceSymbol: 'ETHUSDT', icon: 'Ξ', iconUrl: 'https://raw.githubusercontent.com/cryptocurrency-icons/cryptocurrency-icons/master/32/color/eth.svg' },
  { symbol: 'SOL', name: 'Solana', binanceSymbol: 'SOLUSDT', icon: '◎', iconUrl: 'https://raw.githubusercontent.com/cryptocurrency-icons/cryptocurrency-icons/master/32/color/sol.svg' },
  { symbol: 'LTC', name: 'Litecoin', binanceSymbol: 'LTCUSDT', icon: 'Ł', iconUrl: 'https://raw.githubusercontent.com/cryptocurrency-icons/cryptocurrency-icons/master/32/color/ltc.svg' },
  { symbol: 'DOGE', name: 'Dogecoin', binanceSymbol: 'DOGEUSDT', icon: 'Ð', iconUrl: 'https://raw.githubusercontent.com/cryptocurrency-icons/cryptocurrency-icons/master/32/color/doge.svg' },
  { symbol: 'XRP', name: 'Ripple', binanceSymbol: 'XRPUSDT', icon: 'Ξ', iconUrl: 'https://raw.githubusercontent.com/cryptocurrency-icons/cryptocurrency-icons/master/32/color/xrp.svg' },
  { symbol: 'ADA', name: 'Cardano', binanceSymbol: 'ADAUSDT', icon: '₳', iconUrl: 'https://raw.githubusercontent.com/cryptocurrency-icons/cryptocurrency-icons/master/32/color/ada.svg' },
  { symbol: 'AVAX', name: 'Avalanche', binanceSymbol: 'AVAXUSDT', icon: '◈', iconUrl: 'https://raw.githubusercontent.com/cryptocurrency-icons/cryptocurrency-icons/master/32/color/avax.svg' },
  { symbol: 'MATIC', name: 'Polygon', binanceSymbol: 'MATICUSDT', icon: '◈', iconUrl: 'https://raw.githubusercontent.com/cryptocurrency-icons/cryptocurrency-icons/master/32/color/polygon.svg' },
  { symbol: 'BNB', name: 'BNB', binanceSymbol: 'BNBUSDT', icon: '⬜', iconUrl: 'https://raw.githubusercontent.com/cryptocurrency-icons/cryptocurrency-icons/master/32/color/bnb.svg' },
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