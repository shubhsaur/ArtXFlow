/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
  },
  overrides: [
    {
      files: ['apps/web/**/*.{ts,tsx}'],
      plugins: ['@next/next'],
      rules: {
        ...require('@next/eslint-plugin-next').configs.recommended.rules,
        ...require('@next/eslint-plugin-next').configs['core-web-vitals'].rules,
      },
    },
  ],
  ignorePatterns: ['dist', '.next', 'node_modules', '*.js', '*.cjs', '*.mjs'],
};
