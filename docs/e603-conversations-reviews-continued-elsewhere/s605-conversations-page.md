# [sc-605] Story 2: Add a Conversations page for the full review list

**Epic:** Conversations — reviews continued elsewhere

## Description

Add a static `/conversations` page that lists every review, newest first. The page uses the site nav and footer. Home
stays as it is, including the section id `conversations` that smoke tests already require.

Depends on Story 1 for the conversation record. With only the Scherkenbach review in the data, the page lists that one
review.

## Acceptance criteria

- `/conversations` returns the page (title **Conversations — The Profound Book Club**, meta description for external
  reviews and reflections)
- Page heading matches the home section: **Conversations — continued elsewhere**, with the existing
  conversations intro
- Reviews sort by `date` descending
- Each card shows the review title as a link to the external URL (`target="_blank"`, `rel="noreferrer"`), the author
  and source (or platform when source is absent), and the date
- An `excerpt`, when present, renders as a pull-quote on the card
- A back link returns to the home page
- Nav and footer render on the page. Nav links to home sections use `/#current`, `/#upcoming`, `/#chronology`,
  `/#psa`, and `/#contact` so they resolve from this page. The Conversations item on this page points at
  `/conversations`. The home-page nav item is unchanged until Story 3
- `scripts/smoke-test.cjs` requests `/conversations` and requires HTTP 200. Home smoke still requires
  `id="conversations"`
- Lint and build pass; deployed and verified per standard flow: dev from localhost → push to `main` → pipeline green
  to Production

## Scope

**In:** `src/pages/conversations.astro`, shared card markup the home teaser can reuse in Story 3, nav links that work
off the home page, smoke coverage for `/conversations`.

**Out:** Replacing the home pull-quote or pointing the home nav at this page (Story 3); chronology pills and `Re:`
links (Story 4); seeding more reviews (Story 5); CDK / `4ls-org`.

## Related epic

[`e603-conversations-reviews-continued-elsewhere.md`](./e603-conversations-reviews-continued-elsewhere.md) — Story 2,
after [Story 1](./s1-stable-book-ids-and-conversation-record.md).

## Related implementation

| Piece | Path / note |
| ----- | ----------- |
| Reference page | `profound-conversations/src/routes/conversations.tsx` |
| Reference list | `profound-conversations/src/components/ConversationList.tsx` |
| Reference styles | `profound-conversations/src/styles/pbc.css` |
| Layout | `src/layouts/BaseLayout.astro` — already accepts `title` and `description` |
| Nav | `src/components/Nav.astro` — hash links are home-only today |
| Smoke | `scripts/smoke-test.cjs` — `pages` is `['/']`; home check looks for `id="conversations"` |

## Questions

1. **Scherkenbach pull-quote.** The new card shows an excerpt only when one is set. Keep the live pull-quote as that
   excerpt, or leave it off so the card matches the prototype (title, meta, date)?
