# Story 3: Promote *Leadership Is Language* to current [sc-564]

**Epic:** Site Update — Rotate to *Leadership Is Language*

## Description

Set *Leadership Is Language* by L. David Marquet as the current book. Promotion overwrites the single current-book slot,
which vacates *Sidewinder* from it. Reading schedule is handled separately in Story 4.

## Acceptance criteria

- Current-book section shows title, author (L. David Marquet), cover image, and metadata
- Cover asset and publication details sourced before build
- Adjacency framing consistent with site voice (leadership, psychology, systems)
- Previous current book (*Sidewinder*) no longer shown in the current slot
- Deployed and verified per standard flow: dev from localhost → push to `main` → pipeline green to Production

## Scope

**In:** `src/content/currentBook.ts` — replace *Sidewinder* with *Leadership Is Language* (№ XVII, author, season,
abstract, Profound Knowledge positioning, **and reading schedule** from Story 4 source data); clear `upcomingBook` to
`null` so Up Next / nav no longer duplicate the current selection; Chronology row for *Leadership Is Language* with
`current: true` (start month) so “Current selection” returns after Story 2 cleared it on *Sidewinder*; local lint/build;
manual content deploy to **dev**; commit + push to `main` for stage→prod pipeline smoke.

**Out:** Chronology *Sidewinder* retirement details (done in Story 2 — [sc-563](./s563-retire-sidewinder-to-the-chronology.md));
dependency updates (Story 1); CDK / `4ls-org`; jacket image / CurrentBook cover redesign (Q1 kept CSS card). Schedule
content is pulled forward from [sc-565](./s565-add-leadership-is-language-reading-schedule.md) by kickoff decision (Q2) —
Story 4 may become verify-only or closing hygiene once this ships.

## Related epic

[`e561-site-update-rotate-to-leadership-is-language.md`](./e561-site-update-rotate-to-leadership-is-language.md) —
Story 3 in the rotation sequence (after Chronology retirement). Epic sized schedule as Story 4; kickoff Q2 pulls schedule
data into this story so Current ships complete. Epic delivery: trunk-based commits to `main` (Commit → Acceptance →
Production); **dev** is manual from localhost.

E1 website foundation is **complete** — see
[`docs/e1-website-foundation/website-foundation-summary.md`](../e1-website-foundation/website-foundation-summary.md).

## Split recommendation

**Keep as one Shortcut story.** The epic already sized promotion separately from schedule (Story 4). Orthogonal pieces
(clear Upcoming, Chronology `current` row, Current copy) ship atomically as one content rotation; segments below keep
review clear without a second ticket.

## Related implementation

| Piece                   | Path / note                                                                                                                                                                                         |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Current book data       | `src/content/currentBook.ts` — still *Sidewinder* (№ XVI, schedule, abstract, positioning)                                                                                                          |
| Current UI              | `src/components/CurrentBook.astro` — typographic CSS **book-card** (no image under `public/` today); also renders schedule from `currentBook.schedule`                                              |
| Upcoming source (reuse) | `src/content/upcomingBook.ts` — already № XVII, title, author, `startDate: 'Aug 14, 2026'`, season, Deming-rich `blurb`, `connection: 'adjacent'` ([sc-554](../other-features/sc-554-next-book.md)) |
| Upcoming UI / nav       | `src/components/UpcomingBook.astro`, `src/pages/index.astro`, `src/components/Nav.astro` — section + nav link when `upcomingBook != null`                                                           |
| Chronology              | `src/content/chronology.ts` — *Sidewinder* completed (no `current`); `formatChronMeta` → `'Current selection'` when `current: true`                                                                 |
| SEO / schema            | `src/layouts/BaseLayout.astro` — JSON-LD uses `currentBook` title/author/abstract                                                                                                                   |
| Dev content deploy      | `.cursor/commands/deploy-dev-book-club.md` → `./scripts/deploy-content-dev.sh`                                                                                                                      |
| Smoke                   | `scripts/smoke-test.cjs` — current / upcoming anchors as applicable                                                                                                                                 |

**Repo:** `profound-book-club` only (`4ls-org` not involved).

**Copy seed:** Split upcoming `blurb` into Current `abstract` (first paragraph — leadership language / adjacency) and
`positioning` (second paragraph — Deming / system of Profound Knowledge). Tune wording against site voice in Segment 1.

