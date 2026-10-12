# Story 6 (chore): Collect external links and devise a check that they stay active [sc-609]

**Epic:** Conversations — reviews continued elsewhere

## Description

Collect every external link the published site offers visitors, then devise a way to check automatically that each one
is still active and still the page we meant. Story 5 checks the new review titles and URLs by hand once. This chore
is the lasting list and the check that can be run again.

Depends on Story 5 so the review archive is in the inventory.

## Acceptance criteria

- A list of external `http` and `https` links visitors can open, each with its source (content module or page) and the
  label we show (review title, PSA title)
- The list covers conversation URLs and Of Interest URLs after Story 5. It also covers any other visitor-facing
  external link found in the built pages
- Fonts, `schema.org`, `mailto:`, and links on our own host are recorded as excluded, with the reason
- A short note recommends how to test the list automatically: what counts as active (response status, unexpected
  redirect) and what counts as current (for a review, the live title still matches the title we store)
- If that check is a small script next to the existing smoke test, this story adds it and runs it once against the
  list. If a reliable check needs more than that, the note says what to build next and this story stops at the list
  plus the recommendation
- Lint and build pass. Deploy follows the standard flow only if the story changes the site; a script-only change
  still lands on `main` through the pipeline

## Scope

**In:** An inventory of visitor-facing external links; a recommendation for an automated active/current check;
implementing that check when it stays a small local script.

**Out:** Rewriting review titles or book relations (Story 5); replacing Story 5's one-time manual title check;
monitoring on a schedule beyond a command we can run; CDK / `4ls-org`.

## Related epic

[`e603-conversations-reviews-continued-elsewhere.md`](./e603-conversations-reviews-continued-elsewhere.md) — Story 6,
after [Story 5](./s5-publish-test-and-analysis-reviews.md).

## Related implementation

| Piece | Path / note |
| ----- | ----------- |
| Review URLs | `src/content/conversations.ts` — one today; the Story 5 archive after that story |
| Of Interest URLs | `src/content/psas.ts` — In2:InThinking forum, Deming Institute YouTube |
| Rendered links | `src/components/Conversations.astro`, `src/components/PsaGrid.astro` |
| Contact | `src/components/Contact.astro` — `mailto:` only; exclude from the http list |
| Fonts | `src/layouts/BaseLayout.astro` — Google Fonts; exclude |
| Existing HTTP check | `scripts/smoke-test.cjs` — our pages only, not outbound links |

## Questions

1. **Where the check runs.** A local command we run on demand, or a pipeline step? Outbound checks can fail when a
   host rate-limits or blocks the runner.
2. **Current vs active.** Is HTTP success enough for Of Interest links, with title matching reserved for review posts?
