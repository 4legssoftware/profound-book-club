# Replace expired seminar with Deming Institute podcast in Of Interest [sc-668]

**Shortcut:** [sc-668](https://app.shortcut.com/4legssoftware/story/668)

**Related epic:** none. This is a content change on the home page. It continues the note in
[conversations, reviews, continued elsewhere](../changelogs/20261028-conversations-reviews-continued-elsewhere.md):
the seminar card (sc-610) would need a replacement after 6–7 Nov 2026. It does not take on Resources epic 629.

## Summary

The Of Interest section (`#psa`, § III) on profound-book-club.org still lists the Deming Institute 2-Day Seminar
("Deming Strategies for Sustainable Success: Innovate, Streamline, Lead," Nov 6–7, 2026), which has already happened.
Replace it with the Deming Institute podcast, an evergreen resource, and add the institute's Tools & Methods Catalog
playlist, so the section stays current alongside the 14 Points video series.

## Acceptance Criteria

- The 2-Day Seminar item no longer appears in the Of Interest section.
- A Deming Institute podcast item appears in the section, styled like the existing items: a type/source label (e.g.
  *Podcast · The Deming Institute*), a title, a one-line description, and a "Visit" link.
- The podcast item has no date, since it's evergreen.
- A Tools & Methods Catalog playlist item appears in the section
  (`https://www.youtube.com/playlist?list=PLdxAnF1F8MHA`), styled the same way, with no date.
- Card order is Tools & Methods Catalog, then 14 Points for Management, then In Their Own Words.
- The 14 Points card keeps its label and description. Its title is `14 Points for Management` and its link is
  `https://www.youtube.com/playlist?list=PLIpkt_z8kJT8CIlnRfLk8r40LaTRJH9O5`.
- The section heading, nav link, and § numbering are unchanged.
- The change is live in Production after passing Commit → Acceptance.

## Scope

**In:** Replacing the seminar card, and adding the Tools & Methods Catalog playlist card.

**Out:** Automatically expiring dated items (a possible follow-up story); any other section changes.

## Split recommendation

One story is enough. Both cards live in the same array and the same link inventory. The dated-item follow-up stays a
later ticket.

## Related implementation

Repo: `profound-book-club` only. No CDK and no `4ls-org` change.

The cards are the array in `src/content/psas.ts`, and that array order is the page order. Today the seminar is first
(`kind: 'event'`, meta `2-Day Seminar`) and its date is text inside `blurb`; the `Psa` type has no date field. The 14
Points card is second. Its title is `14 Points for Management` and its URL is the playlist
`https://www.youtube.com/playlist?list=PLIpkt_z8kJT8CIlnRfLk8r40LaTRJH9O5`. Its label and blurb stay. The new order
is the tools playlist, then 14 Points, then the podcast.

YouTube titles the playlist **Tools & Methods Catalog in DemingNEXT**, by The Deming Institute. It has eight videos:
an intro, then Aim and Purpose, Understanding PDSA, Affinity Grouping, Spread Method, Value Stream Map, Control
Charts, and Prioritization Matrix. The list id in the URL is short and still resolves.

`formatPsaLabel` prints `Event`, `Video Series`, or `Resource`, then ` · ` and `meta`. There is no `Podcast` label
today. A `video` kind already prints `Video Series`, which fits the playlist. `PsaGrid.astro` already renders the
label, title, blurb, and `Visit` link, and it owns `§ III. — OF INTEREST` and the heading. The grid is
`repeat(auto-fit, minmax(320px, 1fr))`, so a third card wraps on a narrow window. `Nav.astro` owns the Of Interest
link. This story does not edit those two files.

The show's own site is [In Their Own Words](https://podcast.deming.org/). The institute points people there (or to a
podcast app). `https://deming.org/category/podcast/` is a blog category, not the show.

