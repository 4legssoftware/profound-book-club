# Add Next Book Section for Leadership Is Language [sc-554]

## Goal

Add an **Up Next** section for *Leadership Is Language* (№ XVII, starts Aug 14, 2026) on the single-page Astro site, matching the Lovable design already prototyped in **`profound-conversations`**. Insert the section after **Current** and before **Chronology**, add a conditional nav link, and **renumber § headers so Roman numerals begin at Chronology** (Current and Up Next use descriptive labels instead).

## Acceptance criteria

- [ ] New **`#upcoming`** section renders between Current and Chronology with Lovable-aligned layout: volume mark (№ XVII), start date, title, author, and book blurb.
- [ ] Section header matches Lovable: **`§ NEXT — IN QUEUE`** / title **Up Next — starting soon**.
- [ ] Nav includes an **Upcoming** anchor link when upcoming-book content is present; link hidden when content is `null`.
- [ ] **Section § renumbering:** Chronology → **§ I**, Conversations → **§ II**, Of Interest → **§ III** (Contact stays unnumbered).
- [ ] Current section label updated to Lovable style (**`§ NOW — IN PROGRESS`**) so § numerals start at Chronology.
- [ ] Book copy matches the content below (including the Deming-connection paragraph).
- [ ] Site build, lint, and smoke tests pass; dev deploy verified at `https://dev.profound-book-club.org`.

## Content (source of truth)

| Field | Value |
| ----- | ----- |
| Volume | № XVII |
| Starts | Aug 14, 2026 |
| Title | Leadership Is Language |
| Author | L. David Marquet |

**Blurb (paragraph 1):** Marquet’s follow-up to Turn the Ship Around: This is a study of how the words leaders choose either shut down thinking or invite it. A natural companion to the questions about culture, variation, and the psychology of people that run through Profound Knowledge.

**Blurb (paragraph 2 — Deming connection):** In Leadership Is Language, Marquet explicitly draws on Dr. W. Edwards Deming’s critique of command‑and‑control management and his call for leaders to redesign systems rather than blame people. Dr. Deming argued that most performance problems arise from the system, and that effective leadership means creating conditions where people can think, learn, and improve together. Marquet extends that philosophy into everyday conversations: he shows how leaders’ words can either reinforce fear and compliance or invite curiosity, shared ownership, and continuous improvement. These are the very capabilities Deming saw as essential to quality and transformation.

## Scope

**In:** `profound-book-club` site content module, new Astro component, styles, nav + section renumbering, smoke-test anchor coverage, dev deploy.

**Out:** Changing the current Sidewinder selection or schedule; chronology list edits; infrastructure/CDK; `4ls-org`; multi-page routing.

## Related epic

E1 website foundation is **complete** — see [`docs/e1-website-foundation/website-foundation-summary.md`](../e1-website-foundation/website-foundation-summary.md). This story inherits **delivery only**: trunk-based commits to `main` for stage/prod pipeline; **dev** remains manual via `./scripts/deploy-content-dev.sh`.

## Related implementation

Port from the Lovable prototype (same content model and visual pattern):

| Reference | Path |
| --------- | ---- |
| Upcoming content type + data | `profound-conversations/src/content/upcomingBook.ts` |
| Section markup | `profound-conversations/src/routes/index.tsx` → `UpcomingSection()` |
| Styles | `profound-conversations/src/styles/pbc.css` (`.upcoming-*`, `#upcoming`) |
| Conditional nav | `profound-conversations/src/components/Header.tsx` |

**Target files in `profound-book-club`:**

- New: `src/content/upcomingBook.ts`, `src/components/UpcomingBook.astro`
- Update: `src/pages/index.astro`, `src/components/Nav.astro`, `src/components/CurrentBook.astro`, `src/components/Chronology.astro`, `src/components/Conversations.astro`, `src/components/PsaGrid.astro`, `scripts/smoke-test.cjs`

**Current § numbering (before):** Current § I → Chronology § II → Conversations § III → PSA § IV.

**Target § numbering (after):** Current `§ NOW` → Up Next `§ NEXT` → Chronology § I → Conversations § II → PSA § III.

## Questions

1. **Blurb layout:** ~~Render both paragraphs as a single flowing blurb (Lovable prototype), or split paragraph 2 into a **Connection to Profound Knowledge** callout like `CurrentBook.astro`?~~ **Resolved:** single flowing blurb (both paragraphs in body text; matches Lovable).
2. **`upcomingBook` nullability:** ~~Use `UpcomingBook | null` so the section and nav link disappear when no next book is scheduled?~~ **Resolved:** yes — nullable; section and nav render only when data is present (matches Lovable).
3. **Optional metadata:** ~~Include `connection: 'adjacent'` and `season: 'late summer 2026'` in the content module for future use even if not displayed in v1?~~ **Resolved:** yes — include in data model; display only Lovable-visible fields in v1.

## Implementation checklist

**Repo:** `profound-book-club` only.

### Segment 1 — Content model and Upcoming section

- [ ] Add `src/content/upcomingBook.ts` with typed `UpcomingBook | null`, populated entry for № XVII / Aug 14, 2026 / *Leadership Is Language* (single blurb combining both paragraphs; `connection` + `season` in data, not displayed).
- [ ] Add `src/components/UpcomingBook.astro` — port markup from Lovable `UpcomingSection()` (`id="upcoming"`, grid layout, meta + body).
- [ ] Port upcoming styles into the component scoped styles or `src/styles/global.css` (match Lovable spacing, typography, responsive grid).
- [ ] Wire `index.astro`: render `<UpcomingBook />` after `<CurrentBook />` when `upcomingBook !== null`.
- [ ] **Verify:** `pnpm run lint`, `pnpm run build`; confirm `#upcoming` and book title appear in `dist/index.html`.

### Segment 2 — Section renumbering, nav, and smoke coverage

- [ ] Renumber section headers: Chronology § I, Conversations § II, PSA § III.
- [ ] Update `CurrentBook.astro` header to `§ NOW — IN PROGRESS`.
- [ ] Update `Nav.astro`: conditional **Upcoming** link (`#upcoming`) when content is present; preserve link order (Current → Upcoming → Chronology → …).
- [ ] Extend `scripts/smoke-test.cjs` — require `#upcoming` when `upcomingBook` is non-null (align smoke checks with nullable content).
- [ ] **Verify:** `pnpm run smoke-test` against local build or dev URL; spot-check anchor nav in browser.

### Final — Close the story

- [ ] **Verification:** lint + build green; smoke test passes on dev (`https://dev.profound-book-club.org`).
- [ ] **Deploy:** `./scripts/deploy-content-dev.sh` after Segment 2; confirm Up Next section and renumbered headers on dev.
- [ ] **Coverage:** no CDK changes expected; no new test harness required beyond smoke test unless component logic grows.
- [ ] **Long files:** keep new component/styles focused; avoid expanding unrelated components.

## Shortcut workflow

When this doc is ready to implement, **commit it first** with message:

```text
[skip ci] [sc-554] Prepare story: add Up Next section for Leadership Is Language
```

Shortcut will move **sc-554** to **In Progress** automatically — no manual Started move needed.
