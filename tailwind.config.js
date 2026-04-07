/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // tells Tailwind where to look for classes
  ],
  theme: {
    extend: {
      // Kapwa Design System provides all design tokens via @bettergov/kapwa package
      // Custom theme extensions are kept minimal to avoid conflicts
      fontFamily: {
        // Use Inter from index.css, not Figtree
        sans: ['var(--font-kapwa-sans)'],
        mono: ['var(--font-kapwa-mono)'],
      },
      // Custom animations are now in index.css using @theme
      // No need to duplicate them here
    },
  },
  plugins: [],
};
