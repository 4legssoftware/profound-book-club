# Epic: Site analytics — Search Console and Umami Cloud

**Shortcut:** [epic 636](https://app.shortcut.com/4legssoftware/epic/636)

**ADR:** [`docs/adrs/adr-002-site-analytics.md`](../adrs/adr-002-site-analytics.md)

## Objective

Find out whether new people are finding profound-book-club.org, how they arrive, and which pages they read. Use Google
Search Console for the search side and Umami Cloud Hobby for on-site traffic. Keep cookies and a consent banner off
this site. A later site may choose differently.

## Context

The site is static: Astro, built once and synced to S3 behind CloudFront for stage and then prod. It has no backend.
Search Console, the sitemap, and `robots.txt` shipped in Story 1. Stage and dev send `X-Robots-Tag: noindex`. Prod has
no response-headers policy yet. DNS for the zone lives in
`4ls-org/infrastructure/modules/common/route53-profound-book-club.tf`.

ADR-002 picks the tools and sets the boundaries: pageviews only, Umami Cloud Hobby, and Production traffic only.
Self-hosting was rejected at Story 2 prep. A second site is a later comparison, not another website on this Hobby
account.

Work commits and deploys incrementally — at least once per story — through the pipeline: review → commit → push to
`main` → Commit → Acceptance → Production. Dev is refreshed manually from localhost. Terraform changes in `4ls-org`
apply through Terraform Cloud on push to `main`.

## Stories

### 1. Verify the site in Search Console and publish a sitemap [sc-637]

[s637-search-console-and-sitemap.md](./s637-search-console-and-sitemap.md)

Publish a sitemap and `robots.txt` with the site build. Verify profound-book-club.org as a Search Console Domain
property using a TXT record in `4ls-org` Terraform. Submit the sitemap. Nothing runs on the site, so the CSP is
unaffected.

### 2. Track Production pageviews with Umami Cloud [sc-611]

[s611-umami-cloud.md](./s611-umami-cloud.md)

Add profound-book-club.org to an Umami Cloud Hobby account. Load the tracker on Production pages only, from
`cloud.umami.is`. Add the site's first content-security policy on the existing CloudFront response-headers policy.
Its CSP accounts for Google Fonts and allows `cloud.umami.is` for the script and `gateway.umami.is` for collection. Stage and dev keep
`X-Robots-Tag: noindex`.

Story 1 has no dependencies and has shipped. Story 2 does not depend on it.

## Dependencies / Open questions

Tracked on the stories. Resolve before the story that needs them:

- **Shared apex TXT record with sc-613 (Buttondown SPF):** [Story 1](./s637-search-console-and-sitemap.md) landed the
  Search Console token. Route 53 allows one TXT record set per name, so sc-613 extends that record set.
- **sc-613** (mailing list) is outside this epic. It depends on Story 2 for its Umami signup event, and it adds a
  `form-action` entry to the CSP that Story 2 introduces.
