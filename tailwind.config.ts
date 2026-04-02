import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}','./contexts/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'Georgia', 'serif'],
        noto:   ['Noto Serif JP', 'Georgia', 'serif'],
        sans:   ['Noto Sans JP', 'sans-serif'],
      },
      colors: {
        gold: { 400:'#fbbf24', 500:'#f59e0b', 600:'#d97706' },
        cream: { 50:'#fdf6e3', 100:'#f5e6c8', 200:'#ede0c4', 300:'#d4b896' },
      },
    },
  },
  plugins: [],
}
export default config
