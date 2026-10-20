# ADR: Mailing list for The Profound Book Club

- **Status:** Accepted
- **Date:** 2026-10-15
- **Decider:** Rob Park
- **Story:** [sc-613](https://app.shortcut.com/4legssoftware/story/613) — Visitors can subscribe to club announcements
  ([`docs/other-features/sc-613-club-announcements.md`](../other-features/sc-613-club-announcements.md))

## Context

People interested in the club need a way to hear about new book selections, the meeting schedule, and discussion updates without checking profound-book-club.org. The club's goals are to sustain member interest and attract new participants, and email is the most direct channel for both.

Constraints and forces:

- The site is a static site (AWS CDK, CloudFront, S3) delivered through a trunk-based Commit → Acceptance → Production pipeline. It has no backend today.
- DNS is managed in Terraform (Route 53, org-level). App infrastructure is managed in CDK.
- A CloudFront ResponseHeadersPolicy with a CSP is an open security item. Any signup mechanism has to fit inside a tight CSP.
- The list will be small for the foreseeable future, likely under 100 subscribers.
- Other 4 Legs Software efforts may want lists of their own later: WealthTrax product updates and 4 Legs consulting.
- Total cost matters more than the cheapest local option. That includes build time, maintenance, deliverability, and compliance work, not just the monthly bill.

The primary need is **announcements** (one-to-many). Between-meeting **discussion** (many-to-many) is not a current requirement.

### Two audiences: club-wide vs. current book

Members join book by book. Several people have joined multiple books but aren't part of the current one. That gives us two kinds of message for two audiences:

| Message type | Examples | Audience |
|---|---|---|
| **Club announcements** | Upcoming book selections, club news, site updates | Everyone on the list |
| **Current-book messages** | Schedule changes, meeting reminders, meeting follow-ups | Only members of the current book group |

Members who aren't in the current book still want club announcements, but they shouldn't receive current-book traffic. Whatever we choose has to send to the whole list or to just the current book group.

Pricing note: on Buttondown, **tagging and segmentation is a paid add-on (about $9/mo)**. It is not part of the free plan.

## Options considered

### 1. Buttondown (hosted newsletter)
- Free for the first 100 subscribers. After that, about $9/mo up to 1,000 subscribers.
- Can send from our own domain on the free plan, so mail comes from profound-book-club.org.
- Markdown-native composing. It has a full API and webhooks, which leaves room to automate later (for example, generating "next book" announcements from site metadata).
- Signup can be a plain HTML `<form>` posting to Buttondown. No JavaScript embed is needed, so the CSP only needs a `form-action` allowance.
- Running multiple newsletters on one account is a paid add-on, listed at about $29/mo. Billing counts unique subscribers across all newsletters.
- Subscribers can be exported, and Buttondown offers free migration.

### 2. Substack
- Free to publish at any list size. Substack takes 10% only of paid subscriptions, which we don't plan to offer.
- Adds discovery through Substack's network (app, Notes, recommendations) and built-in comments and chat.
- Mail always comes from `@substack.com`. A custom web domain costs a one-time $50 and changes only the web address, not the sending address.
- Effectively a second home for the club under Substack's design rather than our own. Weak fit for automation.

### 3. Self-built on AWS (SES + API Gateway + Lambda + DynamoDB)
- The AWS bill is negligible at our scale. SES costs $0.10 per 1,000 emails, so about $0.06/mo for 150 subscribers × 4 sends.
- The real cost is building and maintaining it ourselves: double opt-in, one-click unsubscribe (`List-Unsubscribe`), bounce and complaint handling through SNS, getting out of the SES sandbox, deliverability reputation, and a sending workflow.
- Fits the existing CDK pipeline and would make a good TDD/CDK showcase for 4 Legs.

### 4. Group list (groups.io, Google Groups)
- Good for discussion, which isn't the current need. Revisit if members ask to talk between meetings.

### 5. Form plus manual BCC
- Cheapest way to test demand. Doesn't scale and has no unsubscribe or compliance handling.

### Separating club announcements from current-book messages

- **A. One newsletter with tags (Buttondown tagging add-on, about $9/mo).** Everyone subscribes to the club newsletter. Each member gets a tag per book they join (for example `book:leadership-is-language`). Announcements go to everyone, and current-book messages go only to that book's tag. This also builds a record of who joined which books over time. This is the cleanest option, and its cost is small but recurring.
- **B. Two Buttondown newsletters, "Club" and "Current book" (multiple-newsletters add-on, about $29/mo).** This works but costs more than tags for the same result, and the current-book membership has to be reset each time a new book starts.
- **C. Buttondown for announcements only. Current-book messages go outside it (free).** Current-book messages go by email to the book's Zoom invite list, which is already how it works today. This is free and requires no change. The cost is two channels and no record of book membership in Buttondown.
- **D. A separate free Buttondown account per book group.** Not recommended. It means a new account each book and subscribers duplicated across accounts.

## Decision

**Start with Buttondown on the free tier, for the book club list only.**

**Audience separation:** use **Option C**. Buttondown carries club announcements to everyone. Current-book messages (schedule, reminders, follow-ups) keep going by email to the current book's Zoom invite list, as they do today, so the book-group workflow doesn't change. **Option A (tags)** is a nice-to-have, not a requirement. Adopt it only if it starts to earn its roughly $9/mo.

Planned evolution:

1. **Now ([sc-613](https://app.shortcut.com/4legssoftware/story/613)):** one Buttondown newsletter for the book club.
   Signup is a plain HTML form on the home page of profound-book-club.org. Subscription is double opt-in: a subscriber
   is active only after they confirm. Mail is sent from the club's domain, and every announcement includes an
   unsubscribe link.
2. **When other lists are needed** (WealthTrax, 4 Legs Software): create **separate free Buttondown accounts**, one per brand, each staying under the 100-subscriber free tier. Before doing this, confirm that Buttondown's terms allow multiple free accounts for one person.
3. **Eventually:** move the lists to **our own AWS accounts** (SES-based) once the lists or the motivation justify the build. Exported subscriber lists make the migration straightforward.

**Fallback:** Substack stays a viable alternative, especially if Buttondown costs rise more than expected. That could happen if lists grow past the free tier, or if consolidating onto one account with the multiple-newsletters add-on becomes necessary.

WealthTrax **transactional** email (password resets, alerts, receipts) is out of scope for Buttondown and will go through SES or an equivalent regardless of this decision.

## Consequences

**Positive**
- Smallest step to production: a form and a DNS change, with no backend to build.
- No cost while the list is under 100 subscribers.
- Mail comes from our own domain and the club's site stays the hub.
- A no-JS form keeps the planned CSP tight.
- We own the subscriber list (export), which keeps every later option open.

**Negative / risks**
- Depends on a third-party vendor for subscriber data and delivery.
- Separate accounts per brand mean separate logins and no moving subscribers between lists. The terms may also rule this approach out.
- Crossing 100 subscribers, or consolidating lists, brings a monthly cost: about $9/mo, or about $38/mo with the multiple-newsletters add-on.
- Under Option C, current-book messages stay on the Zoom invite list outside Buttondown. That means two channels, and people in the current book get messages from both.
- Tags apply within one Buttondown account, so the per-book segmentation for the club doesn't carry over to the separate WealthTrax and 4 Legs accounts. It doesn't need to.
- No discovery network, unlike Substack.

**Follow-up work** — [sc-613](https://app.shortcut.com/4legssoftware/story/613)
- Terraform: add Buttondown's custom sending-domain records (SPF, DKIM, DMARC) in Route 53.
- CDK / CSP: include `form-action` for Buttondown's endpoint in the ResponseHeadersPolicy when that policy exists. If
  the form ships first, add the allowance when the CSP is built.
- Site: add the home-page signup form and a confirmation state that tells the visitor to check email. Track signups as
  an Umami event.
- Send a test announcement to a confirmed subscriber and confirm it arrives in the inbox, with a working unsubscribe
  link.
- Leave current-book messages on the Zoom invite list. Do not import existing members or send the first real
  announcement in this story; invite current members to opt in instead of bulk-adding them.

## Revisit triggers

- The book club list approaches 100 subscribers.
- Emailing the Zoom invite list becomes a burden, or book-membership history becomes worth about $9/mo (then adopt Option A, tags).
- A second list (WealthTrax or 4 Legs) is ready to launch.
- Buttondown changes its pricing or terms, or rules out separate free accounts.
- Members ask for between-meeting discussion (consider groups.io or Substack's community features).
- Building the AWS version becomes worthwhile in its own right (for example, as 4 Legs showcase content).

## References

Pricing verified 2026-10-15; recheck before acting on it.

- Buttondown pricing: https://buttondown.com/pricing
- Buttondown multiple newsletters: https://docs.buttondown.com/multiple-newsletters
- Buttondown tagging and segmentation: https://buttondown.com/features/analytics
- Amazon SES pricing: https://aws.amazon.com/ses/pricing/
- Substack custom domains: https://on.substack.com/p/new-add-a-custom-domain-to-your-substack

