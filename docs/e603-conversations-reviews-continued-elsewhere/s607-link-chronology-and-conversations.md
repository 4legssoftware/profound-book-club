# [sc-607] Story 4: Link chronology entries to Conversations, and each review back to its book

**Epic:** Conversations — reviews continued elsewhere

## Description

Connect the chronology and the review cards in both directions. A chronology row with related reviews shows a pill
that opens the Conversations page. Each card with a related book links back to that book's anchor on the home page.

Depends on Story 1 for book ids and `relatedBookId`, and on Stories 2–3 for the shared card. Until Story 5 seeds the
archive, only *Deming's Road to Continual Improvement* shows a pill.

## Acceptance criteria

- Each chronology row has an anchor `id="book-{id}"` using the Story 1 slug
- A row with one related review shows **See conversation**; a row with more than one shows **See N conversations**
- Those pills link to `/conversations` (the full list, the same destination for every book)
- A row with no related reviews shows no pill
- On the home teaser and on `/conversations`, a card with a `relatedBookId` shows **Re:** and the book title (and
  author, when the chronology entry has one), linking to `/#book-{id}`
- A card with no `relatedBookId` shows no **Re:** line
- The *Leadership Is Language* row can show a pill while it is still marked current; this story does not change
  `current` or chronology membership
- Lint and build pass; deployed and verified per standard flow: dev from localhost → push to `main` → pipeline green
  to Production

## Scope

**In:** `src/components/Chronology.astro`, the shared conversation card, styles for `.chron-conversations` and
`.conv-card-related`.

**Out:** Seeding reviews (Story 5); filtering `/conversations` to a single book; current-book or upcoming-book edits;
CDK / `4ls-org`.

## Related epic

[`e603-conversations-reviews-continued-elsewhere.md`](./e603-conversations-reviews-continued-elsewhere.md) — Story 4,
after [Story 1](./s1-stable-book-ids-and-conversation-record.md),
[Story 2](./s2-conversations-page.md), and [Story 3](./s3-home-teaser-and-nav.md).

## Related implementation

| Piece | Path / note |
| ----- | ----------- |
| Chronology pill | `profound-conversations/src/routes/index.tsx` → `ChronologySection()` |
| Card **Re:** link | `profound-conversations/src/components/ConversationList.tsx` |
| Pill styles | `profound-conversations/src/styles/pbc.css` (`.chron-conversations`, `.conv-card-related`) |
| Chronology UI | `src/components/Chronology.astro` — rows have no anchor id today |
