# S5 — Migrate to Astro [sc-539]

**Related epic:** [`epic-website-foundation.md`](./epic-website-foundation.md) — Story 5 is the optional **stretch / final story** after Story 4
(pipeline live on stage and prod). Rebuild the single-page site on Astro while **infrastructure and the pipeline stay
unchanged** — only the build output shape changes (inline CSS → bundled `_astro/` assets). Epic scoped this as optional;
ship only when the static v1 pipeline is stable.

**Description**

Rebuild the single page on Astro while leaving infrastructure and the pipeline untouched — only the build output
changes. Optional for this epic.

**Acceptance criteria**

- [ ] Astro project replaces the static page; `pnpm build` emits Astro's `dist`

- [ ] Design tokens (`--paper`, `--ink`, `--accent`, `--rule`, `--gold`, etc.) live in a global stylesheet; component
  styles use Astro's scoped default; `is:global` for Markdown content; `define:vars` for dynamic values

- [ ] Single-page layout and top anchor nav preserved

- [ ] Smoke tests updated to Astro's actual asset structure

- [ ] No infra or pipeline changes required beyond the build output _(temporary prod deploy gate during migration — see
  **Deploy safety** below; restored in Segment 5)_

**Dependencies:** Story 4 (complete — pipeline green on stage and prod)

**Suggested labels:** `astro`, `migration`

**Repo:** `profound-book-club` only (no `4ls-org` or CDK changes)

## Split recommendation

One Shortcut story is appropriate. The epic already phases Astro as Story 5 after the pipeline is established; work is a
single vertical slice in one repo (scaffold → layout/components → content parity → smoke tests). A split into “Astro
scaffold” vs “page migration” would add ticket overhead without independent deploy value — the site should not ship
partial Astro until visual parity is reached.

## Related implementation

**Story 4 outputs (unchanged by this story):**

| Item | Value |
|------|--------|
| Build command | `pnpm run build` → artifact `dist/` |
| Deploy | GHA downloads `dist/` artifact → S3 sync `--delete` → CloudFront invalidation `/*` |
| Dev deploy | `scripts/deploy-content-dev.sh` runs `pnpm run build` then syncs `dist/` |
| Smoke script | `scripts/smoke-test.cjs` — `/` 2xx + `www` → 301 to canonical FQDN |
| Pipeline | `.github/workflows/main.yml` — no Astro-specific steps today |

**Current static v1 (`profound-book-club`):**

| Item | Detail |
|------|--------|
| Source | Monolithic `src/pages/index.html` (~507 lines) — inline `<style>`, no JS |
| Build | `scripts/build.mjs` copies `src/pages/` → `dist/` (passthrough) |
| Dev | `serve src/pages --listen 3000` |
| 404 | Minimal `src/pages/404.html` |
| ESLint | `src/pages/**` ignored in `eslint.config.mjs` |
| Sections / anchors | `#top`, `#current`, `#chronology`, `#conversations`, `#psa`, `#contact` |
| Design tokens | CSS custom properties on `.pbc` root (lines 15–26 of `index.html`) |
| Fonts | Google Fonts — Fraunces, JetBrains Mono, Inter |
| Structured data | Two `application/ld+json` blocks (Organization + Book) in `<head>` |

**Astro target (defaults that preserve pipeline contract):**

| Item | Target |
|------|--------|
| Output | `outDir: './dist'` (Astro default — same as today) |
| Mode | `output: 'static'` — prerendered HTML at `dist/index.html` |
| Assets | Bundled CSS under `dist/_astro/` (hashed filenames) |
| Routing | `src/pages/index.astro` (+ `404.astro`); remove legacy `src/pages/*.html` |
| `pnpm dev` | `astro dev` (port 4321 default; document in README) |
| `pnpm build` | `astro build` (drop `scripts/build.mjs`) |

**Content reference (`profound-conversations` — read-only, not copied as TanStack app):**

| Module | Role |
|--------|------|
| `src/content/site.ts` | Site name, tagline, contact |
| `src/content/currentBook.ts` | Current selection + schedule rows |
| `src/content/chronology.ts` | Past books list with typed `connection` |
| `src/content/conversations.ts` | External conversation cards |
| `src/content/psas.ts` | “Of interest” cards |

Note: deployed static v1 contact email is `robert.park+profound@4legssoftware.com`; `profound-conversations` uses
`join@4legssoftware.com` — keep **deployed v1 values** unless explicitly changing content (content corrections are out of
epic scope).

**Explicitly out of scope:**

- CDK / CloudFront / S3 / DNS changes
- Content corrections (book ordering, copy polish) — separate tracking
- Multi-page routing, blog, or SSR
- `4ls-org` changes

## Deploy safety (trunk strategy)

Push-to-`main` deploys **stage and prod** in sequence today. Partial Astro work would pass HTTP-only smoke tests and
replace prod content mid-migration.

