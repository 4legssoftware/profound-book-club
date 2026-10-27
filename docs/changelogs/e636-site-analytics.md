# Site analytics — epic summary

**Epic:** [epic 636](https://app.shortcut.com/4legssoftware/epic/636) — Search Console and Umami Cloud. Stories
[sc-637](https://app.shortcut.com/4legssoftware/story/637) and
[sc-611](https://app.shortcut.com/4legssoftware/story/611). Closed 2026-10-23.

We can now see whether new people find profound-book-club.org, how they arrive, and which pages they read. Google
Search Console covers the search side. Umami Cloud Hobby covers on-site pageviews. The site sets no cookies and shows no
consent banner. Why these tools, and when to reconsider, is in [ADR-002](../adrs/adr-002-site-analytics.md).

## What shipped

**Search Console and sitemap (sc-637).** `@astrojs/sitemap` publishes `sitemap-index.xml` (with child `sitemap-0.xml`)
and `public/robots.txt` points at it. `/404` stays out. The `profound-book-club.org` Domain property is verified by an
apex TXT record in `4ls-org` (`infrastructure/modules/common/route53-profound-book-club.tf`). The sitemap was submitted
and read with status Success on 2026-10-22.

**Stage and dev stay out of search.** The Domain property also covers `stage.` and `dev.`, and every environment serves
the same build, so those distributions send `X-Robots-Tag: noindex` from CloudFront. Prod does not. Missing paths now
return a real 404 (still serving `/404.html`) instead of a 200 that Google reports as a soft 404.

**First CSP and security headers (sc-611).** Every distribution has one `ResponseHeadersPolicy`
([`security-headers-policy.ts`](../../infrastructure/lib/security-headers-policy.ts)): an enforced CSP, HSTS for two
years with `includeSubDomains` and no preload, `nosniff`, `X-Frame-Options: DENY`, and
`strict-origin-when-cross-origin`. The noindex header is merged into the same policy for stage and dev, because a
CloudFront behavior takes only one.

**Production pageviews in Umami Cloud (sc-611).** [`public/analytics.js`](../../public/analytics.js) injects
`https://cloud.umami.is/script.js` only when the hostname is `profound-book-club.org`, with `data-domains` as a second
guard. Pageviews post to `gateway.umami.is`. Collection started 2026-10-23. Hobby keeps six months.

**Smoke tests** moved from `smoke-test.cjs` to `scripts/smoke-test.ts` plus one module per check under
`scripts/smoke-test/`, run with `tsx`. They cover the sitemap and `robots.txt`, noindex on stage and dev, 404 status,
page content on `/` and `/conversations`, and the analytics loader.

## Decisions worth knowing

- **Umami Cloud Hobby, not self-hosted.** The epic began as self-hosted Umami v3 and PostgreSQL at
  `stats.profound-book-club.org`. At story prep that came to about $16/mo plus the site's first always-on backend,
  which fired ADR-002's own revisit trigger, so we switched before building anything. GA4, PostHog, and FullStory were
  reconsidered and stayed out because they set cookies.
- **Production-only tracking is decided in the browser.** The pipeline builds once and syncs the same files to stage
  and prod, so a build flag can't tell them apart. The hostname check in the loader does.
- **The CSP has no `'unsafe-inline'`.** That is why `astro.config.mjs` sets `build.inlineStylesheets: 'never'`, the
  font `preconnect` hints are gone, and the hero chart's animation delays live in its stylesheet instead of `style=""`
  attributes. New pages need external stylesheets and scripts, and any new third-party origin needs a CSP change.
- **Enforced from the start, not Report-Only.** A clean headless Chrome pass on dev came first.
- **One apex TXT record set.** Route 53 allows one per name. sc-613's Buttondown SPF value must be added to the record
  that holds the Google token, not replace it.

## Surprises

- Umami Cloud serves the script from `cloud.umami.is` but collects on `gateway.umami.is`. The first prod deploy blocked
  sends until `connect-src` gained the gateway. Umami has moved that host before.
- Pushing a code commit behind a `[skip ci]` docs commit skips the code deploy too. The sitemap commit shipped with the
  next push.
- Search Console shows 0 discovered pages on the index row. Google reads the child sitemap separately.

## Follow-ups

- No automated check that pages render without CSP violations, and no `report-to` endpoint. CDK tests assert the header
  text only. Drafted as [csp-violation-checks.md](../other-features/csp-violation-checks.md).
- [sc-613](../other-features/sc-613-club-announcements.md) (mailing list) adds a `form-action` entry for Buttondown and
  an Umami signup event on this same Hobby website.
- Analytics for the 4 Legs site is a separate comparison, not a second website on this Hobby account (see ADR-002
  revisit triggers).

## Retained references

- [ADR-002: site analytics](../adrs/adr-002-site-analytics.md) — options, decision, revision, revisit triggers
- [Search Console runbook](../runbooks/search-console-runbook.md) — monthly checks of the property and sitemap
- [Umami runbook](../runbooks/umami-runbook.md) — monthly checks, website id, CSP troubleshooting
