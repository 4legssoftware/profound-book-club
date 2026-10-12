# Story 3: Turn the home Conversations section into a short teaser and point the nav at the page [sc-606]

**Epic:** Conversations — reviews continued elsewhere

## Description

The home Conversations section becomes a short teaser of the same cards as `/conversations`, plus a view-all link. The
Conversations item in the nav goes to that page from the home page as well.

Depends on Story 2 for the page and the shared card. With one review in the data, the teaser shows that review and the
view-all link.

## Acceptance criteria

- The home section `id="conversations"` remains, with the same § II heading and intro
- The section lists the three newest reviews (fewer when the archive is shorter), using the Story 2 card
- A **View all conversations** link goes to `/conversations`
- From the home page, the nav Conversations item goes to `/conversations` rather than `#conversations`
- Other nav items on the home page still jump to their home anchors
- Smoke tests still find `id="conversations"` on `/`
- Lint and build pass; deployed and verified per standard flow: dev from localhost → push to `main` → pipeline green
  to Production

## Scope

**In:** `src/components/Conversations.astro`, `src/components/Nav.astro`, teaser styles aligned with the Lovable home
section (`.conversations-view-all`).

**Out:** Chronology pills and `Re:` links (Story 4); seeding more reviews (Story 5); changing how many reviews the
full page shows; CDK / `4ls-org`.

## Related epic

[`e603-conversations-reviews-continued-elsewhere.md`](./e603-conversations-reviews-continued-elsewhere.md) — Story 3,
after [Story 2](./s2-conversations-page.md).

## Related implementation

| Piece | Path / note |
| ----- | ----------- |
| Home teaser | `profound-conversations/src/routes/index.tsx` → `ConversationsSection()` (`limit={3}`) |
| Nav target | `profound-conversations/src/components/Header.tsx` — Conversations `to: "/conversations"` |
| Home section | `src/components/Conversations.astro` |
| Nav | `src/components/Nav.astro` |
| Smoke | `scripts/smoke-test.cjs` — `REQUIRED_SECTION_IDS` includes `conversations` |
