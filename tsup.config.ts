import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/main.ts', './src/db-migrate.ts'],
  platform: 'node',
  target: 'esnext',
  format: ['esm'],
  cjsInterop: true,
  legacyOutput: true,
  splitting: false,
  sourcemap: true,
});
