import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  // We want to bundle dependencies for a standalone CLI feel,
  // but usually for MCP servers distributed as libraries, we keep deps external.
  // Given the request "run with a simple npx packagename", a bundled build is often safer.
  // However, `npx` installs dependencies declared in `package.json` unless it's a single file execution.
  // I will avoid bundling dependencies to keep the package size standard and let pnpm handle it.
  splitting: false,
});
