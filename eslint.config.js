import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
	{ files: ["**/*.{js,ts}"] },
	{
		files: ["**/*.{js,ts}"],
		languageOptions: { globals: globals.node },
	},
	{
		files: ["**/*.{js,ts}"],
		plugins: { js },
		extends: ["js/recommended"],
	},
	tseslint.configs.recommended,
	eslintConfigPrettier,
]);
