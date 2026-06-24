# profound-book-club

Static site and infrastructure for [The Profound Book Club](https://profound-book-club.org) (v1 single-page site; Astro migration planned).

Epic context: [`docs/e1-website-foundation/epic-website-foundation.md`](docs/e1-website-foundation/epic-website-foundation.md).

Contributions from outside the maintainer team go through fork + pull request — see [CONTRIBUTING.md](CONTRIBUTING.md).

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
pnpm run format        # write
pnpm run format:check  # CI uses this
```

## CI/CD

| Workflow       | Trigger                             | What runs                                                                    |
| -------------- | ----------------------------------- | ---------------------------------------------------------------------------- |
| **`main.yml`** | Push to `main`, weekly cron, manual | Lint → Build → CDK Test → deploy **stage** → smoke → deploy **prod** → smoke |
| **`pr.yml`**   | Pull request to `main`              | Lint → Build → CDK Test only (no deploy)                                     |

**dev** is never deployed by the pipeline. Maintainer workflow is review → commit → push `main`. External contributions use fork + PR — see [CONTRIBUTING.md](CONTRIBUTING.md).

### Skipping the pipeline

Add **`[skip ci]`** anywhere in the commit message to skip **`main.yml`** on push (docs-only updates, story prep commits, etc.). Example:

```text
[sc-538] Record story completion [skip ci]
```

`pr.yml` still runs on open pull requests. Shortcut story-prep commits commonly use `[skip ci]` so the ticket moves to In Progress without a deploy.

## Deploy

| Environment      | How                         | Notes                                               |
| ---------------- | --------------------------- | --------------------------------------------------- |
| **dev**          | Manual from localhost       | `.cursor/commands/deploy-dev-book-club.md`          |
| **stage / prod** | Push to `main` → `main.yml` | One-time cert/DNS bootstrap per env — see story doc |

Domains: `dev.profound-book-club.org`, `stage.profound-book-club.org`, `profound-book-club.org` (apex canonical; `www` 301-redirects).
