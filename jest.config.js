module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '\\.(css)$': '<rootDir>/jest/fileTransformer.js',
    // '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(d3|internmap|delaunator|robust-predicates))",
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  testMatch: ['**/__tests__/*.(ts|tsx)'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
    }
  },
}
