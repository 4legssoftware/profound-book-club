# [sc-606] Story 3: Turn the home Conversations section into a short teaser and point the nav at the page

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

## Split recommendation

One story is enough. The epic already separated the full page (Story 2), this teaser, and the chronology / `Re:` links
(Story 4). The teaser and the home nav target are one slice in `profound-book-club`: shipping the cards without the
nav change, or the reverse, would leave the home page pointing two ways. The expected diff stays well under 400 lines,
so one segment is enough.

## Related epic

[`e603-conversations-reviews-continued-elsewhere.md`](./e603-conversations-reviews-continued-elsewhere.md) — Story 3,
after [Story 2](./s605-conversations-page.md). Story 2 is on `main`: `/conversations` lists every review, and
`ConversationList` already sorts newest first and accepts `limit`. Epic delivery: trunk-based commits to `main`
(Commit → Acceptance → Production); **dev** is manual from localhost.

## Related implementation

| Piece | Path / note |
| ----- | ----------- |
| Reference teaser | `profound-conversations/src/routes/index.tsx` → `ConversationsSection()` — same heading, `ConversationList limit={3}`, then “View all conversations →” |
| Reference nav | `profound-conversations/src/components/Header.tsx` — Conversations `to: "/conversations"`; other items stay home hashes |
| Reference styles | `profound-conversations/src/styles/pbc.css` — `.conversations-view-all`, `.conversations-view-all-link` (accent, mono, uppercase, hover underline and gap). Skip `.conv-card-related` |
| Home section | `src/components/Conversations.astro` — still maps `conversations` in file order and renders `quote` / author / platform / “Read →”. Keep `id="conversations"`, the § II `h2`, and `conversationsIntro` |
| Shared card | `src/components/ConversationList.astro` — title link, excerpt, author and source (platform when source is absent), date. Pass `limit={3}`. Do not change the component |
| Nav | `src/components/Nav.astro` — `homeAnchors` defaults to true, and Conversations is `#conversations` in that mode. `/conversations` already passes `homeAnchors={false}`, so that page’s Conversations item is already `/conversations` |
| Record | `src/content/conversations.ts` — one review (Scherkenbach). `quote` and `excerpt` are the same sentence. Leave the field; the home section stops reading `quote` |
| Smoke | `scripts/smoke-test.cjs` — `REQUIRED_SECTION_IDS` includes `conversations`, checked on `/` only. No new assertion |
| Dev deploy | `.cursor/commands/deploy-dev-book-club.md` → `./scripts/deploy-content-dev.sh` (content only) |

## Questions

None open. The acceptance criteria already decide the seams that could have gone either way:

- The view-all link is always present, including when the archive has fewer than three reviews.
- On the home page, only the Conversations nav item changes target. Current, Upcoming, Chronology, Of Interest,
  Contact, and the wordmark stay hash links. The `/conversations` page nav is unchanged.

## Implementation Checklist

**Segment 1 — Home teaser and nav** (`profound-book-club`)

- [x] In `Conversations.astro`, replace the inline card map with `<ConversationList limit={3} />`. Keep
      `id="conversations"`, the § II heading as an `h2` (**Conversations — continued elsewhere**), and
      `conversationsIntro`
- [x] Under the list, add a link reading “View all conversations →” to `/conversations`, with Lovable
      `.conversations-view-all` / `.conversations-view-all-link` styles scoped in this component. Show it even when
      the archive has one review
- [x] Remove the home-only card markup and styles (grid, quote, “Read →”). Card appearance comes from
      `ConversationList`
- [x] In `Nav.astro`, the Conversations href is `/conversations` on the home page as well. Leave `homeAnchors` in
      place for the other items and the wordmark (`#current`, `#upcoming` when an upcoming book exists, `#chronology`,
      `#psa`, `#contact`, `#top`)
- [x] Do not change `ConversationList.astro`, `conversations.ts`, `conversations.astro`, or `scripts/smoke-test.cjs`
- [x] `pnpm run lint` and `pnpm run build`
- [x] Deploy content to dev (`source scripts/pro-dev.sh` && `./scripts/deploy-content-dev.sh`), then verify in the
      browser before the push
- [ ] Commit and push to `main`: `[sc-606] Point the home Conversations section at the page`
- [ ] That push’s pipeline is green before Final

**Final — Review and verify**

- [ ] The segment’s pipeline run is green
- [x] In the browser, on desktop and at a width under 720px: the home section still has the § II heading and intro,
      shows the one Scherkenbach card (title link, excerpt, author and source, date), and the view-all link opens
      `/conversations`. Above 720px, home nav Conversations goes to `/conversations` and the other items still jump
      to their home anchors. Under 720px the nav link row stays hidden, so the view-all link is the way to the page.
      `/conversations` is unchanged, including its own Conversations nav item
- [x] After the localhost dev deploy, `pnpm run smoke-test` still passes for `/` and `/conversations`, and `/` still
      contains `id="conversations"`
- [x] No new application unit-test harness; coverage for this story is the existing smoke check plus the browser pass
- [x] `Conversations.astro` and `Nav.astro` stay under 200 lines
