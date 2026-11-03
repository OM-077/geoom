import type { Config } from 'tailwindcss'

// ============================================
// KINPAKU OKLCH DESIGN TOKENS — IMMUTABLE
// All colors defined as OKLCH values
// Never use hex. Never change these values.
// OKLCH format: oklch(lightness chroma hue)
// ============================================

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // ---- Brand: Amber/Orange — primary action, CTAs, scores ----
        amber: {
          DEFAULT: 'oklch(0.70 0.18 55)',   // #FF7A00 equivalent
          light:   'oklch(0.80 0.15 55)',
          dark:    'oklch(0.55 0.20 45)',
          muted:   'oklch(0.70 0.18 55 / 0.08)'
        },
        // ---- Brand: Green — success, gains, positive deltas ----
        green: {
          DEFAULT: 'oklch(0.80 0.20 145)',  // #00E676 equivalent
          light:   'oklch(0.88 0.16 145)',
          dark:    'oklch(0.65 0.22 145)',
          muted:   'oklch(0.80 0.20 145 / 0.08)'
        },
        // ---- Brand: Red — losses, critical issues, warnings ----
        red: {
          DEFAULT: 'oklch(0.55 0.22 25)',   // #FF2A2A equivalent
          light:   'oklch(0.65 0.18 25)',
          dark:    'oklch(0.45 0.25 25)',
          muted:   'oklch(0.55 0.22 25 / 0.08)'
        },
        // ---- Neutral: Background layers ----
        bg: {
          base:    'oklch(0.09 0.01 260)',  // #07090C — deepest background
          surface: 'oklch(0.12 0.015 260)', // #11151C — card background
          border:  'oklch(0.18 0.02 260)',  // #222A35 — borders
          hover:   'oklch(0.15 0.018 260)'  // subtle hover state
        },
        // ---- Neutral: Text ----
        text: {
          primary:   'oklch(0.93 0.01 260)', // #F0F4F8 — main text
          secondary: 'oklch(0.62 0.02 250)', // #8A9BB0 — secondary text
          muted:     'oklch(0.40 0.02 250)', // #3A4759 — footer/captions
          inverse:   'oklch(0.09 0.01 260)'  // dark text on amber buttons
        },
        // ---- Score colors — mapped to Geoom score ranges ----
        score: {
          critical: 'oklch(0.55 0.22 25)',   // 0–29
          low:      'oklch(0.65 0.20 40)',    // 30–49
          medium:   'oklch(0.75 0.18 75)',    // 50–69
          good:     'oklch(0.78 0.18 130)',   // 70–84
          peak:     'oklch(0.80 0.20 145)'    // 85–100
        }
      },
      fontFamily: {
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        brand: ['var(--font-chakra)', 'Chakra Petch', 'sans-serif']
      },
      fontSize: {
        // Score display — big numbers
        'score-xl': ['4rem',   { lineHeight: '1', fontWeight: '700', fontFamily: 'var(--font-mono)' }],
        'score-lg': ['3rem',   { lineHeight: '1', fontWeight: '700', fontFamily: 'var(--font-mono)' }],
        'score-md': ['2rem',   { lineHeight: '1', fontWeight: '700', fontFamily: 'var(--font-mono)' }],
        // Interface
        'label':    ['0.6875rem', { lineHeight: '1', letterSpacing: '0.2em', textTransform: 'uppercase' }]
      },
      borderRadius: {
        'card': '0.5rem',
        'pill': '9999px'
      },
      boxShadow: {
        'glow-amber': '0 0 20px oklch(0.70 0.18 55 / 0.3)',
        'glow-green': '0 0 20px oklch(0.80 0.20 145 / 0.3)',
        'card':       '0 1px 3px oklch(0.05 0.01 260 / 0.5)'
      },
      animation: {
        'score-count': 'scoreCount 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':     'fadeIn 0.3s ease-out forwards'
      },
      keyframes: {
        scoreCount: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    }
  },
  plugins: []
}

export default config
