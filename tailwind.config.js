const colors = require('tailwindcss/colors')

module.exports = {
  purge: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './public/articles/**/*.{mdx}'
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        coolGray: colors.coolGray,
        trueGray: colors.trueGray,
      },
      animation: {
        'wiggle': 'wiggle 0.2s ease-in-out 5',
        'spin-slow': 'spin 3s linear infinite'
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' }
        }
      },
    },
  },
  variants: {
    extend: {
      grayscale: ['group-hover', 'hover', 'focus'],
      scale: ['active', 'group-hover'],
      boxShadow: ['dark'],
      animation: ['hover', 'focus', 'group-hover'],
    },
  },
  plugins: [],
}
