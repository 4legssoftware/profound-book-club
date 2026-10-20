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
- `noindex` for stage and dev (see Notes)

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

- [ ] Extend `scripts/smoke-test.cjs` first. `/sitemap-index.xml`, `/sitemap-0.xml`, and `/robots.txt` return 200.
  `robots.txt` includes `Sitemap: https://profound-book-club.org/sitemap-index.xml`. The sitemap lists the home page
  and `/conversations` on the apex, and does not list `/404`.
- [ ] Add `@astrojs/sitemap` to `astro.config.mjs` and filter out `/404`
- [ ] Add `public/robots.txt` with `Sitemap: https://profound-book-club.org/sitemap-index.xml`
- [ ] Check `dist/` locally: the sitemap lists only canonical apex URLs (`/` and `/conversations`)
- [ ] `pnpm run lint`, `pnpm run check`, `pnpm run format:check`, and `pnpm run build` pass
- [ ] Deploy content to dev (`source scripts/pro-dev.sh`, then `./scripts/deploy-content-dev.sh`).
  `ENVIRONMENT=dev pnpm run smoke-test` passes
- [ ] Commit and push to `main`: `[sc-637] Publish a sitemap and robots.txt`
- [ ] Pipeline is green and both stage and prod smoke tests pass before starting Segment 2

### Segment 2: Search Console Domain verification (`4ls-org`, plus manual steps in Search Console)

- [ ] Manual: add `profound-book-club.org` as a **Domain** property in Search Console and copy the
  `google-site-verification=…` token
- [ ] Add an apex `TXT` record to `route53-profound-book-club.tf`, or extend sc-613's record set if it already exists
- [ ] From `4ls-org/infrastructure`: `terraform fmt -check -recursive`, `terraform init -backend=false`,
  `terraform validate`, `tflint`, and `tfsec` pass. **Stop and review the TFC plan** (expect exactly one TXT record
  added or changed)
- [ ] Commit and push to `main` in `4ls-org`: `[sc-637] Add the Search Console verification record for
  profound-book-club.org`
- [ ] TFC apply succeeds, `dig TXT profound-book-club.org` shows the token, and Search Console reports the property as
  verified
- [ ] Manual: submit `https://profound-book-club.org/sitemap-index.xml` in Search Console and note the date here

### Final

- [ ] Verification: the Segment 1 pipeline run is green, the Segment 2 TFC plan was clean, and Search Console shows the
  property verified and the sitemap read successfully
- [ ] Coverage: this segment does not touch CDK. The smoke test is the check that the sitemap and `robots.txt` stay
  published
- [ ] Long files: `smoke-test.cjs` is already over 200 lines. If the new checks make it noticeably harder to follow,
  split it as its own segment: commit, push, and wait for the pipeline
- [ ] See the `story-kickoff` skill for the evaluation and refactor steps of the story lifecycle

## Notes

- A Domain property also covers `stage.` and `dev.`. Those hosts are crawlable today and serve the same sitemap, which
  points at apex URLs. Adding `noindex` or a stricter `robots.txt` for non-prod hosts is worth a small follow-up story.
  Because the build is shared, it would need a CloudFront-level header or function rather than a build-time file.
