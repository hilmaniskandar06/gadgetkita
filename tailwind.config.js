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
          900: '#0A0A0A',
          800: '#1A1A1A',
          700: '#2A2A2A',
          600: '#555555',
          500: '#888888',
        },
        gray: {
          50: '#F9F9F9',
          100: '#F2F2F2',
          200: '#E0E0E0',
          300: '#C8C8C8',
        },
        // accent = hitam — dipakai menggantikan lime
        accent: {
          DEFAULT: '#0A0A0A',
          50: '#F2F2F2',
          100: '#E0E0E0',
          400: '#555555',
          500: '#0A0A0A',
          600: '#1A1A1A',
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
        // Boxy — kotak sempurna
        DEFAULT: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '2px',   // "rounded-full" jadi hampir kotak (badge/dot masih ok)
      },
    },
  },
  plugins: [],
}
