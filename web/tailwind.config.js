/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stamp: {
          50: '#FDF5F3',
          100: '#FAEBE7',
          200: '#F2D2CA',
          300: '#E5AE9F',
          400: '#D08570',
          500: '#B5604A',
          600: '#8B3A2A',
          700: '#722E21',
          800: '#5C2419',
          900: '#3D1810',
        },
        parchment: '#F5F0E8',
        paper: '#FFFDF7',
        kraft: '#F0EBDF',
        ledger: '#C9BFA8',
        ink: {
          900: '#2C2416',
          700: '#4A4035',
          500: '#7A7062',
          400: '#9E9484',
          300: '#C9BFA8',
        },
        'ledger-green': { DEFAULT: '#3D6B4F', 50: '#E8F0EB' },
        manila: { DEFAULT: '#A67B2C', 50: '#F5EDDA' },
        'void-red': { DEFAULT: '#8B2E2E', 50: '#FAEAEA' },
        carbon: { DEFAULT: '#2E5A7B', 50: '#E5EEF4' },
        'arcade-glow': '#FF6B35',
        'crt-green': '#33FF33',
        'crt-amber': '#FFB000',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'monospace'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'hard-sm': '1px 1px 0px 0px rgba(201,191,168,0.7)',
        'hard': '2px 2px 0px 0px rgba(201,191,168,0.7)',
        'hard-md': '3px 3px 0px 0px rgba(201,191,168,0.5)',
        'hard-lg': '4px 4px 0px 0px rgba(201,191,168,0.5)',
        'hard-brand': '2px 2px 0px 0px #3D1810',
        'hard-brand-sm': '1px 1px 0px 0px #3D1810',
        'arcade': '4px 4px 0px 0px #3D1810',
        'arcade-sm': '2px 2px 0px 0px #3D1810',
        'arcade-glow': '0 0 15px rgba(255,107,53,0.4), 0 0 30px rgba(255,107,53,0.2)',
        'crt-glow': '0 0 20px rgba(139,58,42,0.3), inset 0 0 60px rgba(0,0,0,0.15)',
        'btn-glow': '0 0 10px rgba(139,58,42,0.5)',
      },
      borderRadius: {
        'retro': '4px',
        'arcade': '8px',
        'crt': '12px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
        'slide-in': 'slide-in 0.5s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(139,58,42,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(139,58,42,0.6), 0 0 40px rgba(255,107,53,0.3)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
