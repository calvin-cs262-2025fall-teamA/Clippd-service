module.exports = {
  env: {
    node: true,
    es2021: true,
  },

  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "airbnb-base",
    "airbnb-typescript/base"
  ],

  parser: "@typescript-eslint/parser",

  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },

  plugins: ["@typescript-eslint"],

  rules: {
    "no-console": "warn",
    "import/prefer-default-export": "off",
    "import/extensions": "off",
  },
};
