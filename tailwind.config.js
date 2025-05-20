// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',   // your light/dark CSS vars
        foreground: 'var(--foreground)',
        main:       'var(--Main)',
      },
      fontFamily: {
        sans:  ['var(--font-geist-sans)', 'Montserrat', ...defaultTheme.fontFamily.sans],
        mono:  ['var(--font-geist-mono)', 'Monument Extended', ...defaultTheme.fontFamily.mono],
        inter: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      spacing: {
        // add any custom spacings you repeatedly used
      },
      screens: {
        // add any custom breakpoints if needed
      },
    },
  },
  plugins: [],
};
