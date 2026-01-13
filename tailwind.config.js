/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // tells Tailwind where to look for classes
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#e6f0fd',
          100: '#cce0fb',
          200: '#99c2f7',
          300: '#66a3f3',
          400: '#3385ef',
          500: '#0066eb',
          600: '#0052bc',
          700: '#003d8d',
          800: '#00295e',
          900: '#00142f',
        },
        // add secondary, accent, etc.
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-out',
      },
    },
  },
  plugins: [],
};
