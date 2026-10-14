# [sc-609] Story 6 (chore): Collect external links and devise a check that they stay active

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

## Split recommendation

One story is enough. The epic already set this chore after the archive, in `profound-book-club` only. The list and
the check share one acceptance set. Two segments keep the gate the acceptance criteria already describe: the inventory
and the recommendation ship first; the script ships only when that note says a small local command is enough.

## Related epic

[`e603-conversations-reviews-continued-elsewhere.md`](./e603-conversations-reviews-continued-elsewhere.md) — Story 6,
after [Story 5](./s608-publish-test-and-analysis-reviews.md). Stories 1–5 and 7 are on `main`: the ten Test & Analysis
reviews are in `conversations.ts`, and Of Interest already points at the Deming seminar rather than the In2:InThinking
forum. Inventory the seminar URL. Epic delivery: trunk-based commits to `main` (Commit → Acceptance → Production);
**dev** is manual from localhost. This chore does not change the site, so it does not deploy dev.

## Related implementation

| Piece | Path / note |
| ----- | ----------- |
| Review URLs | `src/content/conversations.ts` — ten posts. Crawl every built page |
| Of Interest URLs | `src/content/psas.ts` — seminar and YouTube. Label is `psa.title` |
| Rendered links | `ConversationList.astro`, `PsaGrid.astro` |
| Contact | `Contact.astro` — `mailto:` only. Exclude |
| Fonts and schema | `BaseLayout.astro` — Google Fonts and JSON-LD `@context`. Exclude |
| Own host | `astro.config.mjs` `site` is `https://profound-book-club.org`. Exclude our hosts |
| SVG namespace | `Hero.astro`, `public/favicon.svg`. Exclude |
| Existing HTTP check | `scripts/smoke-test.cjs` — our pages only. Leave it |
| Pipeline | `main.yml` — new job beside `smoke-tests-prod`, after prod deploy |
| Script style | `scripts/check-action-versions.ts` via `tsx`. Lint covers `scripts/**/*.ts` |
| Lasting list | `docs/external-links.md` — story docs under `docs/e603-*/` are removed at wrap-up |

Home renders the latest three reviews; `/conversations` renders all ten. Of Interest anchor text is `Visit`; record
`psa.title`. Built links to our pages are relative. Also exclude absolute URLs on `profound-book-club.org`, `www`,
`stage`, and `dev`. CI runs `smoke-test` after stage and prod deploy. `smoke-test.cjs` is outside the lint glob
(`scripts/**/*.{js,mjs,ts}`), so the new checker should be `.ts`.

Probe on 14 Oct 2026, one GET/HEAD with a named user agent, no browser: the seminar returned 200 with no redirect; the
YouTube channel URL returned 200 with no redirect; the Leadership Is Language post's `og:title` is the stored title
(`&#8211;` decodes to the same en dash we store), and `<title>` is that string plus ` – TestAndAnalysis`. A plain
Node fetch is enough for the twelve links below. The check runs once per pipeline, after production is already
deployed, so a block or rate limit fails the workflow and Slack without holding the release. The Thursday cron on
`main.yml` re-runs that same workflow, so the check is repeated then too.

### Expected visitor links

Confirm against `dist/` after `pnpm run build`. Add any external `http`/`https` anchor the build shows that is not
here. Home includes only the first three reviews; the other seven appear on `/conversations` only.

Reviews — source `src/content/conversations.ts`, pages `/` (newest three) and `/conversations` (all). Label is the
review title.

- Help to move from test execution to decision-making – A Review of Leadership is Language by L. David Marquet  
  https://testandanalysis.home.blog/2026/10/06/help-to-move-from-test-execution-to-decision-making-a-review-of-leadership-is-language-by-l-david-marquet/
- Creative teamwork for quality – A Review of “Sidewinder – Creative Missile Development at China Lake” by Ron Westrum  
  https://testandanalysis.home.blog/2026/09/15/creative-teamwork-for-quality-a-review-of-sidewinder-creative-missile-development-at-china-lake-by-ron-westrum/
- How to get the most from the constraint on your (testing) process – A review of The Phoenix Project by Gene Kim, Kevin Behr, and George Spafford  
  https://testandanalysis.home.blog/2026/06/02/how-to-get-the-most-from-the-constraint-on-your-testing-process-the-phoenix-project-by-gene-kim-kevin-behr-and-george-spafford/
- Quality Comes First — a review of Deming's Road to Continual Improvement by William W. Scherkenbach  
  https://testandanalysis.home.blog/2025/09/16/quality-comes-first-a-review-of-demings-road-to-continual-improvement-by-william-w-scherkenbach/
- We Can Learn So Much From How AI Got Here — a review of Rebels of Reason by John Willis with Derek Lewis  
  https://testandanalysis.home.blog/2025/06/10/we-can-learn-so-much-from-how-ai-got-here-a-review-of-rebels-of-reason-by-john-willis-with-derek-lewis/
- A Great Resource for Leaders in Test and Quality — a review of Learning to Lead, Leading to Learn by Katie Anderson  
  https://testandanalysis.home.blog/2024/09/24/a-great-resource-for-leaders-in-test-and-quality-a-review-of-learning-to-lead-leading-to-learn-by-katie-anderson/
- Think Slowly When You Are Testing — and Think Slowly When You Are Automating  
  https://testandanalysis.home.blog/2024/04/16/think-slowly-when-you-are-testing-and-think-slowly-when-you-are-automating/
