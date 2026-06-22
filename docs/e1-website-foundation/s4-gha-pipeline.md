# S4 GHA Build Pipeline [sc-538]

**Related epic:** [`epic-website-foundation.md`](./epic-website-foundation.md) — Story 4 delivers the **Commit → Acceptance (
stage) → Production (prod)** GitHub Actions pipeline modeled on **4ls-site**. Trunk-based development: review → commit →
push to `main` triggers the pipeline. **dev is never deployed here** (localhost only); the pipeline handles stage and prod.
Story 3 deferred stage/prod cert deploy, DNS aliases, and HTTPS verification — those land here before the first successful
pipeline run.

**Description**

End-to-end CI/CD via GitHub Actions authenticating to AWS through OIDC, following the 4ls-site 3-stage flow. Trunk-based
development: no PR workflow — review → commit → push to `main` triggers the pipeline. **dev is never deployed here** (
localhost only); the pipeline handles stage and prod.

**Commit stage** _(target ≤ 5 min)_

- [x] GitHub OIDC provider + per-environment IAM deploy roles (no long-lived keys)

- [ ] Static checks (ESLint, Prettier)

- [ ] Compile / build (`pnpm build`)

- [ ] Unit tests (as applicable)

- [ ] CDK tests in CI (`infrastructure/` Jest) — synth stays local / pre-deploy (mirrors **4ls-site**)

- [ ] No deploy to dev

**Acceptance stage**

- [ ] Deploy to `stage` (CDK), sync build output to S3, invalidate CloudFront

- [ ] Run acceptance tests against the deployed `stage` environment

- [ ] Contract tests where external dependencies exist — N/A for the static site today

**Production stage**

- [ ] Repeat the same deploy logic to `prod` (only configuration differs)

- [ ] Run smoke tests against `prod`

- [ ] Same smoke tests run in the acceptance suite against `stage` to confirm they still pass

- [ ] No manual approval gate

>
Notes: acceptance/smoke tests are written against the current static asset structure and updated when Astro lands (Story
5). Follows 4ls-site conventions where practical.

**Dependencies:** Stories 1, 2, 3 (complete for dev; stage/prod infra deferred from Story 3)

**Suggested labels:** `ci-cd`, `github-actions`

**Repos:** `profound-book-club` (workflow, smoke tests, branch protection) and `4ls-org` (GitHub OIDC IAM in stage/prod
accounts)

## Split recommendation

One Shortcut story is appropriate. The epic already phases the pipeline as Story 4; work naturally splits into **org OIDC
→ commit-stage workflow → stage cert/DNS + deploy → prod cert/DNS + deploy**, but those are **segments inside this ticket**,
not separate Shortcut stories. Do not split OIDC from the workflow — the first green pipeline run is the story's done
signal.

## Related implementation

**Story 3 outputs (reuse in pipeline):**

| Environment | Account ID | FQDN | Deploy role (after Segment 1) | Cert secret |
|-------------|------------|------|-------------------------------|-------------|
| dev | `637905408031` | `dev.profound-book-club.org` | `arn:aws:iam::637905408031:role/gha-deploy-dev` | `CERTIFICATE_ARN_DEV` ✅ |
| stage | `883353268059` | `stage.profound-book-club.org` | `arn:aws:iam::883353268059:role/gha-deploy-stage` | `CERTIFICATE_ARN_STAGE` — Story 4 |
| prod | `727508844146` | `profound-book-club.org` | `arn:aws:iam::727508844146:role/gha-deploy-prod` | `CERTIFICATE_ARN_PROD` — Story 4 |

**CDK / deploy conventions (`profound-book-club`):**

| Item | Value |
|------|--------|
| Main stack | `ProfoundBookClubStack` (`us-east-2`) |
| Cert stack | `ProfoundBookClub-Certificate-{env}` (`us-east-1`) |
| Stack outputs | `BucketName`, `DistributionId`, `WebsiteURL`, `CertificateArn` |
| Build artifact | `pnpm run build` → `dist/` (upload as GHA artifact) |
| Content deploy pattern | `scripts/deploy-content-dev.sh` — S3 sync + CloudFront invalidation `/*` |
| Route 53 zone | `profound-book-club.org` — `Z02858163FD16TMT7WSTS` (`4ls-org`) |

