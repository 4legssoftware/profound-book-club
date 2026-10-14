# Epic: Conversations — reviews continued elsewhere

## Objective

Give external book reviews a home on profound-book-club.org: a Conversations page for the full list, a short teaser on
the home page, and links both ways between a chronology entry and the reviews that refer to it.

## Context

The live site is a single Astro page. Conversations is a home section with one pull-quote (Mike Harris on *Deming's
Road to Continual Improvement*). Chronology entries have no stable id and no link to that review. Smoke tests require
the home section id `conversations`.

`profound-conversations` (Lovable) is the design reference. Its Conversations page lists Test & Analysis reviews. The
home section shows the latest three and a view-all link. A chronology row that has reviews shows `See conversation` or
`See N conversations`, and that pill opens the full Conversations page. Each review card links back to that book's
anchor on the home page (`Re:` → `/#book-{id}`).

This epic adds one static page (`/conversations`) in `profound-book-club`. Astro emits it into `dist/` with the rest of
the site, so CloudFront, DNS, and the pipeline stay as they are. Book rotation — current book, upcoming book, and
which titles sit in the chronology — stays as it is.

Work commits and deploys incrementally — at least once per story — through the pipeline: review → commit →
push to `main` → Commit → Acceptance → Production. Dev is refreshed manually from localhost.

## Stories

### 1. Give chronology books stable ids and expand the conversation record [sc-604]

[s604-stable-book-ids-and-conversation-record.md](./s604-stable-book-ids-and-conversation-record.md)

Add a stable id on each chronology book. Extend the conversation type with title, date, source, related book, and an
optional excerpt. Keep the existing Scherkenbach review rendering on the home page.

### 2. Add a Conversations page for the full review list [sc-605]

[s605-conversations-page.md](./s605-conversations-page.md)

New `/conversations` route: intro, reviews newest first, page title and description, and a link back to the home page.
Extend smoke coverage for the new path. Leave the home section id `conversations` in place so the current smoke checks
still pass.

### 3. Turn the home Conversations section into a short teaser and point the nav at the page [sc-606]

[s606-home-teaser-and-nav.md](./s606-home-teaser-and-nav.md)

Home section shows the latest three reviews and a view-all link. The Conversations nav item goes to `/conversations`.

### 4. Link chronology entries to Conversations, and each review back to its book [sc-607]

[s607-link-chronology-and-conversations.md](./s607-link-chronology-and-conversations.md)

Chronology rows with related reviews show `See conversation` or `See N conversations`, linking to the Conversations
page. Each review card's `Re:` line links to that book's home-page anchor.

### 5. Publish the Test & Analysis reviews, including Sidewinder and Leadership Is Language [sc-608]

[s608-publish-test-and-analysis-reviews.md](./s608-publish-test-and-analysis-reviews.md)

Seed the archive from the Lovable list, plus Sidewinder (15 Sep 2026), Leadership Is Language (6 Oct 2026), and The
Phoenix Project (2 Jun 2026). Every Test & Analysis post is attributed to Mike Harris. The Scherkenbach review already
on the site is the first of the Lovable seven.

### 6. Collect external links and devise a check that they stay active (chore) [sc-609]

[s609-external-link-check.md](./s609-external-link-check.md)

After the review archive is in place, list every external link the site offers visitors and recommend an automated
check that each one is still active and still the intended page. Implement the check in this story only if it stays a
small script.

### 7. Update events [sc-610]

[s610-update-events.md](./s610-update-events.md)

Replace the In2:InThinking Network Forum card in Of Interest with the Deming Institute two-day seminar (6–7 Nov 2026).
The video series stays. Independent of stories 1–6.

## Dependencies / Open questions

Tracked on the stories. Resolve before the story that needs them:

- **Scherkenbach pull-quote** — [Story 2](./s605-conversations-page.md). Keep it as an excerpt, or leave it off so the
  card matches the prototype (title, related book, meta).

Resolved on [Story 5](./s608-publish-test-and-analysis-reviews.md): author is Mike Harris (source Test & Analysis);
“Think Slowly…” stays on *Wiring the Winning Organization*; the *Understanding Variation* review stays on *Twenty
Things You Need to Know*; the Phoenix Project review is included. Manually check every title and link before that
story is done.
