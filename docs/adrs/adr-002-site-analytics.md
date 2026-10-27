# ADR: Site analytics for The Profound Book Club

- **Status:** Accepted
- **Date:** 2026-10-15
- **Revised:** 2026-10-23
- **Decider:** Rob Park
- **Epic:** [epic 636](https://app.shortcut.com/4legssoftware/epic/636) — Site analytics
  ([`docs/changelogs/e636-site-analytics.md`](../changelogs/e636-site-analytics.md))
- **Stories:** [sc-637](https://app.shortcut.com/4legssoftware/story/637) — Search Console and sitemap;
  [sc-611](https://app.shortcut.com/4legssoftware/story/611) — Umami Cloud pageviews

## Context

The club's goals are to sustain member interest and attract new participants. We currently have no way to tell whether new people are finding profound-book-club.org, how they arrive, or which pages they read.

Constraints and forces:

- The site is a static site (AWS CDK, CloudFront, S3) delivered through a trunk-based Commit → Acceptance → Production pipeline. It has no backend today.
- DNS is managed in Terraform (Route 53, org-level). App infrastructure is managed in CDK.
- A CloudFront ResponseHeadersPolicy with a CSP is an open security item. Any third-party script widens that CSP, so fewer origins are better. Stage and dev already send `X-Robots-Tag: noindex` from that policy. A behavior takes only one policy, so a CSP has to merge with it.
- Traffic is small. We need trends and sources, not funnels, experiments, or session replay.
- Cookies and a consent banner are worth avoiding when a tool that answers the questions can do without them. They are not a ban. A later product site, including the 4 Legs site, can accept cookies if a comparison favors that tool.
- Total cost matters more than the cheapest local option. That includes setup, upkeep, upgrades and backups, not just the monthly bill.

Search has also shifted. Most Google searches now end without a click, driven largely by AI Overviews. Long-tail and branded queries ("Deming book club") still click through at much higher rates, and those are the queries this site depends on. So search-side visibility data (impressions, queries) matters as much as on-site pageviews.

The questions we want answered:

1. Are new people finding the site, and from where (search, LinkedIn, community forums, direct)?
2. Which search queries show the site, and do they turn into visits?
3. Which pages do visitors actually read?

## Options considered

### Search side

**Google Search Console.** Free. Shows queries, impressions, clicks, and indexing problems. Domain verification works through a DNS TXT record in our Terraform-managed Route 53. Nothing runs on the site, so the CSP is unaffected. There is no comparable alternative for Google search data, so this is adopted alongside whichever on-site option we choose.

### On-site traffic

**1. Google Analytics 4.** Free, including across many sites. A heavy script (on the order of 180 KB) that sets cookies and is built around marketing measurement. Visitors in the EEA, the UK, and Switzerland need an opt-in consent gate before those cookies, under Google's EU user consent policy. A US visitor does not automatically get a banner. The CSP has to allow Google's tag and collection hosts.

**2. PostHog.** Free tier of 1 million analytics events a month, with no card. The default script stores a user id in a cookie for a year, and the bundle is about 100 KB before session replay. Cookieless mode counts a new visitor each day and drops location. The CSP has to allow the API host and an asset host.

**3. Plausible (cloud).** Cookie-free, small script, polished dashboard, built-in Search Console integration. Starter is about $9/mo for one site and three years of retention. The runner-up if we want a longer history than Umami's free plan.

**4. Umami Cloud.** Cookie-free, script about 2 KB. Hobby is free for one website, 100,000 events a month, and six months of retention. The script is served from `cloud.umami.is`. Pageviews are sent to `gateway.umami.is`. Pro is $20/mo for up to 20 sites and two years of retention. Heatmaps and session replay start on the Business plan, so Hobby stays pageviews-shaped.

**5. Umami self-hosted.** Same cookie-free tool on our own infrastructure. Umami v3 requires PostgreSQL. A `t4g.small` plus a public IPv4 address is about $16/mo, and we would own upgrades, backups, an internet-facing admin, and a prod SSO exception so localhost could deploy the stack. Rejected at story prep on 2026-10-23, before any instance was created. The cost and the upkeep fired the revisit trigger.

**6. FullStory and LogRocket.** Session replay, which is more than these questions need. LogRocket's free tier is gone.
Core starts at $176/mo. FullStory's free plan is 30,000 sessions a month (a session is a visit, not a request),
which would cover the book club and the 4 Legs site together. Reconsidered on 2026-10-23 for that reason, and
declined. Capture sets first-party cookies on the site's own domain. `fs_uid` lasts a year, and FullStory says a
session cannot be captured without it, so there is no cookieless mode and an anonymous visit is not logged.
`fs_cid` stores the consent choice for a year. Capture starts immediately unless the snippet waits for
`FS('start')`. Visitors in the EEA, the UK, and Switzerland need opt-in before that. A US visitor does not
automatically get a banner. Session replay is also the category that draws California wiretap claims.

**7. Cloudflare Web Analytics.** Free, cookie-free JS beacon that works without proxying through Cloudflare. Fewer features and another vendor's origin in the CSP.

**8. CloudFront standard logs.** Zero JavaScript and no CSP change. Logs are crude (bot traffic, no visit or session concept) and need a query layer (for example Athena) before they answer anything.

## Decision

Adopt **Google Search Console** for the search side and **Umami Cloud Hobby** for on-site traffic on profound-book-club.org.

- Search Console is verified as a Domain property via a TXT record in Terraform (Route 53, org root account), and a sitemap is published through the pipeline and submitted. This shipped in [sc-637](https://app.shortcut.com/4legssoftware/story/637).
- The book club site is the one website on an Umami Cloud Hobby account. The tracking script is `https://cloud.umami.is/script.js`. Collection is `https://gateway.umami.is/api/send`. The CSP allows the script host on `script-src` and both hosts on `connect-src`, and no other analytics origin.
- The tracking script loads on every Production page. Acceptance and dev traffic stay out of the stats.
- Tracking is pageviews only. Custom events are added by the story that needs them. The mailing-list signup event belongs to [sc-613](https://app.shortcut.com/4legssoftware/story/613) ([`adr-001-mailing-list.md`](./adr-001-mailing-list.md)).
- A second site, including the 4 Legs site, does not join this Hobby account. When that site wants stats, try another tool and compare it with Umami over time. Prefer a cookie-free tool there too when it still answers the questions.

Why Umami Cloud rather than self-hosting, GA4, or Plausible:

- **The self-hosted trigger already fired.** About $16/mo and a server we would have to patch, back up, and keep off the site pipeline. Hobby is $0 and Umami operates it.
- **Cookies stay off this site.** Hobby answers the three questions without cookies or a banner. GA4 and PostHog are free, and GA4 covers many sites, but both set cookies. That trade is available later for a product site. It is avoidable here.
- **One site is the plan.** The Hobby cap is acceptable because a second site will be its own comparison, not an automatic upgrade to Umami Pro.

## Consequences

**Positive**

- Search and on-site data together answer all three questions above.
- No cookies and no consent banner on the book club site. The CSP adds the Umami script host and the collection host.
- No server, database, backup job, or DNS record for analytics.

**Negative / costs we accept**

- Six months of retention. Older pageviews expire.
- The script and the data live on Umami's domains (`cloud.umami.is` and `gateway.umami.is`), and an ad blocker that knows those hosts can drop the script. Umami has changed the collection host before, which breaks a strict CSP until `connect-src` is updated.
- Hobby is one website. Watching the 4 Legs site in the same account would mean Umami Pro at $20/mo, which this decision does not buy.
- We depend on Umami's free plan. If that plan changes, the revisit triggers below apply.

**Neutral**

- Search Console is a Google service, but it involves no script on the site and collects nothing from visitors.

**Follow-up work** — [sc-611](https://app.shortcut.com/4legssoftware/story/611)

- Add the CSP, merged with the existing noindex header on stage and dev.
- Load the Umami script on Production pages only.
- Broader SEO (meta descriptions, Open Graph, schema.org Event/Book markup) is a separate story.

## Revision

On 2026-10-23 the decision changed from self-hosted Umami to Umami Cloud Hobby. Story prep showed that a usable
instance sits over the old ~$9/mo trigger and would be the site's first always-on backend. The first-party origin,
unlimited retention, and a shared AWS setup for later sites were the reasons to self-host. They lose to cost and
upkeep for a single low-traffic site. GA4 was considered again because it is free for many sites. It stays out of
this site because a cookie-free tool fits. FullStory was reconsidered the same day because its free
30,000 sessions a month would cover every current site. It stays out because capture requires the `fs_uid` cookie.
The decision remains Umami Cloud Hobby.

## Revisit triggers

Reconsider this decision if any of these happen:

- We need more than six months of pageview history. Plausible Starter, at about $9/mo, is the first hosted alternative.
- Umami changes the Hobby plan, or the free account becomes a burden.
- The 4 Legs site or WealthTrax is ready for analytics. Compare a cookie-free tool with whatever else is worth trying, including GA4 if the feature set earns the cookies. Do not assume Umami Pro.
- We need features Hobby does not offer, such as funnels or email reports.
