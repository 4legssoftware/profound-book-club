# Story 1: Give chronology books stable ids and expand the conversation record [sc-604]

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
| Chronology type + rows | `src/content/chronology.ts` — `PastBook` has no `id` today |
| Reference slugs | `profound-conversations/src/content/chronology.ts` |
| Conversation type | `src/content/conversations.ts` — today: `author`, `platform`, `url`, `quote` |
| Home card | `src/components/Conversations.astro` — keep the pull-quote rendering |
| Reference record | `profound-conversations/src/content/conversations.ts` |
