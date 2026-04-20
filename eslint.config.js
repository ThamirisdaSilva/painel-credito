import js from '@eslint/js';
import tsEslint from 'typescript-eslint';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', '.angular/**', 'coverage/**']
  },
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        console: 'readonly'
      }
    },
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  },
  {
    files: ['*.html'],
    rules: {}
  }
];
