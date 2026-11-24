import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { obsidian: fileURLToPath(new URL('./tests/helpers/obsidian.ts', import.meta.url)) } },
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**', '.obsidian-cache/**', 'node_modules/**'],
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
