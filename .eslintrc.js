module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'jest',
    "import"
  ],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off"
  },
  parserOptions: {
    "project": "./tsconfig.json",
    "tsconfigRootDir": "./"
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',

    'plugin:react/recommended',
    'plugin:react-hooks/recommended',

    'plugin:jest/recommended',

    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  settings: {
    'import/external-module-folders': ['types'],
    'react': {
      'version': 'detect'
    },
    "import/resolver": {
      "typescript": {}
    }
  },
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      "files": ["*.ts", "*.tsx"],
      "rules": {
        "@typescript-eslint/explicit-function-return-type": ["error"]
      }
    }
  ]
}
