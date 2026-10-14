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
2. **Current vs active.** ~~Is HTTP success enough for Of Interest, with title matching reserved for reviews?~~
   **Resolved:** Yes. **Active** for every inventoried link: GET, follow redirects, final status 2xx. **Current** for
   reviews only: the stored title's words appear in order in `og:title` (or `<title>`). Case, dashes, and quotation
   marks are ignored, and either side may include extra words. The card titles are not byte-identical to the older
   WordPress titles. Of Interest stays active-only. The YouTube card title is ours, not the channel page's `<title>`.
   An unexpected redirect is a final URL whose host differs, or whose path is more than a trailing-slash change.
   `http` → `https` on the same host is fine.
3. **Proving a miss fails the pipeline.** ~~Fixture only, or a hidden link on the live site?~~ **Resolved:** Both.
   Segment 2a proves the script fails on a fixture that is not deployed. Segment 2d adds one hidden anchor (`hidden`,
   not a visible card) to a non-2xx URL and records that URL in the expected list, so the red job is the status
   check. That push deploys the hidden href to stage and prod. Segment 2e removes it and the next run is green.
4. **Keeping the list in sync.** ~~Hand-edit the snapshot, or crawl the built pages?~~ **Resolved:** Crawl `dist/`
   on every run. Compare that set to the visitor URLs in `docs/external-links.md`. A URL on only one side fails the
   script, names the URL, and fails the pipeline job. Slack reports that job failure. The failure is distinct from
   a link that is listed and rendered but not active. Segment 2a proves both drift directions locally. Segment 2b
   puts one extra URL in the expected list only, so the live HTML is unchanged, and the job goes red. Segment 2c
   restores the list.

## Implementation Checklist

**Review gate.** Finish the segment's checks, stage the diff, and show the commit message. Then stop. Commit and push
only after an explicit go-ahead. "Proceed with segment N" starts the work. It does not approve the commit.

**Segment 1 — Inventory and recommendation** (`profound-book-club`, docs)

- [x] Resolve Questions 1 and 2 and record the answers here. The proposed answers are the default if they still hold
- [x] `pnpm run build`. Walk `dist/**/*.html` and collect every `http`/`https` `href`, plus the exclusions in the
      table above (they are not all anchors)
- [x] Write `docs/external-links.md`: each visitor link with URL, source module, page, and label; exclusions with
      reasons; the recommendation (active, current, unexpected redirect) using the resolved answers. Note the 14 Oct
      2026 probe. If a plain GET is not enough, name the host and what to build next, and skip Segment 2
- [x] `pnpm run lint` (docs-only; build already ran)
- [x] Commit and push to `main`: `[sc-609] List external links and recommend a check [skip ci]`
- [x] That push skipped CI. The note says the check is a small script plus the pipeline job, so Segment 2 is next

**Segment 2a — Script and a green pipeline run** (`profound-book-club`)

- [x] Add `scripts/check-external-links.ts` and `pnpm run check-external-links` (`tsx`, same pattern as
      `check-action-versions`). It reads `dist/` by default (tell the user to build if `dist/` is missing) and accepts
      a directory argument for a fixture. It crawls visitor `http`/`https` links, compares that set to the visitor
      URLs in `docs/external-links.md`, then checks active/current. A URL on only one side fails before any fetch and
      names the URL. A listed link that is not active fails separately. Hidden anchors count. Exit non-zero on a
      miss. No new dependencies. Do not change `smoke-test.cjs`
- [x] Add a `main.yml` job parallel to `smoke-tests-prod` (same `needs`), downloading the `dist` artifact and running
      `pnpm run check-external-links`. No AWS credentials. Add the job to `summary` and `notify` so a failure fails
      the workflow and Slack. Do not add it to the stage path or run it twice
- [x] `pnpm run lint` and `pnpm run build`, then `pnpm run check-external-links` once. It passes for the twelve links
- [x] Negative check, not deployed: run the script against a fixture directory (one HTML file with a single bad
      `https` href, for example `https://example.com/profound-book-club-missing`). The script exits non-zero. The
      fixture is not under `src/` or `public/` and does not appear in `dist/`
