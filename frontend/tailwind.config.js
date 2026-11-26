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
        dark: {
          950: '#05080F',
          900: '#080C14',
          850: '#0D131F',
          800: '#111827',
          750: '#151F32',
          700: '#1E293B',
          600: '#334155',
        },
        cyber: {
          emerald: '#10B981',
          cyan: '#06B6D4',
          indigo: '#6366F1',
          amber: '#F59E0B',
          rose: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
