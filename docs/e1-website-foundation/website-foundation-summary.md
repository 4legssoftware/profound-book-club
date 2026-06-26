# Website foundation — epic summary

**Epic:** Profound Book Club website foundation ([sc-534](https://app.shortcut.com/4ls/story/534))

The Profound Book Club single-page site is live on AWS across **dev → stage → prod**, deployed through a GitHub Actions pipeline modeled on **4ls-site**. The repo uses **PNPM + TypeScript + Astro 7**; infrastructure and the pipeline were established on a static v1 passthrough build, then the page migrated to Astro without changing deploy contracts.

## What shipped

| Layer | Outcome |
| ----- | ------- |
| **AWS org** (`4ls-org`) | `profound-book-club` OU with dev / stage / prod accounts, SSO permission sets, inherited baseline SCPs |
| **DNS + TLS** | `profound-book-club.org` hosted zone in org account; ACM certs per env in app accounts; alias A records; `www` → 301 to canonical hostname on every env |
| **App infra** (`profound-book-club/infrastructure/`) | CDK: S3 + OAC + CloudFront, cert stack in `us-east-1`, main stack in `us-east-2`; 403/404 → `/404.html` |
| **Site** | Astro static single page with anchor nav, typed content modules, global design tokens, styled 404 |
| **Pipeline** | `main.yml`: lint → build → CDK test → stage deploy + smoke → prod deploy + smoke; `pr.yml` for PR commit-stage; OIDC (no long-lived keys); Slack notify |
| **Dev deploy** | Manual from localhost only — never in pipeline |

## Domains

| Environment | URL | Deploy path |
| ----------- | --- | ----------- |
| dev | `https://dev.profound-book-club.org` | `./scripts/deploy-*-dev.sh` / `.cursor/commands/deploy-dev-book-club.md` |
| stage | `https://stage.profound-book-club.org` | Push to `main` (acceptance stage) |
| prod | `https://profound-book-club.org` | Push to `main` (after stage smoke) |

Apex is canonical; `www` 301-redirects to the bare domain (or env subdomain on dev/stage).

## Key decisions

See [website-foundation-decisions.md](./website-foundation-decisions.md) for durable trade-offs (IaC split, cert bootstrap, OIDC trust, trunk delivery, Astro prod gate, and follow-ups).

## Account IDs

| Environment | Account ID |
| ----------- | ---------- |
| dev | `637905408031` |
| stage | `883353268059` |
| prod | `727508844146` |

Route 53 zone ID: `Z02858163FD16TMT7WSTS`.

## OIDC deploy roles

| Environment | Role |
| ----------- | ---- |
| dev | `arn:aws:iam::637905408031:role/gha-deploy-dev` |
| stage | `arn:aws:iam::883353268059:role/gha-deploy-stage` |
| prod | `arn:aws:iam::727508844146:role/gha-deploy-prod` |

Prod trust policy: `refs/heads/main` only.

## Stories delivered

1. **AWS Organization** — OU, accounts, SSO, cost tags
2. **Repo + scaffold** — static v1, PNPM/TS/lint, `pnpm build` → `dist/`
3. **DNS + infra** — CDK + Terraform; dev end-to-end; stage/prod deferred to pipeline story
4. **GHA pipeline** — OIDC, full stage→prod pipeline, branch protection, PR workflow
5. **Astro migration** — componentized page, extended smoke tests, prod gate restored

## Out of scope (tracked separately)

- Content corrections (book ordering, copy polish)
- Multi-page routing, blog, SSR

## Retained references

- [website-foundation-decisions.md](./website-foundation-decisions.md) — epic decisions and follow-ups
- [README](../../README.md) — local dev, build, CI/CD, deploy table
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — fork + PR flow for external contributors
- [deploy-dev-book-club.md](../../.cursor/commands/deploy-dev-book-club.md) — manual dev deploy
- [design-assets/](../design-assets/) — favicon variants and branding explorations
- [route53-custom-domain-pattern.md](../../../4ls-org/docs/route53-custom-domain-pattern.md) — CDK/Terraform DNS split; includes dedicated-zone example (4ls-org)
