# Add *Signals & Levers* as next book; extend the current book one week with *Germ Theory of Management* [sc-639]

**Shortcut:** [sc-639](https://app.shortcut.com/4legssoftware/story/639)

**Related epic:** [Resources — companion documents for the books we read](e629-resources.md)
([epic 629](https://app.shortcut.com/4legssoftware/epic/629)). This story inherits the epic's aim that the current book
can point at a companion document. It does not take on the catalog, the Resources page, chronology pills, or PDF
hosting (stories [sc-630](https://app.shortcut.com/4legssoftware/story/630) through
[sc-634](https://app.shortcut.com/4legssoftware/story/634)). The Germ Theory file stays on SPC Press.

## Summary

Two updates to the book rotation on profound-book-club.org:

1. **Next book:** *Signals & Levers* by Hendrickson & Tosi, starting **2027-01-08**.
2. **Current book:** add one more week to the current book's run. That extra week reads a related resource: *The Germ
   Theory of Management* by Myron Tribus (https://www.spcpress.com/ink/pdf/Germ-Theory-of-Management.pdf).

## Acceptance Criteria

- The upcoming-book area shows *Signals & Levers* by Hendrickson & Tosi with a start date of 2027-01-08.
- The current book's schedule runs one week longer than today, and the extra week is labeled as reading *The Germ
  Theory of Management* by Myron Tribus.
- The current book's resources show *The Germ Theory of Management* and link to the SPC Press PDF.
- The chronology picks up both changes in the usual way when the books rotate.

## Scope

**In**

- Next book entry (title, authors, start date).
- Current book end date / extra week.
- Germ Theory of Management listed as a resource of the current book, with attribution to Myron Tribus.

**Out**

- Hosting the PDF on our own CloudFront/S3 (the link points to SPC Press).
- Any other changes to book rotation logic.

## Split recommendation

One story is enough. The announcement and the extra week share one page and one date constraint: the current book's
last meeting has to stay before 2027-01-08. The epic already has its five stories; this ticket does not absorb them.

## Related implementation

Repo: `profound-book-club` only. Content files, plus a small amount of current-book markup so the new week and the
resource can link out. No CDK and no `4ls-org` change.

The announce path is the runbook's optional step, in
[book rotation runbook](../runbooks/book-rotation-runbook.md). Filling `src/content/upcomingBook.ts` shows Up Next and
the Upcoming nav link. `scripts/smoke-test/check-pages.ts` then requires `id="upcoming"` on the home page.

`src/content/upcomingBook.ts` is `null` today. `src/content/currentBook.ts` is *The Leader's Handbook*, № XVIII, fall
2026. The schedule runs Week 1 (Oct 16) through Week 7 (Dec 4), with Nov 27 as a no-meeting row. Those dates are
Fridays. One more week is **Dec 11, 2026**. Jan 8, 2027 is also a Friday, so the new end date lands before the next
book. The Fridays in between are Dec 18, Dec 25, and Jan 1.

`src/content/chronology.ts` already has `leaders-handbook` as the current row (`2026.10`, Leadership, direct). This
story leaves that file alone. Chronology `date` is the start month, so the extra week does not change it. *Signals &
Levers* becomes a chronology row only when a later rotation promotes it, using the same runbook: drop `current` on
*The Leader's Handbook*, append the new row, overwrite `currentBook.ts`, and clear or replace `upcomingBook`. A
published slug should be `signals-and-levers` unless profound-conversations already has one by then (it does not
today). `Volumes Read` in `src/content/site.ts` stays as it is.

The prototype in `profound-conversations` already has this content and is the reference for wording, not a port:

- `src/content/upcomingBook.ts` uses № XIX, author `Hendrickson & Tosi`, `startDate` `Jan 8, 2027`, season `winter
  2027`. Its blurb is lorem ipsum and is marked placeholder. Do not copy that blurb.
- `src/content/currentBook.ts` adds Week 8 on Dec 11, with an optional `url` on the schedule row. The book club
  `ScheduleItem` type has no `url` yet, and `CurrentBook.astro` prints `chapters` as plain text.
- `src/content/resources.ts` has `germ-theory-of-management`, attribution `Myron Tribus · SPC Press`, book id
  `leaders-handbook`, and the SPC Press PDF with `permitted: true`. The home page lists it under Additional Resources
  from the full catalog.

The book club has no `src/content/resources.ts`, no `/resources` route, and no Additional Resources block. A new
visitor link has to be added to [external links](../external-links.md) in the same change that renders it.
`pnpm run check-external-links` crawls `dist/` and compares. An ordinary `<a href>` to SPC Press needs no
Content-Security-Policy change.

`src/styles/current-book.css` is already about 211 lines. Resource styles for this story should stay a handful of
rules. A split of that file is its own segment if the addition makes it harder to follow.

## Questions

1. **Where the Germ Theory link lives until sc-634.** The acceptance criterion asks for the current book's resources.
   The epic's Additional Resources block, Sergent credit, and `Browse resources →` link do not exist yet, and a
   `Browse resources` link would open a page this story does not build. Recommended shape for this ticket: a short
   list on the current book with one row — the title links to the SPC Press PDF in a new tab, and the line credits
   Myron Tribus. The Week 8 label also names the paper and Myron Tribus, and uses the same URL. sc-634 later replaces
   this list with the catalog-driven block and moves the entry into the catalog. Confirm this shape before coding.
2. **The gap after Dec 11.** Recommended schedule change is one new row only: Week 8, Dec 11, 2026. Dec 18, Dec 25,
   and Jan 1 stay off both schedules. Up Next carries the Jan 8 start. Dec 25 and Jan 1 are U.S. holiday Fridays; Dec
   18 is an open Friday with no row. Confirm that gap is intended.
3. **Up Next fields beyond the acceptance criteria.** Recommended entry: № XIX, title *Signals & Levers*, author
   `Hendrickson & Tosi`, `startDate` `Jan 8, 2027`, season `winter 2027`. Leave `blurb` and `connection` unset until
   there is real copy and a rotation-time `kind`. Confirm the author string (given names or the surname pair) and
   that shipping without a blurb is acceptable.

## Implementation Checklist

### Segment 1 — Announce *Signals & Levers* and add the extra week (`profound-book-club`)

Content only. Meets the upcoming-book criterion and the longer schedule. The PDF link is Segment 2.

- [ ] Resolve questions 2 and 3.
- [ ] Set `src/content/upcomingBook.ts` from the confirmed Up Next fields. Leave `blurb` unset when there is no real
      copy.
- [ ] Append the confirmed extra week to `schedule` in `src/content/currentBook.ts`. The `chapters` text names *The
      Germ Theory of Management* and Myron Tribus. Leave `chronology.ts` and `site.ts` unchanged.
- [ ] `pnpm run lint`, `pnpm run format:check`, and `pnpm run build`.
- [ ] Deploy dev (`source scripts/pro-dev.sh`, then `./scripts/deploy-content-dev.sh`). On
      `https://dev.profound-book-club.org`: Up Next shows the title, authors, and Jan 8, 2027; the Upcoming nav link
      is present; Week 8 is on the current schedule; *The Leader's Handbook* is still `Current selection` in the
      chronology; Up Next has no placeholder blurb.
- [ ] Commit and push to `main`: `[sc-639] Announce Signals & Levers and extend the current schedule`. No `[skip ci]`.
- [ ] That pipeline is green through Production before Segment 2. Spot-check `https://profound-book-club.org`.

### Segment 2 — Link *The Germ Theory of Management* from the current book (`profound-book-club`)

Depends on question 1. Skip this segment only if kickoff decides the Week 8 label with no link already meets the
resources criterion; in that case fold a plain-text credit into Segment 1 and do not add a URL.

- [ ] Add an optional `url` on `ScheduleItem` and render it in `CurrentBook.astro` as the week label
      (`target="_blank"`, `rel="noopener noreferrer"`). Point Week 8 at
      `https://www.spcpress.com/ink/pdf/Germ-Theory-of-Management.pdf`.
- [ ] Add the short current-book resource list from question 1: one title, the same PDF URL, attribution Myron
      Tribus. Keep the data beside the current book so sc-634 can replace the block. Do not add `/resources`, a
      catalog file, a Sergent credit, or a chronology pill.
- [ ] Add the new visitor URL to `docs/external-links.md` once, even though the schedule and the resource list share
      it.
- [ ] `pnpm run lint`, `pnpm run format:check`, `pnpm run build`, and `pnpm run check-external-links`.
- [ ] Deploy dev. On the home page, open the Week 8 label and the resource title; both reach the SPC Press PDF. Check
      the current-book column at phone width.
- [ ] Commit and push to `main`: `[sc-639] Link Germ Theory of Management from the current book`. No `[skip ci]`.
- [ ] That pipeline is green through Production. Spot-check the PDF links on `https://profound-book-club.org`.

### Final

- [ ] Segment 2's pipeline run is green (or Segment 1's, if question 1 dropped Segment 2). Dev was checked before each
      push.
- [ ] No new application test suite. The build, the external-link check, and the existing smoke test cover this
      change. Once `upcomingBook` is set, smoke requires `#upcoming`.
- [ ] If resource styles were added to `src/styles/current-book.css` and the file is harder to follow, split it in its
      own segment, push, and wait for that pipeline. Leave the file as it stands when the addition is only a few
      rules.
- [ ] Story-kickoff alignment: questions 1–3 are answered in this doc before implementation starts.

## Notes

- Dates: the extra week for the current book may affect the gap before 2027-01-08; confirm the current book's new end
  date still lands before the next book starts. Dec 11, 2026 does, if question 2 is confirmed.
- The PDF is hosted by SPC Press, so this story links out and skips the epic's PDF hosting and permission-to-publish
  path.