- [x] Drift checks, not deployed. Against the real `dist/`, run the script with an expected-list copy that drops one
      real URL. It exits non-zero and names that URL as on the site and absent from the expected list. Run again with
      a copy that adds `https://example.com/not-on-the-site`. It exits non-zero and names that URL as expected and
      absent from the site. Leave `docs/external-links.md` unchanged for this push
- [x] No dev deploy — the site output is unchanged
- [x] Commit and push to `main`: `[sc-609] Check that external links stay active`
- [x] That push's pipeline is green, including the new link-check job, before Segment 2b

**Segment 2b — Expected list drift fails the workflow** (`profound-book-club`, docs)

- [ ] Add `https://example.com/not-on-the-site` to the visitor URLs in `docs/external-links.md`. Do not change the site
- [ ] `pnpm run build` and `pnpm run check-external-links`. The script fails and names that URL as expected and absent
      from the site
- [ ] No dev deploy. Do not use `[skip ci]` — the pipeline has to run
- [ ] Stop. Show the staged diff and the commit message. Wait for an explicit go-ahead
- [ ] Commit and push to `main`: `[sc-609] Confirm inventory drift fails the pipeline`
- [ ] Deploy jobs stay green. The link-check job is red, and Slack reports that failure. Confirm the red job and the
      drift message in the log before Segment 2c

**Segment 2c — Restore the expected list** (`profound-book-club`, docs)

- [ ] Remove `https://example.com/not-on-the-site` from `docs/external-links.md`
- [ ] `pnpm run check-external-links` passes
- [ ] Stop. Show the staged diff and the commit message. Wait for an explicit go-ahead
- [ ] Commit and push to `main`: `[sc-609] Restore the external-link inventory`
- [ ] That push's pipeline is green, including the link-check job, before Segment 2d

**Segment 2d — A hidden bad link fails the workflow** (`profound-book-club`)

- [ ] Add one hidden anchor, not a visible review or Of Interest card. Use `hidden` so it is absent from the layout
      and present in the built HTML. Point it at a non-2xx URL (the same example host path as the fixture). Add that
      URL to `docs/external-links.md` in the same commit so the failure is the status check, not inventory drift
- [ ] `pnpm run lint`, `pnpm run build`, and `pnpm run check-external-links`. The script fails because the URL is not
      active
- [ ] No dev deploy
- [ ] Stop. Show the staged diff and the commit message. Wait for an explicit go-ahead
- [ ] Commit and push to `main`: `[sc-609] Confirm a bad external link fails the pipeline`
- [ ] Stage and prod deploy first. The hidden href is on the live site until Segment 2e. Expect the deploy jobs green
      and the link-check job red, with Slack reporting that failure. Confirm the red job before Segment 2e

**Segment 2e — Remove the hidden link** (`profound-book-club`)

- [ ] Remove the hidden anchor and its URL from `docs/external-links.md`
- [ ] `pnpm run lint`, `pnpm run build`, and `pnpm run check-external-links`. The script passes
- [ ] No dev deploy
- [ ] Stop. Show the staged diff and the commit message. Wait for an explicit go-ahead
- [ ] Commit and push to `main`: `[sc-609] Remove the external-link failure fixture`
- [ ] That push's pipeline is green, including the link-check job, before Final

**Final — Review and verify**

- [ ] Segment 2e's pipeline run is green (or, if Segment 2 was skipped, Segment 1 is on `main` and
      `docs/external-links.md` states what to build next)
- [ ] Segment 2a showed both drift directions and a bad fixture link exiting non-zero. Segment 2b's link-check job
      failed on inventory drift. Segment 2d's link-check job failed because the hidden URL was not active
- [ ] The committed script run matches `docs/external-links.md`: twelve visitor links, exclusions present, review
      titles current, Of Interest links active. The hidden anchor and the extra expected URL are gone
- [ ] No new application unit-test harness. Coverage is the green script run, the local drift and fixture failures,
      and the two red pipeline jobs. `smoke-test` still covers our own pages in the pipeline
- [ ] If `scripts/check-external-links.ts` is over 200 lines, split helpers in a follow-up segment. Stop for review
      before that commit and push, then wait for that pipeline run before closing
