# The pipeline catches pages that break the content-security policy

**Shortcut:** not created yet

**Background:** [`../changelogs/20261027-site-analytics.md`](../changelogs/20261027-site-analytics.md) and
[ADR-002](../adrs/adr-002-site-analytics.md)

## Summary

As the site maintainer, I want the pipeline to fail when a page triggers a CSP violation, so that a blocked font,
stylesheet, script, or Umami send is caught at deploy time instead of noticed later in a browser console.

The site has had an enforced CSP since sc-611
([`security-headers-policy.ts`](../../infrastructure/lib/security-headers-policy.ts)). The CDK tests assert the header
text, and the smoke tests fetch HTML without a browser. Nothing renders the pages under the policy. During sc-611 a
headless Chrome pass on dev and a manual console check on stage and prod were the only proof. The first prod deploy
blocked every Umami send until `connect-src` gained `gateway.umami.is`. No check caught it.

## Acceptance Criteria

- [ ] A browser check loads `/`, `/conversations`, and a missing path on stage and on prod after each deploy, and fails
  the smoke job if any `securitypolicyviolation` event fires or the console reports a blocked resource
- [ ] On prod, the check confirms the Umami script loaded from `https://cloud.umami.is` and its send to
  `https://gateway.umami.is` was not blocked by the CSP
- [ ] The prod check does not add pageviews to the Umami dashboard
- [ ] On stage, the check confirms no request goes to `cloud.umami.is`
- [ ] A deliberately broken CSP (for example, `connect-src` without the gateway) fails the check on dev, and the
  fixture is removed afterward

## Scope

**In**

- A headless browser check in `scripts/smoke-test/` or alongside it, run by the existing stage and prod smoke jobs
- Updates to the [Umami runbook](../runbooks/umami-runbook.md) troubleshooting section

**Out**

- Changing the CSP itself, unless the check finds a real violation
- Checking every external link or third-party page ([external-links.md](../external-links.md) covers links)
- The 4 Legs site

## Questions

1. **Browser check or violation reports?**
   - (a) A headless browser in the smoke jobs (Playwright Chromium is the likely tool). It runs on every deploy,
     needs no backend, and adds a browser download to CI.
   - (b) A `report-to` endpoint so real visitors report violations. The site has no backend, so this needs a Lambda
     or a third-party collector, and the collector's origin goes into the CSP. It finds problems only after visitors
     hit them.
   - (c) Both: (a) now, (b) later if traffic grows.
2. **Keeping the prod check out of Umami stats.** Options to evaluate: set `localStorage` `umami.disabled` before the
   page loads (confirm the current tracker still honors it), or let the send reach the CSP check and then abort the
   request in the browser tool (confirm CSP is evaluated before the tool intercepts it).
3. **Where the check lives.** Inside `pnpm run smoke-test`, or as a separate script and pipeline step so the
   HTTP-only smoke test stays fast and dependency-free on localhost.

## Implementation Checklist

## Notes

- Umami loads only on `profound-book-club.org`, so only the prod check exercises the analytics directives. Stage covers
  fonts, styles, and same-origin scripts.
- The CSP has no `'unsafe-inline'`. The most likely future violation is a new inline `style=""` attribute, an inline
  script, or a new third-party origin added without a CSP change.
- [sc-613](./sc-613-club-announcements.md) adds a Buttondown `form-action` entry. A form post is not exercised by a
  page load, so this check would not cover it unless the check also submits the form.
