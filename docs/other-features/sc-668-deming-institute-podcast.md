# Replace expired seminar with Deming Institute podcast in Of Interest [sc-668]

**Shortcut:** [sc-668](https://app.shortcut.com/4legssoftware/story/668)

**Related epic:** none. This is a one-card content swap on the home page. It continues the note in
[conversations, reviews, continued elsewhere](../changelogs/20261028-conversations-reviews-continued-elsewhere.md):
the seminar card (sc-610) would need a replacement after 6–7 Nov 2026. It does not take on Resources epic 629.

## Summary

The Of Interest section (`#psa`, § III) on profound-book-club.org still lists the Deming Institute 2-Day Seminar
("Deming Strategies for Sustainable Success: Innovate, Streamline, Lead," Nov 6–7, 2026), which has already happened.
Replace it with the Deming Institute podcast, an evergreen resource, so the section stays current alongside the 14
Points video series.

## Acceptance Criteria

- The 2-Day Seminar item no longer appears in the Of Interest section.
- A Deming Institute podcast item appears in its place, styled like the existing items: a type/source label (e.g.
  *Podcast · The Deming Institute*), a title, a one-line description, and a "Visit" link.
- The podcast item has no date, since it's evergreen.
- The 14 Points video series item is unchanged.
- The section heading, nav link, and § numbering are unchanged.
- The change is live in Production after passing Commit → Acceptance.

## Scope

**In:** Swapping out the content of the one Of Interest item.

**Out:** Automatically expiring dated items (a possible follow-up story); any other section changes.

## Split recommendation

One story is enough. One card, one URL, one repo. The dated-item follow-up stays a later ticket, as the scope already
says.

## Related implementation

Repo: `profound-book-club` only. No CDK and no `4ls-org` change.

The two cards are the array in `src/content/psas.ts`. The seminar is the first object (`kind: 'event'`, meta
`2-Day Seminar`). Its date is text inside `blurb`; the `Psa` type has no date field. The second object is the 14
Points series and stays as it is, including `https://www.youtube.com/@DemingInstitute`.

`formatPsaLabel` prints `Event`, `Video Series`, or `Resource`, then ` · ` and `meta`. There is no `Podcast` label
today. `PsaGrid.astro` already renders the label, title, blurb, and `Visit` link, and it owns `§ III. — OF INTEREST`
and the heading. `Nav.astro` owns the Of Interest link. This story does not edit those two files.

The show's own site is [In Their Own Words](https://podcast.deming.org/). The institute points people there (or to a
podcast app). `https://deming.org/category/podcast/` is a blog category, not the show.

A swapped visitor URL is recorded in [external links](../external-links.md) in the same change, under
`### Of Interest`, in place of the seminar URL. The 14 Points URL stays. The inventory still has fourteen links.
`pnpm run build`, then `pnpm run check-external-links`. An ordinary `<a href>` needs no Content-Security-Policy
change. `scripts/smoke-test/check-pages.ts` only requires `id="psa"`.

The home page is what a reviewer sees on dev, so deploy content to dev before the push
([deploy to dev](../../.cursor/commands/deploy-dev-book-club.md): `source scripts/pro-dev.sh`, then
`./scripts/deploy-content-dev.sh`).

## Questions

1. **The type/source label.** The example in the acceptance criteria is *Podcast · The Deming Institute*. Today the
   only evergreen kind prints `Resource`. Recommend adding `podcast` to `PsaKind` so this card prints
   `Podcast · The Deming Institute`, with meta `The Deming Institute`. `Event` and `Video Series` stay as they are.
2. **The URL.** Recommend `https://podcast.deming.org/`, the show home, with no episode date in the card. A podcast
   app listing and the deming.org blog category stay off the card.
3. **Title and one-line description.** Recommend title `In Their Own Words` and blurb `Conversations with the Deming
   community on putting his ideas to work today.` No date in the blurb.

## Implementation Checklist

### Segment 1 — Swap the seminar card for the podcast (`profound-book-club`)

Content and the link inventory, in one commit. Meets every acceptance criterion except production, which the push
covers.

- [ ] Questions 1–3 are decided.
- [ ] Replace the seminar object in `src/content/psas.ts` with the podcast card from those answers. Leave the 14
      Points object unchanged. The blurb has no date.
- [ ] If question 1 adds a `podcast` kind, teach `formatPsaLabel` to print `Podcast`. Do not edit `PsaGrid.astro` or
      `Nav.astro`.
- [ ] In `docs/external-links.md`, replace the seminar title and URL under `### Of Interest` with the new card. Leave
      the 14 Points line. The "Fourteen links" count still matches.
- [ ] `pnpm run lint`, `pnpm run check`, and `pnpm run build` pass. `pnpm run check-external-links` passes.
- [ ] Deploy content to dev and confirm on `https://dev.profound-book-club.org`: the seminar is gone, the podcast card
      matches the answers, Visit opens the chosen URL, and the 14 Points card, the § III heading, and the Of Interest
      nav link are unchanged.
- [ ] Commit and push to `main`: `[sc-668] Replace the expired seminar with the Deming Institute podcast`
- [ ] That push's pipeline is green (Commit → Acceptance → Production) before Final.

### Final

- [ ] Production shows the podcast card and not the seminar. The 14 Points card, heading, nav link, and § III are
      unchanged.
- [ ] No CDK or Terraform in this story. `psas.ts` stays a short catalog file. `PsaGrid.astro` was not part of the
      change.
- [ ] The external-link inventory matches the built Of Interest links.
