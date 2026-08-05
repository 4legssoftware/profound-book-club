# Story 2: Retire *Sidewinder* to the Chronology [sc-563]

**Epic:** Site Update — Rotate to *Leadership Is Language*

## Description

Add *Sidewinder* to the completed-books Chronology now that the club has finished it. The current-book slot itself is
replaced in Story 3 (single slot, promotion overwrites), so this story is just the Chronology entry.

## Acceptance criteria

- *Sidewinder* added to the Chronology with title, author (Dr. Ron Westrum), and completion month/year
- Completion date confirmed before it's stamped
- Entry ordering and formatting match existing Chronology entries
- Deployed and verified per standard flow: dev from localhost → push to `main` → pipeline green to Production

## Scope

**In:** `src/content/chronology.ts` — finalize the *Sidewinder* Chronology row as a completed entry (keep start date
`2026.06`, author, `kind: 'Systems'`, `connection: 'adjacent'`; clear `current`); update *Win-Win* to
`kind: 'Education'`, `connection: 'direct'`; local build/lint; manual content deploy to **dev**; commit + push to
`main` for stage→prod pipeline smoke.

**Out:** `currentBook.ts` / Current section and schedule (Story 3 — [sc-564](./s564-promote-leadership-is-language-to-current.md));
Upcoming / cover work; dependency updates (Story 1); CDK / `4ls-org`; design-system changes.

## Related epic

[`e561-site-update-rotate-to-leadership-is-language.md`](./e561-site-update-rotate-to-leadership-is-language.md) —
Story 2 in the rotation sequence (after deps, before promoting *Leadership Is Language*). Epic delivery: trunk-based
commits to `main` (Commit → Acceptance → Production); **dev** is manual from localhost. Do not widen into the current
slot or schedule.

E1 website foundation is **complete** — see
[`docs/e1-website-foundation/website-foundation-summary.md`](../e1-website-foundation/website-foundation-summary.md).

## Split recommendation

**Keep as one Shortcut story.** The epic already sized this as a thin content seam (Chronology only). A second ticket
would not earn its own AC set; segments below keep review and deploy clear without splitting.

## Related implementation

| Piece | Path / note |
| ----- | ----------- |
| Chronology data | `src/content/chronology.ts` — *Sidewinder* already present as last row with `date: '2026.06'`, author `Dr. Ron Westrum`, `connection: 'adjacent'`, `current: true` |
| Chronology UI | `src/components/Chronology.astro` — renders date, title, author, `formatChronMeta` |
| Meta helper | `formatChronMeta` returns `'Current selection'` when `current: true`; completed rows use `kind · Direct/Adjacent` or connection only |
| Current book (do **not** edit) | `src/content/currentBook.ts` — still *Sidewinder*; vacated in Story 3 ([sc-564](./s564-promote-leadership-is-language-to-current.md)) |
| Chronology date convention | Entries use **start** month (`YYYY.MM`), not completion — *Sidewinder* stays `2026.06` |
| Dev content deploy | `.cursor/commands/deploy-dev-book-club.md` → `./scripts/deploy-content-dev.sh` |
| Smoke | `scripts/smoke-test.cjs` (if Chronology anchors are covered) |

**Repo:** `profound-book-club` only (`4ls-org` not involved).

**Interim UX (until Story 3):** After clearing `current` on *Sidewinder*, Chronology will have no “Current selection”
row while the Current section still shows *Sidewinder*. Acceptable for this epic’s story seam; call out in verification.

## Questions

1. **Completion stamp:** ~~Confirm Chronology `date` for *Sidewinder* — `2026.07` vs keep `2026.06`?~~ **Resolved:**
   Chronology dates are **start** months. Keep **`2026.06`**.
2. **Clear `current: true` in this story?** ~~Propose yes?~~ **Resolved:** Yes — remove `current: true` in this
   story. Current-book slot stays *Sidewinder* until Story 3.
3. **Optional `kind`?** ~~Add History/Culture or leave blank?~~ **Resolved:** *Sidewinder* → `kind: 'Systems'`
   (meta: `Systems · Adjacent`). Also update *Win-Win* → `kind: 'Education'`, `connection: 'direct'` (meta:
   `Education · Direct`).
4. **Adjacent Chronology cleanup:** ~~Missing-author / optional kind fills?~~ **Resolved:** Only the *Win-Win* row
   called out in Q3 — no broader Chronology cleanup.

## Implementation Checklist

**Repo:** `profound-book-club`.

### Segment 1 — Finalize *Sidewinder* Chronology entry (+ *Win-Win* meta)

- [x] Questions resolved (Q1–4). No further blockers before editing.
- [x] In `src/content/chronology.ts`, update the *Sidewinder* row: keep `date: '2026.06'`, title, author; set
      `kind: 'Systems'`, keep `connection: 'adjacent'`; remove `current: true`.
- [x] Same file: update *Win-Win* to `kind: 'Education'`, `connection: 'direct'` (title/author/date unchanged).
- [x] Leave list order as chronological (still last completed entry until Story 3 adds nothing here).
- [x] Do **not** change `currentBook.ts`, Upcoming, or other sections.
- [x] **Verify:** `pnpm run lint` and `pnpm run build`; spot-check Chronology — *Sidewinder* shows `2026.06`, author,
      meta `Systems · Adjacent` (not “Current selection”); *Win-Win* shows `Education · Direct`.

### Final — Deploy and close

- [x] Manual **dev** content deploy (`source scripts/pro-dev.sh` → `./scripts/deploy-content-dev.sh`); confirm
      Chronology at `https://dev.profound-book-club.org` (entry + formatting; interim: no Chronology “Current
      selection”).
- [x] Commit content change (message includes `[sc-563]`); push to `main`; confirm pipeline green through Acceptance →
      Production; spot-check Chronology on prod.
- [x] **Coverage:** Content-only — no new CDK/app tests required; rely on lint/build + visual/smoke.
- [x] **Long files:** No split expected (`chronology.ts` stays a data list; skip unless a prior edit already pushed it
      well past ~200 lines of non-data logic).
- [x] Story AC satisfied; ready for Story 3 ([sc-564](./s564-promote-leadership-is-language-to-current.md)).

## Notes

- Chronology `date` values are **start** months; *Sidewinder* remains `2026.06`.
- Clear `current: true` on *Sidewinder* in this story (interim: no Chronology “Current selection” until Story 3).
- *Sidewinder* meta: `Systems · Adjacent` (`kind: 'Systems'`, `connection: 'adjacent'`).
- *Win-Win* meta fix in same pass: `Education · Direct` (`kind: 'Education'`, `connection: 'direct'`).
