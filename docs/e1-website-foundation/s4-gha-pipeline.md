# S4 GHA Build Pipeline [sc-538]

**Related epic:** [`epic-website-foundation.md`](./epic-website-foundation.md) — Story 4 delivers the **Commit → Acceptance (
stage) → Production (prod)** GitHub Actions pipeline modeled on **4ls-site**. Trunk-based development: review → commit →
push to `main` triggers the pipeline. **dev is never deployed here** (localhost only); the pipeline handles stage and prod.
Story 3 deferred stage/prod cert deploy, DNS aliases, and HTTPS verification — those land here before the first successful
pipeline run.

**Description**

End-to-end CI/CD via GitHub Actions authenticating to AWS through OIDC, following the 4ls-site 3-stage flow. Trunk-based
development: review → commit → push to `main` triggers the full deploy pipeline. Optional **`pr.yml`** runs commit-stage
checks on pull requests (no deploy). **dev is never deployed here** (localhost only); the pipeline handles stage and prod.

**Commit stage** _(target ≤ 5 min)_

- [x] GitHub OIDC provider + per-environment IAM deploy roles (no long-lived keys)

- [x] Static checks (ESLint, Prettier)

- [x] Compile / build (`pnpm build`)

- [x] Unit tests (as applicable) — N/A for static v1

- [x] CDK tests in CI (`infrastructure/` Jest) — synth stays local / pre-deploy (mirrors **4ls-site**)

- [x] No deploy to dev

**Acceptance stage**

- [x] Deploy to `stage` (CDK), sync build output to S3, invalidate CloudFront

- [x] Run acceptance tests against the deployed `stage` environment

- [x] Contract tests where external dependencies exist — N/A for the static site today

**Production stage**

- [x] Repeat the same deploy logic to `prod` (only configuration differs)

- [x] Run smoke tests against `prod`

- [x] Same smoke tests run in the acceptance suite against `stage` to confirm they still pass

- [x] No manual approval gate

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
| stage | `883353268059` | `stage.profound-book-club.org` | `arn:aws:iam::883353268059:role/gha-deploy-stage` | `CERTIFICATE_ARN_STAGE` ✅ |
| prod | `727508844146` | `profound-book-club.org` | `arn:aws:iam::727508844146:role/gha-deploy-prod` | `CERTIFICATE_ARN_PROD` ✅ |

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
| `.github/workflows/` | **Complete** | `main.yml` — full pipeline; `pr.yml` — commit-stage on PRs |
| Root `package.json` | Ready | `build`, `lint`, `format`, `format:check`, `smoke-test` |
| `infrastructure/` | Ready | Jest tests + `pnpm run synth`; dev deployed locally |
| GitHub OIDC (`4ls-org`) | **Complete** | `4ls-org` commit `2843ad3`; TFC applied |
| Stage/prod certs + DNS | **Complete** | Manual bootstrap per env; TFC validation + alias records applied |
| Branch protection | **Complete** | `main` — `Lint`, `Build`, `Deploy Infrastructure (Stage)`; PRs use `pr.yml` checks |

**Reference patterns** (mirror **4ls-site**; adapt names/domains):