**Current repo state:**

| Item | Status | Notes |
|------|--------|-------|
| `.github/workflows/` | **Missing** | No CI yet; `.github/ISSUE_TEMPLATE/` only |
| Root `package.json` | Ready | `build`, `lint`, `format`; **no `test` script** (N/A for static v1) |
| `infrastructure/` | Ready | Jest tests + `pnpm run synth`; dev deployed locally |
| GitHub OIDC (`4ls-org`) | **Complete** | `4ls-org` commit `2843ad3`; TFC applied |
| Stage/prod certs + DNS | **Deferred from S3** | Segments 3 and 5 below |
| Branch protection | Partial | S2 enabled baseline; **required status checks** deferred to this story |

**Reference patterns** (mirror **4ls-site**; adapt names/domains):

| Concern | Reference | Notes |
|---------|-----------|-------|
| Full pipeline | `4ls-site/.github/workflows/main.yml` | lint → build → stage infra/app → smoke → prod infra/app → smoke → summary/notify |
| OIDC Terraform | `4ls-org/infrastructure/modules/common/4ls-site-github-oidc.tf` | Per-account OIDC provider + `gha-deploy-{env}` + CDK policy; prod trust **main only** |
| OIDC test workflow | `4ls-org/docs/wealthtrax/wealthtrax-test-oidc.yml` | Optional `workflow_dispatch` sanity check before full deploy |
| Smoke tests | `4ls-site/scripts/smoke-test.js` | Adapt paths for single-page static site; pass `SITE_URL` from stack output |
| Cert + DNS loop | Story 3 Segments 3–5 | Repeat dev pattern for stage/prod before first pipeline deploy per env |
| Node in GHA | `.nvmrc` → **`v26.3.1`** | Book-club ahead of 4ls-site (`24`); use `setup-node` with `.nvmrc` or `'26'` |
| Action pinning | `4ls-site/.github/workflows/main.yml` | Pin actions to commit SHAs (not floating `@v*` tags) |

**Explicitly out of scope:**

- dev deploy in pipeline (localhost / `scripts/deploy-*-dev.sh` only)
- Astro migration smoke-test updates — Story 5
- Contract tests — N/A today

## Questions

1. ~~**OIDC scope (dev role)**~~ — **Resolved:** **All three** — mirror **4ls-site**: OIDC provider + `gha-deploy-dev` /
   `gha-deploy-stage` / `gha-deploy-prod` in dev/stage/prod accounts. Dev role supports optional `test-oidc` workflow;
   main pipeline still **never deploys dev**.

2. ~~**Prettier in CI**~~ — **Resolved:** add **`format:check`** (`prettier --check .`) and run it in the **Lint** job
   alongside ESLint (matches story AC and S2 ESLint + Prettier choice).

3. ~~**Slack notification job**~~ — **Resolved:** **Include notify job** — mirror **4ls-site**; use repo secret
   **`SLACK_WEBHOOK_URL`** (same name).

4. ~~**Scheduled / manual triggers**~~ — **Resolved:** match **4ls-site** — `push` to `main`, **`workflow_dispatch`**, and
   weekly cron. Cron: **Thursday 15:00 UTC** (`0 15 * * 4`) — one weekday earlier than 4ls-site (Friday) and 30 minutes
   earlier than 4ls-site’s `30 15 * * 5`.

5. ~~**Branch protection status checks**~~ — **Resolved:** require **`Lint`**, **`Build`**, and **`Deploy Infrastructure
   (Stage)`** on `main` after workflow lands — no PR gate.

