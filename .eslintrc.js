module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  overrides: [
    {
      files: ['vite.config.js', 'postcss.config.js', 'server.js', '.eslintrc.js'],
      env: { node: true },
    },
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
