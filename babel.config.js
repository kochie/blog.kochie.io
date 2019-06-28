const config = {
  presets: ['next/babel', '@zeit/next-typescript/babel'],
}

module.exports = {
  env: {
    production: config,
    development: config,
    test: {},
  },
}
