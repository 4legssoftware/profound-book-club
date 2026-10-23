# Track Production pageviews with Umami Cloud on the book club site [sc-611]

**Shortcut:** [sc-611](https://app.shortcut.com/4legssoftware/story/611)

**Related epic:** [`e636-site-analytics.md`](./e636-site-analytics.md), Story 2. It covers the on-site half of
[ADR-002](../adrs/adr-002-site-analytics.md). The search side is [sc-637](./s637-search-console-and-sitemap.md). The
ADR's Decision, Consequences, and Revisit triggers bound this story. Self-hosting was rejected on 2026-10-23.

## Summary

See on-site traffic (visits, referrers, top pages) on profound-book-club.org with Umami Cloud Hobby, without cookies or
a consent banner. The script loads from `cloud.umami.is` on Production pages only. This story also adds the site's
first CSP.

## Acceptance Criteria

- [ ] profound-book-club.org is a website on an Umami Cloud Hobby account, and visits appear in that dashboard
- [ ] The Umami tracking script loads on every page in Production from `https://cloud.umami.is`, with this site's
  website id
- [ ] No cookies are set and no consent banner is needed
- [ ] The site's CSP (CloudFront ResponseHeadersPolicy) allows only `https://cloud.umami.is` for the script and the
  collection endpoint
- [ ] Acceptance and dev traffic do not pollute Production stats (the script does not load outside Production)

## Scope

**In**

- An Umami Cloud Hobby website for profound-book-club.org
- The Umami script on all Production pages
- A CloudFront ResponseHeadersPolicy with a fonts-aware CSP that allows `https://cloud.umami.is`, merged with the
  existing `X-Robots-Tag: noindex` header on stage and dev

**Out**

- Self-hosted Umami, a stats subdomain, database backups, and any `4ls-org` change
- Search Console and sitemap ([sc-637](./s637-search-console-and-sitemap.md))
- Analytics for the 4 Legs site or any second website
- Custom events or goals beyond pageviews (the mailing-list signup event belongs to
  [sc-613](../other-features/sc-613-club-announcements.md))
- GA4, PostHog, Plausible, FullStory, or LogRocket
- Broader SEO work

## Split recommendation

One story is enough. The epic already made this a single story, and the acceptance criteria are one outcome:
Production pageviews in Umami Cloud. The CSP and the tracker ship as two segments. There is no second repo.

## Related implementation

- **ADR-002 is already on `main`,** revised 2026-10-23 to Umami Cloud Hobby. This story does not re-decide the tool.
- **Build once, deploy twice.** `.github/workflows/main.yml` builds `dist/` once and syncs the same artifact to stage
  and then prod. A build-time "prod only" flag would break that, so the Production-only tracker has to be decided at
  runtime (Question 1). `www` 301s to the apex before HTML loads, so the tracker hostname is
  `profound-book-club.org` only.
- **A behavior takes one response-headers policy.** [sc-637](./s637-search-console-and-sitemap.md) Segment 3 already
  attached one. `infrastructure/lib/cloudfront-distribution.ts` sets `X-Robots-Tag: noindex` for stage and dev, and
  leaves prod with no policy. `profound-book-club-stack.test.ts` asserts that split (`ResponseHeadersPolicy` count 0
  on prod, 1 on stage and dev). This story replaces that with one policy per distribution: security headers and the
  CSP everywhere, and `X-Robots-Tag: noindex` only on stage and dev.
- **Fonts and styles.** `src/layouts/BaseLayout.astro` loads Google Fonts (`fonts.googleapis.com` for CSS,
  `fonts.gstatic.com` for font files) and two `application/ld+json` blocks. Browsers do not execute
  `application/ld+json`, so `script-src` does not affect them. The default `build.inlineStylesheets: 'auto'` inlines
  small stylesheets, which forces `'unsafe-inline'` into `style-src` (Question 2). The home-page smoke check already
  expects an external `/_astro/*.css` link.
- **Smoke tests** live in `scripts/smoke-test.ts` plus one module per check under `scripts/smoke-test/`. CDK tests
  are `pnpm run test` from `infrastructure/`.
- **Umami Cloud.** The Hobby script and collection endpoint are both `https://cloud.umami.is` (`/script.js` and
  `/api/send`). `data-domains` matches `window.location.hostname`. The website id is public. Store the account login
  in 1Password. Hobby has no heatmaps or session replay.

## Questions

Resolve these one at a time at kickoff, in this order.

1. **Production-only tracking with one build artifact.**
   - **Decided: (a).** A same-origin `public/analytics.js` loader injects the Umami script only when
     `location.hostname === 'profound-book-club.org'`, with `data-domains="profound-book-club.org"` as a second
     guard. The tracker never loads outside Production.
   - (b) Use `data-domains` alone. The script still loads on stage, which does not meet the criterion as written.
     Not chosen.
2. **CSP shape.** The acceptance criteria require a CloudFront `ResponseHeadersPolicy`. A `<meta>` CSP does not meet
   them on its own. Merge with the existing noindex policy. One policy per distribution.
   - **Decided: (a).** Enforce the policy directly, after a dev deploy shows a clean console.
     - `default-src 'self'`
     - `script-src 'self' https://cloud.umami.is`
     - `connect-src 'self' https://cloud.umami.is`
     - `style-src 'self' https://fonts.googleapis.com`
     - `font-src https://fonts.gstatic.com`
     - `img-src 'self' data:`
     - `frame-ancestors 'none'`
     - `base-uri 'self'`
     - `form-action 'self'`

     Set `build.inlineStylesheets: 'never'` in `astro.config.mjs` so `style-src` does not need `'unsafe-inline'`.
     Include HSTS, `nosniff`, `Referrer-Policy`, and frame options in the same policy. Stage and dev keep
     `X-Robots-Tag: noindex`. Prod does not send that header.
   - (b) Ship `Content-Security-Policy-Report-Only` first, then enforce in a follow-up commit once stage is clean.
     Report-only does not meet the acceptance criterion until the enforcing commit ships. Not chosen.

## Implementation Checklist

Kickoff chose (a) for both questions. This checklist matches those decisions.

### Segment 1: Site CSP and security headers (`profound-book-club`, CDK and Astro config)

- [x] Update `profound-book-club-stack.test.ts` first. The prod assertion that counts
  `AWS::CloudFront::ResponseHeadersPolicy` as 0 has to change. Assert that each distribution's default behavior has
  one policy and that:
  - `script-src` and `connect-src` allow `'self'` and `https://cloud.umami.is`, and nothing else
  - `font-src` and `style-src` allow the Google Fonts origins
  - HSTS and `nosniff` are present
  - stage and dev still send `X-Robots-Tag: noindex`
  - prod does not send `X-Robots-Tag`
- [x] Add `infrastructure/lib/security-headers-policy.ts` and attach it in `cloudfront-distribution.ts`, including the
  noindex header only when `environment !== 'prod'`. HSTS is two years with `includeSubDomains`, and no preload.
  `Referrer-Policy` is `strict-origin-when-cross-origin`. `X-Frame-Options` is `DENY`
- [x] Set `build.inlineStylesheets: 'never'` in `astro.config.mjs`
- [x] Two page details would have violated that policy, so they moved with the dev content deploy. Font `preconnect`
  hints are a `connect-src` request, and that directive does not allow the font hosts. The hero chart's
  `animation-delay` attributes are inline styles. The delays are now in the hero stylesheet, in the same order
- [x] Deploy dev infrastructure from localhost (`source scripts/pro-dev.sh`, then
  `./scripts/deploy-infrastructure-dev.sh`), then dev content (`./scripts/deploy-content-dev.sh`). `/`,
  `/conversations`, and a missing path send the policy. Fraunces, Inter, and JetBrains Mono load. A headless Chrome
  pass logged no CSP violations. `ENVIRONMENT=dev pnpm run smoke-test` passed 13 of 13, including noindex (2026-10-23)
- [x] `pnpm run lint`, `pnpm run check`, `pnpm run format:check`, `pnpm run build`, plus infrastructure `pnpm run test`
  and `pnpm exec cdk synth`, pass
- [ ] Commit and push to `main`: `[sc-611] Add a CSP and security headers to the site distribution`
- [ ] Pipeline is green, and a manual check of the stage and prod consoles shows no CSP violations, before starting
  Segment 2. Stage and dev still send `X-Robots-Tag: noindex`

### Segment 2: Track Production pageviews (`profound-book-club`, site, plus the Umami account)

- [ ] Create the Umami Cloud Hobby account, store the login in 1Password, and add a website for
  `profound-book-club.org`. Record the website id here. It is public:
- [ ] Extend the smoke tests first: every page references `/analytics.js`, and `/analytics.js` returns 200. Do not
  require `cloud.umami.is` in the HTML. The loader decides that in the browser
- [ ] Add `public/analytics.js`, which injects `https://cloud.umami.is/script.js` with `data-website-id` and
  `data-domains="profound-book-club.org"`, only when `location.hostname === 'profound-book-club.org'`
- [ ] Reference the loader from `BaseLayout.astro` with `defer`
- [ ] `pnpm run lint`, `pnpm run check`, `pnpm run format:check`, and `pnpm run build` pass
- [ ] Deploy dev content from localhost (`source scripts/pro-dev.sh`, then `./scripts/deploy-content-dev.sh`) and
  confirm in DevTools that dev never requests `cloud.umami.is`
- [ ] Commit and push to `main`: `[sc-611] Track Production pageviews with Umami Cloud`
- [ ] Pipeline is green, then verify:
  - stage makes no requests to `cloud.umami.is`
  - prod loads the script under the CSP with no violations
  - a visit shows up in the Umami dashboard
  - no cookies are set on prod (DevTools, Application, Cookies)
  - `ENVIRONMENT=stage` and `ENVIRONMENT=prod` smoke tests pass

### Final

- [ ] Verification: both segment pipeline runs are green. CDK tests and synth passed. The site build passed. No
  `4ls-org` change was required
- [ ] Coverage: the site stack asserts the security headers policy and the noindex split. The smoke test asserts that
  every page references `/analytics.js`
- [ ] Long files: review any non-test file over 200 lines, especially `cloudfront-distribution.ts` and
  `security-headers-policy.ts`. If one needs splitting, do it as its own segment: commit, push, and wait for the
  pipeline
- [ ] Check every acceptance criterion against what is live in prod, and record the date of the first week of data
- [ ] See the `story-kickoff` skill for the evaluation and refactor steps of the story lifecycle

## Notes

- Cookies stay off this site because Umami Hobby makes that easy. A later site can choose a tool that sets cookies if
  the comparison favors it. That choice is outside this story.
- sc-613 extends the CSP from Segment 1 with a `form-action` entry for Buttondown. It also adds an Umami signup event
  on this same Hobby website.
- Shortcut used to link `docs/other-features/sc-611-site-analytics.md`. The story doc is this file.
