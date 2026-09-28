# Update site for *The Leader's Handbook* [sc-583]

**Shortcut:** [sc-583](https://app.shortcut.com/4legssoftware/story/583) — *Update site for the next book, The Leader's Handbook, schedule.*

## Summary

Rotate the site for the next book cycle: retire *Leadership Is Language* to the Chronology, promote *The Leader's Handbook*
(Peter Scholtes, № XVIII) from Upcoming to Current with the confirmed reading schedule, and clear Upcoming until the next
selection is announced.

## Acceptance criteria

- *Leadership Is Language* appears in the Chronology as a completed entry (no longer “Current selection”)
- Current-book section shows *The Leader's Handbook* (title, author, № XVIII, cover treatment, metadata, abstract/positioning)
- Reading schedule matches the source schedule in Shortcut (session dates + chapter assignments), including Nov 27 holiday break
- Schedule formatting matches the prior Current presentation (*Leadership Is Language* / *Sidewinder* style)
- Previous current book no longer shown in the current slot
- Upcoming section/nav hidden after promotion
- Deployed and verified per standard flow: local lint/build → manual **dev** content deploy → push to `main` → pipeline
  green to Production

## Book Schedule (source: Shortcut sc-583)

- Oct 16 — Week 1 — Ch.1 – Ch.2
- Oct 23 — Week 2 — Ch.3
- Oct 30 — Week 3 — Ch.4
- Nov 6 — Week 4 — Ch.5 – Ch.6
- Nov 13 — Week 5 — Ch.7 – Ch.8
- Nov 20 — Week 6 — Ch.9
- _Nov 27 — No Meeting — U.S. Holiday Weekend_
- Dec 4 — Week 7 — Ch.10

## Scope

**In:** `src/content/chronology.ts` (retire *Leadership Is Language*; add *The Leader's Handbook* as current);
`src/content/currentBook.ts` (promote № XVIII + schedule + approved abstract/positioning); `src/content/upcomingBook.ts`
(`null`); local lint/build; manual **dev** content deploy; commit + land on `main` (PR if protection blocks) for
stage→prod pipeline smoke.

**Out:** Dependency updates; CDK / `4ls-org`; jacket image redesign; next-next book announcement.

## Related prior rotation

Pattern from epic
[`e561-site-update-rotate-to-leadership-is-language`](../e561-site-update-rotate-to-leadership-is-language/e561-site-update-rotate-to-leadership-is-language.md)
([sc-563](../e561-site-update-rotate-to-leadership-is-language/s563-retire-sidewinder-to-the-chronology.md) +
[sc-564](../e561-site-update-rotate-to-leadership-is-language/s564-promote-leadership-is-language-to-current.md)). This
Shortcut story combines retire + promote + schedule (tasks 584–586) in one ticket.

E1 website foundation is **complete** — see
[`docs/e1-website-foundation/website-foundation-summary.md`](../e1-website-foundation/website-foundation-summary.md).

## Split recommendation

**Keep as one Shortcut story.** Tasks 584–586 are the same rotation seam shipped together last cycle. Segments below keep
review/deploy clear without slicing tickets.

## Related implementation

| Piece | Path / note |
| ----- | ----------- |
| Current book | `src/content/currentBook.ts` — replace № XVII with № XVIII + schedule + copy |
| Upcoming | `src/content/upcomingBook.ts` → `null` |
| Chronology | `src/content/chronology.ts` — clear LIL `current`; append *The Leader's Handbook* |
| Current UI | `src/components/CurrentBook.astro` + `src/styles/current-book.css` — CSS book-card (unchanged) |
| Meeting cadence | `src/content/site.ts` — leave as-is |
| Dev content deploy | `.cursor/commands/deploy-dev-book-club.md` → `./scripts/deploy-content-dev.sh` |

**Repo:** `profound-book-club` only.

**Schedule rows:** `Week N` / `Oct 16` / `Chapters 1–2`; Nov 27 `break: true`.

## Questions

1. **Thanksgiving gap:** ~~Add Nov 27 break?~~ **Resolved:** Yes — `No meeting · U.S. holiday weekend`.
2. **Cover:** ~~CSS book-card?~~ **Resolved:** Yes — no jacket image.
3. **Clear Upcoming?** ~~`null`?~~ **Resolved:** Yes.
4. **Chronology — LIL:** ~~Keep `2026.08` / Leadership · Adjacent; remove `current`?~~ **Resolved:** Yes.
5. **Chronology — *The Leader's Handbook*:** ~~`2026.10` / Peter Scholtes / Leadership · Direct / `current`?~~
   **Resolved:** Yes.
6. **Season / status:** ~~`fall 2026` / `Currently reading`?~~ **Resolved:** Yes.
7. **Abstract / positioning:** ~~Redraft?~~ **Resolved:** Approved copy below.

### Approved Current copy (Q7)

**`abstract`:**

> Peter Scholtes’ *The Leader’s Handbook* is a practical guide to leadership as the work of improving systems—not
> managing people in isolation. It walks leaders through systems thinking, variation, learning, and the habits that
> either create pride in work or get in its way. Among its clearest applications: why performance appraisals and
> rankings undermine cooperation, and what to do instead.

**`positioning` (Connection to Profound Knowledge):**

> Scholtes was a friend and colleague of Dr. W. Edwards Deming and shared the seminar platform with him for years,
> helping organizations learn the new philosophy of quality. *The Leader’s Handbook* speaks directly to Deming’s
> System of Profound Knowledge: understanding systems and variation, building knowledge through learning rather than
> guesswork, and leading people with respect instead of fear, blame, and ranking. Where Deming named annual appraisal
> among the diseases of management, Scholtes shows in plain language why those practices fail—and how leaders can
> redesign the conditions of work so improvement becomes possible.

## Implementation Checklist

**Repo:** `profound-book-club`. Confirm before coding.

### Segment 0 — Story doc kickoff commit

- [x] Commit refined story markdown with `[sc-583]` + `[skip ci]` (moves Shortcut to In Progress).

### Segment 1 — Content rotation (Chronology + Current + Upcoming + schedule)

- [x] `chronology.ts`: remove `current: true` from *Leadership Is Language* (keep `2026.08`, Leadership, adjacent).
- [x] `chronology.ts`: append *The Leader's Handbook* — `2026.10`, Peter Scholtes, `kind: 'Leadership'`,
      `connection: 'direct'`, `current: true`.
- [x] `currentBook.ts`: № **XVIII**, title *The Leader's Handbook*, author Peter Scholtes, `season: 'fall 2026'`,
      `status: 'Currently reading'`, approved abstract/positioning; schedule:

  | week | date | chapters |
  | ---- | ---- | -------- |
  | Week 1 | Oct 16 | Chapters 1–2 |
  | Week 2 | Oct 23 | Chapter 3 |
  | Week 3 | Oct 30 | Chapter 4 |
  | Week 4 | Nov 6 | Chapters 5–6 |
  | Week 5 | Nov 13 | Chapters 7–8 |
  | Week 6 | Nov 20 | Chapter 9 |
  | — | Nov 27 | No meeting · U.S. holiday weekend (`break: true`) |
  | Week 7 | Dec 4 | Chapter 10 |

- [x] `upcomingBook.ts`: export `null`.
- [x] **Verify:** `pnpm run lint` + `pnpm run build`; spot-check Current (card + schedule + holiday), Chronology
      (LIL completed; Handbook “Current selection”), Upcoming/nav absent.

### Final — Deploy and close

- [x] Manual **dev** content deploy (`source scripts/pro-dev.sh` → `./scripts/deploy-content-dev.sh`); confirm
      `https://dev.profound-book-club.org`.
  - Deployed 2026-09-28: S3 sync + CloudFront invalidation `I5IVCC3YCQAVTFTAU4137IX5KY` (Completed).
    Smoke: Current = *The Leader's Handbook* / Scholtes / № XVIII; schedule incl. Nov 27 break;
    Chronology LIL completed + Handbook “Current selection”; Upcoming nav absent.
- [ ] Commit content (`[sc-583]`); land on `main` (PR if protection blocks); pipeline green; spot-check prod.
  - Content committed on `cursor/sc-583-leaders-handbook-d70c`; PR [#6](https://github.com/4legssoftware/profound-book-club/pull/6)
    CI green — awaiting human review/merge (do not merge from agent).
- [x] **Coverage:** Content-only — lint/build + visual/smoke (dev).
- [x] **Long files:** Spot-check; no forced split (content data files only).
- [ ] Mark Shortcut tasks **584–586** complete when AC satisfied (after merge / prod smoke).

## Notes

- Meeting cadence (`site.meetingTime` / `meetingPlace`) already from sc-564 — unchanged.
- Chronology `date` values are **start** months (`YYYY.MM`).
- Copy redrafted from Upcoming + Scholtes/Deming background (seminar colleague; appraisal / SoPK themes).
