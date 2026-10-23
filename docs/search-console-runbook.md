# Search Console runbook

How to read [Google Search Console](https://search.google.com/search-console) for the `profound-book-club.org` Domain
property. The property, the verification TXT record, and the submitted sitemap are recorded in
[`s637-search-console-and-sitemap.md`](./e636-site-analytics/s637-search-console-and-sitemap.md). Why this data matters
is in [`adr-002-site-analytics.md`](./adrs/adr-002-site-analytics.md): queries, impressions, clicks, and indexing.

Check about once a month, and again after a page is added or the sitemap changes. Open the Domain property
`profound-book-club.org` (the one with the `sc-domain:` prefix).

## What to check

**Sitemaps** (Indexing → Sitemaps). `https://profound-book-club.org/sitemap-index.xml` shows status Success. Google
reads the child `sitemap-0.xml` on its own, so discovered pages can sit at 0 on the index row. Open the child sitemap
and confirm it lists only:

- `https://profound-book-club.org/`
- `https://profound-book-club.org/conversations/`

**Pages** (Indexing → Pages). This report lags the sitemap. A new property shows "Processing data, please check again in a
day or so" for several days, and an empty chart in that state means Google has not finished the report yet. Once it
fills in, confirm the indexed URLs are the apex home page and `/conversations/`. URL inspection on each URL answers
sooner for that single page.

**Performance** (Search results). Set the range to the last three months, then look at queries and pages.

- Queries: total clicks, impressions, and average position. Note branded queries ("Profound Book Club", book titles the
  club has read) and any other query that earns impressions.
- Pages: which URL Google shows, and whether clicks land on `/` or `/conversations/`.

## What to discover

- Which queries show the site, and which of those turn into clicks. Impressions without clicks are still useful: they
  say the site is being offered for that query.
- Whether a new page (a new conversation, a future route) has been crawled and indexed after it ships. Add it to the
  sitemap by publishing the page; `@astrojs/sitemap` picks up every page except `/404`.
- Whether search traffic and on-site pageviews (Umami, once [sc-611](./e636-site-analytics/s611-self-hosted-umami.md)
  is live) tell the same story about which page people open.

## What to look out for

- Sitemap status other than Success, or a discovered URL besides the apex home page and `/conversations/`. `/404` must
  stay out of the sitemap.
- `www.profound-book-club.org` URLs in the pages or performance reports. `www` 301-redirects to the apex, and the apex
  is the canonical host.
- `stage.profound-book-club.org` or `dev.profound-book-club.org` in the index or the performance report. The Domain
  property covers those hosts. Stage and dev send `X-Robots-Tag: noindex`; an indexed stage or dev URL means that
  header is missing or Google has not recrawled since it was added.
- A drop to zero discovered pages on the child sitemap, or a "Couldn't fetch" status. Fetch
  `https://profound-book-club.org/sitemap-index.xml` and `https://profound-book-club.org/sitemap-0.xml` in a browser
  and confirm both return XML.
- Verification failing. The token lives in the apex TXT record in `4ls-org`
  (`infrastructure/modules/common/route53-profound-book-club.tf`). Route 53 allows one TXT record set per name. Another
  apex TXT value, such as Buttondown SPF from
  [sc-613](./other-features/sc-613-club-announcements.md), has to be added to that same record. Replacing the record
  drops the Google token and the property becomes unverified.
