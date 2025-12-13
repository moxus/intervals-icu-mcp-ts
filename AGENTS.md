# AGENTS.md

## Project Overview

This project is an **MCP (Model Context Protocol) Server** for **Intervals.icu**. It allows AI agents to interact with the Intervals.icu API to fetch athlete data, workouts, and more.

## Tech Stack

- **Language**: TypeScript (Node.js)
- **Framework**: `@modelcontextprotocol/sdk`
- **CLI**: `commander`
- **Build**: `tsup` (bundles for distribution)
- **Test**: `vitest`
- **Formatting**: `prettier`

## Project Structure

- `src/`: Source code
  - `index.ts`: Entry point, CLI setup.
  - `server.ts`: MCP server setup (tools, resources).
  - `api.ts`: Intervals.icu API client.
  - `schemas.ts`: Zod schemas for API validation.
- `test/`: Integration and unit tests.
- `.github/workflows/`: CI/CD workflows.

## Workflows

### Build

```bash
npm run build
```

Uses `tsup` to bundle the code into `dist/`. Injects the version number from `package.json`.

### Test

```bash
npm test
```

Runs tests using `vitest`.

### Format

```bash
npm run format
```

Formats code using `prettier`. **Always run this before committing.**

### Release

The release process is **fully automated** via GitHub Actions.

1.  Push changes to `main`.
2.  The `.github/workflows/release.yml` workflow triggers.
3.  It bumps the patch version, builds, and publishes to NPM using OIDC Trusted Publishing.
4.  It pushes the new tag and `package.json` back to the repo.

## Conventions

### Formatting

- Prettier is the source of truth.
- Config: `.prettierrc` (single quotes, no semi, etc.).

### Commits

- **Conventional Commits** are **REQUIRED**.
  - `feat: ...` -> Triggers release (minor bump if configured, usually patch).
  - `fix: ...` -> Triggers release (patch bump).
  - `chore: ...` -> Triggers release (patch bump).
- **Documentation Changes**:
  - If you are ONLY changing documentation (like this file) and do NOT want to trigger a release, you **MUST** include `[skip ci]` in the commit message.
  - Example: `docs: update AGENTS.md [skip ci]`
