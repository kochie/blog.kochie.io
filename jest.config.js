import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

const customJestConfig = {
  // preset: "ts-jest/presets/js-with-ts",
  // preset: "ts-jest/presets/default-esm",
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: ['<rootDir>/jest/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    // "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    // '\\.(css)$': '<rootDir>/jest/fileTransformer.js',
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }],
    // '<rootDir>/node_modules/prism-react-renderer/dist/index.cjs.js': [
    //   'babel-jest',
    //   {
    //     presets: [['@babel/preset-env', { modules: 'cjs' }]],
    //     plugins: ['add-module-exports'],
    //   },
    // ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transformIgnorePatterns: [
    '/node_modules/(?!(d3))',
    //   '^.+\\.module\\.(css|sass|scss)$',
  ],
  // testMatch: ['**/__tests__/*.(ts|tsx)'],
  // globals: {
  //   'ts-jest': {
  //     tsconfig: 'tsconfig.jest.json',
  //   }
  // },
}

// console.log(await createJestConfig(customJestConfig)())

// const config = await createJestConfig(customJestConfig)()

// config.transformIgnorePatterns.splice(0, 1)
// console.log(config)

export default createJestConfig(customJestConfig)
