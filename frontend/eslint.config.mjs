import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

// eslint-config-next v16 exports a flat config array directly — no FlatCompat needed.
const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...nextCoreWebVitals,
];

export default eslintConfig;
