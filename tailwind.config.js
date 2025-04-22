/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef9ff',
          100: '#d9f1ff',
          200: '#bae6ff',
          300: '#8ad6ff',
          400: '#53bbff',
          500: '#2b9aff',
          600: '#1a7aff',
          700: '#1565ed',
          800: '#1752be',
          900: '#1a4994',
          950: '#162b55',
        },
        secondary: {
          50: '#fff8ec',
          100: '#ffefd3',
          200: '#ffdca6',
          300: '#ffc26d',
          400: '#ffa033',
          500: '#ff810a',
          600: '#ff6600',
          700: '#cc4902',
          800: '#a1390b',
          900: '#82300c',
          950: '#461605',
        },
        court: {
          50: '#f2f9fd',
          100: '#e4f0fa',
          200: '#c3e2f5',
          300: '#8fcbed',
          400: '#54b0e0',
          500: '#2e94d1',
          600: '#1d77b3',
          700: '#195f91',
          800: '#1a5178',
          900: '#1b4565',
          950: '#112d43',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};