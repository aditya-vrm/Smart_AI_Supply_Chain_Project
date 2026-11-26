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
        neon: {
          DEFAULT: '#F5FF00',
          hover: '#E5EE00',
          light: '#F8FF4D',
          dark: '#C8D100',
        },
        cobalt: {
          DEFAULT: '#0864E8',
          hover: '#0650BA',
          light: '#3385F5',
          dark: '#053C8D',
        },
        dark: {
          950: '#06090E',
          900: '#0A0F18',
          850: '#0E1522',
          800: '#141D2D',
          750: '#1A253A',
          700: '#22324C',
          600: '#334766',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
