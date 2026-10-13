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

## Split recommendation

One story is enough. The epic already separated the full page (this story), the home teaser (Story 3), and the
chronology / `Re:` links (Story 4). This story is one repo and one route. The expected diff stays well under 400 lines.

## Related epic

[`e603-conversations-reviews-continued-elsewhere.md`](./e603-conversations-reviews-continued-elsewhere.md) — Story 2,
after [Story 1](./s604-stable-book-ids-and-conversation-record.md). Story 1 is on `main`: chronology ids exist, and
`Conversation` already carries `title`, `date` (`YYYY.MM.DD`), `source`, optional `relatedBookId`, and optional
`excerpt`. Epic delivery: trunk-based commits to `main` (Commit → Acceptance → Production); **dev** is manual from
localhost.

## Related implementation

| Piece | Path / note |
| ----- | ----------- |
| Reference page | `profound-conversations/src/routes/conversations.tsx` — `h1`, intro, list, “← Back to the home page” |
| Reference list | `profound-conversations/src/components/ConversationList.tsx` — sort, title link, excerpt, meta, date. Skip the `Re:` row; that is Story 4 |
| Reference styles | `profound-conversations/src/styles/pbc.css` — `.conversations-page`, `.conv-card-title`, `.conv-card-date`, `.conversations-back`. Skip `.conv-card-related` and `.conversations-view-all` |
| Record | `src/content/conversations.ts` — one review (Scherkenbach). Copy `quote` into `excerpt` (Q1). Intro copy is `conversationsIntro` (“LinkedIn posts…”, not the Lovable “blog posts…” sentence) |
| Home card | `src/components/Conversations.astro` — still renders `quote` / author / platform / “Read →”. Leave it until Story 3 |
| Layout | `src/layouts/BaseLayout.astro` — pass `title` and `description`. Organization and current-book JSON-LD stay as they are |
| Nav | `src/components/Nav.astro` — hash links are home-only (`#current`, `#conversations`, …). Upcoming link renders only when `upcomingBook` is set. On `/conversations`, the wordmark goes to `/#top` (Q2); on home it stays `#top` |
| Page pattern | `src/pages/index.astro` composes `Nav` + `main` + `Footer`. `src/pages/404.astro` shows how a second page passes a title into `BaseLayout` |
| Smoke | `scripts/smoke-test.cjs` — `pages` is `['/']`. Section-id checks run only for `/` |
| Sort | `YYYY.MM.DD` is zero-padded, so `localeCompare` descending matches chronological order. Copy the array before sorting |

## Questions

**Q1: Scherkenbach excerpt.** ✅  
Copy the live quote into `excerpt`, so this page’s card shows the pull-quote. The home section still renders `quote`
until Story 3.

**Q2: Wordmark from `/conversations`.** ✅  
On this page, the wordmark goes to `/#top`. The home wordmark stays `#top`.

## Implementation Checklist

**Segment 1 — `/conversations` page, shared list, and off-home nav** (`profound-book-club`)

Home stays visually the same.

- [x] Add `src/components/ConversationList.astro`. Copy `conversations`, sort by `date` descending, and accept an
      optional `limit` so Story 3 can show the latest three without a second sort. This page passes no limit
- [x] Each card: title as the external link (`target="_blank"`, `rel="noreferrer"`), `excerpt` as a pull-quote when
      set, then author and source (platform when source is absent) and the stored date (`2025.09.16`). No **Re:** line
- [x] Card and grid styles follow the Lovable list (title underline, meta row, date). Omit `.conv-card-related` and
      `.conversations-view-all`
- [x] Add `src/pages/conversations.astro`: `BaseLayout` title **Conversations — The Profound Book Club** and description
      “External conversations, reviews, and reflections sparked by books read with The Profound Book Club.” Heading is
      an `h1` with the same visible text as the home section (**Conversations — continued elsewhere**, including
      § II. — IN THE OPEN). Intro is `conversationsIntro`. Back link reads “← Back to the home page” and goes to `/`
- [x] Give the page `main` `id="top"` and top padding so the heading clears the fixed nav (Lovable
      `.conversations-page`). Do not put `id="conversations"` on this page; that id stays on the home section
- [x] `Nav` takes a prop that defaults to today’s home hrefs. `index.astro` keeps the default: `#current`,
      `#upcoming` when an upcoming book exists, `#chronology`, `#conversations`, `#psa`, `#contact`. The conversations
      page opts into `/#current`, `/#upcoming`, `/#chronology`, `/#psa`, `/#contact`, and Conversations →
      `/conversations`. On this page the wordmark is `/#top`; on home it stays `#top`
- [x] Set the Scherkenbach `excerpt` to the existing `quote`. `Conversations.astro` still renders `quote`
- [x] `pnpm run lint` and `pnpm run build`
- [x] Commit and push to `main`: `[sc-605] Add the Conversations page`

**Segment 2 — Smoke coverage for `/conversations`** (`profound-book-club`)

- [x] Add `/conversations` to `pages` in `scripts/smoke-test.cjs`. Require HTTP 200 only. Keep the `id="conversations"`
      check on `/` only
- [x] `pnpm run build`, then smoke against the local preview (`SITE_URL` pointing at `astro preview`) before the dev
      deploy
- [x] Commit and push to `main`: `[sc-605] Smoke-test the Conversations page`

**Final — Review and verify**

- [x] The smoke-test pipeline run is green
- [x] In the browser, on desktop and at a width under 720px: `/conversations` shows the heading, intro, and one
      Scherkenbach card (external title link, author and source, date, and the pull-quote). The back link returns
      home. Off-home nav links land on the home anchors. The Conversations item stays on `/conversations`. Home nav
      still uses `#conversations`, and the home pull-quote is unchanged
- [x] After the localhost dev deploy, `pnpm run smoke-test` passes for `/` and `/conversations`
- [x] No new application unit-test harness; coverage for this story is the smoke check plus the browser pass. The
      CloudFront function assertion covers the directory-index rewrite
- [x] `ConversationList.astro`, `conversations.astro`, and `Nav.astro` stay under 200 lines
