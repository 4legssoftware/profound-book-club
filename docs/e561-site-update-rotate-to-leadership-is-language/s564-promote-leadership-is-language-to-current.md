# Story 3: Promote *Leadership Is Language* to current [sc-564]

**Epic:** Site Update — Rotate to *Leadership Is Language*

## Description

Set *Leadership Is Language* by L. David Marquet as the current book. Promotion overwrites the single current-book slot,
which vacates *Sidewinder* from it. Also publish the reading schedule in the current-book section (same presentation as
*Sidewinder*), absorbing what was originally epic Story 4 / [sc-565].

## Acceptance criteria

- Current-book section shows title, author (L. David Marquet), cover image, and metadata
- Cover asset and publication details sourced before build
- Adjacency framing consistent with site voice (leadership, psychology, systems)
- Previous current book (*Sidewinder*) no longer shown in the current slot
- Schedule renders in the current-book section
- Session dates and chapter/section assignments match the source schedule
- Formatting and layout match how the *Sidewinder* schedule was presented
- Source schedule finalized and confirmed before entry
- Meeting cadence shown on the Current schedule (time + place) and on Contact, matching profound-conversations
- Deployed and verified per standard flow: dev from localhost → push to `main` → pipeline green to Production

## Book Schedule

Include the book's schedule on the site with the same style as was used with *Sidewinder*'s schedule.

- [x] Aug 14 - Week 1
    - [x] Ch.1 - Ch.2
- [x] Aug 21 - Week 2
    - [x] Ch.3 - Ch.4
- [x] Aug 28 - Week 3
    - [x] Ch.5 - Ch.6
- [x] _Sep 4 - No Meeting - US Holiday Weekend_
- [x] Sep 11 - Week 4
    - [x] Ch.7 - Ch.8
- [x] Sep 18 - Week 5
    - [x] Ch.9 - Ch. 10
- [x] Sep 25 - Week 6
    - [x] Ch.11

## Scope

**In:** `src/content/currentBook.ts` — replace *Sidewinder* with *Leadership Is Language* (№ XVII, author, season,
abstract, Profound Knowledge positioning, **and reading schedule**); clear `upcomingBook` to `null` so Up Next / nav no
longer duplicate the current selection; Chronology row for *Leadership Is Language* with `current: true` (start month) so
“Current selection” returns after Story 2 cleared it on *Sidewinder*; local lint/build; manual content deploy to **dev**;
commit + push to `main` for stage→prod pipeline smoke.

**Out:** Chronology *Sidewinder* retirement details (done in Story 2 — [sc-563](./s563-retire-sidewinder-to-the-chronology.md));
dependency updates (Story 1); CDK / `4ls-org`; jacket image / CurrentBook cover redesign (Q1 kept CSS card). Schedule
scope was absorbed from superseded Story 4 / sc-565 (doc removed).

## Related epic

[`e561-site-update-rotate-to-leadership-is-language.md`](./e561-site-update-rotate-to-leadership-is-language.md) —
Story 3 in the rotation sequence (after Chronology retirement). Schedule (originally Story 4) is in scope here. Epic
delivery: trunk-based commits to `main` (Commit → Acceptance → Production); **dev** is manual from localhost.

E1 website foundation is **complete** — see
[`docs/e1-website-foundation/website-foundation-summary.md`](../e1-website-foundation/website-foundation-summary.md).

## Split recommendation

**Keep as one Shortcut story.** Promotion + schedule ship together (Q2). Orthogonal pieces (clear Upcoming, Chronology
`current` row, Current copy + schedule) land as one content rotation.

## Related implementation

| Piece | Path / note |
| ----- | ----------- |
| Current book data | `src/content/currentBook.ts` — № XVII *Leadership Is Language*, schedule, abstract, positioning |
| Current UI | `src/components/CurrentBook.astro` — typographic CSS **book-card**; renders `currentBook.schedule` |
| Upcoming | `src/content/upcomingBook.ts` — `null` after promotion ([sc-554](../other-features/sc-554-next-book.md) was source seed) |
| Upcoming UI / nav | Hidden when `upcomingBook == null` |
| Chronology | `src/content/chronology.ts` — *Leadership Is Language* `2026.08` with `current: true`; *Sidewinder* completed |
| SEO / schema | `src/layouts/BaseLayout.astro` — JSON-LD uses `currentBook` |
| Dev content deploy | `.cursor/commands/deploy-dev-book-club.md` → `./scripts/deploy-content-dev.sh` |
| Smoke | `scripts/smoke-test.cjs` |

**Repo:** `profound-book-club` only (`4ls-org` not involved).

