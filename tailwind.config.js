const colors = require('tailwindcss/colors')

module.exports = {
  purge: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      transitionDelay: {
        '0': '0ms',
      },
      colors: {
        coolGray: colors.coolGray,
        trueGray: colors.trueGray,
      },
    },
  },
  variants: {
    extend: {
      grayscale: ['group-hover', 'hover', 'focus'],
      scale: ['active', 'group-hover'],
      boxShadow: ['dark'],
      transitionDelay: ['group-hover']
    },
  },
  plugins: [],
}
