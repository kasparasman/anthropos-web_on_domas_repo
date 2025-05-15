// tailwind.config.js
/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',       // <-- note the **/*
    './components/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.{css}'
  ],
    

  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        main:       'var(--main)',
        smoke:      'var(--smoke)',
        dim_smoke:  'var(--dim_smoke)',
        gray:      'var(--gray)',

      },
      fontFamily: {
      sans: ['var(--font-geist-sans)', 'Montserrat', defaultTheme.fontFamily.sans],
      mono: ['var(--font-geist-mono)', 'Monument Extended', defaultTheme.fontFamily.mono],
      inter: ['Inter', defaultTheme.fontFamily.sans],
      }
    }
  },
  plugins: [
    // any Tailwind plugins (e.g. require('@tailwindcss/forms'))
  ]
};
