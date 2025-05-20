// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
<<<<<<< HEAD
=======
    './styles/**/*.{css}'
>>>>>>> origin/feature/frontend
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',   // your light/dark CSS vars
        foreground: 'var(--foreground)',
        main:       'var(--Main)',
        main:       'var(--main)',
        smoke:      'var(--smoke)',
        dim_smoke:  'var(--dim_smoke)',
        gray:       'var(--gray)',
      },
      fontFamily: {
        sans:  ['var(--font-geist-sans)', 'Montserrat', ...defaultTheme.fontFamily.sans],
<<<<<<< HEAD
        mono:  ['var(--font-geist-mono)', 'Monument Extended', ...defaultTheme.fontFamily.mono],
=======
        monu:  ['var(--font-geist-mono)', 'Monument Extended', ...defaultTheme.fontFamily.mono],
>>>>>>> origin/feature/frontend
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
