# Story 1 — AWS Organization [sc-535]

**Related epic:** [`epic-website-foundation.md`](./epic-website-foundation.md) — foundational Story 1; no dependencies.
Story 2 (repo scaffold) can run in parallel. Stories 3+ need these accounts.

**Description**

In `4ls-org`, create a dedicated OU for the Profound Book Club workload and provision `dev`, `stage`, and `prod`
accounts under it with baseline guardrails.

**Acceptance criteria**

- [x] New OU created under `4ls-org` for profound-book-club

- [x] `dev`, `stage`, and `prod` accounts created and moved into the OU

- [x] Baseline SCPs applied (region restriction + guardrails consistent with `4ls-org` conventions)

- [x] Access verified for each account (IAM Identity Center / SSO roles)

- [x] Cost allocation tags set per account

**Dependencies:** none (foundational)

**Suggested labels:** `infra`, `aws-org`

**Repo:** `4ls-org` only (no `profound-book-club` app or CDK changes in this story).

## Split recommendation

One Shortcut story is appropriate. The epic already phases org setup as Story 1; scope is a single Terraform
workstream in one repo with a natural internal segment order (org → policies → SSO → verify). Defer Route 53, GitHub
OIDC, and CDK bootstrap to Stories 3–4.

## Related implementation

Mirror existing workload patterns under `4ls-org/infrastructure/modules/common/`:

| Concern | Reference files | Notes |
|--------|-----------------|-------|
| OU hierarchy + accounts + cost tags | `organizations.tf` (`four-legs-site`, `wealthtrax` OUs) | Parent OU: `4-legs-software`. Per-account tags: `Environment`, `System`, `Env`, `Owner` (see existing accounts). |
| Cross-account providers | `4ls-site-bootstrap.tf`, `wealthtrax-bootstrap.tf` | `OrganizationAccountAccessRole` assume-role providers per env (`us-east-2`). |
| Baseline SCP + tag policy | `policies.tf` (wealthtrax) | **Not used for this story** — parent OU inheritance only (4ls-site pattern). |
| SSO permission sets + assignments | `sso-4ls-site-permission-sets.tf`, `sso-4ls-site-assignments.tf`, `sso-4ls-site-*-policy.tf` | Permission-set naming: `{workload}-{Env}-v1`. Assignments use `data.aws_identitystore_user`. |
| Identity Center locals | `sso-identity.tf` | Reuse existing `local.sso_instance_arn` / user data sources. |
| Delivery | `.github/workflows/tf-org.yml`, `README.md` | Merge to `main` → lint/validate → Terraform Cloud plan/apply. **Do not apply org changes locally** except `terraform plan` for review. |

**Explicitly out of scope (later stories):**

- Route 53 hosted zone / DNS records (`route53-4ls-site.tf` pattern) — Story 3
- GitHub Actions OIDC deploy roles (`4ls-site-github-oidc.tf` pattern) — Story 4
- CDK bootstrap or stack deploy in child accounts — Story 3

When authoring SSO inline policies, prefer `${aws_organizations_account.*.id}` interpolation instead of hardcoded
account IDs (4ls-site policies predate that pattern).

## Questions

1. ~~**Shortcut ticket id**~~ — **Resolved:** `[sc-535]`

2. ~~**SCP baseline**~~ — **Resolved:** parent inheritance only (4ls-site style). No dedicated
   `profound-book-club` SCP or tag policy in Terraform; accounts inherit guardrails from parent OUs.

3. ~~**SSO assignees**~~ — **Resolved:** `rob.park` only (matches 4ls-site).

4. ~~**Account naming & email**~~ — **Resolved:** OU `profound-book-club`; accounts
   `profound-book-club-{dev,stage,prod}`; emails `robert.park+profound-book-club-{env}@4legssoftware.com`;
   `System = profound-book-club` cost tag.

