import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  prettier,
  {
    rules: {
      "prefer-arrow-callback": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "FunctionDeclaration[generator=false], FunctionExpression[generator=false]:not([parent.kind=/^(constructor|get|set)$/])",
          message: "Use an arrow function."
        }
      ]
    }
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"])
]);
