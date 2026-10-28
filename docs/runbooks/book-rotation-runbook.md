# Book rotation runbook

How to move the site to the next book: announce it in Up Next, then retire the current book to the Chronology and
promote the new one to Current with its reading schedule. The pattern was set in
[`20261027-site-update-rotate-to-leadership-is-language.md`](../changelogs/20261027-site-update-rotate-to-leadership-is-language.md)
and repeated for *The Leader's Handbook* (sc-583).

Rotations are content-only. They touch `src/content/` and nothing in CDK or `4ls-org`. If dependencies are stale, update
them in a separate commit first (`package-updates-book-club` skill), so the rotation ships from a known-good base.
Catalog rules for ids, Up Next, and reviews live in [content conventions](../content-conventions.md).

## Before you start

Have these confirmed before editing:

- Title, author, and the book's Roman numeral (one past the current `currentBook.number`).
- Stable chronology `id`. Copy the profound-conversations slug when the book already has one. Otherwise use a short
  kebab slug, and do not change it once it is published.
- Start month for the Chronology (`YYYY.MM`).
- `kind` (for example `Leadership`, `Systems`, `Education`) and `connection` (`direct` if Deming or a close colleague
  wrote it, `adjacent` otherwise).
- Reading schedule: each session date with its chapters, plus any no-meeting weeks.
- Abstract and Profound Knowledge positioning copy. The Up Next `blurb` is usually the seed.

## Announce the next book (optional)

Fill in `src/content/upcomingBook.ts` (number, title, author, `startDate`, `season`, `blurb`, `connection`). A non-null
`upcomingBook` shows the Up Next section and its nav link, and the smoke test then requires the `#upcoming` section.

## Rotate

1. **`src/content/chronology.ts`** — remove `current: true` from the outgoing book's row. Keep its `id`, `date`, `kind`,
   and `connection`. Append the new book with its `id` and `current: true`. Chronology rows render `Current selection`
   when `current` is set and `kind · Direct/Adjacent` otherwise.
2. **`src/content/currentBook.ts`** — overwrite the single slot: `number`, `title`, `author`, `status:
   'Currently reading'`, `season` (for example `fall 2026`), `abstract`, `positioning`, and `schedule`. The JSON-LD in
   `BaseLayout.astro` reads from this file, so it updates with it.
3. **`src/content/upcomingBook.ts`** — export `null` unless the book after this one is already announced.
4. **`src/content/site.ts`** — the hero's `Volumes Read` stat is a hand-kept string. Set it to the number of completed
   Chronology rows (those without `current`).

Schedule rows follow one shape:

```ts
{ week: 'Week 1', date: 'Oct 16', chapters: 'Chapters 1–2' },
{ week: 'Week 2', date: 'Oct 23', chapters: 'Chapter 3' },
{ week: '—', date: 'Nov 27', chapters: 'No meeting · U.S. holiday weekend', break: true },
```

Meeting time and place (`site.meetingTime`, `site.meetingPlace`) appear on the schedule header and on Contact. They
are copied from profound-conversations; change them only when the club's cadence changes, and in both repos.

## Verify and ship

1. `pnpm run lint`, `pnpm run format:check`, and `pnpm run build`.
2. Deploy to dev: `source scripts/pro-dev.sh` then `./scripts/deploy-content-dev.sh`.
3. Check `https://dev.profound-book-club.org`:
   - Current shows the new card (№, title, author), abstract, positioning, and the full schedule including breaks.
   - The previous book is gone from Current.
   - Chronology shows the previous book as completed and the new one as `Current selection`.
   - Up Next and its nav link are gone (or show the next announced book).
   - The hero `Volumes Read` count matches the completed Chronology rows.
4. Commit with the story's `[sc-…]` tag and push to `main`. Do not put `[skip ci]` on it, and do not push it behind a
   `[skip ci]` docs commit, or the deploy is skipped. Confirm the pipeline is green through Production and spot-check
   `https://profound-book-club.org`.

## Conventions

- **Chronology `date` is the start month**, not the completion month. A book started in June and finished in July stays
  `2026.06`.
- **The cover is the typographic CSS book card** in `CurrentBook.astro` (styles in `src/styles/current-book.css`).
  There are no jacket images to source.
- **There is one current slot.** Promoting a book overwrites `currentBook.ts`; the history lives in `chronology.ts`.
- **Each chronology row has a stable `id`.** Reviews and `#book-{id}` anchors use it. Leave an existing slug unchanged.
