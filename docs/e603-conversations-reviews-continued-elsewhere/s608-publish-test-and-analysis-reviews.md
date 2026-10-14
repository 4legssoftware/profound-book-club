# [sc-608] Story 5: Publish the Test & Analysis reviews, including Sidewinder and Leadership Is Language

**Epic:** Conversations — reviews continued elsewhere

## Description

Fill `conversations.ts` with the Test & Analysis reviews from the Lovable archive, plus the Sidewinder, Leadership Is
Language, and Phoenix Project reviews. The Scherkenbach review already on the site is the first of the Lovable seven;
this story completes that entry and adds the rest.

Depends on Stories 1–4 for ids, the page, the teaser, and the cross-links. After this story the teaser shows the three
newest reviews, and chronology pills appear on every book in the list below. Every Test & Analysis post is attributed
to Mike Harris.

## Acceptance criteria

- The archive contains the reviews in the list below, each with the stated title, URL, ISO date, and `relatedBookId`
- Sidewinder uses the article permalink (the tag page is only a finder). Leadership Is Language links to the 6 Oct
  2026 review
- Each review attaches to the chronology id in the list, including `leadership-is-language` on the current-selection
  row and `phoenix-project`
- Newest-first order on the page and the home teaser follows `date` (Leadership Is Language, then Sidewinder, then
  the Phoenix Project review in the top three)
- Every entry, including Scherkenbach, uses author Mike Harris, source Test & Analysis, and platform Blog
- **Testing note:** manually open every link and confirm the live post title and URL match this list before the story
  is called done
- Lint and build pass; deployed and verified per standard flow: dev from localhost → push to `main` → pipeline green
  to Production

## Scope

**In:** `src/content/conversations.ts` only. The Scherkenbach `excerpt` stays (Story 2). New rows set `quote` to
`_TBD_` and have no excerpt.

**Out:** New chronology rows; current-book or upcoming-book edits; page or nav design; CDK / `4ls-org`.

## Reviews

Newest first. `relatedBookId` is the chronology slug from Story 1. Store each date as `YYYY.MM.DD` (Q5); the ISO dates
below are the calendar days.

- **2026-10-06** — `leadership-is-language`  
  Help to move from test execution to decision-making – A Review of Leadership is Language by L. David Marquet  
  https://testandanalysis.home.blog/2026/10/06/help-to-move-from-test-execution-to-decision-making-a-review-of-leadership-is-language-by-l-david-marquet/
- **2026-09-15** — `sidewinder`  
  Creative teamwork for quality – A Review of “Sidewinder – Creative Missile Development at China Lake” by Ron
  Westrum  
  https://testandanalysis.home.blog/2026/09/15/creative-teamwork-for-quality-a-review-of-sidewinder-creative-missile-development-at-china-lake-by-ron-westrum/
- **2026-06-02** — `phoenix-project`  
  How to get the most from the constraint on your (testing) process – A review of The Phoenix Project by Gene Kim,
  Kevin Behr, and George Spafford  
  https://testandanalysis.home.blog/2026/06/02/how-to-get-the-most-from-the-constraint-on-your-testing-process-the-phoenix-project-by-gene-kim-kevin-behr-and-george-spafford/
- **2025-09-16** — `demings-road`  
  Quality Comes First — a review of Deming's Road to Continual Improvement by William W. Scherkenbach  
  https://testandanalysis.home.blog/2025/09/16/quality-comes-first-a-review-of-demings-road-to-continual-improvement-by-william-w-scherkenbach/
- **2025-06-10** — `rebels-of-reason`  
  We Can Learn So Much From How AI Got Here — a review of Rebels of Reason by John Willis with Derek Lewis  
  https://testandanalysis.home.blog/2025/06/10/we-can-learn-so-much-from-how-ai-got-here-a-review-of-rebels-of-reason-by-john-willis-with-derek-lewis/
- **2024-09-24** — `learning-to-lead`  
  A Great Resource for Leaders in Test and Quality — a review of Learning to Lead, Leading to Learn by Katie
  Anderson  
  https://testandanalysis.home.blog/2024/09/24/a-great-resource-for-leaders-in-test-and-quality-a-review-of-learning-to-lead-leading-to-learn-by-katie-anderson/
