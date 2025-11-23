import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [{
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
}, ...nextCoreWebVitals, ...nextTypescript, {
  rules: {
    "@next/next/no-img-element": "off",
  },
}];

export default eslintConfig;