- Get Insights from The World of W. Edwards Deming by Cecelia S. Kilian  
  https://testandanalysis.home.blog/2024/02/20/get-insights-from-the-world-of-w-edwards-deming-by-cecelia-s-kilian/
- A Review of Understanding Variation — The Key to Managing Chaos by Donald J. Wheeler  
  https://testandanalysis.home.blog/2024/01/23/a-review-of-understanding-variation-the-key-to-managing-chaos-by-donald-j-wheeler/
- A Review of Deming's Journey to Profound Knowledge by John Willis with Derek Lewis  
  https://testandanalysis.home.blog/2023/10/03/a-review-of-demings-journey-to-profound-knowledge-by-john-botchagalupe-willis-with-derek-lewis/

Of Interest — source `src/content/psas.ts`, page `/`. Label is the PSA title (the anchor text is `Visit`).

- Deming Strategies for Sustainable Success: Innovate, Streamline, Lead  
  https://deming.org/events/deming-strategies-for-sustainable-success-innovate-streamline-lead/
- Deming's 14 Points — video series  
  https://www.youtube.com/@DemingInstitute

### Exclusions to record

| URL or scheme | Where | Reason |
| ------------- | ----- | ------ |
| `mailto:` plus the contact address | `Contact.astro`, label Get in Touch | Not an http(s) page |
| `https://schema.org` | `BaseLayout.astro` JSON-LD | Vocabulary id, not a visitor page |
| Google Fonts host, gstatic, and the CSS `href` | `BaseLayout.astro` | Stylesheet and preconnect |
| `http://www.w3.org/2000/svg` | Hero SVG, favicon | XML namespace |
| `/`, `/conversations`, `/#…`, `/favicon.svg` | Nav, chronology, **Re:**, 404 | Our site; smoke test covers these |

## Questions

1. **Where the check runs.** ~~A local command, or a pipeline step?~~ **Resolved:** A job in `main.yml`, parallel to
   `smoke-tests-prod`. Same `needs` as that job (`deploy-application-prod` and `deploy-infrastructure-prod`), so it
   starts only after production is deployed and does not sit on the path into prod. It downloads the `dist` artifact
   from `build` and does not use AWS credentials. `summary` and `notify` include it, so a failure fails the workflow
   and the Slack message. `smoke-test` stays the check of our own pages. One run per pipeline (not again on stage):
   the links are the same in both environments. The existing Thursday cron re-runs `main`, so this check rides along.
2. **Current vs active.** Is HTTP success enough for Of Interest links, with title matching reserved for review posts?
   **Proposed:** yes. **Active** for every inventoried link: GET, follow redirects, final status 2xx. **Current** for
   reviews only: after HTML-entity decode and whitespace normalize, `og:title` equals the stored title (or `<title>`
   starts with it). Of Interest stays active-only — the YouTube card title is ours, not the channel page's `<title>`.
   An unexpected redirect is a final URL whose host differs, or whose path is more than a trailing-slash change.
   `http` → `https` on the same host is fine.

## Implementation Checklist

**Segment 1 — Inventory and recommendation** (`profound-book-club`, docs)

- [ ] Resolve Questions 1 and 2 and record the answers here. The proposed answers are the default if they still hold
- [ ] `pnpm run build`. Walk `dist/**/*.html` and collect every `http`/`https` `href`, plus the exclusions in the
      table above (they are not all anchors)
- [ ] Write `docs/external-links.md`: each visitor link with URL, source module, page, and label; exclusions with
      reasons; the recommendation (active, current, unexpected redirect) using the resolved answers. Note the 14 Oct
      2026 probe. If a plain GET is not enough, name the host and what to build next, and skip Segment 2
- [ ] `pnpm run lint` (docs-only; build already ran)
- [ ] Commit and push to `main`: `[sc-609] List external links and recommend a check [skip ci]`
- [ ] That push skipped CI. Start Segment 2 only if the note says the check is a small local script

**Segment 2 — Local link check** (`profound-book-club`)

- [ ] Add `scripts/check-external-links.ts` and `pnpm run check-external-links` (`tsx`, same pattern as
      `check-action-versions`). It reads `dist/` (tell the user to build if `dist/` is missing). It prints the
      inventory, checks active/current as the note defines, and exits non-zero on a miss. No new dependencies. Do
      not change `smoke-test.cjs`
- [ ] Add a `main.yml` job parallel to `smoke-tests-prod` (same `needs`), downloading the `dist` artifact and running
      `pnpm run check-external-links`. No AWS credentials. Add the job to `summary` and `notify` so a failure fails
      the workflow and Slack. Do not add it to the stage path or run it twice
- [ ] `pnpm run lint` and `pnpm run build`, then `pnpm run check-external-links` once. It passes for the twelve links
- [ ] No dev deploy — the site output is unchanged
- [ ] Commit and push to `main`: `[sc-609] Check that external links stay active`
- [ ] That push's pipeline is green before Final

**Final — Review and verify**

- [ ] Segment 2's pipeline run is green (or, if Segment 2 was skipped, Segment 1 is on `main` and
      `docs/external-links.md` states what to build next)
- [ ] The committed script run matches `docs/external-links.md`: twelve visitor links, exclusions present, review
      titles current, Of Interest links active
- [ ] No new application unit-test harness. Coverage for this story is that one script run, plus lint and build.
      `smoke-test` still covers our own pages in the pipeline
- [ ] If `scripts/check-external-links.ts` is over 200 lines, split helpers in a follow-up segment: commit, push, and
      wait for that pipeline run before closing