- **2024-04-16** — `wiring-winning-org`  
  Think Slowly When You Are Testing — and Think Slowly When You Are Automating  
  https://testandanalysis.home.blog/2024/04/16/think-slowly-when-you-are-testing-and-think-slowly-when-you-are-automating/
- **2024-02-20** — `world-of-deming`  
  Get Insights from The World of W. Edwards Deming by Cecelia S. Kilian  
  https://testandanalysis.home.blog/2024/02/20/get-insights-from-the-world-of-w-edwards-deming-by-cecelia-s-kilian/
- **2024-01-23** — `twenty-things`  
  A Review of Understanding Variation — The Key to Managing Chaos by Donald J. Wheeler  
  https://testandanalysis.home.blog/2024/01/23/a-review-of-understanding-variation-the-key-to-managing-chaos-by-donald-j-wheeler/
- **2023-10-03** — `demings-journey`  
  A Review of Deming's Journey to Profound Knowledge by John Willis with Derek Lewis  
  https://testandanalysis.home.blog/2023/10/03/a-review-of-demings-journey-to-profound-knowledge-by-john-botchagalupe-willis-with-derek-lewis/

## Split recommendation

One story is enough. The epic already separated the archive from ids (Story 1), the page (Story 2), the teaser
(Story 3), and the cross-links (Story 4). This story is one file in `profound-book-club`. One segment is enough: the
ten rows are one content slice, well under 400 lines, and a partial archive would leave the teaser and the manual
link check unfinished.

## Related epic

[`e603-conversations-reviews-continued-elsewhere.md`](./e603-conversations-reviews-continued-elsewhere.md) — Story 5,
after [Story 4](./s607-link-chronology-and-conversations.md). Stories 1–4 are on `main`: chronology ids exist,
`/conversations` and the home teaser share `ConversationList`, and chronology pills and **Re:** links are live. With
one review in the data, only `demings-road` shows **See conversation**. Epic delivery: trunk-based commits to `main`
(Commit → Acceptance → Production); **dev** is manual from localhost.

## Related implementation

| Piece | Path / note |
| ----- | ----------- |
| Live record | `src/content/conversations.ts` — `Conversation` requires `quote`. Scherkenbach keeps its quote and excerpt. The nine new rows set `quote` to `_TBD_` and omit `excerpt`, so the placeholder does not render. Update Scherkenbach in place |
| Sort and cards | `src/components/ConversationList.astro` — copies the array and sorts `date` with `localeCompare` descending. Renders `excerpt` when set, then **Re:** when `relatedBookId` matches a chronology id, then `author · source` and the stored date. Nothing reads `quote`. Do not change this component |
| Dates | Story 1 stores `YYYY.MM.DD`. Hyphens and dots do not sort together: `localeCompare` stops at the separator. Store `2026.10.06`, not `2026-10-06` |
| Reference list | `profound-conversations/src/content/conversations.ts` — the seven older posts (author there is “Test & Analysis”; source is the hostname). Copy titles, URLs, and `relatedBookId`s. Do not copy that author or source. Sidewinder, Leadership Is Language, and Phoenix Project are not in that file |
| Sidewinder finder | https://testandanalysis.home.blog/tag/sidewinder/ — use the article URL in the table |
| Chronology | `src/content/chronology.ts` — all ten ids exist. `current: true` is on `leaders-handbook`, not `leadership-is-language`. Attach the 6 Oct 2026 review to `leadership-is-language`. Each of the ten books has one review, so each pill reads **See conversation**. The other eight rows, including the current book, stay without a pill |
| Teaser | Home passes `limit={3}`. After the seed the top three are Leadership Is Language (`2026.10.06`), Sidewinder (`2026.09.15`), and Phoenix Project (`2026.06.02`) |
| Smoke | `scripts/smoke-test.cjs` — HTTP 200 for `/` and `/conversations`, and `id="conversations"` on `/`. No new assertion |
| Dev deploy | `.cursor/commands/deploy-dev-book-club.md` → `source scripts/pro-dev.sh` && `./scripts/deploy-content-dev.sh` (content only) |

## Testing note

Open every URL in the manual link check under **Final** and confirm the live post title matches. Do this before
calling the story done. The check is titles and links; book relations stay as listed.

## Questions