5. ~~**SSO policy breadth for Story 1**~~ — **Resolved:** full dev/stage/prod inline policies adapted
   from `4ls-site` now (CDK/S3/CloudFront-shaped), using Terraform account ID refs and `profound-book-club`
   resource prefixes.

## Implementation Checklist

**Repo:** `4ls-org` unless noted.

### Segment 1 — OU, accounts, and bootstrap providers

- [x] Add `profound-book-club` OU under `aws_organizations_organizational_unit.four-legs-software` in
  `organizations.tf`
- [x] Add `profound-book-club-dev`, `-stage`, `-prod` accounts with cost allocation tags (`System`, `Env`,
  `Environment`, `Owner`) consistent with existing workloads
- [x] Add assume-role provider aliases in `profound-book-club-bootstrap.tf` (new file, mirror bootstrap pattern)
- [x] Run locally: `terraform fmt`, `tflint`, `terraform init -backend=false`, `terraform validate`
- [x] **Stop for review:** TFC apply confirmed — accounts visible in Organizations (commit `cfe90f9`)

### Segment 2 — ~~Baseline SCP and tag policy~~ (skipped)

**Decision:** parent inheritance only — no new resources in `policies.tf` for this workload.

- [x] Confirm parent OU SCPs apply to new accounts after Segment 1 apply (Organizations console spot-check)

### Segment 3a — SSO permission sets and assignments

- [x] Add `sso-profound-book-club-permission-sets.tf` — Dev / Stage / Prod permission sets (`profound-book-club-*-v1`)
- [x] Add `sso-profound-book-club-assignments.tf` — account assignments for `rob.park` (dev, stage, prod)
- [x] Re-run fmt / tflint / validate; plan review

### Segment 3b — SSO inline policies (full 4ls-site adaptation; split commits if diff exceeds ~400 lines)

- [x] Add `sso-profound-book-club-dev-policy.tf` — full inline policy adapted from `sso-4ls-site-dev-policy.tf`
  (Terraform account ID refs; `profound-book-club` resource prefixes)
- [x] Add `sso-profound-book-club-stage-policy.tf` — stage inline policy (Route53 DNS validation deferred to Story 3)
- [x] Add `sso-profound-book-club-prod-policy.tf` — prod inline policy (tighter than dev/stage per 4ls-site pattern)
- [x] Re-run fmt / tflint / validate; plan review; TFC apply (commit `9f68014`)
- [x] **Local CLI access:** portal copy in `~/.aws/credentials` verified (`sts get-caller-identity` on dev); remove
  conflicting `sso_session` profiles from `~/.aws/config` when using portal copy

### Final — Apply, access verification, and story close

- [x] Merge segments to `main`; GitHub Actions lint/validate/tfsec pass and TFC runs succeeded
- [x] **Access verification:** SSO portal + CLI (`aws sts get-caller-identity`) on dev; stage/prod account IDs recorded
- [x] Confirm cost allocation tags visible on each account in Organizations console
- [x] Confirm inherited SCPs apply (parent OU — no dedicated workload SCP)
- [x] Record new account IDs in story Notes (for Story 3 DNS/CDK and Story 4 OIDC)

## Notes

_All questions resolved — see **Questions** section for decisions._

**Local AWS CLI:** portal copy in `~/.aws/credentials` (`[profound-book-club-dev]`, etc.); do not duplicate with
`sso_session` profiles in `~/.aws/config`. Optional later: SSO profiles per
`4ls-org/docs/wealthtrax/wealthtrax-sso-migration.md` § CLI Access.

**Account IDs:**
- dev:   637905408031
- stage: 883353268059
- prod:  727508844146

**Cost allocation tags (per account):** `Application = profound-book-club`, `Component = website`, `System = profound-book-club`,
`Env` / `Environment` = dev|stage|prod, `Owner = platform`. `System` matches the 4ls-site / wealthtrax cost-tag convention;
`Application` / `Component` express product → deployable unit hierarchy.
