# Site update: rotate to *The Leader's Handbook*

**Story:** [sc-583](https://app.shortcut.com/4legssoftware/story/583). Shipped 2026-09-28.
[PR #6](https://github.com/4legssoftware/profound-book-club/pull/6).

The site moved to the club's eighteenth book. *Leadership Is Language* (L. David Marquet) went into the Chronology as
completed, and *The Leader's Handbook* (Peter Scholtes, № XVIII) became the current book. Up Next was cleared. Same
content-only path as the previous rotation: `chronology.ts`, `currentBook.ts`, and `upcomingBook.ts`. Stage and prod
went green on the merge.

## What shipped

**Chronology.** *Leadership Is Language* stays `2026.08`, Leadership, adjacent, and is no longer the current selection.
*The Leader's Handbook* is `2026.10`, Peter Scholtes, Leadership, direct, and shows `Current selection`.

**Current book.** № XVIII, fall 2026, “Currently reading,” with the typographic book card. The abstract and positioning
were redrafted around systems, variation, and Scholtes’s critique of appraisals and forced rankings, including his
years with Deming (1987–1993). The schedule runs Oct 16 through Dec 4. Nov 27 is a no-meeting row for the U.S. holiday
weekend.

## Follow-ups

- The hero’s `Volumes Read` stat was left at 16. Completed Chronology rows are now 17. The
  [book rotation runbook](../runbooks/book-rotation-runbook.md) says that stat should track completed rows.

## Retained references

- [Book rotation runbook](../runbooks/book-rotation-runbook.md) — the steps this rotation followed
- [Rotate to *Leadership Is Language*](../changelogs/20261027-site-update-rotate-to-leadership-is-language.md) — the
  cycle that set the pattern
