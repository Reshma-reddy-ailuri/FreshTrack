/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0F766E', light: '#14B8A6', dark: '#0D5E57' },
        danger: '#DC2626',
        warning: '#D97706',
        safe: '#16A34A',
        sidebar: '#0F172A',
      },
    },
  },
  plugins: [],
}

