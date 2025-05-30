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
        // add any custom spacings you repeatedly use
      },
      screens: {
        // add any custom breakpoints if needed
      },
      keyframes: {
        moveAround: {
          '0%':   { top: '-25px',               left: '-25px'               },
          '25%':  { top: '-25px',               left: 'calc(100% - 25px)'   },
          '50%':  { top: 'calc(100% - 25px)',   left: 'calc(100% - 25px)'   },
          '75%':  { top: 'calc(100% - 25px)',   left: '-25px'               },
          '100%': { top: '-25px',               left: '-25px'               },
        },
        moveAround2: {
          '0%':   { top: 'calc(100% - 25px)',   left: 'calc(100% - 25px)'   },
          '25%':  { top: 'calc(100% - 25px)',   left: '-25px'               },
          '50%':  { top: '-25px',               left: '-25px'               },
          '75%':  { top: '-25px',               left: 'calc(100% - 25px)'   },
          '100%': { top: 'calc(100% - 25px)',   left: 'calc(100% - 25px)'   },
        },
      },
      animation: {
        moveAround: 'moveAround 3s linear infinite',
        moveAround2: 'moveAround2 3s linear infinite',
      },
    },
  },
  plugins: [],
};

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
      keyframes: {
        moveAround: {
          '0%':   { top: '-25px',               left: '-25px'               },
          '25%':  { top: '-25px',               left: 'calc(100% - 25px)'   },
          '50%':  { top: 'calc(100% - 25px)',   left: 'calc(100% - 25px)'   },
          '75%':  { top: 'calc(100% - 25px)',   left: '-25px'               },
          '100%': { top: '-25px',               left: '-25px'               },
        },
        moveAround2: {
          '0%':   { top: 'calc(100% - 25px)',   left: 'calc(100% - 25px)'   },
          '25%':  { top: 'calc(100% - 25px)',   left: '-25px'               },
          '50%':  { top: '-25px',               left: '-25px'               },
          '75%':  { top: '-25px',               left: 'calc(100% - 25px)'   },
          '100%': { top: 'calc(100% - 25px)',   left: 'calc(100% - 25px)'   },
        },
      },
      animation: {
        moveAround: 'moveAround 3s linear infinite',
        moveAround2: 'moveAround2 3s linear infinite',
      },
    },
  },
  plugins: [],
};