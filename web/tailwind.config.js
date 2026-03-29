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
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
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
      },
      borderRadius: {
        'retro': '4px',
      },
    },
  },
  plugins: [],
}
