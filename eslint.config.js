import js from '@eslint/js';
import globals from 'globals';
import { configs as tseslintConfigs } from 'typescript-eslint';

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      globals: {
        ...globals.node,  // browser 제거, node만
      },
    },
    rules: {
      // Airbnb Style Guide rules
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'no-unused-vars': ['warn', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
      }],
      'no-console': 'off',  // 서버는 console.log 허용
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'brace-style': ['error', '1tbs'],
    },
  },
  js.configs.recommended,
  ...tseslintConfigs.recommended,
];