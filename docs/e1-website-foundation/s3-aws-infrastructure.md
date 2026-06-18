# S3 — DNS + TLS + CloudFront/S3 infrastructure (CDK app / Terraform DNS) [sc-537]

**Related epic:** [`epic-website-foundation.md`](./epic-website-foundation.md) — Story 3 delivers custom domains
(`dev.profound-book-club.org`, `stage.profound-book-club.org`, `profound-book-club.org`) with the **4ls custom-domains
pattern**: CDK in each app account (CloudFront, S3 origin, ACM in `us-east-1`); Terraform in **`4ls-org`** (hosted zone,
validation CNAMEs, stable alias records). Apex is canonical; **`www` 301-redirects to apex** (prod). Story 4 (pipeline)
depends on this story.

**Description**

Stand up the custom domain following the 4ls custom-domains pattern. The **application accounts** own CloudFront, the S3
origin, and the ACM cert (requested in `us-east-1`); the **`4ls-org` root account** owns the Route 53 hosted zone, the
ACM validation records, and the stable alias records. App infra is **CDK**; org-level DNS is **Terraform**. Apex is
canonical — `www` 301-redirects to the bare domain.

**App side — CDK (per environment account)**

- [ ] Private S3 origin + CloudFront via OAC; default root object set; anchor/single-page-friendly error handling

- [ ] ACM certificate requested **in us-east-1** for each environment domain (`dev.`, `stage.`, apex `+ www`)

- [ ] `www` → apex 301 redirect (CloudFront Function, viewer-request)

- [ ] CDK app runs cleanly for a **local `dev` deploy** (dev is never deployed by the pipeline)

**Org side — Terraform (`4ls-org` root account)**

- [ ] `profound-book-club.org` hosted zone created/managed in the org-owned Route 53

- [ ] ACM DNS validation records added so each environment's cert can be issued

- [ ] Stable alias (A/AAAA) records: apex `+ www` → the environment's CloudFront distribution

**One-time validation boundary (per environment)**

- [ ] App infra requests cert → validation records extracted → org DNS proves ownership → cert issued

- [ ] Issued cert reference stored securely (e.g., SSM parameter) for automated pipeline use

**Verification**

- [ ] `dev.`, `stage.`, and apex `profound-book-club.org` all resolve over HTTPS; `www` redirects to apex

- [ ] Cache invalidation approach defined (used by the pipeline in Story 4)

>
Ownership stays split: CloudFront/certs live with the app, DNS lives with the org. After the one-time validation per
environment, redeploys are fully automated.

**Dependencies:** Story 1 (complete); Story 2 (`pnpm build` → `dist/` — scaffold largely complete)

**Suggested labels:** `infra`, `dns`, `cloudfront`, `terraform`

**Repos:** `profound-book-club` (CDK + dev deploy scripts) and `4ls-org` (Route 53)

## Split recommendation

One Shortcut story is appropriate. The epic already phases DNS + infra as Story 3; work follows a repeatable
**per-environment cert → validate → deploy → alias** loop across two repos. Segments below keep each integration point
reviewable without splitting Shortcut tickets. Defer GitHub Actions OIDC and pipeline wiring to Story 4.

## Related implementation

**Story 1 outputs (account IDs for CDK `env` config):**

| Environment | Account ID | FQDN | S3 bucket name (expected) |
|-------------|------------|------|---------------------------|
| dev | `637905408031` | `dev.profound-book-club.org` | `dev.profound-book-club.org` |
| stage | `883353268059` | `stage.profound-book-club.org` | `stage.profound-book-club.org` |
| prod | `727508844146` | `profound-book-club.org` | `profound-book-club.org` (or account-suffixed if needed) |

**Current repo state:**

| Item | Status | Notes |
|------|--------|-------|
| `infrastructure/` CDK app | Missing | Story 3 creates it (Story 2 explicitly deferred CDK) |
| Site build output | Ready | `pnpm run build` → `dist/` (Story 2) |
| Dev deploy command | Stub | `.cursor/commands/deploy-dev-book-club.md` — expects `scripts/deploy-infrastructure-dev.sh` |
| Org SSO / IAM | Ready | Story 1 — S3 bucket ARNs already use domain-shaped names in SSO policies |
| Route 53 zone | In AWS + TF data source | Zone ID `Z02858163FD16TMT7WSTS`; ACM/alias records in Segment 3+ |

**Reference patterns** (mirror **4ls-site**; adapt for apex domain + Terraform-only DNS):

