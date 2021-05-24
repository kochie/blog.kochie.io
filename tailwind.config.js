module.exports = {
  purge: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      grayscale: ['group-hover', 'hover', 'focus'],
      scale: ['active', 'group-hover'],
    },
  },
  plugins: [],
}
