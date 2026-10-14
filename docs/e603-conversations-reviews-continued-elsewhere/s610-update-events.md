# [sc-610] Story 7: Update events

**Epic:** Conversations — reviews continued elsewhere

## Description

Replace the In2:InThinking Network Forum card in Of Interest with the Deming Institute two-day seminar. The video
series stays. The Shortcut card names the replacement and its URL; the live event page confirms that URL.

This story was added to epic 603 after stories 1–6. It does not change Conversations, chronology, or the review
archive, and it does not wait on them.

## Acceptance criteria

- The first Of Interest card is no longer the In2:InThinking Network Forum (`https://www.in2in.org/events`)
- That card is the seminar below: title, URL, kind `event`, meta `2-Day Seminar`, and the blurb in Seminar
- The label still comes from `formatPsaLabel` (`Event · {meta}`)
- Deming's 14 Points video series is unchanged
- The seminar link opens
  `https://deming.org/events/deming-strategies-for-sustainable-success-innovate-streamline-lead/`
- Lint and build pass; deployed and verified per standard flow: dev from localhost → push to `main` → pipeline green
  to Production

## Scope

**In:** The forum object in `src/content/psas.ts`.

**Out:** The video-series card; `PsaGrid` markup and styles; Conversations; chronology; CDK / `4ls-org`. If
[sc-609](./s609-external-link-check.md) has already inventoried the forum URL, refreshing that list is a follow-up on
609, not this story.

## Seminar

Live page, fetched 14 Oct 2026. The event is 6–7 Nov 2026, 8:30 AM–4:30 PM, at Fordham University's Gabelli School
of Business, Lincoln Center, New York. Co-hosted by The Deming Institute and Fordham. The 9 Oct scholarship deadline
has passed; the seminar itself has not.

Card:

- **Title:** Deming Strategies for Sustainable Success: Innovate, Streamline, Lead
- **URL:** https://deming.org/events/deming-strategies-for-sustainable-success-innovate-streamline-lead/
- **Kind:** `event`
- **Meta:** `2-Day Seminar` — the card's bracket label. The rendered label is `Event · 2-Day Seminar`
- **Blurb:** Nov 6–7, 2026 at Fordham's Lincoln Center — two days with Deming experts, working a real challenge
  through the system behind it.

## Split recommendation

One story is enough. The change is one object in `psas.ts`. It is filed on this epic because the card was added
here; it is not a seventh slice of the Conversations work, and a separate epic would only move the same edit. One
segment is enough: the swap is a single content change, and shipping the seminar without removing the forum would
leave both events up.

## Related epic

[`e603-conversations-reviews-continued-elsewhere.md`](./e603-conversations-reviews-continued-elsewhere.md) — Story 7,
added after [Story 6](./s609-external-link-check.md). Independent of stories 1–6. Epic delivery: trunk-based commits
to `main` (Commit → Acceptance → Production); **dev** is manual from localhost.

## Related implementation

| Piece | Path / note |
| ----- | ----------- |
| Event card | `src/content/psas.ts` — replace the forum object in place. Leave the video series and `psaIntro` |
| Label | `formatPsaLabel` prefixes `Event · ` when `kind` is `event` and `meta` is set. Do not put "Event" in `meta` |
| Render | `src/components/PsaGrid.astro` — title, blurb, and `Visit` link. Do not change this component |
| Smoke | `scripts/smoke-test.cjs` — requires `id="psa"` on `/`. It does not assert card titles |
| Link inventory | [sc-609](./s609-external-link-check.md) reads whatever is in `psas.ts` when that chore runs |
| Dev deploy | `source scripts/pro-dev.sh` && `./scripts/deploy-content-dev.sh` |

## Questions

1. **Meta.** ~~Use `2-Day Seminar`, or put the dates in `meta`?~~ **Resolved:** Meta is `2-Day Seminar`. The rendered
   label is `Event · 2-Day Seminar`. The dates stay in the blurb.
2. **Blurb.** ~~Use the working sentence, or supply another?~~ **Resolved:** Nov 6–7, 2026 at Fordham's Lincoln
   Center — two days with Deming experts, working a real challenge through the system behind it.

## Implementation Checklist

**Segment 1 — Replace the forum card** (`profound-book-club`)

- [x] Resolve Questions 1 and 2, and record the answers on this doc
- [x] In `src/content/psas.ts`, replace the In2:InThinking forum object with the confirmed seminar. Leave the video
      series and `psaIntro`
- [x] `pnpm run lint` and `pnpm run build`
- [x] Deploy content to dev (`source scripts/pro-dev.sh` && `./scripts/deploy-content-dev.sh`), then verify in the
      browser before the push
- [ ] Commit and push to `main`: `[sc-610] Replace the forum card with the Deming seminar`
- [ ] That push's pipeline is green before Final

**Final — Review and verify**

- [ ] The segment's pipeline run is green
- [ ] In the browser, on desktop and at a width under 720px: Of Interest shows the seminar card (label, title,
      blurb, Visit) and the unchanged video series. Visit opens the Deming event URL. The forum title and
      `in2in.org` URL are gone
- [ ] `pnpm run smoke-test` still passes for `/` (`id="psa"`)
- [ ] No new application unit-test harness; coverage for this story is the existing smoke check and the browser pass
- [ ] `psas.ts` stays under 200 lines
