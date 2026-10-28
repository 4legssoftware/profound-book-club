# Content conventions

Rules for the typed catalog in `src/content/`. The site is curated here. Rendering only reads these files.
How to rotate a book: [book rotation runbook](runbooks/book-rotation-runbook.md).
How visitor links stay active: [external links](external-links.md).

## Books

There is one current book, in `currentBook.ts`. The chronology is the history. Exactly one chronology row has
`current: true`, and its title matches the current book.

`upcomingBook` is `null` until the club announces the book after the current one. `null` hides Up Next and its nav
link. A filled object shows them.

Each chronology row has a stable `id` slug. Reviews and `#book-{id}` anchors use it, so a published slug stays put.
When the book already has an id in profound-conversations, use that slug (`wiring-winning-org`, `twenty-things`).
Otherwise use a short kebab slug (`leaders-handbook`).

Chronology `date` is the start month, `YYYY.MM`. `kind` plus `connection` (`direct` or `adjacent`) render as
`Leadership · Direct` and the like. The current row renders `Current selection` instead.

The cover is the typographic book card. There is no jacket image.

`Volumes Read` in `site.ts` is a hand-kept count of chronology rows that are not current.

Meeting time and place are copied from profound-conversations. Change them in both repos when the cadence changes.

## Reviews

Reviews live in `conversations.ts`, newest first. Dates are `YYYY.MM.DD` so a string sort stays chronological.

A Test & Analysis post is author Mike Harris, source Test & Analysis, platform Blog. `relatedBookId` is a chronology
`id`. The card’s **Re:** line uses that id. A chronology row with a review shows **See conversation** (or **See N
conversations**) and that pill opens `/conversations`, the full list.

The card shows `excerpt` as a pull-quote. `quote` is stored and is not rendered. Only the Scherkenbach review has an
excerpt.

A new review URL is also added to `docs/external-links.md` in the same change.
