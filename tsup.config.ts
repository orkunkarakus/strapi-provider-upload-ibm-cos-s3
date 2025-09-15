import { defineConfig, type Options } from 'tsup';

export default defineConfig((options: Options) => ({
	format: ['cjs', 'esm'],
	minify: !options.watch,
	sourcemap: true,
	treeshake: true,
	clean: true,
	external: [],
	banner: {
		js: "'use client'"
	},
	...options
}));