# Visitors can subscribe to club announcements [sc-613]

**Shortcut:** [sc-613](https://app.shortcut.com/4legssoftware/story/613)

**ADR:** [`docs/adrs/adr-001-mailing-list.md`](../adrs/adr-001-mailing-list.md)

## Summary

As someone interested in The Profound Book Club, I want to subscribe to club announcements from profound-book-club.org,
so that I hear about upcoming books and club news without checking the site.

Implements the mailing-list ADR (`docs/adrs/adr-001-mailing-list.md`). This uses Buttondown on the free tier for
**club announcements only**. Current-book messages (schedule, reminders, follow-ups) keep going to the Zoom invite
list, as they do today.

## Acceptance Criteria

- [ ] The site has a signup form (email field plus submit) that a visitor can find on the home page.
- [ ] The form is plain HTML posting to Buttondown, with no third-party JavaScript embed.
- [ ] After submitting, the visitor sees a clear "check your email to confirm" message.
- [ ] Subscription uses double opt-in: the subscriber is active only after clicking the confirmation email.
- [ ] Confirmation and announcement emails are sent from the profound-book-club.org domain, with SPF, DKIM, and DMARC
  passing.
- [ ] Every announcement email includes a working unsubscribe link.
- [ ] A test announcement sent through Buttondown reaches a confirmed test subscriber's inbox, not spam.
- [ ] Signup submissions are tracked as an Umami event.
- [ ] Works at phone width and matches the site's design system (cream tones, Fraunces, accent red).

## Scope

**In**

- Buttondown account and newsletter setup (free tier)
- Custom sending-domain DNS records in Route 53 via Terraform
- Signup form plus confirmation/thank-you state on the site
- CSP `form-action` allowance for Buttondown, if the ResponseHeadersPolicy is in place
- Umami signup event
- `docs/adrs/adr-001-mailing-list.md` committed to the repo

**Out**

- Current-book messages (stay on the Zoom invite list)
- Tagging/segmentation (nice-to-have, about $9/mo add-on)
- Lists for WealthTrax or 4 Legs Software
- Importing existing members (separate decision: invite them to opt in rather than bulk-add)
- Sending the first real announcement

## Questions

## Implementation Checklist

## Notes

- Buttondown is free for the first 100 subscribers and supports sending from a custom domain on the free plan.
- The CSP ResponseHeadersPolicy is still an open security item. If it lands first, include Buttondown's endpoint in
  `form-action`. If this story lands first, add the allowance when the CSP is built.
- DNS changes belong in the org-level Terraform (Route 53), not CDK.
- Revisit triggers are in the ADR (about 100 subscribers, a second list, pricing changes).
