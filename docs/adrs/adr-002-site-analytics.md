# ADR: Site analytics for The Profound Book Club

- **Status:** Proposed
- **Date:** 2026-10-15
- **Decider:** Rob Park
- **Epic:** [epic 636](https://app.shortcut.com/4legssoftware/epic/636) — Site analytics
  ([`docs/e636-site-analytics/e636-site-analytics.md`](../e636-site-analytics/e636-site-analytics.md))
- **Stories:** [sc-637](https://app.shortcut.com/4legssoftware/story/637) — Search Console and sitemap
  ([`s637-search-console-and-sitemap.md`](../e636-site-analytics/s637-search-console-and-sitemap.md));
  [sc-611](https://app.shortcut.com/4legssoftware/story/611) — Self-hosted Umami
  ([`s611-self-hosted-umami.md`](../e636-site-analytics/s611-self-hosted-umami.md))

## Context

The club's goals are to sustain member interest and attract new participants. We currently have no way to tell whether new people are finding profound-book-club.org, how they arrive, or which pages they read.

Constraints and forces:

- The site is a static site (AWS CDK, CloudFront, S3) delivered through a trunk-based Commit → Acceptance → Production pipeline. It has no backend today.
- DNS is managed in Terraform (Route 53, org-level). App infrastructure is managed in CDK.
- A CloudFront ResponseHeadersPolicy with a CSP is an open security item. Any third-party script widens that CSP, so fewer and first-party origins are better.
- Traffic is small. We need trends and sources, not funnels, experiments, or session replay.
- We don't want cookies or a consent banner on a book club site.
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

**1. Google Analytics 4.** Free, but a heavy script that sets cookies and is built around marketing funnels. It needs consent handling and a broad CSP. Overkill for the questions above.

**2. PostHog.** Generous free tier. It's a full product-analytics suite (session replay, feature flags, A/B tests, surveys). Far more than we need, and a larger script and CSP footprint.

**3. Plausible (cloud).** Cookie-free, small script, polished dashboard, built-in Search Console integration. About $9/mo. The strongest hosted option, and the runner-up.

**4. Umami Cloud.** Cookie-free and open source. The free plan covers one website with six months of data retention. Script and collection endpoint live on Umami's domain.

**5. Umami self-hosted.** Same cookie-free, open-source (MIT) tool, running on our own infrastructure. Umami v3 requires PostgreSQL (MySQL support was dropped). Self-hosted installs get unlimited retention and heatmaps but no email reports. We own upgrades and backups.

**6. Cloudflare Web Analytics.** Free, cookie-free JS beacon that works without proxying through Cloudflare. Fewer features and another vendor's origin in the CSP.

**7. CloudFront standard logs.** Zero JavaScript and no CSP change. Logs are crude (bot traffic, no visit or session concept) and need a query layer (for example Athena) before they answer anything.

## Decision

Adopt **Google Search Console** for the search side and **self-hosted Umami** for on-site traffic, to begin with.

- Search Console is verified as a Domain property via a TXT record in Terraform (Route 53, org root account), and a
  `sitemap.xml` is published through the pipeline and submitted.
- Umami v3 runs on our own AWS infrastructure behind a first-party subdomain (for example `stats.profound-book-club.org`)
  over HTTPS. The tracking script and collection endpoint are served from that subdomain. The CSP allows only that
  subdomain for the script and the collection endpoint. If the ResponseHeadersPolicy is not in place yet, add the
  allowance when the CSP is built.
- The tracking script loads on every Production page. Acceptance and dev traffic stay out of the stats.
- Tracking is pageviews only to start. Custom events are added by the story that needs them. The mailing-list signup
  event belongs to [sc-613](https://app.shortcut.com/4legssoftware/story/613)
  ([`adr-001-mailing-list.md`](./adr-001-mailing-list.md)).

Why self-hosted rather than Umami Cloud or Plausible:

- **First-party origin.** Script and data stay on our own domain, which keeps the CSP tight and is less likely to be blocked than a known analytics domain.
- **Data ownership and retention.** No six-month cap, and the data lives in our AWS account.
- **Direction of travel.** It matches the longer-term plan, also stated in
  [`adr-001-mailing-list.md`](./adr-001-mailing-list.md), of moving 4 Legs Software services onto our own AWS accounts,
  and it gives a reusable setup if WealthTrax or the 4 Legs site want analytics later.

## Consequences

**Positive**
- Search and on-site data together answer all three questions above.
- No cookies, no consent banner, and a CSP that only adds our own subdomain.
- No vendor lock-in. Umami is MIT-licensed, and the data is ours to keep or move.

**Negative / costs we accept**
- The site gains its first always-on backend: compute for Umami plus a PostgreSQL database. That is a real monthly cost, likely more than Umami Cloud's free plan and possibly more than Plausible, depending on how it's hosted.
- We own Umami upgrades, PostgreSQL backups, patching, and the security of an internet-facing dashboard and login. Reviewers rate self-hosted Umami a step less stable than Umami Cloud, with some upgrade issues reported in the v3 line.
- The hosting shape (a single small instance running Umami and PostgreSQL in containers, versus managed containers plus a managed database) is still to be chosen. That choice is made at story kickoff and recorded on the story, or in a follow-up ADR if it turns out to be significant.
- The Umami infrastructure becomes part of the Commit → Acceptance → Production pipeline, or deliberately sits outside it. Either way it needs an owner and a home in CDK or Terraform.

**Neutral**
- Search Console is a Google service, but it involves no script on the site and collects nothing from visitors.

**Follow-up work** — [sc-611](https://app.shortcut.com/4legssoftware/story/611)
- Back up the Umami PostgreSQL database automatically, and test a restore once.
- Use a non-default admin password, and remove or secure the default admin account.
- Broader SEO (meta descriptions, Open Graph, schema.org Event/Book markup) is a separate story.

## Revisit triggers

Reconsider this decision if any of these happen:

- Hosting and upkeep cost more than about $9/mo or noticeably more time than a hosted service would (then move to Umami Cloud or Plausible).
- An Umami upgrade breaks, or backups and patching start slipping.
- A second site (WealthTrax, 4 Legs) wants analytics. That's a chance to confirm the self-hosted setup is worth sharing, or to switch to a hosted plan.
- We need features Umami doesn't offer, such as funnels across multiple sites or email reports.
