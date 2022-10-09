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
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  // transformIgnorePatterns: [
  //   "/node_modules/(?!(d3|internmap|delaunator|robust-predicates))",
  //   '^.+\\.module\\.(css|sass|scss)$',
  // ],
  // testMatch: ['**/__tests__/*.(ts|tsx)'],
  // globals: {
  //   'ts-jest': {
  //     tsconfig: 'tsconfig.jest.json',
  //   }
  // },
}

export default createJestConfig(customJestConfig)
