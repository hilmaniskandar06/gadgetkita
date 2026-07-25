/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        cacao: {
          900: '#1A1412',
          800: '#2A1F1B',
          700: '#3D2D27',
          600: '#5C443A',
          500: '#7A5C4F',
        },
        cream: {
          50: '#FFFFFF',
          100: '#FDFCFB',
          200: '#F5F2ED',
          300: '#E8E3DA',
        },
        gold: {
          400: '#D4C19C',
          500: '#C2A878',
          600: '#9E865C',
        },
        rose: {
          500: '#8C271E',
          50: '#F8EBEA',
        },
        ok: {
          500: '#3F7D53',
          50: '#E9F4EC',
        },
      },
      borderRadius: {
        xl: '4px',
        '2xl': '8px',
      },
    },
  },
  plugins: [],
}
