import type { Config } from 'tailwindcss';

const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

/** Colours come from CSS variables (see app/globals.css) so the Cream / Night themes switch without class changes. */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="night"]'],
  theme: {
    borderRadius: { none: '0', sm: '0', DEFAULT: '0', md: '0', lg: '0', xl: '0', '2xl': '0', full: '9999px' },
    extend: {
      colors: {
        bg: v('surface-100'),
        panel: v('surface-100'),
        panel2: v('surface-200'),
        raised: v('surface-raised'),
        line: v('hairline'),
        ink: v('ink'),
        mute: v('ink-muted'),
        label: v('ink-label'),
        chrome: v('chrome'),
        signal: v('signal'),
        'on-signal': v('on-signal'),
        // Semantic aliases kept for existing class names: the system has one accent (signal, fill only).
        accent: v('ink'),
        accent2: v('ink'),
        ok: v('ink'),
        warn: v('ink'),
        bad: v('ink-muted')
      },
      fontFamily: {
        serif: ['Newsreader', '"Times New Roman"', 'Georgia', 'serif'],
        sans: ['Geist', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'SFMono-Regular', 'Menlo', 'monospace']
      }
    }
  },
  plugins: []
};
export default config;
