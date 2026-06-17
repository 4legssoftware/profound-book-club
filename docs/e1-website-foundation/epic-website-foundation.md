# Epic - Profound Book Club website foundation [sc-534]

## Goal

Stand up the Profound Book Club website (the Lovable single-page build) on AWS across **dev → stage → prod**, deployed
through a GitHub Actions pipeline modeled on **4ls-site**. The repo is scaffolded with **PNPM + TypeScript** from the
start so an **Astro** migration can drop in later without disturbing the pipeline or infrastructure.

## Context

- Current site is a **single long page** (one HTML build from Lovable) with a top menu that scans to anchor points on
  the page.

- Pipeline follows the 4ls-site / 3-stage flow: **Commit → Acceptance (stage) → Production (prod)**, no manual approval
  gate.

- **Trunk-based development**: no PR workflow — review → commit → push to `main` triggers the pipeline.

- **dev is never deployed by the pipeline** — it's updated manually from localhost (CDK). The pipeline handles stage and
  prod only.

- Auth from GitHub Actions → AWS uses **OIDC federation** (no long-lived keys).

- Domains: `dev.profound-book-club.org` / `stage.profound-book-club.org` / `profound-book-club.org`. **Apex is canonical
  **; `www` 301-redirects to the bare domain.

- **IaC ownership split** (per the 4ls custom-domains pattern): **CDK** owns app infrastructure (CloudFront, S3 origin,
  ACM cert request) in each environment account; **Terraform** owns org-level DNS (Route 53 hosted zone, validation
  records, alias records) in the `4ls-org` root account.

## Out of scope (this epic)

- Astro migration is captured as a **stretch / final story** and is optional — ship the static page first to bring the
  pipeline up, then migrate.

- Content corrections (book list ordering, look-and-feel polish) are tracked separately.

## Sequencing & dependencies

1. **Story 1 (AWS Org)** and **Story 2 (Repo + scaffold)** can run in parallel.

3. **Story 3 (DNS + infra)** needs the accounts from Story 1.

4. **Story 4 (Pipeline)** needs Stories 1, 2, and 3.

5. **Story 5 (Astro)** comes after the pipeline is established.

## Decisions (resolved)

- **Repo visibility:** public (will switch to private if a concern surfaces).

- **Apex behavior:** apex canonical; `www` → 301 → `profound-book-club.org`, mirroring 4ls-site.

- **Route 53 ownership:** the `4ls-org` root account owns all Route 53 hosted zones, mirroring 4ls-site (course-correct
  if found otherwise).
