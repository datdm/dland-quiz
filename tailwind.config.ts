import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'Georgia', 'serif'],
        noto:   ['Noto Serif JP', 'Georgia', 'serif'],
        sans:   ['Noto Sans JP', 'sans-serif'],
      },
      colors: {
        gold: { 400:'#fbbf24', 500:'#f59e0b', 600:'#d97706' },
        ink:  { 900:'#030308', 800:'#0a0f1f', 700:'#123c3b' },
      },
    },
  },
  plugins: [],
}
export default config
