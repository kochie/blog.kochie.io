module.exports = {
  "plugins": {
    "postcss-flexbugs-fixes": {},
    "postcss-preset-env": {
      importFrom: [{
        "customMedia": {
          '--small-viewport': '(min-width: 500px)',
          '--medium-viewport': '(min-width: 600px)',
          '--large-viewport': '(min-width: 1100px)',
        }}
      ],
      "autoprefixer": {
        "flexbox": "no-2009"
      },
      "stage": 1
    }
  }
}
