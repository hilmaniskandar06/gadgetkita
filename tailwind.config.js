/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        slate: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
        },
        gray: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
        },
        lime: {
          400: '#A3E635',
          500: '#84CC16',
          600: '#65A30D',
        },
        rose: {
          500: '#E11D48',
          50: '#FFF1F2',
        },
        ok: {
          500: '#16A34A',
          50: '#F0FDF4',
        },
        warning: {
          500: '#F97316',
          50: '#FFF7ED',
        },
      },
      borderRadius: {
        xl: '6px',
        '2xl': '12px',
      },
    },
  },
  plugins: [],
}
