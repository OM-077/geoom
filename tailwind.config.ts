import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        chakra: ['var(--font-chakra)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        inter: ['var(--font-inter)', 'sans-serif']
      },
      colors: {
        void: '#07090C',
        plate: '#11151C',
        razor: '#222A35',
        chamfer: '#3A4759',
        amber: '#FF7A00',
        emerald: '#00E676',
        crimson: '#FF2A2A',
        bone: '#F0F4F8',
        steel: '#8A9BB0',
        well: '#050709',
        cyan: '#06B6D4'
      }
    }
  },
  plugins: []
}

export default config
