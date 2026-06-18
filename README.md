# profound-book-club

Static site and infrastructure for [The Profound Book Club](https://profound-book-club.org) (v1 single-page site; Astro migration planned).

Epic context: [`docs/e1-website-foundation/epic-website-foundation.md`](docs/e1-website-foundation/epic-website-foundation.md).

## Prerequisites

- **Node.js** `v26.3.1` (see [`.nvmrc`](.nvmrc))
- **pnpm** `11.8.0` (see `packageManager` in [`package.json`](package.json))

Enable Corepack and activate pnpm:

```bash
corepack enable
corepack prepare pnpm@11.8.0 --activate
```

## Setup

```bash
nvm use          # or install Node v26.3.1
pnpm install
```

## Local development

Preview the site source (no build required):

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

Production output is written to **`dist/`** (gitignored):

```bash
pnpm run build
```

The build copies `src/pages/` → `dist/`. Story 3+ deploy scripts sync `dist/` to S3.

## Quality checks

```bash
pnpm run lint
pnpm run format
```

## Deploy (coming in later stories)

| Environment | How | Story |
|-------------|-----|-------|
| **dev** | Manual from localhost (CDK + S3 sync) | Story 3 — see `.cursor/commands/deploy-dev-book-club.md` |
| **stage / prod** | Push to `main` → GitHub Actions pipeline | Story 4 |

**dev** is never deployed by the pipeline. Domains: `dev.profound-book-club.org`, `stage.profound-book-club.org`, `profound-book-club.org`.