| Concern | Reference | Notes |
|---------|-----------|-------|
| CDK layout | `4ls-site/infrastructure/` | `bin/`, `lib/` constructs, `CertificateStack` in `us-east-1`, main stack in `us-east-2` |
| S3 + OAC + CloudFront | `4ls-site/infrastructure/lib/website-bucket.ts`, `cloudfront-distribution.ts` | OAC via `S3BucketOrigin.withOriginAccessControl`; error responses **403/404 → `/404.html`** (match 4ls-site) |
| ACM cert stack | `4ls-site/infrastructure/lib/certificate-stack.ts`, `acm-certificate.ts` | Each env: primary FQDN + SAN `www.{env-fqdn}` (prod apex + `www.profound-book-club.org`) |
| Cert deploy flow | `4ls-site/scripts/deploy-dev-cert.sh`, `deploy-infrastructure-dev.sh` | `DEPLOY_CERTS_ONLY=true`; `CERTIFICATE_ARN` from CF output or override |
| Cross-account DNS | `4ls-org/docs/route53-custom-domain-pattern.md` | CDK **must not** create Route53 records — set `createRoute53Records: false`; all records in Terraform |
| Terraform DNS file | `4ls-org/infrastructure/modules/common/route53-4ls-site.tf` | Validation CNAMEs + alias A records; CloudFront zone ID `Z2FDTNDATAQYW2` |
| Custom-domains write-up | `4ls-site/docs/posts/custom-domains.md` | Architectural rationale for CDK/Terraform split |
| www behavior | Epic + Q3 decision | **301 redirect on all envs** via CloudFront Function: `www.dev.` → `dev.`, `www.stage.` → `stage.`, `www` → apex on prod |

**Key difference from 4ls-site:** domains live on **`profound-book-club.org`** (dedicated hosted zone in org account), not
under `4legssoftware.com`. The zone **already exists** in Route 53 — Story 3 references it in Terraform and adds records;
no registrar NS cutover.

**Explicitly out of scope (Story 4+):**

- GitHub Actions workflow, OIDC deploy roles, stage/prod cert deploy and DNS cutover (Story 3 = **dev only**)
- `CERTIFICATE_ARN_STAGE` / `CERTIFICATE_ARN_PROD` GitHub secrets (Story 4)

## Questions

1. ~~**Registrar and NS delegation**~~ — **Resolved:** Domain is registered; **`profound-book-club.org` hosted zone
   already exists in org Route 53**. Segment 2 uses a Terraform data source (or import) for the existing zone — no new
   zone creation or registrar NS delegation.

2. ~~**Cert ARN storage for Story 4**~~ — **Resolved:** **GitHub secrets only** (mirror **4ls-site**:
   `CERTIFICATE_ARN_DEV`, `CERTIFICATE_ARN_STAGE`, `CERTIFICATE_ARN_PROD`). Story 3 records ARNs in story **Notes** and
   adds dev secret when dev cert is issued; Story 4 wires stage/prod secrets into the pipeline.

3. ~~**www redirect scope**~~ — **Resolved:** **All environments** — each env cert/distribution includes its `www`
   hostname with **301 → canonical hostname** (CloudFront Function): `www.dev.profound-book-club.org` → `dev.…`,
   `www.stage.…` → `stage.…`, `www.profound-book-club.org` → apex on prod.

4. ~~**SPA / anchor error handling**~~ — **Resolved:** **403/404 → 200 `/404.html`** (match **4ls-site**). Ensure build
   emits `404.html` in `dist/` (add in Segment 1 or site build if missing).

5. ~~**Stage/prod infra apply in Story 3**~~ — **Resolved:** **Dev end-to-end only** in Story 3 (cert, Terraform records,
   CDK deploy, content sync, HTTPS verify). **Stage and prod** infra (Segments 4–5 pattern) **deferred to Story 4**
   alongside the pipeline. Story 3 still lands CDK + Terraform zone scaffolding usable by all envs; only **dev** is
   applied/deployed in this story.

## Implementation Checklist

### Segment 1 — CDK scaffold + synth verification (`profound-book-club`)

- [x] Ensure site build emits **`404.html`** in `dist/` (static copy or minimal page) for CloudFront error responses
- [x] Add `infrastructure/` package (PNPM, TypeScript, CDK) mirroring **4ls-site** layout — `package.json`, `cdk.json`,
  `tsconfig.json`, `bin/`, `lib/`
- [x] Implement constructs: `WebsiteBucket`, `CloudFrontDistribution` (OAC, `index.html` root, **403/404 → `/404.html`**,
  IPv6, `PriceClass_100`), `AcmCertificate`, `CertificateStack` (`us-east-1`)
- [x] Implement main stack: S3 + CloudFront; **no Route53 construct** (`createRoute53Records: false`); wire
  `CERTIFICATE_ARN` / `skipDomainAliases` for cert-validation bootstrap
