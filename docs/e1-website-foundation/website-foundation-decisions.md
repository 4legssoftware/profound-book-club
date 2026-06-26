# Website foundation — decisions

Durable decisions from the [website foundation epic](./website-foundation-summary.md) ([sc-534](https://app.shortcut.com/4ls/story/534)). Future readers should not need to re-derive these from story history or git archaeology.

## IaC split: CDK in app accounts, Terraform in org account

**Decision:** Application infrastructure (S3 origin, CloudFront, ACM certificate request) lives in each environment account via CDK. Org-level DNS (Route 53 hosted zone reference, ACM validation CNAMEs, alias A records) lives in the `4ls-org` root account via Terraform.

**Why:** CDK cannot create Route 53 records cross-account reliably. Centralizing DNS in the org account matches the 4ls-site / wealthtrax pattern and keeps registrar zones under one roof.

**Where encoded:**

- CDK: `createRoute53Records: false` in `infrastructure/lib/profound-book-club-stack.ts`
- Terraform: `4ls-org/infrastructure/modules/common/route53-profound-book-club.tf`
- Pattern write-up: [route53-custom-domain-pattern.md](../../../4ls-org/docs/route53-custom-domain-pattern.md) (includes dedicated-zone example for `profound-book-club.org`)

## One-time cert bootstrap per environment

**Decision:** Each environment gets a one-time manual cert deploy from localhost (cert stack in `us-east-1`, validation CNAMEs in Terraform, wait for `ISSUED`). The issued ARN is stored as a GitHub secret (`CERTIFICATE_ARN_DEV`, `CERTIFICATE_ARN_STAGE`, `CERTIFICATE_ARN_PROD`). The pipeline and routine deploys only run the **main** CDK stack with the secret — not the cert stack.

**Why:** Matches 4ls-site; avoids pipeline complexity for rare cert lifecycle events; validation requires org-account DNS writes anyway.

**Where encoded:**

- Cert scripts: `scripts/deploy-{dev,stage,prod}-cert.sh`, `scripts/deploy-infrastructure-{env}.sh`
- GitHub secrets on `4legssoftware/profound-book-club`
- Pipeline: `.github/workflows/main.yml` passes `CERTIFICATE_ARN` from secrets to CDK deploy jobs

## Parent OU SCP inheritance (no workload-specific SCP)

**Decision:** The `profound-book-club` OU does **not** get dedicated SCP or tag-policy resources in Terraform. New accounts inherit guardrails from parent OUs (4ls-site pattern).

**Why:** Baseline org policies already constrain region and tagging; a workload-specific SCP added no value for this static site.

**Where encoded:** Absence of `profound-book-club` entries in `4ls-org/infrastructure/modules/common/policies.tf`; accounts under `aws_organizations_organizational_unit.profound_book_club`.

## Prod OIDC trust: `refs/heads/main` only

**Decision:** GitHub OIDC deploy roles exist in all three app accounts (`gha-deploy-dev`, `gha-deploy-stage`, `gha-deploy-prod`). Dev and stage trust `repo:4legssoftware/profound-book-club:*`. **Prod** trusts only `ref:refs/heads/main`.

**Why:** Limits prod deploy surface to trunk merges; dev/stage roles support optional OIDC sanity checks and broader ref patterns without affecting prod.

**Where encoded:** `4ls-org/infrastructure/modules/common/profound-book-club-github-oidc.tf`

## Apex canonical; `www` → 301 on every environment

**Decision:** The bare hostname is canonical on each environment. `www` hostnames redirect with **301** to the canonical FQDN via a CloudFront Function (viewer-request):

| Environment | Canonical | Redirect source |
| ----------- | --------- | --------------- |
| dev | `dev.profound-book-club.org` | `www.dev.profound-book-club.org` |
| stage | `stage.profound-book-club.org` | `www.stage.profound-book-club.org` |
| prod | `profound-book-club.org` | `www.profound-book-club.org` |

**Why:** Mirrors 4ls-site; avoids duplicate content URLs; smoke tests assert redirect behavior.

**Where encoded:** `infrastructure/lib/cloudfront-distribution.ts` (www redirect function); `scripts/smoke-test.cjs`

## Trunk delivery and `[skip ci]`

**Decision:** Maintainer workflow is review → commit → push to `main` (no routine PR gate). Push to `main` triggers the full stage → prod pipeline. Commits that should not deploy (docs, story prep) include **`[skip ci]`** in the message to skip `main.yml`. External contributors use fork + PR; `pr.yml` runs commit-stage checks only.

**Why:** Trunk-based development per epic; `[skip ci]` prevents accidental stage/prod deploys on non-shipping commits.

**Where encoded:** `.cursor/rules/rules.mdc`, [README.md](../../README.md), [CONTRIBUTING.md](../../CONTRIBUTING.md), `.github/workflows/main.yml` / `pr.yml`

## Astro migration prod gate

**Decision:** During the Astro migration (Story 5), prod deploy and smoke jobs in `main.yml` were temporarily commented out while stage continued to receive each push. Prod was restored only after visual parity, updated smoke tests, and a green stage run.

**Why:** Trunk push deploys stage and prod in sequence; partial Astro work would have passed HTTP-only smoke tests and replaced prod mid-migration.

**Where encoded:** Restored in `main.yml` (Segment 5, [run 28125383286](https://github.com/4legssoftware/profound-book-club/actions/runs/28125383286)). Reuse this pattern for future in-place migrations that change deploy artifacts.

## Static site content source

**Decision:** `profound-conversations` is a **read-only reference** for content, layout, and anchor nav — not copied as a TanStack/Cloudflare app. Deployed contact email remains the v1 value (`robert.park+profound@4legssoftware.com`), not `join@4legssoftware.com` from the reference repo. Content corrections are tracked outside this epic.

**Why:** Keeps the book-club repo a simple static/Astro site with a stable deploy contract; avoids importing an unrelated stack.

**Where encoded:** `src/content/*.ts`, section components under `src/components/`

---

## Follow-ups and accepted debt

### `Hero.astro` size (~397 lines)

**Status:** Accepted debt — split deferred at Story 5 close.

**Context:** `src/components/Hero.astro` is ~397 lines, mostly an inline control-chart SVG with scoped animation styles. The ~200-line component guideline was waived because the SVG is a cohesive visual unit; splitting would fragment chart markup without improving maintainability today.

**When to revisit:** If the hero section gains interactive behavior, alternate chart variants, or shared SVG primitives reused elsewhere — extract SVG paths/animations into `src/components/hero/` or a dedicated partial.

### Public repo visibility

**Status:** Open decision — currently **public**; switch to **private** if a concern surfaces.

**Context:** Epic resolved visibility as public at kickoff (open-source posture, simpler fork + PR for external contributors). No secrets live in the repo; deploy uses OIDC and GitHub secrets. Infrastructure account IDs and ARNs are visible in docs and Terraform — acceptable for this workload.

**When to revisit:** If the repo gains non-public content, licensed assets, or operational details that should not be world-readable. Switching to private does not require infra changes; update [CONTRIBUTING.md](../../CONTRIBUTING.md) and GitHub branch protection/OIDC settings if fork workflow changes.