Visitor URLs are recorded in [external links](../external-links.md) in the same change, under `### Of Interest`, in
the order the cards render. The seminar URL and the Deming Institute channel URL come out. The tools playlist, the
14 Points playlist, and the podcast URL are the three Of Interest links. The inventory goes from fourteen links to
fifteen, and the intro line that says "both Of Interest cards" becomes three.
`pnpm run build`, then `pnpm run check-external-links`. An ordinary `<a href>` needs no Content-Security-Policy
change. `scripts/smoke-test/check-pages.ts` only requires `id="psa"`.

The home page is what a reviewer sees on dev, so deploy content to dev before the push
([deploy to dev](../../.cursor/commands/deploy-dev-book-club.md): `source scripts/pro-dev.sh`, then
`./scripts/deploy-content-dev.sh`).

## Questions

1. **The podcast type/source label.** Decided: add `podcast` to `PsaKind` so this card prints
   `Podcast · The Deming Institute`, with meta `The Deming Institute`. `Event` and `Video Series` stay as they are.
2. **The podcast URL.** Decided: `https://podcast.deming.org/`, the show home. No episode date on the card. A
   podcast app listing and the deming.org blog category stay off the card.
3. **Podcast title and one-line description.** Decided: title `In Their Own Words` and blurb `Conversations about
   applying Deming in modern organizations.` No date in the blurb.
4. **Playlist card.** Decided: `kind: 'video'`, meta `The Deming Institute` (label `Video Series · The Deming
   Institute`), title `Tools & Methods Catalog in DemingNEXT`, blurb `Short videos from the institute on PDSA,
   control charts, and the other methods in the DemingNEXT catalog.` URL
   `https://www.youtube.com/playlist?list=PLdxAnF1F8MHA`. No date.
5. **Card order.** Decided: Tools & Methods Catalog, then 14 Points for Management, then In Their Own Words.
6. **14 Points card.** Decided: title `14 Points for Management`, URL
   `https://www.youtube.com/playlist?list=PLIpkt_z8kJT8CIlnRfLk8r40LaTRJH9O5`. Label and blurb stay. Card heights
   stay as the grid already lays them out.

## Implementation Checklist

### Segment 1 — Swap the seminar and add the playlist (`profound-book-club`)

Content and the link inventory, in one commit. Meets every acceptance criterion except production, which the push
covers.

- [x] Questions 1–6 are decided.
- [x] In `src/content/psas.ts`, order the array as the tools playlist, the 14 Points card from question 6, then the
      podcast card from questions 1–3. Drop the seminar. Neither new blurb has a date.
- [x] Teach `formatPsaLabel` to print `Podcast` for the new kind. Do not edit `PsaGrid.astro` or `Nav.astro`.
- [x] In `docs/external-links.md`, list the Of Interest cards in that same order: playlist, 14 Points, podcast.
      Remove the seminar URL. Update the link count from fourteen to fifteen, and the line that says both Of Interest
      cards.
- [x] `pnpm run lint`, `pnpm run check`, and `pnpm run build` pass. `pnpm run check-external-links` passes.
- [x] Deploy content to dev and confirm on `https://dev.profound-book-club.org`: the seminar is gone, the three cards are
      playlist, 14 Points, then podcast, each Visit opens its URL, and the § III heading and the Of Interest nav link
      are unchanged. Check the three cards at a phone width.
- [x] Stop here and wait for manual review of dev
- [x] Commit and push to `main`: `[sc-668] Replace the expired seminar with current Deming resources` (`99e173b`)
- [x] That push's pipeline is green (Commit → Acceptance → Production) before Final.
      https://github.com/4legssoftware/profound-book-club/actions/runs/45508628081

### Final

- [x] Production shows the tools playlist, 14 Points for Management, and the podcast, and not the seminar. The heading,
      nav link, and § III are unchanged.
- [x] No CDK or Terraform in this story. `psas.ts` is 50 lines. `PsaGrid.astro` was not part of the change.
- [x] The external-link inventory matches the built Of Interest links. The pipeline's External Link Check passed.
