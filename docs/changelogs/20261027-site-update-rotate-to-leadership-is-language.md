# Site update: rotate to *Leadership Is Language* — epic summary

**Epic:** [epic 561](https://app.shortcut.com/4legssoftware/epic/561). Stories
[sc-562](https://app.shortcut.com/4legssoftware/story/562),
[sc-563](https://app.shortcut.com/4legssoftware/story/563), and
[sc-564](https://app.shortcut.com/4legssoftware/story/564). Shipped 2026-08-02 to 2026-08-04.

The site moved to the club's seventeenth book. *Sidewinder* (Dr. Ron Westrum) went into the Chronology as completed, and
*Leadership Is Language* (L. David Marquet, № XVII) became the current book with its six-week reading schedule.
Dependencies were brought current first, so the content rotation shipped from a clean base. Every code push went green
through stage and prod. The steps are now a [book rotation runbook](../runbooks/book-rotation-runbook.md), which the
next rotation (*The Leader's Handbook*, sc-583) followed.

## What shipped

**Dependencies (sc-562).** `main` was tagged `v1.0.0` ("website foundation complete") before any bumps. Minor and
patch updates landed for root and `infrastructure/`, CDK included. After a one-by-one review, six majors went in:
ESLint 10, Jest 30, TypeScript 6, pnpm 11.20, `actions/setup-node` 7, and `slackapi/slack-github-action` 4. Dependabot
alerts went to zero through pnpm overrides: `svgo`, `fast-uri`, `postcss`, and `sharp` at the root, and `js-yaml`
4.3.1 in `infrastructure/`. `scripts/check-action-versions.ts` was ported from 4ls-site
(`pnpm run check-action-versions`) and used to refresh the workflow SHA pins.

**Chronology (sc-563).** *Sidewinder* became a completed row (`Systems · Adjacent`). *Win-Win* was corrected to
`Education · Direct` in the same pass.

**Current book (sc-564).** *Leadership Is Language* replaced *Sidewinder* in `currentBook.ts`, with copy adapted from
its Up Next blurb and a schedule from Aug 14 to Sep 25 that skips Labor Day weekend. Up Next was cleared, and the new
Chronology row carries `Current selection`. Meeting time and place (Fridays, 8–9 AM Eastern, over Zoom) now show on
the schedule header and on Contact, from `site.meetingTime` and `site.meetingPlace`. The Current section styles moved
from `CurrentBook.astro` to `src/styles/current-book.css`.

## Decisions worth knowing

- **Chronology dates are start months.** *Sidewinder* stays `2026.06` even though the club finished it in July.
- **The cover is the CSS book card.** The story asked for a cover image, and the typographic card counts as the cover,
  so no jacket images are sourced.
- **The reading-schedule story was folded into the promotion.** It started as a separate story (sc-565), and
  promotion and schedule shipped together.
- **Majors are reviewed one at a time and never bumped silently.** TypeScript 7 is deferred because
  `typescript-eslint`, `@astrojs/check`, and `ts-jest` don't support it yet.

## Follow-ups

- The hero's `Volumes Read` stat (`site.ts`) and `currentBook.number` are hand-kept and can drift from the Chronology.
  `Volumes Read` still says 16 after the next rotation made it 17. Deriving both from `chronology.ts` would remove a
  rotation step.
- The pnpm overrides and the TypeScript 7 deferral should be rechecked at each package update. Remove an override once
  the upstream range already resolves to a fixed version.
- Meeting time and place are copied from profound-conversations, so a cadence change has to land in both repos.

## Retained references

- [Book rotation runbook](../runbooks/book-rotation-runbook.md) — pre-reqs, the content edits, schedule row shape,
  verification, and conventions
- `v1.0.0` git tag — the last commit before this epic's dependency updates
