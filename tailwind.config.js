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
    },
  },
  variants: {
    extend: {
      grayscale: ['group-hover', 'hover', 'focus'],
      scale: ['active', 'group-hover'],
      boxShadow: ['dark'],
    },
  },
  plugins: [],
}
