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

## Split recommendation

One story is enough. The epic already separated this cross-link from the page (Story 2), the home teaser (Story 3),
and the review archive (Story 5). Both directions live in `profound-book-club` and stay well under 400 lines. Two
checklist segments keep each direction deployable on its own: the chronology can point at Conversations before the
cards point back.

## Related epic

[`e603-conversations-reviews-continued-elsewhere.md`](./e603-conversations-reviews-continued-elsewhere.md) — Story 4,
after [Story 1](./s604-stable-book-ids-and-conversation-record.md),
[Story 2](./s605-conversations-page.md), and [Story 3](./s606-home-teaser-and-nav.md). Stories 1–3 are on `main`:
chronology ids exist, `/conversations` and the home teaser share `ConversationList`, and the nav Conversations item
goes to `/conversations`. Epic delivery: trunk-based commits to `main` (Commit → Acceptance → Production); **dev** is
manual from localhost.

## Related implementation

| Piece | Path / note |
| ----- | ----------- |
| Reference pill | `profound-conversations/src/routes/index.tsx` → `ChronologySection()` — `id={`book-${b.id}`}` on each `<li>`, title and pill wrapped in `.chron-body`, pill only when `related.length > 0`, `to="/conversations"` |
| Reference **Re:** | `profound-conversations/src/components/ConversationList.tsx` — lookup `chronology` by `relatedBookId`; link `/#book-{id}` after the excerpt and before the meta row. Omit the row when the id is missing or does not match a chronology entry |
| Reference styles | `profound-conversations/src/styles/pbc.css` — `.chron-body`, `.chron-conversations`, `.chron-conversations-label`, `.conv-card-related`, `.conv-card-related-label`, `.conv-card-related-title`. Scope them in the Astro component that owns the markup |
| Chronology UI | `src/components/Chronology.astro` — 18 rows, no anchor id. Grid is `80px 1fr auto` (date, title, meta). Nest the title and pill in `.chron-body` so the pill stays under the title and the meta column stays put. At `max-width: 720px` the meta already wraps to column 2; the pill stays inside `.chron-body`. `scroll-margin-top: 5rem` on `.chronology-item` clears the fixed nav (Q1) |
| Shared card | `src/components/ConversationList.astro` — title, excerpt, meta. No **Re:** line. Home teaser passes `limit={3}`; `/conversations` passes no limit. One change covers both |
| Record | `src/content/conversations.ts` — one review, `relatedBookId: 'demings-road'`. Do not add reviews |
| Current row | `current: true` is on `leaders-handbook` (*The Leader's Handbook*), not *Leadership Is Language*. Pill logic does not read `current`. Until Story 5, only `demings-road` shows **See conversation**. `leaders-handbook` and `leadership-is-language` show no pill |
| Dev deploy | `.cursor/commands/deploy-dev-book-club.md` → `./scripts/deploy-content-dev.sh` (content only) |

## Questions

**Q1: Clearance under the fixed nav.** ✅  
Set `scroll-margin-top: 5rem` on `.chronology-item`. The nav is about 4rem tall, so the book title clears it with a
small gap. The Lovable reference does not do this.

## Implementation Checklist

**Segment 1 — Chronology anchors and pills** (`profound-book-club`)

- [x] In `Chronology.astro`, give every row `id={`book-${book.id}`}`. Count related reviews with
      `conversations.filter((c) => c.relatedBookId === book.id)`
- [x] Wrap the title and the pill in `.chron-body` (column, `gap: 0.5rem`). Keep date and `formatChronMeta` as the
      other two grid cells. Do not change `current`, chronology membership, or meta copy
- [x] When the count is 1, the pill reads **See conversation**. When it is greater than 1, it reads
      **See N conversations**. The link goes to `/conversations`. When the count is 0, render no pill
- [x] Add the Lovable `.chron-conversations` and `.chron-conversations-label` styles in this component. Set
      `scroll-margin-top: 5rem` on `.chronology-item` so a jump to `#book-{id}` clears the fixed nav (Q1)
- [x] `pnpm run lint` and `pnpm run build`
- [x] Deploy content to dev (`source scripts/pro-dev.sh` && `./scripts/deploy-content-dev.sh`), then verify in the
      browser before the push
- [x] Commit and push to `main`: `[sc-607] Link chronology rows to Conversations`
- [x] That push’s pipeline is green before Segment 2

**Segment 2 — Re: line on the shared card** (`profound-book-club`)

- [x] In `ConversationList.astro`, resolve `relatedBookId` against `chronology`. When it matches, after the excerpt
      and before the meta row, add a link to `/#book-{id}` with **Re:**, the book title, and ` — {author}` when the
      chronology entry has an author
- [x] When `relatedBookId` is absent, or it does not match a chronology id, render no **Re:** line
- [x] Add the Lovable `.conv-card-related` styles in this component. Do not change sort, `limit`, title link, excerpt,
      or meta
- [x] `pnpm run lint` and `pnpm run build`
- [x] Deploy content to dev, then verify in the browser before the push
- [x] Commit and push to `main`: `[sc-607] Link review cards back to their chronology row`
- [x] That push’s pipeline is green before Final

**Final — Review and verify**

- [x] The Segment 2 pipeline run is green
- [x] In the browser, on desktop and at a width under 720px: every chronology row has a `book-{id}` anchor. Only
      *Deming's Road to Continual Improvement* shows **See conversation**, and that pill opens `/conversations`.
      *The Leader's Handbook* stays **Current selection** and has no pill. The Scherkenbach card on the home teaser
      and on `/conversations` shows **Re:** *Deming's Road to Continual Improvement — William W. Scherkenbach*, and
      that link lands on `#book-demings-road` with the title clear of the fixed nav
- [x] After the localhost dev deploy, `pnpm run smoke-test` still passes for `/` and `/conversations`. No new smoke
      assertion
- [x] No new application unit-test harness; coverage for this story is the existing smoke check plus the browser pass
- [x] `Chronology.astro` and `ConversationList.astro` stay under 200 lines
