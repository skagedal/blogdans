// Flat config for ESLint 10. Next's rules come from @next/eslint-plugin-next
// directly rather than from eslint-config-next, which also bundles
// eslint-plugin-react, eslint-plugin-import and eslint-plugin-jsx-a11y, none
// of which support ESLint 10. See the comment in package.yaml.
//
// The import and accessibility rules those plugins brought are deliberately
// not replaced. eslint-plugin-import-x covers the first and does support
// ESLint 10, if it ever seems worth it; nothing maintained covers the second.
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import eslintReact from "@eslint-react/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  ...tseslint.configs.recommended,
  // -typescript rather than -type-checked: the latter wants a parser pointed
  // at tsconfig.json, and nothing else here does type-aware linting.
  eslintReact.configs["recommended-typescript"],
  {
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  // core-web-vitals rather than recommended: it raises the rules that affect
  // Core Web Vitals from warnings to errors, which is what
  // eslint-config-next/core-web-vitals did here before.
  nextPlugin.configs["core-web-vitals"],
  {
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
);
