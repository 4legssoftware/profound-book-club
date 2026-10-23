# Verify the book club site in Search Console and publish a sitemap [sc-637]

**Shortcut:** [sc-637](https://app.shortcut.com/4legssoftware/story/637)

**Related epic:** [`e636-site-analytics.md`](./e636-site-analytics.md), Story 1. It covers the search side of
[ADR-002](../adrs/adr-002-site-analytics.md). The on-site Umami work is [sc-611](./s611-self-hosted-umami.md).

## Summary

See how the site shows up in Google search (queries, impressions, clicks, indexing) by verifying profound-book-club.org
in Google Search Console and submitting a sitemap. Nothing runs on the site, and the CSP is unaffected.

## Acceptance Criteria

- [ ] profound-book-club.org is verified in Google Search Console as a Domain property, via a DNS TXT record managed in
  Terraform (Route 53, root account)
- [ ] A sitemap.xml is published on the site and submitted in Search Console

## Scope

**In**

- Search Console Domain verification through Terraform-managed DNS (`4ls-org`)
- Sitemap and `robots.txt` generation/publishing through the existing pipeline

**Out**

- On-site analytics ([sc-611](./s611-self-hosted-umami.md))
- Broader SEO work (meta descriptions, Open Graph, schema.org markup, canonical link tags)
- `noindex` for stage and dev. Out of scope at kickoff, then added as Segment 3

## Split recommendation

One story is enough. The epic already pairs the sitemap and the DNS verification because they are one outcome: a
verified property with a sitemap submitted. The two repos ship as separate segments below. Splitting them into Shortcut
tickets would leave a sitemap story that cannot close the second acceptance criterion.

## Related implementation

- `astro.config.mjs` sets `site: 'https://profound-book-club.org'` and `output: 'static'`. Sitemap URLs use that
  canonical apex on every deploy, including stage and dev. There is no `robots.txt` under `public/` (only
  `favicon.svg`) and no sitemap integration. The layout has no canonical link tags; adding them is out of scope.
- Pages are `/`, `/conversations`, and `/404`. Leave `/404` out of the sitemap.
- The pipeline builds `dist/` once, syncs it to stage and then prod, and invalidates `/*`. No CloudFront behavior
  change is needed for `.xml` or `.txt`. `aws s3 sync` sets content types from the extension.
- `scripts/smoke-test.cjs` (279 lines) checks `/` and `/conversations`, then the `www` redirect. CI runs it with
  `ENVIRONMENT=stage` and `ENVIRONMENT=prod` against those hosts. Assert status and body content. The sitemap on stage
  still lists apex URLs, so do not require the sitemap host to match the host under test.
- Dev content deploys from localhost with `source scripts/pro-dev.sh` and `./scripts/deploy-content-dev.sh` (build,
  sync, invalidate `/*`).
- `4ls-org` has no `TXT` records today. The apex in
  `infrastructure/modules/common/route53-profound-book-club.tf` is an `A` alias, which can sit beside a new `TXT`
  record set. Route 53 allows one `TXT` record set per name. If
  [sc-613](../other-features/sc-613-club-announcements.md) puts Buttondown's SPF on the apex first, add the Google
  token to that record set instead of creating a second one. The verification token is public DNS; committing it is
  fine.

## Questions

1. **sitemap.xml file name.** `@astrojs/sitemap` writes `sitemap-index.xml` plus `sitemap-0.xml`, not a single
   `sitemap.xml`. Google accepts a sitemap index.
   - **Decided: (a).** Use the integration, submit `sitemap-index.xml`, and reference it from `robots.txt`.
   - (b) Write a small `src/pages/sitemap.xml.ts` endpoint if the literal file name matters. Not chosen.

## Implementation Checklist

### Segment 1: Sitemap and robots.txt (`profound-book-club`)

- [x] Extend `scripts/smoke-test.cjs` first. `/sitemap-index.xml`, `/sitemap-0.xml`, and `/robots.txt` return 200.
  `robots.txt` includes `Sitemap: https://profound-book-club.org/sitemap-index.xml`. The sitemap lists the home page
  and `/conversations` on the apex, and does not list `/404`.
- [x] Add `@astrojs/sitemap` to `astro.config.mjs` and filter out `/404`
- [x] Add `public/robots.txt` with `Sitemap: https://profound-book-club.org/sitemap-index.xml`
- [x] Check `dist/` locally: the sitemap lists only canonical apex URLs (`/` and `/conversations/`)
- [x] `pnpm run lint`, `pnpm run check`, `pnpm run format:check`, and `pnpm run build` pass
- [x] Deploy content to dev (`source scripts/pro-dev.sh`, then `./scripts/deploy-content-dev.sh`).
  `ENVIRONMENT=dev pnpm run smoke-test` passes (10 passed, 2026-10-20)
- [x] Commit and push to `main`: `[sc-637] Publish a sitemap and robots.txt` (`c3fea65`)
- [x] Pipeline is green and both stage and prod smoke tests pass before starting Segment 2. `c3fea65` was first pushed
  behind a `[skip ci]` docs commit, so GitHub skipped that push. It deployed with `247e651`
  ([run 39635002405](https://github.com/4legssoftware/profound-book-club/actions/runs/39635002405), 2026-10-21)

### Segment 2: Search Console Domain verification (`4ls-org`, plus manual steps in Search Console)

- [x] Manual: add `profound-book-club.org` as a **Domain** property in Search Console and copy the
  `google-site-verification=…` token
- [x] Add an apex `TXT` record to `route53-profound-book-club.tf`, or extend sc-613's record set if it already exists.
  New record set `profound_book_club_apex_txt`; sc-613 had not added SPF yet
- [x] From `4ls-org/infrastructure`: `terraform fmt -check -recursive`, `terraform init -backend=false`,
  `terraform validate`, `tflint`, and `tfsec` pass. **Stop and review the TFC plan** (expect exactly one TXT record
  added or changed). Plan: 1 to add, 0 to change, 0 to destroy
- [x] Commit and push to `main` in `4ls-org`: `[sc-637] Add the Search Console verification record for
  profound-book-club.org` (`58b24ae`, [run 39842213431](https://github.com/4legssoftware/4ls-org/actions/runs/39842213431))
- [x] TFC apply succeeds, `dig TXT profound-book-club.org` shows the token, and Search Console reports the property as
  verified (2026-10-22)
- [x] Manual: submit `https://profound-book-club.org/sitemap-index.xml` in Search Console and note the date here.
  Submitted and read 2026-10-22, status Success. Discovered pages showed 0 at first, because Google reads the child
  `sitemap-0.xml` separately; expect 2

### Final

- [x] Verification: the Segment 1 pipeline run is green, the Segment 2 TFC plan was clean, and Search Console shows the
  property verified and the sitemap read successfully
- [x] Coverage: this segment does not touch CDK. The smoke test is the check that the sitemap and `robots.txt` stay
  published
- [x] Long files: `smoke-test.cjs` reached 343 lines after Segment 1. Split into `scripts/smoke-test.ts` plus modules
  under `scripts/smoke-test/` (target, http, results, and one file per check, each under 75 lines), matching
  `scripts/external-links/`, and run with `tsx`. Output against dev is identical before and after, for both a passing
  run and a forced-failure run
- [x] See the `story-kickoff` skill for the evaluation and refactor steps of the story lifecycle

### Segment 3: Keep stage and dev out of search, and return real 404s (`profound-book-club`, CDK)

Added after the Final block, at the user's request, instead of as a separate story.

- [x] CDK tests first: stage and dev get a `ResponseHeadersPolicy` with `X-Robots-Tag: noindex` on the default
  behavior; prod has none; both error responses return status 404
- [x] `cloudfront-distribution.ts`: add the noindex policy for non-prod, and change the 403 and 404 error responses
  from status 200 to 404. Still serves `/404.html`
- [x] Smoke test: new `check-indexing.ts` expects the header on stage and dev and its absence on prod, and expects a
  missing path to return 404 with the not-found page
- [x] `pnpm test` and synth for dev, stage, and prod pass. Dev `cdk diff` showed only the policy, the two status codes,
  and the policy reference
- [x] Deploy dev infrastructure from localhost. `ENVIRONMENT=dev` smoke test passes 12 of 12 (2026-10-23)
- [ ] Commit and push to `main`: `[sc-637] Keep stage and dev out of search and return real 404s`
- [ ] Pipeline is green, and the stage and prod smoke tests pass, including the new checks

## Notes

- A Domain property also covers `stage.` and `dev.`. Those hosts serve the same build as prod, so a build-time
  `robots.txt` or meta tag can't tell them apart. Segment 3 sends `X-Robots-Tag: noindex` from the stage and dev
  CloudFront distributions instead.
- CloudFront used to serve `/404.html` with status 200 for missing paths, which Google reports as soft 404s. Segment 3
  returns 404.
- [sc-611](./s611-self-hosted-umami.md) adds a CSP `ResponseHeadersPolicy` to the same default behavior, and a behavior
  takes only one policy. sc-611 has to merge the two: security headers everywhere, plus `X-Robots-Tag` for stage and
  dev only.