6. ~~**Stage/prod cert bootstrap**~~ — **Resolved:** **Manual bootstrap per env** (Segments 3 and 5) — deploy cert
   stacks, add Terraform validation CNAMEs, wait for ISSUED, set `CERTIFICATE_ARN_STAGE` / `CERTIFICATE_ARN_PROD` secrets;
   pipeline deploys **main stack only** with cert ARN env var (matches dev and 4ls-site).

## Implementation Checklist

### Segment 1 — GitHub OIDC IAM (`4ls-org`) ✅

- [x] Add `profound-book-club-github-oidc.tf` mirroring `4ls-site-github-oidc.tf` — OIDC provider + `gha-deploy-dev` /
  `gha-deploy-stage` / `gha-deploy-prod` in all three accounts
- [x] Trust policy: `repo:4legssoftware/profound-book-club:*` for dev and stage; **`ref:refs/heads/main` only** for prod
- [x] Attach CDK deploy policy (CloudFormation, S3, CloudFront, ACM, IAM, etc.) per 4ls-site
- [x] Outputs: role ARNs for dev/stage/prod (document in story **Notes**)
- [x] Run: `terraform fmt`, `tflint`, `terraform validate`; TFC plan review
- [x] TFC apply; verify assume-role with optional `test-oidc` workflow (Segment 2a)
- [x] **Stop for review:** plan/apply and role ARNs before wiring workflow deploy jobs

### Segment 2a — Commit-stage workflow (`profound-book-club`)

- [ ] Add `.github/workflows/main.yml` skeleton — `push` to `main`, concurrency, OIDC permissions, pinned actions;
  triggers: `push` (`main`), `workflow_dispatch`, cron **`0 15 * * 4`** (Thu 15:00 UTC)
- [ ] Add root script **`format:check`** (`prettier --check .`)
- [ ] **Lint** job: checkout, pnpm (root + infra deps as needed), Node **26**, `pnpm run lint`, `pnpm run format:check`
- [ ] **Build** job: `pnpm install --frozen-lockfile`, `pnpm run build`, upload **`dist/`** artifact
- [ ] **CDK test** job: `cd infrastructure && pnpm install --frozen-lockfile && pnpm run test`
- [ ] Confirm commit stage completes **without** AWS deploy, dev touch, or CDK synth; target ≤ 5 min
- [ ] **Stop for review:** green commit-stage run on a docs-only or workflow-only push (`[skip ci]` not needed once workflow
  exists — use a throwaway commit or `workflow_dispatch` if added)

### Segment 2b — Deploy + smoke jobs (stage/prod wiring)

_Wire deploy jobs after Segment 1 OIDC is live and Segment 3 stage cert secret exists (stage jobs can be merged with 2b only
after Segment 3, or land disabled behind a follow-up push)._

- [ ] Extend `main.yml`: **Deploy Infrastructure (Stage)** — assume `gha-deploy-stage`, CDK bootstrap, deploy main stack,
  capture `WebsiteURL` / `BucketName` / `DistributionId` outputs; `ENVIRONMENT=stage`, `CERTIFICATE_ARN` from secret
- [ ] **Deploy Application (Stage)** — download `dist/` artifact, S3 sync `--delete`, CloudFront invalidation `/*`
- [ ] **Smoke Tests (Stage)** — `pnpm run smoke-test` with `ENVIRONMENT=stage`, `SITE_URL` from infra job output
- [ ] Repeat for **prod** jobs after Segment 5 (needs `CERTIFICATE_ARN_PROD`); prod jobs `needs` stage smoke success (no
  manual approval)
- [ ] Add **Deployment Summary** job (`if: always()`)
- [ ] Add **Slack notify** job (mirror 4ls-site; `SLACK_WEBHOOK_URL` secret)
- [ ] Add root `smoke-test` script — adapt from 4ls-site: `/` returns 2xx; optional `www` → 301 check per env FQDN
- [ ] **Stop for review:** inspect full workflow YAML size; split prod notify into Segment 2c if diff approaches ~400 lines

### Segment 3 — Stage cert, DNS, and secret (both repos)

