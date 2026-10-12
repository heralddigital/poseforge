import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0b0b10',
        panel: '#14141c',
        panel2: '#1c1c28',
        line: '#2a2a3a',
        ink: '#ecebf5',
        mute: '#9a99b0',
        accent: '#c4a7ff',
        accent2: '#ff9ec7',
        ok: '#7be0a4',
        warn: '#ffd37a',
        bad: '#ff7a8a'
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    }
  },
  plugins: []
};
export default config;
