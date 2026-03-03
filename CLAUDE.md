# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm run build      # Bundle with tsup → dist/
pnpm test           # Run all tests (vitest)
pnpm vitest run test/utils.test.ts  # Run a single test file
pnpm run format     # Prettier (run before every commit)
pnpm start          # Start MCP server (requires env vars)
pnpm run dev:worker # Start Cloudflare Worker locally
pnpm run deploy     # Deploy Worker to Cloudflare
```

## Commit Conventions

- **Conventional Commits required**: `feat:`, `fix:`, `chore:`, etc.
- Pushing to `main` auto-releases (patch bump → NPM publish via GitHub Actions).
- For docs-only changes, include `[skip ci]` in the commit message to prevent a release.

## Architecture

This is an MCP (Model Context Protocol) server that exposes Intervals.icu fitness platform data to AI agents over stdio transport.

**Flow:** CLI (`index.ts`) → MCP Server (`server.ts`) → API Client (`api.ts`) → Intervals.icu REST API

- **`src/index.ts`** — Commander.js CLI entry point. Two modes: `verify` (credential check) and default (start MCP server). Reads `INTERVALS_ATHLETE_ID` and `INTERVALS_API_KEY` from env/.env.
- **`src/server.ts`** — Registers 10 MCP tools (get/list/create/update/delete for activities, wellness, workouts, events). Each tool validates input with inline Zod schemas and returns `removeNulls()`-cleaned JSON.
- **`src/api.ts`** — `IntervalsClient` wraps `fetch` with basic auth. All responses are Zod-validated. **Critical safety invariant:** events can only be created/modified/deleted if they are in the future (fetches existing event before update/delete to verify).
- **`src/worker.ts`** — Cloudflare Worker entry point. Reads credentials from query params (`?athleteId=&apiKey=`) and serves MCP via Streamable HTTP.
- **`src/schemas.ts`** — Zod schemas for all API request/response types. Most use `.passthrough()` to allow extra fields from the API.
- **`src/utils.ts`** — `removeNulls()` recursively strips nulls so JSON output is cleaner.

## Key Patterns

- **Tool registration** in `server.ts` follows: `server.tool(name, description, zodShape, handler)`. Handlers return `{ content: [{ type: 'text', text: ... }] }`.
- **Build-time version injection**: `tsup.config.ts` sets `process.env.VERSION` from package.json.
- **ESM-only**: All imports use `.js` extensions (required by NodeNext module resolution).
- Tests mock `fetch` (`vi.stubGlobal('fetch', ...)`) — no real API calls in tests.
- **Package manager**: pnpm (enforced via `packageManager` field in package.json).

## Formatting

Prettier is the only formatter (no ESLint). Config in `.prettierrc`: single quotes, semicolons, 100 char width, trailing commas.
