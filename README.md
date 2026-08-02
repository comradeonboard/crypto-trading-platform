# Crypto Trading Platform

A live crypto trading platform with real-time price data, technical indicators, buy/sell signals, and AI-powered price predictions.

## Features

- **Real-time Price Data** - Fetches from Binance API every 10 seconds
- **Technical Indicators** - SMA (20), RSI (14), MACD
- **Buy/Sell Signals** - Automated signal generation with confidence scores
- **Price Prediction** - AI-powered forecasts for 1h, 4h, and 24h timeframes
- **Retro Mining Dashboard** - Dark theme with cyan/green/red color scheme

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + TradingView Lightweight Charts
- **Backend**: Node.js + Express + TypeScript
- **State Management**: Zustand
- **Deployment**: GitHub Pages (frontend)

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Deployment

The frontend is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

## License

MIT