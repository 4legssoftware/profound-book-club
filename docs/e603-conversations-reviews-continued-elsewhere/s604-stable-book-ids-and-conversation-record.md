# [sc-604] Story 1: Give chronology books stable ids and expand the conversation record

**Epic:** Conversations — reviews continued elsewhere

## Description

Add a stable id on every chronology book, and extend the conversation record so a review can name its title, date,
source, and related book. The home page still shows the existing Scherkenbach pull-quote. Later stories use these ids
to link the Conversations page and the chronology.

## Acceptance criteria

- Every chronology entry has a unique `id` slug
- Slugs match the Lovable chronology where the book already exists there; *Leadership Is Language* is
  `leadership-is-language`
- The conversation type can carry `title`, ISO `date`, `source`, `relatedBookId`, and an optional `excerpt`, alongside
  the fields the home card already uses (`author`, `platform`, `url`, `quote`)
- The existing Scherkenbach review is filled in with title, date `2025-09-16`, source, and `relatedBookId:
  demings-road`, and still renders on the home page as the same pull-quote (author Mike Harris, platform Blog, same
  URL)
- `relatedBookId` values used in content refer to a chronology `id`
- Lint and build pass; deployed and verified per standard flow: dev from localhost → push to `main` → pipeline green
  to Production

## Scope

**In:** `src/content/chronology.ts`, `src/content/conversations.ts`. Home card markup stays visually the same.

**Out:** The `/conversations` route (Story 2); home teaser and nav (Story 3); chronology pills and `Re:` links
(Story 4); the rest of the review archive (Story 5); current book, upcoming book, and chronology membership; CDK /
`4ls-org`.

## Book ids

| id | Title |
| --- | --- |
| `demings-journey` | Deming's Journey to Profound Knowledge |
| `world-of-deming` | The World of W. Edwards Deming |
| `wiring-winning-org` | Wiring the Winning Organization |
| `win-win` | Win-Win |
| `learning-to-lead` | Learning to Lead, Leading to Learn |
| `deming-goldratt` | Deming & Goldratt |
| `idealized-design` | Idealized Design |
| `new-economics` | The New Economics |
| `rebels-of-reason` | Rebels of Reason |
| `sys-tao` | Sys-Tao |
| `demings-road` | Deming's Road to Continual Improvement |
| `thinking-in-systems` | Thinking in Systems |
| `twenty-things` | Twenty Things You Need to Know |
| `out-of-the-crisis` | Out of the Crisis |
| `phoenix-project` | The Phoenix Project |
| `sidewinder` | Sidewinder |
| `leadership-is-language` | Leadership Is Language |

## Related epic

[`e603-conversations-reviews-continued-elsewhere.md`](./e603-conversations-reviews-continued-elsewhere.md) — Story 1.
Epic delivery: trunk-based commits to `main` (Commit → Acceptance → Production); **dev** is manual from localhost.

## Related implementation

| Piece | Path / note |
| ----- | ----------- |
| Chronology type + rows | `src/content/chronology.ts` — `PastBook` has no `id` today; 14 entries total |
| Conversation type | `src/content/conversations.ts` — today: `author`, `platform`, `url`, `quote`; one entry (Scherkenbach) |
| Home card | `src/components/Conversations.astro` — renders `conversation.quote`, `author`, `platform`, `url` |
| Reference (Lovable) | `profound-conversations/src/content/chronology.ts` — slugs to match where they exist |

## Questions

None at this stage — acceptance criteria are clear and scope is tight. Resolve as implementation surfaces them.

## Implementation Checklist

**Segment 1 — Add chronology `id` field and populate all book ids** (`profound-book-club`)

- [ ] Update `PastBook` type in `src/content/chronology.ts` to include `id: string`
- [ ] Add `id` to all 14 chronology entries, matching the Book ids table above
- [ ] Verify Lovable reference: check `profound-conversations/src/content/chronology.ts` for any id differences; confirm leadership-is-language slug exists
- [ ] Build succeeds (`pnpm run build`)
- [ ] Commit: `[sc-604] Add chronology book ids`

**Segment 2 — Extend Conversation type with metadata fields** (`profound-book-club`)

- [ ] Update `Conversation` type in `src/content/conversations.ts` to include `title`, `date` (ISO 8601), `source`, `relatedBookId` (optional), `excerpt` (optional)
- [ ] Keep existing fields: `author`, `platform`, `url`, `quote`
- [ ] Update the Scherkenbach conversation entry with new fields: title, date `2025-09-16`, source (Test & Analysis), `relatedBookId: demings-road`
- [ ] Lint passes (`pnpm run lint`)
- [ ] Build succeeds (`pnpm run build`)
- [ ] Commit: `[sc-604] Extend Conversation type with title, date, source, relatedBookId, excerpt`

**Segment 3 — Verify home card rendering is unchanged** (`profound-book-club`)

- [ ] The Conversations component still renders the Scherkenbach quote identically to before
- [ ] Home page smoke test passes locally (`pnpm run smoke-test`)
- [ ] Deploy to dev manually from localhost
- [ ] Verify dev site home page shows the same pull-quote (`author: Mike Harris`, `platform: Blog`, same URL)
- [ ] Commit: `[sc-604] Verify home card rendering unchanged [skip ci]`

**Final — Review and verify for production**

- [ ] All three segments pass lint and build
- [ ] Smoke test passes on dev
- [ ] Review the `src/content/chronology.ts` and `src/content/conversations.ts` changes for correctness
- [ ] No long files created (both stay under 150 lines)
- [ ] Merge to `main` ready; push to `main` → pipeline to Acceptance and Production