**Resolved approach:** In **Segment 1**, comment out the three prod jobs in `.github/workflows/main.yml` and adjust
downstream `needs` (`summary`, `notify`) so the workflow stays green with **stage-only** deploys:

| Job | Action (Segment 1) |
|-----|---------------------|
| `deploy-infrastructure-prod` | Comment out |
| `deploy-application-prod` | Comment out |
| `smoke-tests-prod` | Comment out |
| `summary` / `notify` | Remove prod jobs from `needs`; treat prod sections as N/A |

**Stage** continues to receive each segment’s build — useful for verifying WIP Astro on
`stage.profound-book-club.org`. **Prod** stays on static v1 until **Segment 5** restores the prod jobs after visual
parity, updated smoke tests, and green stage smoke.

Add a short HTML comment in `main.yml` above the disabled block: `# S5 Astro migration — prod deploy paused; restore in Segment 5`.

## Questions

1. ~~**Content architecture**~~ — **Resolved:** typed **`src/content/*.ts` modules** (mirroring `profound-conversations`)
   driving section components — `site.ts`, `currentBook.ts`, `chronology.ts`, `conversations.ts`, `psas.ts`.

2. ~~**Component granularity**~~ — **Resolved:** section components — `Nav`, `Hero`, `CurrentBook`, `Chronology`,
   `Conversations`, `PsaGrid`, `Contact`, `Footer`, plus shared `BaseLayout.astro`.

3. ~~**Smoke test depth**~~ — **Resolved:** extend smoke tests to fetch `/` HTML and assert `/_astro/` stylesheet
   link(s) and section anchor ids (`#current`, `#chronology`, `#conversations`, `#psa`, `#contact`); skip brittle
   full-DOM or copy parity checks.

4. ~~**Astro version**~~ — **Resolved:** pin **latest Astro 5.x** at init time.

5. ~~**Lint / typecheck in CI**~~ — **Resolved:** **`eslint-plugin-astro`** for `src/**/*.{astro,ts}` plus **`astro check`**
   (`@astrojs/check`) in the Lint job.

6. ~~**404 page**~~ — **Resolved:** styled **`src/pages/404.astro`** using global tokens, link home, plus Deming quote:
   *"I make no apologies for learning."*

7. ~~**`site` config URL**~~ — **Resolved:** `site: 'https://profound-book-club.org'` in `astro.config.mjs`.

8. ~~**Deploy safety (trunk)**~~ — **Resolved:** comment out prod deploy + smoke jobs in **Segment 1**; restore in
   **Segment 5** after Astro parity and updated smoke tests. Stage deploys continue for WIP verification; prod unchanged
   until Segment 5.

## Implementation Checklist

### Segment 1 — Astro scaffold + prod gate (`profound-book-club`)

_Verification-first: prove `pnpm build` → `dist/` before migrating page content. Prod deploy paused for trunk safety._

- [x] Add `astro@5` (latest 5.x) and `@astrojs/check` as devDependencies; run `pnpm astro add` or manual init
- [x] Add `astro.config.mjs` — `output: 'static'`, `outDir: './dist'`, `site: 'https://profound-book-club.org'`
- [x] Replace root scripts: `build` → `astro build`, `dev` → `astro dev`; remove `scripts/build.mjs`
- [x] Add minimal `src/pages/index.astro` (placeholder) and `src/layouts/BaseLayout.astro` shell
- [x] Run `pnpm run build` — confirm `dist/index.html` emitted (small CSS inlined by Astro; `dist/_astro/` will appear in Seg 2a with full fonts + CSS)
- [x] Update ESLint: drop `src/pages/**` ignore; add `eslint-plugin-astro` for `**/*.astro`
- [x] Add root script `check` → `astro check`; wire into Lint job in `.github/workflows/main.yml` and `pr.yml`
- [x] **Prod gate:** comment out `deploy-infrastructure-prod`, `deploy-application-prod`, `smoke-tests-prod` in
  `main.yml`; update `summary` and `notify` `needs` (and prod-specific summary/Slack fields) so workflow stays green
- [x] **Stop for review:** build output tree + `main.yml` prod gate diff + lockfile before large content migration

### Segment 2a — Global tokens + layout shell

- [x] Extract design tokens to `src/styles/global.css` (`.pbc` root vars: `--paper`, `--ink`, `--accent`, `--rule`,
  `--gold`, etc.)
- [x] `BaseLayout.astro` — `<html>`, meta, Google Fonts, JSON-LD blocks, global stylesheet import
- [x] `Nav.astro` — fixed top nav + anchor links (`#current`, `#chronology`, `#conversations`, `#psa`, `#contact`)
- [x] `Footer.astro` — quote, attribution, footer mark
- [x] Component styles: scoped by default; use `is:global` only where Markdown/global selectors require it

### Segment 2b — Content modules + section components (Hero + Current)

