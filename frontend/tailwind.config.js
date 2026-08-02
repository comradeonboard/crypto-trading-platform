/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        cyan: '#00ffff',
        green: '#00ff00',
        red: '#ff0000',
        panel: '#0d0d0d',
        border: '#1a1a1a',
        text: '#00ffff',
        muted: '#666666',
      },
      fontFamily: {
        mono: ['Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};