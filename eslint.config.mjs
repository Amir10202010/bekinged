import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    plugins: {
      "@next/next": nextPlugin,
    },

    rules: {
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },

  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "tsconfig.tsbuildinfo",
    ],
  },
];