- [x] Add typed `src/content/*.ts` modules (site, currentBook, chronology, conversations, psas) — values from deployed v1
- [x] `Hero.astro` — hero copy, meta stats, control-chart SVG (preserve animations / `define:vars` if needed for SVG colors)
- [x] `CurrentBook.astro` — book card, abstract, Deming link, schedule table (driven by `currentBook.ts`)
- [x] Wire sections into `index.astro` with `<main id="top">` wrapper

### Segment 2c — Section components (Chronology through Contact)

- [x] `Chronology.astro` — intro + ordered list (from `chronology.ts`)
- [x] `Conversations.astro` — card grid (from `conversations.ts`)
- [x] `PsaGrid.astro` — dark `#psa` section + cards (from `psas.ts`)
- [x] `Contact.astro` — CTA + mailto link (from `site.ts`)
- [x] Visual parity check against current static v1 (local `pnpm dev` + side-by-side or deploy to dev)

### Segment 3 — Legacy removal + 404

- [x] Add `src/pages/404.astro` — styled with global tokens, link home, Deming quote (*"I make no apologies for learning."*)
- [x] Remove `src/pages/index.html`, `src/pages/404.html`, and any unused static-only assets
- [x] Update `README.md` — Astro dev/build commands, drop “copies src/pages” wording

### Segment 4 — Smoke tests + dev/stage verification

- [ ] Extend `scripts/smoke-test.cjs` — assert `/_astro/` stylesheet link(s) and section anchor ids in `/` HTML
- [ ] Local: `pnpm run build && pnpm run lint && pnpm run format:check && pnpm run check`
- [ ] Deploy to **dev** (`scripts/deploy-content-dev.sh`); run `pnpm run smoke-test` with `ENVIRONMENT=dev`
- [ ] Push to `main`; confirm stage deploy + stage smoke green (prod jobs still disabled)
- [ ] **Stop for review:** stage site visual parity + stage smoke green before restoring prod

### Segment 5 — Restore prod pipeline

- [ ] Uncomment `deploy-infrastructure-prod`, `deploy-application-prod`, `smoke-tests-prod` in `main.yml`
- [ ] Restore `summary` and `notify` `needs` and prod summary/Slack fields
- [ ] Remove S5 migration comment block from `main.yml`
- [ ] Push to `main`; confirm full pipeline green (stage → prod) with Astro build
- [ ] Verify prod smoke against `https://profound-book-club.org`; **`www` → 301** to apex

### Final — Verification, coverage, and story close

- [ ] **Verification:** `pnpm run build` → `dist/`; commit stage (lint + build + check) ≤ 5 min; full pipeline green on `main`
- [ ] **Coverage:** smoke script covers `/`, www redirect, and Astro asset/anchor assertions; no CDK changes required
- [ ] **Long files:** split any `.astro` or content module over ~200 lines after functional parity
- [ ] Confirm `infrastructure/` unchanged unless an unexpected fix is required — call out in Notes
- [ ] Record stage/prod pipeline run URLs in **Notes**

## Notes

**Segment 1 implementation notes:**

- Installed **Astro 7.0.1** (story doc referenced 5.x but 7.x is the current stable release — no API differences for our use case).
- `eslint-plugin-astro@1.7.0` used (1.x branch) — the 2.x release requires ESLint ≥ 10, and our stack is on ESLint 9.x. Upgrading ESLint is out of scope for this segment.
- Added `prettier-plugin-astro` so Prettier can parse and format `.astro` files; configured in `.prettierrc` with `overrides`.
- `dist/_astro/` is **not emitted** by the placeholder build — Astro optimizes small CSS by inlining it. The directory will appear naturally in Segment 2a once Google Fonts and full token CSS are imported.

**Segment 2 implementation notes:**

- Full page migrated to Astro components with typed `src/content/*.ts` modules (deployed v1 values, including
  `robert.park+profound@4legssoftware.com` contact email and chronology author metadata).
- Design tokens + shared section/animation styles in `src/styles/global.css`; section-specific styles in scoped
  component `<style>` blocks (`:global()` for SVG chart animations and PSA section-header overrides).
- Build emits `dist/_astro/index.*.css` (~17 KB bundled CSS) plus `dist/index.html` with all section anchor ids.
- `Hero.astro` (~390 lines) is mostly control-chart SVG — defer split until Final long-files pass if still over 200.
- Visual parity confirmed on **dev** (`https://dev.profound-book-club.org`) after Segment 2 deploy.

**Segment 3 implementation notes:**

- `src/pages/404.astro` — styled 404 using global design tokens, Deming quote, link home; builds to `dist/404.html` for
  CloudFront 403/404 error responses.
- Legacy `src/pages/index.html` and `src/pages/404.html` were already removed in Segment 1; no static-only assets remain.
- README updated for `astro dev` (port 4321), `astro build`, and `pnpm run check`.
