# Epic: Site analytics — Search Console and self-hosted Umami

**Shortcut:** [epic 636](https://app.shortcut.com/4legssoftware/epic/636)

**ADR:** [`docs/adrs/adr-002-site-analytics.md`](../adrs/adr-002-site-analytics.md)

## Objective

Find out whether new people are finding profound-book-club.org, how they arrive, and which pages they read. Use Google
Search Console for the search side and self-hosted Umami for on-site traffic. Set no cookies and show no consent
banner.

## Context

The site is static: Astro, built once and synced to S3 behind CloudFront for stage and then prod. It has no backend,
no analytics, no sitemap, no `robots.txt`, and no CSP. DNS for the zone lives in
`4ls-org/infrastructure/modules/common/route53-profound-book-club.tf`.

ADR-002 picks the tools and sets the boundaries: pageviews only, a first-party stats subdomain, and Production traffic
only. If running costs pass about $9/mo, or upgrades and backups become a burden, we revisit the choice, with Plausible
and Umami Cloud as the fallbacks. The hosting shape and the pipeline home for Umami were left to kickoff, and they are
open questions on Story 2.

Work commits and deploys incrementally — at least once per story — through the pipeline: review → commit → push to
`main` → Commit → Acceptance → Production. Dev is refreshed manually from localhost. Terraform changes in `4ls-org`
apply through Terraform Cloud on push to `main`.

## Stories

### 1. Verify the site in Search Console and publish a sitemap [sc-637]

[s637-search-console-and-sitemap.md](./s637-search-console-and-sitemap.md)

Publish a sitemap and `robots.txt` with the site build. Verify profound-book-club.org as a Search Console Domain
property using a TXT record in `4ls-org` Terraform. Submit the sitemap. Nothing runs on the site, so the CSP is
unaffected.

### 2. Run self-hosted Umami and track Production pageviews [sc-611]

[s611-self-hosted-umami.md](./s611-self-hosted-umami.md)

Run Umami v3 and PostgreSQL on our own AWS infrastructure at `stats.profound-book-club.org` over HTTPS, with automated
backups, a tested restore, and a secured admin login. Load the tracker on Production pages only. Add the site's first
CloudFront `ResponseHeadersPolicy`. Its CSP accounts for Google Fonts and allows only the stats origin for analytics.

Story 1 has no dependencies and ships first. Story 2 is independent of Story 1, but it is larger, so it goes second.

## Dependencies / Open questions

Tracked on the stories. Resolve before the story that needs them:

- **Hosting shape, pipeline home, and HTTPS approach for Umami:** [Story 2](./s611-self-hosted-umami.md).
- **Shared apex TXT record with sc-613 (Buttondown SPF):** [Story 1](./s637-search-console-and-sitemap.md). Route 53
  allows one TXT record set per name, so whichever story lands second extends the existing record.
- **sc-613** (mailing list) is outside this epic. It depends on Story 2 for its Umami signup event, and it adds a
  `form-action` entry to the CSP that Story 2 introduces.