1. **Attribution.** ~~Author Test & Analysis, or Mike Harris?~~ **Resolved:** Anything from the Test & Analysis blog
   is attributed to Mike Harris. Author `Mike Harris`, source `Test & Analysis`, platform `Blog`, including the
   existing Scherkenbach entry.
2. **Think Slowly…** ~~Relate to *Wiring the Winning Organization*, or leave unset?~~ **Resolved:** Keep the post
   title as stated and relate it to `wiring-winning-org`.
3. **Understanding Variation.** ~~Relate to *Twenty Things You Need to Know*, or leave unset?~~ **Resolved:** Keep the
   post title as stated and relate it to `twenty-things`.
4. **Phoenix Project review.** ~~Include the 2 Jun 2026 post?~~ **Resolved:** Include it. Keep the post title as
   stated and relate it to `phoenix-project`.
5. **Stored dates.** ✅  
   Store `YYYY.MM.DD` (`2026.10.06`). The review list’s ISO dates are the same calendar days. The page prints the
   stored string, and mixed separators break `localeCompare`.
6. **`quote` on the new rows.** ✅  
   `quote` stays required. The nine new rows use `quote: '_TBD_'` until a sentence is supplied. Scherkenbach keeps its
   quote and excerpt. New rows have no excerpt, so the placeholder does not render. The Quotes checklist tracks each
   replacement. Filling a quote does not block Segment 1.

## Implementation Checklist

**Segment 1 — Seed the review archive** (`profound-book-club`)

- [ ] Leave `quote` required. Leave Scherkenbach’s `quote` and `excerpt` as they are
- [ ] Add the nine reviews from the list above, newest first, in `conversations`. Each row: the stated title, author
      `Mike Harris`, date `YYYY.MM.DD`, platform `Blog`, source `Test & Analysis`, the article URL, `relatedBookId`,
      and `quote: '_TBD_'`. No `excerpt`. No second Scherkenbach row
- [ ] Sidewinder’s URL is the 15 Sep 2026 article, not the tag page. Leadership Is Language is the 6 Oct 2026 article
      and `relatedBookId` is `leadership-is-language`
- [ ] `pnpm run lint` and `pnpm run build`
- [ ] Deploy content to dev (`source scripts/pro-dev.sh` && `./scripts/deploy-content-dev.sh`), then verify in the
      browser before the push
- [ ] Commit and push to `main`: `[sc-608] Publish the Test & Analysis reviews`
- [ ] That push’s pipeline is green before Final

**Final — Review and verify**

- [ ] The segment’s pipeline run is green
- [ ] In the browser, on desktop and at a width under 720px: the home teaser shows Leadership Is Language, Sidewinder,
      and the Phoenix Project review, with no pull-quote on those three. `/conversations` lists all ten, newest first.
      Scherkenbach still shows its pull-quote. Each card’s **Re:** line links to `/#book-{id}`. Those ten chronology
      rows show **See conversation** to `/conversations`. `leaders-handbook` (current) and the other rows with no
      review show no pill
- [ ] After the localhost dev deploy, `pnpm run smoke-test` still passes for `/` and `/conversations`
- [ ] No new application unit-test harness; coverage for this story is the existing smoke check, the manual link
      pass, and the browser pass
- [ ] `conversations.ts` stays under 200 lines

**Manual link check** — open each URL and confirm the live post title. Sidewinder is the article, not the tag page.

- [ ] **2026-10-06** — Help to move from test execution to decision-making – A Review of Leadership is Language by L. David Marquet  
      https://testandanalysis.home.blog/2026/10/06/help-to-move-from-test-execution-to-decision-making-a-review-of-leadership-is-language-by-l-david-marquet/
- [ ] **2026-09-15** — Creative teamwork for quality – A Review of “Sidewinder – Creative Missile Development at China Lake” by Ron Westrum  
      https://testandanalysis.home.blog/2026/09/15/creative-teamwork-for-quality-a-review-of-sidewinder-creative-missile-development-at-china-lake-by-ron-westrum/
- [ ] **2026-06-02** — How to get the most from the constraint on your (testing) process – A review of The Phoenix Project by Gene Kim, Kevin Behr, and George Spafford  
      https://testandanalysis.home.blog/2026/06/02/how-to-get-the-most-from-the-constraint-on-your-testing-process-the-phoenix-project-by-gene-kim-kevin-behr-and-george-spafford/
