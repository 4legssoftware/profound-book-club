# S2 — Create repo + scaffold project (PNPM + TypeScript) [sc-536]

**Related epic:** [`epic-website-foundation.md`](./epic-website-foundation.md) — Story 2 establishes the
`profound-book-club` repo, commits the Lovable single-page site, and wires PNPM + TypeScript tooling so Story 4's pipeline
can call a stable `pnpm build` without change when Astro lands later. Runs in parallel with Story 1 (AWS org).

**Description**

Create the `profound-book-club` GitHub repo, commit the Lovable single-page site, and establish PNPM + TypeScript
tooling. The tooling's full payoff lands with Astro, but standing it up now keeps the build command (`pnpm build`)
stable so the pipeline doesn't change when Astro arrives — for the static page the build can be a thin passthrough that
emits the deployable output directory.

**Acceptance criteria**

- [ ] `profound-book-club` repo created; `main` branch protection enabled

- [ ] Lovable single-page site committed (single long page + top anchor nav intact)

- [ ] PNPM initialized (`package.json` with `packageManager` field, `pnpm-lock.yaml`, `.npmrc`)

- [ ] TypeScript configured (`tsconfig.json`)

- [ ] Lint + format set up (ESLint + Prettier, or Biome)

- [ ] `pnpm build` produces a deployable static output directory (passthrough acceptable for now)

- [ ] `README` with local dev / build instructions

**Dependencies:** none (can run parallel to Story 1)

**Suggested labels:** `repo`, `tooling`

**Repo:** `profound-book-club` only (no `4ls-org` or CDK/infrastructure in this story — Story 3 adds CDK scaffold).

## Split recommendation

One Shortcut story is appropriate. The epic already phases repo + scaffold as Story 2; work is a single repo with a
natural segment order (site source → tooling/build → repo hygiene). Defer CDK, DNS, GitHub Actions pipeline, and Astro
to Stories 3–5.

## Related implementation

**Current repo state** (local + `4legssoftware/profound-book-club` on GitHub):

| Item | Status | Notes |
|------|--------|-------|
| GitHub repo | Exists | Public; `main` default branch; remote `origin` configured |
| Branch protection | Enabled | Mirrors **4ls-site**: force-push + deletion blocked; no PR gate; status checks deferred to Story 4 |
| Site content | Missing | No `index.html`, `site/`, or build output in repo |
| PNPM / TS / lint | Missing | No `package.json`, `tsconfig.json`, or ESLint config |
| README | Complete | Prerequisites, dev, build, lint; pointers to Story 3 dev deploy and Story 4 pipeline |
| `.gitignore` | Partial | Has `node_modules/`, `cdk.out/`; **`dist/` not listed yet** — add in Segment 2 |

**Reference patterns** (mirror **4ls-site** where noted):

| Concern | Reference | Notes |
|---------|-----------|-------|
| Node version | `.nvmrc` → **`v26.3.1`** | Ahead of 4ls-site; GHA-supported via setup-node@v6 |
| Package manager | `package.json` → **`packageManager: pnpm@11.8.0`** | Latest pnpm; 4ls-site uses 11.1.0 |
| ESLint flat config | `4ls-site/eslint.config.mjs` | ESLint + `typescript-eslint`; no Prettier in 4ls-site |
| Build → deploy path | `.cursor/commands/deploy-dev-book-club.md` | `pnpm run build` → `dist/`; S3 sync + invalidation in Story 3+ |
| Branch protection | `gh api repos/4legssoftware/4ls-site/branches/main/protection` | Force-push/delete disabled; no PR gate (TBD); status checks added in Story 4 |
| Trunk delivery | Epic + `.cursor/rules/rules.mdc` | Review → commit → push to `main`; no routine PR workflow |

**Lovable reference** (read-only — **`profound-conversations`** repo, synced from Lovable):

| Item | Detail |
|------|--------|
| Role | **Reference only** — content, layout, and anchor nav (`#current`, `#chronology`, `#conversations`, `#psa`, `#contact`); **not** copied into `profound-book-club` as a TanStack/Vite app |
| Content modules | `src/content/*` (site, currentBook, chronology, conversations, psas) |
| Page structure | Single long page in `src/routes/index.tsx` — replicate UX in `profound-book-club`'s own static v1 |

**`profound-book-club-drafts`** — out of scope; remove from workspace.

**Story 2 target** (per ticket + epic): own repo scaffold — **PNPM + TypeScript**, static single-page v1, **`pnpm build` → `dist/`** (passthrough acceptable), stable build command for Story 4 pipeline; **Astro migration in Story 5** without changing pipeline or infra.

