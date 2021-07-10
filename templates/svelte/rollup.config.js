import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import zip from "rollup-plugin-zip";
import { emptyDir } from 'rollup-plugin-empty-dir';
import postcss from "rollup-plugin-postcss";

import {
	chromeExtension,
	simpleReloader,
} from 'rollup-plugin-chrome-extension';

const production = !process.env.ROLLUP_WATCH;

export default {
	input: "src/manifest.json",
	output: {
		dir: "dist",
		format: "esm",
	},
	plugins: [
		// always put chromeExtension() before other plugins
		chromeExtension(),
		simpleReloader(),
		svelte({
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production,
			},
		}),

		postcss({ minimize: production }),
		resolve({
			dedupe: ["svelte"],
		}),
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		commonjs(),
		// Empties the output dir before a new build
		emptyDir(),
		// If we're building for production, minify
		production && terser(),
		// Outputs a zip file in ./releases
		production && zip({ dir: "releases" })
	],
};