- [ ] **2025-09-16** — Quality Comes First — a review of Deming's Road to Continual Improvement by William W. Scherkenbach  
      https://testandanalysis.home.blog/2025/09/16/quality-comes-first-a-review-of-demings-road-to-continual-improvement-by-william-w-scherkenbach/
- [ ] **2025-06-10** — We Can Learn So Much From How AI Got Here — a review of Rebels of Reason by John Willis with Derek Lewis  
      https://testandanalysis.home.blog/2025/06/10/we-can-learn-so-much-from-how-ai-got-here-a-review-of-rebels-of-reason-by-john-willis-with-derek-lewis/
- [ ] **2024-09-24** — A Great Resource for Leaders in Test and Quality — a review of Learning to Lead, Leading to Learn by Katie Anderson  
      https://testandanalysis.home.blog/2024/09/24/a-great-resource-for-leaders-in-test-and-quality-a-review-of-learning-to-lead-leading-to-learn-by-katie-anderson/
- [ ] **2024-04-16** — Think Slowly When You Are Testing — and Think Slowly When You Are Automating  
      https://testandanalysis.home.blog/2024/04/16/think-slowly-when-you-are-testing-and-think-slowly-when-you-are-automating/
- [ ] **2024-02-20** — Get Insights from The World of W. Edwards Deming by Cecelia S. Kilian  
      https://testandanalysis.home.blog/2024/02/20/get-insights-from-the-world-of-w-edwards-deming-by-cecelia-s-kilian/
- [ ] **2024-01-23** — A Review of Understanding Variation — The Key to Managing Chaos by Donald J. Wheeler  
      https://testandanalysis.home.blog/2024/01/23/a-review-of-understanding-variation-the-key-to-managing-chaos-by-donald-j-wheeler/
- [ ] **2023-10-03** — A Review of Deming's Journey to Profound Knowledge by John Willis with Derek Lewis  
      https://testandanalysis.home.blog/2023/10/03/a-review-of-demings-journey-to-profound-knowledge-by-john-botchagalupe-willis-with-derek-lewis/

**Quotes** — replace `quote: '_TBD_'` when the sentence is ready. Scherkenbach already has one. These do not block
Segment 1. Leave `excerpt` unset so the placeholder stays off the card.

- [ ] **2026-10-06** — Leadership Is Language (`leadership-is-language`)
  - “As testers, we know the way we communicate matters. We can learn from how David Marquet used language to improve his submarine’s performance.”
- [ ] **2026-09-15** — Sidewinder (`sidewinder`)
  - "The development of the Sidewinder missile is a successful example of how to run a creative research and development team."
- [ ] **2026-06-02** — The Phoenix Project (`phoenix-project`)
  - "This novel is a gateway to learning because it shows how the company also benefits from using the four types of work and the three ways, and many other techniques."
- [ ] **2025-06-10** — Rebels of Reason (`rebels-of-reason`)
  - "Testing professionals need to develop an understanding of AI that will help us to test applications that use AI and utilise tools that incorporate AI."
- [ ] **2024-09-24** — Learning to Lead, Leading to Learn (`learning-to-lead`)
  - "If you are a Test\QE\QA Manager or Lead or want to become one this book will give you many insights that will help you build your own chain of learning to become a people-centred leader."
- [ ] **2024-04-16** — Think Slowly When You Are Testing… (`wiring-winning-org`)
    - "When we test and when we automate there are benefits in “Slowing ourselves down so that we can be more deliberative and self-reflective”"
- [ ] **2024-02-20** — The World of W. Edwards Deming (`world-of-deming`)
    - "The details of Deming’s life are interesting, however I am interested in him because I want the same things he did. I want companies to be successful businesses by continually improving the quality of their products and services."
- [ ] **2024-01-23** — Understanding Variation (`twenty-things`)
    - "This book can help you start to use control charts to analyse data from your test and development processes."
- [ ] **2023-10-03** — Deming's Journey to Profound Knowledge (`demings-journey`)
    - "W. Edwards Deming is often referred to as the “grandfather of quality”, and this new well-researched book about him and his philosophy gives us many new and useful insights."
