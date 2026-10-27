# Website foundation — epic summary

**Epic:** [epic 534](https://app.shortcut.com/4legssoftware/epic/534) — Profound Book Club website foundation. Closed
2026-06-26.

The Profound Book Club single-page site is live on AWS across **dev → stage → prod**, deployed through a GitHub Actions
pipeline modeled on **4ls-site**. The repo uses **PNPM + TypeScript + Astro 7**. Infrastructure and the pipeline were
established on a static v1 passthrough build, then the page migrated to Astro without changing deploy contracts.

## What shipped

| Layer | Outcome |
| ----- | ------- |
| **AWS org** (`4ls-org`) | `profound-book-club` OU with dev / stage / prod accounts, SSO permission sets, inherited baseline SCPs |
| **DNS + TLS** | `profound-book-club.org` hosted zone in org account; ACM certs per env in app accounts; alias A records; `www` → 301 to canonical hostname on every env |
| **App infra** (`profound-book-club/infrastructure/`) | CDK: S3 + OAC + CloudFront, cert stack in `us-east-1`, main stack in `us-east-2`; 403/404 → `/404.html` |
| **Site** | Astro static single page with anchor nav, typed content modules, global design tokens, styled 404 |
| **Pipeline** | `main.yml`: lint → build → CDK test → stage deploy + smoke → prod deploy + smoke; `pr.yml` for PR commit-stage; OIDC (no long-lived keys); Slack notify |
| **Dev deploy** | Manual from localhost only — never in pipeline |

## Stories delivered

1. **AWS Organization** — OU, accounts, SSO, cost tags
2. **Repo + scaffold** — static v1, PNPM/TS/lint, `pnpm build` → `dist/`
3. **DNS + infra** — CDK + Terraform; dev end-to-end; stage/prod deferred to pipeline story
4. **GHA pipeline** — OIDC, full stage→prod pipeline, branch protection, PR workflow
5. **Astro migration** — componentized page, extended smoke tests, prod gate restored

Out of scope at the time: content corrections (book ordering, copy polish) and multi-page routing, blog, or SSR.

## Domains

| Environment | URL | Deploy path |
| ----------- | --- | ----------- |
| dev | `https://dev.profound-book-club.org` | `./scripts/deploy-*-dev.sh` / `.cursor/commands/deploy-dev-book-club.md` |
| stage | `https://stage.profound-book-club.org` | Push to `main` (acceptance stage) |
| prod | `https://profound-book-club.org` | Push to `main` (after stage smoke) |

Apex is canonical; `www` 301-redirects to the bare domain (or env subdomain on dev/stage).

## Account IDs and OIDC deploy roles

| Environment | Account ID | Role |
| ----------- | ---------- | ---- |
| dev | `637905408031` | `arn:aws:iam::637905408031:role/gha-deploy-dev` |
| stage | `883353268059` | `arn:aws:iam::883353268059:role/gha-deploy-stage` |
| prod | `727508844146` | `arn:aws:iam::727508844146:role/gha-deploy-prod` |

Route 53 zone ID: `Z02858163FD16TMT7WSTS`. Prod trust policy: `refs/heads/main` only.

## Decisions

### IaC split: CDK in app accounts, Terraform in org account

**Decision:** Application infrastructure (S3 origin, CloudFront, ACM certificate request) lives in each environment
account via CDK. Org-level DNS (Route 53 hosted zone reference, ACM validation CNAMEs, alias A records) lives in the
`4ls-org` root account via Terraform.

**Why:** CDK cannot create Route 53 records cross-account reliably. Centralizing DNS in the org account matches the
4ls-site / wealthtrax pattern and keeps registrar zones under one roof.

**Where encoded:**

- CDK: `createRoute53Records: false` in `infrastructure/lib/profound-book-club-stack.ts`
- Terraform: `4ls-org/infrastructure/modules/common/route53-profound-book-club.tf`
- Pattern write-up: [route53-custom-domain-pattern.md](../../../4ls-org/docs/route53-custom-domain-pattern.md)
  (includes dedicated-zone example for `profound-book-club.org`)

### One-time cert bootstrap per environment

**Decision:** Each environment gets a one-time manual cert deploy from localhost (cert stack in `us-east-1`, validation
CNAMEs in Terraform, wait for `ISSUED`). The issued ARN is stored as a GitHub secret (`CERTIFICATE_ARN_DEV`,
`CERTIFICATE_ARN_STAGE`, `CERTIFICATE_ARN_PROD`). The pipeline and routine deploys only run the **main** CDK stack with
the secret — not the cert stack.

**Why:** Matches 4ls-site; avoids pipeline complexity for rare cert lifecycle events; validation requires org-account
DNS writes anyway.

**Where encoded:**

- Cert scripts: `scripts/deploy-{dev,stage,prod}-cert.sh`, `scripts/deploy-infrastructure-{env}.sh`
- GitHub secrets on `4legssoftware/profound-book-club`
- Pipeline: `.github/workflows/main.yml` passes `CERTIFICATE_ARN` from secrets to CDK deploy jobs

### Parent OU SCP inheritance (no workload-specific SCP)

**Decision:** The `profound-book-club` OU does **not** get dedicated SCP or tag-policy resources in Terraform. New
accounts inherit guardrails from parent OUs (4ls-site pattern).

**Why:** Baseline org policies already constrain region and tagging; a workload-specific SCP added no value for this
static site.

**Where encoded:** Absence of `profound-book-club` entries in `4ls-org/infrastructure/modules/common/policies.tf`;
accounts under `aws_organizations_organizational_unit.profound_book_club`.

### Prod OIDC trust: `refs/heads/main` only

**Decision:** GitHub OIDC deploy roles exist in all three app accounts (`gha-deploy-dev`, `gha-deploy-stage`,
`gha-deploy-prod`). Dev and stage trust `repo:4legssoftware/profound-book-club:*`. **Prod** trusts only
`ref:refs/heads/main`.

**Why:** Limits prod deploy surface to trunk merges; dev/stage roles support optional OIDC sanity checks and broader ref
patterns without affecting prod.

**Where encoded:** `4ls-org/infrastructure/modules/common/profound-book-club-github-oidc.tf`

### Apex canonical; `www` → 301 on every environment

**Decision:** The bare hostname is canonical on each environment. `www` hostnames redirect with **301** to the
canonical FQDN via a CloudFront Function (viewer-request):

| Environment | Canonical | Redirect source |
| ----------- | --------- | --------------- |
| dev | `dev.profound-book-club.org` | `www.dev.profound-book-club.org` |
| stage | `stage.profound-book-club.org` | `www.stage.profound-book-club.org` |
| prod | `profound-book-club.org` | `www.profound-book-club.org` |

**Why:** Mirrors 4ls-site; avoids duplicate content URLs; smoke tests assert redirect behavior.

**Where encoded:** `infrastructure/lib/www-redirect-function.ts`; `scripts/smoke-test/check-www-redirect.ts`

### Trunk delivery and `[skip ci]`

**Decision:** Maintainer workflow is review → commit → push to `main` (no routine PR gate). Push to `main` triggers the
full stage → prod pipeline. Commits that should not deploy (docs, story prep) include **`[skip ci]`** in the message to
skip `main.yml`. External contributors use fork + PR; `pr.yml` runs commit-stage checks only.

**Why:** Trunk-based development per epic; `[skip ci]` prevents accidental stage/prod deploys on non-shipping commits.

**Where encoded:** `.cursor/rules/rules.mdc`, [README.md](../../README.md), [CONTRIBUTING.md](../../CONTRIBUTING.md),
`.github/workflows/main.yml` / `pr.yml`

### Astro migration prod gate

**Decision:** During the Astro migration (Story 5), prod deploy and smoke jobs in `main.yml` were temporarily commented
out while stage continued to receive each push. Prod was restored only after visual parity, updated smoke tests, and a
green stage run.

**Why:** Trunk push deploys stage and prod in sequence; partial Astro work would have passed HTTP-only smoke tests and
replaced prod mid-migration.

**Where encoded:** Restored in `main.yml` (Segment 5,
[run 28125383286](https://github.com/4legssoftware/profound-book-club/actions/runs/28125383286)). Reuse this pattern for
future in-place migrations that change deploy artifacts.

### Static site content source

**Decision:** `profound-conversations` is a **read-only reference** for content, layout, and anchor nav — not copied as
a TanStack/Cloudflare app. Deployed contact email remains the v1 value (`robert.park+profound@4legssoftware.com`), not
`join@4legssoftware.com` from the reference repo. Content corrections are tracked outside this epic.

**Why:** Keeps the book-club repo a simple static/Astro site with a stable deploy contract; avoids importing an
unrelated stack.

**Where encoded:** `src/content/*.ts`, section components under `src/components/`

## Follow-ups and accepted debt

### `Hero.astro` size (~397 lines)

**Status:** Accepted debt — split deferred at Story 5 close.

**Context:** `src/components/Hero.astro` is ~397 lines, mostly an inline control-chart SVG with scoped animation styles.
The ~200-line component guideline was waived because the SVG is a cohesive visual unit; splitting would fragment chart
markup without improving maintainability today.

**When to revisit:** If the hero section gains interactive behavior, alternate chart variants, or shared SVG primitives
reused elsewhere — extract SVG paths/animations into `src/components/hero/` or a dedicated partial.

### Public repo visibility

**Status:** Open decision — currently **public**; switch to **private** if a concern surfaces.

**Context:** Epic resolved visibility as public at kickoff (open-source posture, simpler fork + PR for external
contributors). No secrets live in the repo; deploy uses OIDC and GitHub secrets. Infrastructure account IDs and ARNs are
visible in docs and Terraform — acceptable for this workload.

**When to revisit:** If the repo gains non-public content, licensed assets, or operational details that should not be
world-readable. Switching to private does not require infra changes; update [CONTRIBUTING.md](../../CONTRIBUTING.md)
and GitHub branch protection/OIDC settings if fork workflow changes.

## Since then

- **No longer a single page.** The Conversations epic (e603) added `/conversations`, linked from the home page and the
  chronology.
- **Missing paths return a real 404.** CloudFront still serves `/404.html` for 403 and 404, but with status 404 instead
  of 200, so Google does not report soft 404s. Stage and dev also send `X-Robots-Tag: noindex`. See
  [20261027-site-analytics.md](./20261027-site-analytics.md).
- **Every distribution has a CSP and security headers,** with no `'unsafe-inline'`. `Hero.astro` is now 386 lines: its
  animation delays moved from inline `style` attributes into the component stylesheet to satisfy the CSP. The size
  debt above still stands.
- **Smoke tests** moved from `scripts/smoke-test.cjs` to `scripts/smoke-test.ts` plus one module per check under
  `scripts/smoke-test/`, run with `tsx`.

## Retained references

- [README](../../README.md) — local dev, build, CI/CD, deploy table
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — fork + PR flow for external contributors
- [deploy-dev-book-club.md](../../.cursor/commands/deploy-dev-book-club.md) — manual dev deploy
- [design-assets/](../design-assets/) — favicon variants and branding explorations
- [route53-custom-domain-pattern.md](../../../4ls-org/docs/route53-custom-domain-pattern.md) — CDK/Terraform DNS split;
  includes dedicated-zone example (4ls-org)