- [x] CloudFront Function (viewer-request) on **each environment** — 301 `www` hostname → canonical FQDN for that env
- [x] Environment config in `bin/` — account IDs from Story 1; FQDNs and bucket names per table above; region `us-east-2`
  (main), `us-east-1` (cert stack)
- [x] Stack outputs: `BucketName`, `DistributionId`, `WebsiteURL`, `CertificateArn` (cert stack)
- [x] Add CDK snapshot or synth tests + assertions on key resources (bucket block public access, OAC origin, error
  responses, prod www function when cert present)
- [x] Run: `pnpm install` (root + `infrastructure/`), `pnpm run build` (infra tsc), `cd infrastructure && pnpm run synth`
  for dev/stage/prod
- [x] **Stop for review:** synth output and test results before any AWS deploy

### Segment 2 — Org hosted zone reference (`4ls-org`)

- [x] Add `route53-profound-book-club.tf` — `data "aws_route53_zone" "profound_book_club"` for existing
  `profound-book-club.org` zone (org root account); import into state if zone was created outside Terraform
- [x] Record hosted zone ID in story **Notes**
- [x] Run: `terraform fmt`, `tflint`, `terraform validate`; TFC plan review (expect no zone-create churn — records only in
  later segments)
- [x] **Stop for review:** plan confirms data source resolves existing zone before ACM validation records

### Segment 3 — Dev environment end-to-end (both repos)

**Repo: `profound-book-club`**

- [ ] Add `scripts/deploy-dev-cert.sh` and `scripts/deploy-infrastructure-dev.sh` (mirror **4ls-site**; profile
  `profound-book-club-dev`; stack names prefixed e.g. `ProfoundBookClub-…`)
- [ ] Deploy cert stack to dev account (`us-east-1`); capture validation CNAME name/value from ACM

**Repo: `4ls-org`**

- [ ] Add ACM validation CNAME record(s) for `dev.profound-book-club.org` and `www.dev.profound-book-club.org` in
  `route53-profound-book-club.tf`
- [ ] TFC apply; wait until ACM status `ISSUED`

**Repo: `profound-book-club`**

- [ ] Record issued cert ARN in story **Notes**; add **`CERTIFICATE_ARN_DEV`** GitHub repo secret (Story 4 adds stage/prod)
- [ ] Deploy main CDK stack with `CERTIFICATE_ARN`; capture CloudFront domain name

**Repo: `4ls-org`**

- [ ] Add A/AAAA alias records: `dev.profound-book-club.org` and `www.dev.profound-book-club.org` → dev CloudFront
  distribution
- [ ] TFC apply

**Repo: `profound-book-club`**

- [ ] Dev content deploy: `pnpm run build`, `aws s3 sync dist/ …`, `aws cloudfront create-invalidation --paths '/*'`
- [ ] Verify: `curl -I https://dev.profound-book-club.org` — HTTPS 200; `curl -I https://www.dev.profound-book-club.org`
  → **301** to dev canonical hostname
- [ ] **Stop for review:** dev custom domain live — **Story 3 deploy scope ends here**

### Segment 4 — Stage environment _(deferred to Story 4)_

- [ ] _Deferred_ — repeat dev cert → validation → stack → alias pattern for stage when pipeline lands

### Segment 5 — Prod environment _(deferred to Story 4)_

- [ ] _Deferred_ — prod cert (apex + www), validation, stack, aliases, and www redirect when pipeline lands

### Final — Verification, invalidation contract, and story close

- [ ] **Verification (Story 3 scope):** `https://dev.profound-book-club.org` and www redirect live; `pnpm run synth` and
  CDK tests pass; Terraform plan clean for org DNS changes applied in this story
- [ ] **Deferred AC:** stage/prod HTTPS verification completes in **Story 4** (per Q5)
- [ ] **Cache invalidation:** document approach for Story 4 — distribution ID from stack output / env; invalidate `/*`
  after S3 sync (see `.cursor/commands/deploy-dev-book-club.md`); GitHub secrets for cert ARNs (not SSM)
- [ ] **Coverage:** CDK snapshot tests + key property assertions (bucket, OAC, cert region, prod redirect function)
- [ ] **Long files:** after functional work, review any new infra file > ~200 lines for split (prefer small constructs like
  4ls-site)
- [ ] Record hosted zone ID, cert ARNs, CloudFront domains, and distribution IDs in story **Notes** for Story 4

## Notes

**Route 53 hosted zone (`profound-book-club.org`):** `Z02858163FD16TMT7WSTS` — resolved via TFC apply on
`data.aws_route53_zone.profound_book_club` (`4ls-org` commit `7f90f88`).

_Populate during implementation — cert ARNs, CloudFront domain names, distribution IDs._