**Copy seed:** Upcoming `blurb` → Current `abstract` (para 1) + `positioning` (para 2 / Deming).

**Schedule rows (Sidewinder-style):** `Week N` / `Aug 14` / `Chapters 1–2`; Sep 4 break with `break: true`.

## Questions

1. **Cover treatment:** ~~AC says “cover image,” but the site uses a typographic CSS card…~~ **Resolved:** Keep the
   typographic CSS book-card for № XVII (title/author/metadata on the card = “cover”). No jacket image asset.
2. **Schedule:** ~~Empty / hide / include source now?~~ **Resolved:** Include full schedule in this story (absorbs
   former Story 4 / sc-565).
3. **Clear Upcoming?** ~~Propose yes?~~ **Resolved:** Yes — set `upcomingBook` to `null`.
4. **Chronology “Current selection” row?** ~~Propose yes? Optional kind?~~ **Resolved:** Yes — append *Leadership Is
   Language*, author `L. David Marquet`, `date: '2026.08'`, `connection: 'adjacent'`, `kind: 'Leadership'`,
   `current: true`.
5. **Season / status strings:** ~~Use upcoming’s `late summer 2026`?~~ **Resolved:** `season: 'summer 2026'`,
   `status: 'Currently reading'`.

## Implementation Checklist

**Repo:** `profound-book-club`.

### Segment 1 — Promote current book + clear Upcoming (+ Chronology current row) + schedule

- [x] Questions resolved (Q1–5).
- [x] No jacket image to source (Q1). Publication details = title, author, №, season, copy from Upcoming seed + schedule.
- [x] Update `src/content/currentBook.ts`: № **XVII**, title *Leadership Is Language*, author **L. David Marquet**,
  `season: 'summer 2026'`, `status: 'Currently reading'`, abstract + positioning from upcoming blurb; **schedule** per
  Book Schedule above, *Sidewinder*-style `ScheduleItem` rows including Sep 4 break.
- [x] Keep CSS book-card only (Q1) — sync title/author/№ fields; no `CurrentBook.astro` cover-image work.
- [x] Set `upcomingBook` to `null` in `src/content/upcomingBook.ts` (Q3).
- [x] Append Chronology row for *Leadership Is Language*: `date: '2026.08'`, author `L. David Marquet`,
  `kind: 'Leadership'`, `connection: 'adjacent'`, `current: true`; leave *Sidewinder* completed (no `current`).
- [x] **Verify:** `pnpm run lint` and `pnpm run build`; spot-check Current (title/author/abstract/positioning/CSS cover,
  full schedule incl. holiday break), no *Sidewinder* in current slot; Upcoming section/nav absent; Chronology “Current
  selection” matches Q4.

### Segment 2 — Meeting cadence (schedule header + Contact)

- [x] Add `meetingTime` / `meetingPlace` to `src/content/site.ts` (same copy as profound-conversations).
- [x] Current schedule: `schedule-when` row under header (`Meeting Schedule` / season) — mono strip styling from
      prototype.
- [x] Contact: `contact-when` above CTA — “We meet weekly, … — **Fridays · …**” (Fraunces in place of Source Serif 4).
- [x] **Verify:** `pnpm run lint` / `pnpm run build`; spot-check Current + Contact.

### Final — Deploy and close

- [x] Manual **dev** content deploy (`source scripts/pro-dev.sh` → `./scripts/deploy-content-dev.sh`); confirm
  `https://dev.profound-book-club.org` Current + Chronology (+ no Upcoming).
- [x] Commit content change (message includes `[sc-564]`); push to `main`; confirm pipeline green through Acceptance →
  Production; spot-check prod.
- [x] **Coverage:** Content-only — no new CDK/app tests required; rely on lint/build + visual/smoke.
- [x] **Long files:** Extracted Current section styles to `src/styles/current-book.css` (scoped under `#current`);
  `CurrentBook.astro` is markup-only (~50 lines). Book rotations stay in `currentBook.ts`.
- [x] Story AC satisfied (promotion + schedule + meeting cadence). Former Story 4 / sc-565 absorbed; Shortcut sc-565 can
  be closed as superseded.

## Notes

- Cover = CSS book-card (Q1); no jacket asset.
- Schedule absorbed from sc-565 (Q2); s565 markdown deleted.
- Meeting time/place from profound-conversations (`site.meetingTime` / `meetingPlace`) on schedule + Contact.
- Story 2 left Chronology without a “Current selection” row on purpose until this promotion.
- Prefer adapting sc-554 Upcoming copy over rewriting Deming adjacency from scratch.
