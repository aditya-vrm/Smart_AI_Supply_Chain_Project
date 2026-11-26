/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1F3D2B',
          950: '#0E1D14',
          900: '#14281D',
          850: '#1A3324',
          800: '#1F3D2B',
          750: '#264A35',
          700: '#2C573E',
          600: '#396E4F',
        },
        sand: {
          DEFAULT: '#E8DCC4',
          50: '#FAF7F0',
          100: '#F5EEDB',
          200: '#E8DCC4',
          300: '#D8C6A3',
          400: '#C2AC82',
          500: '#A68D5F',
        },
        purple: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          light: '#A78BFA',
          dark: '#6D28D9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