**Schedule source (pulled from Story 4 / sc-565):** Aug 14 W1 Ch.1–2; Aug 21 W2 Ch.3–4; Aug 28 W3 Ch.5–6; Sep 4 break
(US holiday); Sep 11 W4 Ch.7–8; Sep 18 W5 Ch.9–10; Sep 25 W6 Ch.11 — format like *Sidewinder* (`Week N` / `Aug 14` /
`Chapters 1–2`, break row with `break: true`).

## Questions

1. **Cover treatment:** ~~AC says “cover image,” but the site uses a typographic CSS card…~~ **Resolved:** Keep the
   typographic CSS book-card for № XVII (title/author/metadata on the card = “cover”). No jacket image asset.
2. **Schedule until Story 4:** ~~Empty / hide / pull Story 4 data?~~ **Resolved:** Include Story 4’s schedule
   dates/chapters in this story (Current ships with full Meeting Schedule). Story 4 may shrink to follow-up verification.
3. **Clear Upcoming?** ~~Propose yes?~~ **Resolved:** Yes — set `upcomingBook` to `null` so Up Next / nav no longer
   advertise the book that is now current.
4. **Chronology “Current selection” row?** ~~Propose yes? Optional kind?~~ **Resolved:** Yes — append *Leadership Is
   Language*, author `L. David Marquet`, `date: '2026.08'`, `connection: 'adjacent'`, `kind: 'Leadership'`,
   `current: true` (meta: `Leadership · Adjacent` until `current` wins → “Current selection”).
5. **Season / status strings:** ~~Use upcoming’s `late summer 2026`?~~ **Resolved:** `season: 'summer 2026'`,
   `status: 'Currently reading'` (match *Sidewinder* season pattern).

## Implementation Checklist

**Repo:** `profound-book-club`.

### Segment 1 — Promote current book + clear Upcoming (+ Chronology current row)

- [x] Questions resolved (Q1–5).
- [ ] No jacket image to source (Q1). Publication details = title, author, №, season, copy from Upcoming seed + schedule.
- [ ] Update `src/content/currentBook.ts`: № **XVII**, title *Leadership Is Language*, author **L. David Marquet**,
  `season: 'summer 2026'`, `status: 'Currently reading'`, abstract + positioning from upcoming blurb (tuned); **schedule**
  from Story 4 source (see Related implementation), *Sidewinder*-style `ScheduleItem` rows including Sep 4 break.
- [ ] Keep CSS book-card only (Q1) — sync title/author/№ fields; no `CurrentBook.astro` cover-image work.
- [ ] Set `upcomingBook` to `null` in `src/content/upcomingBook.ts` (Q3).
- [ ] Append Chronology row for *Leadership Is Language*: `date: '2026.08'`, author `L. David Marquet`,
  `kind: 'Leadership'`, `connection: 'adjacent'`, `current: true`; leave *Sidewinder* completed (no `current`).
- [ ] **Verify:** `pnpm run lint` and `pnpm run build`; spot-check Current (title/author/abstract/positioning/CSS cover,
  full schedule incl. holiday break), no *Sidewinder* in current slot; Upcoming section/nav absent; Chronology “Current
  selection” matches Q4.

### Final — Deploy and close

- [ ] Manual **dev** content deploy (`source scripts/pro-dev.sh` → `./scripts/deploy-content-dev.sh`); confirm
  `https://dev.profound-book-club.org` Current + Chronology (+ no Upcoming).
- [ ] Commit content change (message includes `[sc-564]`); push to `main`; confirm pipeline green through Acceptance →
  Production; spot-check prod.
- [ ] **Coverage:** Content-only (plus optional small CurrentBook template change) — no new CDK/app tests required; rely
  on lint/build + visual/smoke.
- [ ] **Long files:** No split expected (`currentBook.ts` stays a data module; `CurrentBook.astro` only if cover work
  balloons — prefer extract styles later, not in this story).
- [ ] Story AC satisfied; ready for Story 4 ([sc-565](./s565-add-leadership-is-language-reading-schedule.md)).

## Notes

- Cover = CSS book-card (Q1); no jacket asset.
- Schedule data pulled into this story from sc-565 (Q2); Story 4 may become verify-only afterward.
- Story 2 left Chronology without a “Current selection” row on purpose until this promotion.
- Prefer adapting sc-554 Upcoming copy over rewriting Deming adjacency from scratch.