_Repeat Story 3 dev pattern; required before first stage pipeline deploy._

**Repo: `profound-book-club`**

- [ ] Deploy cert stack to stage account (`DEPLOY_CERTS_ONLY=true`, `ENVIRONMENT=stage`); capture ACM validation CNAMEs

**Repo: `4ls-org`**

- [ ] Add stage ACM validation CNAME record(s) in `route53-profound-book-club.tf`
- [ ] TFC apply; wait until ACM status **ISSUED**

**Repo: `profound-book-club`**

- [ ] Set GitHub secret **`CERTIFICATE_ARN_STAGE`**; record ARN in story **Notes**
- [ ] _(Optional local verify)_ Deploy main stack to stage with cert ARN; capture CloudFront domain

**Repo: `4ls-org`**

- [ ] Add alias A records: `stage.profound-book-club.org` + `www.stage.profound-book-club.org` → stage CloudFront
- [ ] TFC apply

- [ ] **Stop for review:** `curl -I https://stage.profound-book-club.org` — HTTPS 200 (after first content deploy)

### Segment 4 — First green stage pipeline run (`profound-book-club`)

- [ ] Push workflow + smoke script; trigger pipeline on `main`
- [ ] Verify acceptance stage: CDK deploy, S3 sync, invalidation, smoke tests pass against `stage.profound-book-club.org`
- [ ] Verify **`www.stage.…` → 301** to stage canonical hostname
- [ ] **Stop for review:** stage pipeline green before prod cert work

### Segment 5 — Prod cert, DNS, and secret (both repos)

- [ ] Repeat Segment 3 pattern for prod (apex + `www.profound-book-club.org`)
- [ ] Set GitHub secret **`CERTIFICATE_ARN_PROD`**; alias A records for apex + www → prod CloudFront
- [ ] **Stop for review:** prod cert issued and DNS aliases applied before enabling prod deploy jobs

### Segment 6 — Prod pipeline + branch protection

- [ ] Enable prod deploy/smoke jobs in workflow; push to `main`
- [ ] Verify prod smoke tests against `https://profound-book-club.org`; **`www` → 301** to apex
- [ ] Update `main` branch protection — required status checks: **`Lint`**, **`Build`**, **`Deploy Infrastructure (Stage)`**
  (no PR gate)
- [ ] Document `[skip ci]` convention in README for docs-only commits (Shortcut still moves on story prep commits)

### Final — Verification, coverage, and story close

- [ ] **Verification:** commit stage (lint, build, CDK test) ≤ 5 min; full pipeline stage → prod green on `main`
- [ ] **Coverage:** CDK Jest tests still pass; smoke script covers deployed static v1 (`/` minimum)
- [ ] **Long files:** if `main.yml` exceeds ~400 lines, extract reusable composite action or shared bash only if it aids
  readability — otherwise accept parity with 4ls-site
- [ ] Record OIDC role ARNs, stage/prod cert ARNs, CloudFront distribution IDs, and first green run URL in **Notes**
- [ ] Mark acceptance criteria complete; Story 5 (Astro) can update smoke paths without pipeline structural change

## Notes

_(Populate during implementation.)_

**Dev (Story 3 — unchanged by pipeline):**

| Item | Value |
|------|--------|
| ACM cert | `arn:aws:acm:us-east-1:637905408031:certificate/63c034b7-bdaa-4f5f-8485-60caaac71d8d` |
| CloudFront | `E2FAUPP5RRTK3D` |
| GitHub secret | `CERTIFICATE_ARN_DEV` ✅ |

**Stage / prod:** _pending Segments 3 and 5._

**OIDC role ARNs (`4ls-org` commit `2843ad3`):**

| Environment | Role ARN |
|-------------|----------|
| dev | `arn:aws:iam::637905408031:role/gha-deploy-dev` |
| stage | `arn:aws:iam::883353268059:role/gha-deploy-stage` |
| prod | `arn:aws:iam::727508844146:role/gha-deploy-prod` |
