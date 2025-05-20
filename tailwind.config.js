// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.{css}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        main:       'var(--Main)',
        main:       'var(--main)',
        secondary:  'var(--secondary)',
        smoke:      'var(--smoke)',
        dim_smoke:  'var(--dim_smoke)',
        gray:       'var(--gray)',
      },
      fontFamily: {
        sans:  ['var(--font-geist-sans)', 'Montserrat', ...defaultTheme.fontFamily.sans],
        monu:  ['var(--font-geist-mono)', 'Monument Extended', ...defaultTheme.fontFamily.mono],
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
