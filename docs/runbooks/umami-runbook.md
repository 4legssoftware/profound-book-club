# Umami runbook

How to read [Umami Cloud](https://cloud.umami.is) for profound-book-club.org. The account is the Hobby plan. The login
is in 1Password. Why this data matters is in [`adr-002-site-analytics.md`](../adrs/adr-002-site-analytics.md): visits,
referrers, and pages. The implementation is recorded in
[`e636-site-analytics.md`](../changelogs/e636-site-analytics.md).

Check about once a month, alongside [Search Console](./search-console-runbook.md). Open the website
`profound-book-club.org`.

The website id is `637b201e-31d8-4a12-9e9d-1f6c64e0a1c2`. It is public. It is the `data-website-id` on the tracker.
Collection started on 2026-10-23. Hobby keeps events for six months, so the first week of data is 2026-10-23 through
2026-10-30, and anything older than six months drops off.

## What to check

**Pages.** Which URLs people open. The home page and `/conversations` are the pages that should lead. A spike on
`/404` means a broken link or a bad share.

**Referrers.** Where visits come from: search, LinkedIn, a community forum, or direct. Compare that list with the
Search Console queries for the same month. Impressions without clicks stay a Search Console fact. Umami only sees the
visits that arrive.

**Realtime.** After a deploy to production, open the site once in a private window and confirm the visit shows up
within a minute. Dev and stage must not appear. The loader in `public/analytics.js` injects the script only when
`location.hostname` is `profound-book-club.org`.

## What to discover

- Are new people finding the site, and from where?
- Which pages do they actually open?
- Does a Search Console query that earns clicks show up here as a visit from Google?

## What to look out for

- A visit from `dev.profound-book-club.org` or `stage.profound-book-club.org`. That means the hostname guard in
  `public/analytics.js` failed. Those hosts must not send pageviews.
- The browser console reports that `https://gateway.umami.is/api/send` was blocked. The script is loaded from
  `https://cloud.umami.is/script.js`, and pageviews are posted to the gateway. Both hosts belong in the CloudFront
  content-security policy: `cloud.umami.is` on `script-src`, and both hosts on `connect-src`. Umami has changed the
  collection host before. If sends stop, compare the blocked URL with `connect-src` in
  `infrastructure/lib/security-headers-policy.ts` before changing anything else.
- Cookies on `profound-book-club.org` after a normal page view. This install sets none, and there is no consent
  banner. A new cookie means the tracker or some other script changed.
- The Hobby limits: one website, 100,000 events a month, six months of retention. A second site does not join this
  account. Heatmaps and session replay are not part of this plan.
- A custom event, such as the mailing-list signup in
  [sc-613](../other-features/sc-613-club-announcements.md), is added by that story. This runbook stays pageviews until
  then.
