import { defineConfig } from 'vite';

export default defineConfig({
  build: {
	outDir: 'dist',
	emptyOutDir: true,
	target: 'es2022',
	lib: {
	  entry: 'src/index.ts',
	  name: 'SncfTrainCard',
	  formats: ['iife'],
	  fileName: () => 'sncf-train-card.js'
	},
	rollupOptions: {
	  output: {
		inlineDynamicImports: true
	  }
	},
	sourcemap: true,
	minify: 'esbuild'
  }
});

