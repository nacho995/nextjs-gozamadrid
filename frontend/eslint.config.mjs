import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals"),
  {
    // Asegúrate de que aquí no haya funciones dentro de la configuración
    parser: "@babel/eslint-parser",
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
    env: {
      es6: true,
      browser: true,
      node: true,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": "warn",
      // Añade cualquier regla adicional aquí
    },
  },
];