| Concern | Reference | Notes |
|---------|-----------|-------|
| Full pipeline | `4ls-site/.github/workflows/main.yml` | lint → build → stage infra/app → smoke → prod infra/app → smoke → summary/notify |
| PR commit-stage | `.github/workflows/pr.yml` | lint, build, CDK test on `pull_request` — no AWS deploy |
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
   (Stage)`** on `main` ( **`Main / …`** check names). PRs use **`pr.yml`** (`PR / Lint`, `PR / Build`, `PR / CDK Test`). No
   routine PR gate for maintainer trunk flow.

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

### Segment 2a — Commit-stage workflow (`profound-book-club`) ✅

- [x] Add `.github/workflows/main.yml` skeleton — `push` to `main`, concurrency, OIDC permissions, pinned actions;
  triggers: `push` (`main`), `workflow_dispatch`, cron **`0 15 * * 4`** (Thu 15:00 UTC)
- [x] Add root script **`format:check`** (`prettier --check .`)
- [x] **Lint** job: checkout, pnpm (root + infra deps as needed), Node **26**, `pnpm run lint`, `pnpm run format:check`
- [x] **Build** job: `pnpm install --frozen-lockfile`, `pnpm run build`, upload **`dist/`** artifact
- [x] **CDK test** job: `cd infrastructure && pnpm install --frozen-lockfile && pnpm run test`
- [x] Confirm commit stage completes **without** AWS deploy, dev touch, or CDK synth; target ≤ 5 min
- [x] **Stop for review:** green commit-stage run — commit `0424795`

### Segment 2b — Deploy + smoke jobs (stage/prod wiring) ✅

_Wired in workflow; **first green deploy** blocked until Segment 3 (`CERTIFICATE_ARN_STAGE`) / Segment 5 (
`CERTIFICATE_ARN_PROD`)._

- [x] Extend `main.yml`: **Deploy Infrastructure (Stage)** — assume `gha-deploy-stage`, CDK bootstrap, deploy main stack,
  capture `WebsiteURL` / `BucketName` / `DistributionId` outputs; `ENVIRONMENT=stage`, `CERTIFICATE_ARN` from secret
- [x] **Deploy Application (Stage)** — download `dist/` artifact, S3 sync `--delete`, CloudFront invalidation `/*`
- [x] **Smoke Tests (Stage)** — `pnpm run smoke-test` with `ENVIRONMENT=stage`, `SITE_URL` from infra job output
- [x] **Prod** jobs wired — `needs` stage smoke success; requires `CERTIFICATE_ARN_PROD` (Segment 5) for green run
- [x] Add **Deployment Summary** job (`if: always()`)
- [x] Add **Slack notify** job (mirror 4ls-site; `SLACK_WEBHOOK_URL` secret)
- [x] Add root `smoke-test` script — `/` 2xx + `www` → 301 to canonical FQDN
- [x] **Stop for review:** workflow ~590 lines — parity with 4ls-site; ready to commit

### Segment 3 — Stage cert, DNS, and secret (both repos) ✅

_Repeat Story 3 dev pattern; required before first stage pipeline deploy._

**Repo: `profound-book-club`**

- [x] Add `scripts/pro-stage.sh`, `deploy-stage-cert.sh`, `deploy-infrastructure-stage.sh` (mirror dev; profile
  `profound-book-club-stage`; CDK bootstrap us-east-1 / us-east-2)
- [x] Deploy cert stack to stage account (`./scripts/deploy-stage-cert.sh`); capture ACM validation CNAMEs

**Repo: `4ls-org`**

- [x] Add stage ACM validation CNAME record(s) in `route53-profound-book-club.tf`
- [x] TFC apply; wait until ACM status **ISSUED**

**Repo: `profound-book-club`**

- [x] Set GitHub secret **`CERTIFICATE_ARN_STAGE`**; record ARN in story **Notes**
- [x] _(Optional local verify)_ Deploy main stack to stage with cert ARN; capture CloudFront domain

**Repo: `4ls-org`**

- [x] Add alias A records: `stage.profound-book-club.org` + `www.stage.profound-book-club.org` → stage CloudFront
- [x] TFC apply

- [x] **Stop for review:** `curl -I https://stage.profound-book-club.org` — HTTPS 200 (pipeline content deploy `ccdfb6a`)

### Segment 4 — First green stage pipeline run (`profound-book-club`) ✅

- [x] Push workflow + smoke script; trigger pipeline on `main` — run [`27971265342`](https://github.com/4legssoftware/profound-book-club/actions/runs/27971265342) (`ccdfb6a`)
- [x] Verify acceptance stage: CDK deploy, S3 sync, invalidation, smoke tests pass against `stage.profound-book-club.org`
- [x] Verify **`www.stage.…` → 301** to stage canonical hostname
- [x] **Stop for review:** stage jobs all green; overall workflow failed on **Smoke Tests (Prod)** — `www.profound-book-club.org` DNS not yet in place (Segment 5)

### Segment 5 — Prod cert, DNS, and secret (both repos) ✅

- [x] Repeat Segment 3 pattern for prod (apex + `www.profound-book-club.org`) — scripts `pro-prod.sh`, `deploy-prod-cert.sh`,
  `deploy-infrastructure-prod.sh`
- [x] Set GitHub secret **`CERTIFICATE_ARN_PROD`**; alias A records for apex + www → prod CloudFront (`4ls-org` `7a78358`)
- [x] **Stop for review:** prod cert **ISSUED**; DNS aliases applied; main stack custom domain live

### Segment 6 — Prod pipeline + branch protection ✅

- [x] Prod deploy/smoke jobs in `main.yml`; full green run [`27978268880`](https://github.com/4legssoftware/profound-book-club/actions/runs/27978268880) (`d0a1da0`)
- [x] Verify prod smoke tests against `https://profound-book-club.org`; **`www` → 301** to apex
- [x] `main` branch protection — required status checks: **`Lint`**, **`Build`**, **`Deploy Infrastructure (Stage)`**
- [x] Add **`pr.yml`** — commit-stage on PRs ([PR #1](https://github.com/4legssoftware/profound-book-club/pull/1)); documented **`[skip ci]`** in README

### Final — Verification, coverage, and story close ✅

- [x] **Verification:** commit stage ≤ 5 min; full pipeline stage → prod green on `main`
- [x] **Coverage:** CDK Jest tests pass in CI; smoke script covers `/` + www redirect on stage and prod
- [x] **Long files:** `main.yml` ~591 lines — accepted; parity with **4ls-site**, no extract
- [x] Record OIDC role ARNs, stage/prod cert ARNs, CloudFront distribution IDs, and pipeline run URLs in **Notes**
- [x] Story complete — Story 5 (Astro) updates smoke paths only; pipeline structure unchanged

## Notes

**Dev (Story 3 — unchanged by pipeline):**

| Item | Value |
|------|--------|
| ACM cert | `arn:aws:acm:us-east-1:637905408031:certificate/63c034b7-bdaa-4f5f-8485-60caaac71d8d` |
| CloudFront | `E2FAUPP5RRTK3D` |
| GitHub secret | `CERTIFICATE_ARN_DEV` ✅ |

**Stage (account `883353268059`):**

| Item | Value |
|------|--------|
| ACM cert (us-east-1) | `arn:aws:acm:us-east-1:883353268059:certificate/66049654-7925-4396-842c-8fcfb3e1efd2` — **ISSUED** |
| Cert stack | `ProfoundBookClub-Certificate-stage` |
| Main stack | `ProfoundBookClubStack` (us-east-2) |
| S3 bucket | `stage.profound-book-club.org` |
| CloudFront distribution | `E1MG8OL4OH1ECS` → `d1icyeb0awmpt1.cloudfront.net` |
| GitHub secret | `CERTIFICATE_ARN_STAGE` ✅ |

**First green stage pipeline run:** [`27971265342`](https://github.com/4legssoftware/profound-book-club/actions/runs/27971265342) — Lint, Build, CDK Test, Deploy Infrastructure/Application (Stage), Smoke Tests (Stage) all **success** (`ccdfb6a`, 2026-06-22).

**4ls-org DNS commits (stage):** validation CNAMEs `e798a68`, alias A records `d2b0075`.

**Prod (account `727508844146`):**

| Item | Value |
|------|--------|
| ACM cert (us-east-1) | `arn:aws:acm:us-east-1:727508844146:certificate/622ec5cf-0a9d-49c9-b739-d51e1e9ace68` — **ISSUED** |
| Cert stack | `ProfoundBookClub-Certificate-prod` |
| Main stack | `ProfoundBookClubStack` (us-east-2) |
| S3 bucket | `profound-book-club.org` |
| CloudFront distribution | `EMZFL51Z9E80Q` → `d652h0aq33l80.cloudfront.net` |
| GitHub secret | `CERTIFICATE_ARN_PROD` ✅ |

**4ls-org DNS commits (prod):** validation CNAMEs `a5579be`, alias A records `7a78358`.

**Pipeline runs:**

| Run | URL | Notes |
|-----|-----|-------|
| First green stage only | [`27971265342`](https://github.com/4legssoftware/profound-book-club/actions/runs/27971265342) | Prod smoke failed — DNS pending (`ccdfb6a`) |
| First full green (stage → prod) | [`27978268880`](https://github.com/4legssoftware/profound-book-club/actions/runs/27978268880) | All jobs success (`d0a1da0`) |
| Post-`pr.yml` merge | [`27979848833`](https://github.com/4legssoftware/profound-book-club/actions/runs/27979848833) | Full pipeline green after PR #1 merge |

**OIDC role ARNs (`4ls-org` commit `2843ad3`):**

| Environment | Role ARN |
|-------------|----------|
| dev | `arn:aws:iam::637905408031:role/gha-deploy-dev` |
| stage | `arn:aws:iam::883353268059:role/gha-deploy-stage` |
| prod | `arn:aws:iam::727508844146:role/gha-deploy-prod` |
