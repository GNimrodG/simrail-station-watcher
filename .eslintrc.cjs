module.exports = {
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["react-refresh", "import", "mui-path-imports"],
  rules: {
    "react-refresh/only-export-components": "warn",
    quotes: ["error", "double", { avoidEscape: true }],
    semi: ["error", "always"],
    indent: ["error", 2],
    "no-multiple-empty-lines": ["error", { max: 1 }],
    "no-trailing-spaces": ["error"],
    "no-var": ["error"],
    "prefer-const": ["error"],
    "no-console": ["error", { allow: ["warn", "error"] }],
    "object-curly-spacing": ["error", "always"],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/jsx-uses-react": "off",
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: false,
        },
      },
    ],
    "mui-path-imports/mui-path-imports": "error",
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
      },
    },
  },
};
