# Story 5: Publish the Test & Analysis reviews, including Sidewinder and Leadership Is Language [sc-608]

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

**In:** `src/content/conversations.ts` only, plus any excerpt on the Scherkenbach row if that question is resolved as
keep.

**Out:** New chronology rows; current-book or upcoming-book edits; page or nav design; CDK / `4ls-org`.

## Reviews

Newest first. `relatedBookId` is the chronology slug from Story 1.

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

## Related epic

[`e603-conversations-reviews-continued-elsewhere.md`](./e603-conversations-reviews-continued-elsewhere.md) — Story 5,
after [Story 4](./s4-link-chronology-and-conversations.md).

## Related implementation

| Piece | Path / note |
| ----- | ----------- |
| Live seed | `src/content/conversations.ts` — Scherkenbach pull-quote only |
| Reference list | `profound-conversations/src/content/conversations.ts` |
| Sidewinder finder | https://testandanalysis.home.blog/tag/sidewinder/ — use the article URL in the table |

## Testing note

Manually open every URL in the review list and confirm the live post title matches the title recorded here. Do this
before calling the story done. The check is titles and links; book relations stay as listed.

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