**Explicitly out of scope (later stories):**

- CDK stack, S3 bucket, CloudFront — Story 3
- Route 53 / DNS — Story 3 (`4ls-org`)
- GitHub Actions workflow, OIDC deploy roles — Story 4
- Astro migration — Story 5 (stretch)

## Questions

1. **Lovable site source** — **Resolved:** Use **`profound-conversations` as reference only** (content, design, nav).
   Build the v1 site **natively in `profound-book-club`** — static single page, PNPM + TypeScript scaffold, `pnpm build`
   → `dist/` passthrough now, **Astro in Story 5**. Do **not** import the TanStack Start / Cloudflare stack. Ignore /
   remove **`profound-book-club-drafts`** from the workspace.

2. **Site directory layout** — **Resolved:** **`src/pages/`** for v1 static source (Astro-friendly shape without Astro
   yet). `pnpm build` copies/emits to **`dist/`** for Story 3/4 S3 sync.

3. **Lint / format stack** — **Resolved:** **ESLint + Prettier** (Lovable-style, as in `profound-conversations`); not
   4ls-site ESLint-only.

4. **Branch protection scope** — **Resolved:** Enable **`main`** protection mirroring **4ls-site** — block force-push
   and branch deletion; no required PR reviews; defer required status checks until Story 4 adds CI.

5. **Node / pnpm versions** — **Resolved:** **Node `v26.3.1`** (`.nvmrc`); **pnpm `11.8.0`** (`packageManager` field).
   Ahead of 4ls-site (`v24.15.0` / `pnpm@11.1.0`); supported on GHA via `actions/setup-node@v6`.

## Implementation Checklist

**Repo:** `profound-book-club` unless noted.

### Segment 1 — Static single-page site (Lovable reference)

- [x] Resolve Question 1 — **`profound-conversations` = reference**; implement v1 in `profound-book-club` (static page,
  not TanStack import)
- [x] Resolve Question 2 — source under **`src/pages/`**; build emits **`dist/`**
- [x] Implement static single-page site at **`src/pages/index.html`** (or equivalent) from Lovable reference — preserve
  top anchor nav and section IDs; pull content from `profound-conversations/src/content/*` and layout from
  `src/routes/index.tsx`
- [x] Open locally in a browser — scroll nav, section anchors, responsive spot-check (served via `python3 -m http.server`
  in `src/pages/`; HTTP 200, content verified)
- [x] **Stop for review:** staged diff is mostly site content; confirm this matches the intended v1 page

### Segment 2 — PNPM, TypeScript, lint, and build passthrough

- [x] Add root `package.json` with `packageManager`, scripts (`build`, `lint`; optional `dev` static server)
- [x] Add `.npmrc`, `pnpm-lock.yaml`, `.nvmrc` (**Node `v26.3.1`**, **pnpm `11.8.0`**)
- [x] Add root `tsconfig.json` scoped to `scripts/**/*` (and future TS) — mirror 4ls-site posture until Astro
- [x] Add ESLint + Prettier config (Question 3 — Lovable-style); scripts `lint` and `format`; ensure `pnpm run lint` passes
- [x] Implement thin `build` script: copy agreed site source → **`dist/`** (passthrough acceptable)
- [x] Run: `pnpm install`, `pnpm run lint`, `pnpm run build` — verify `dist/index.html` (and assets if any)
- [x] Confirm `dist/` is gitignored; source lives outside `dist/`

### Segment 3 — README and GitHub branch protection

- [x] Expand `README.md` — prerequisites (Node/pnpm), install, local preview, `pnpm run build`, pointer to future dev
  deploy (Story 3) and pipeline (Story 4)
- [x] Enable `main` branch protection on `4legssoftware/profound-book-club` (Question 4 — 4ls-site baseline)
- [ ] Push segments to `main`; confirm GitHub repo reflects site + tooling

### Final — Verification and story close

- [ ] **Verification:** `pnpm run lint` and `pnpm run build` succeed on clean clone (`pnpm install --frozen-lockfile`)
- [ ] **Coverage:** N/A for static HTML passthrough; TS/lint config validated by successful lint run
- [ ] **Long files:** Review site HTML if > ~200 lines — acceptable for v1 static page; note any follow-up split for
  Astro migration (Story 5)
- [ ] Mark acceptance criteria complete; Story 3 can consume `dist/` output path and add CDK + dev deploy scripts
