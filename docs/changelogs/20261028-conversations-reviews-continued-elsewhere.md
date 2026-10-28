# Conversations — reviews continued elsewhere

**Epic:** [epic 603](https://app.shortcut.com/4legssoftware/epic/603). Stories
[sc-604](https://app.shortcut.com/4legssoftware/story/604),
[sc-605](https://app.shortcut.com/4legssoftware/story/605),
[sc-606](https://app.shortcut.com/4legssoftware/story/606),
[sc-607](https://app.shortcut.com/4legssoftware/story/607),
[sc-608](https://app.shortcut.com/4legssoftware/story/608),
[sc-610](https://app.shortcut.com/4legssoftware/story/610), and
[sc-609](https://app.shortcut.com/4legssoftware/story/609). Shipped 2026-10-12 to 2026-10-14.

External book reviews now have a home on the site. `/conversations` lists ten Test & Analysis reviews, newest first.
The home section shows the latest three and a view-all link, and the Conversations nav item points at that page. A
chronology row with a review shows **See conversation** and opens the full list. Each card’s **Re:** line links back
to that book’s `#book-{id}` anchor on the home page. Catalog rules for ids, Up Next, and reviews are in
[content conventions](../content-conventions.md).

## What shipped

**Ids and the page (sc-604, sc-605, sc-606).** Every chronology row has a stable `id`, including *The Leader's
Handbook*. `/conversations` uses the site nav and footer. Smoke tests request that path and still require
`id="conversations"` on the home page. The home teaser reuses the same cards.

**Cross-links (sc-607).** Chronology pills go to `/conversations`, not a filtered view. **Re:** goes to
`/#book-{id}`. A jump to a book anchor clears the fixed nav.

**The archive (sc-608).** Ten reviews by Mike Harris, source Test & Analysis, from 3 Oct 2023 through the 6 Oct 2026
*Leadership Is Language* review. Sidewinder uses the article permalink. “Think Slowly…” stays on *Wiring the Winning
Organization*, and the Wheeler review stays on *Twenty Things You Need to Know*. Only the Scherkenbach card shows a
pull-quote.

**Of Interest (sc-610).** The In2:InThinking forum card is now the Deming Institute seminar, 6–7 Nov 2026 at Fordham’s
Lincoln Center. The 14 Points video series is unchanged. This swap is independent of the review archive and landed
before the link inventory, so the inventory records the seminar URL.

**External links (sc-609).** [External links](../external-links.md) lists the twelve visitor links. After production
is deployed, the pipeline crawls the built HTML, checks that set against the inventory, checks that each link returns
2xx, and checks that each review title still matches the live post. A failure fails the workflow and Slack. It does
not hold the release. The Thursday cron runs the same check. The script lives in `scripts/check-external-links.ts`
and `scripts/external-links/`.

## Follow-ups

- The seminar is 6–7 Nov 2026. The Of Interest card will need a replacement after that date.
- `quote` is filled on every review and is not rendered. Only `excerpt` shows on a card, and only Scherkenbach has one.

## Retained references

- [Content conventions](../content-conventions.md) — book ids, Up Next, review dates, and what the cards show
- [External links](../external-links.md) — the inventory and the active/current rules
- [Book rotation runbook](../runbooks/book-rotation-runbook.md) — includes the stable `id` when a book is promoted
