# External links

Visitor-facing `http` and `https` links in the built site, and the check that they stay active and current.
Collected from `dist/` after `pnpm run build` on 14 Oct 2026 (`index.html`, `conversations/index.html`, `404.html`).

The check is a small TypeScript script plus one pipeline job. A plain GET is enough for every link below.

## Visitor links

Twelve links. Home renders the three newest reviews and both Of Interest cards. `/conversations` renders all ten
reviews. No other external visitor link appears in the built HTML.

### Reviews

Source `src/content/conversations.ts`. The label is the review title, which is also the anchor text. **Current**
means the live title still matches that label.

| Page | Label |
| ---- | ----- |
| `/`, `/conversations` | Help to move from test execution to decision-making – A Review of Leadership is Language by L. David Marquet |
| `/`, `/conversations` | Creative teamwork for quality – A Review of “Sidewinder – Creative Missile Development at China Lake” by Ron Westrum |
| `/`, `/conversations` | How to get the most from the constraint on your (testing) process – A review of The Phoenix Project by Gene Kim, Kevin Behr, and George Spafford |
| `/conversations` | Quality Comes First — a review of Deming's Road to Continual Improvement by William W. Scherkenbach |
| `/conversations` | We Can Learn So Much From How AI Got Here — a review of Rebels of Reason by John Willis with Derek Lewis |
| `/conversations` | A Great Resource for Leaders in Test and Quality — a review of Learning to Lead, Leading to Learn by Katie Anderson |
| `/conversations` | Think Slowly When You Are Testing — and Think Slowly When You Are Automating |
| `/conversations` | Get Insights from The World of W. Edwards Deming by Cecelia S. Kilian |
| `/conversations` | A Review of Understanding Variation — The Key to Managing Chaos by Donald J. Wheeler |
| `/conversations` | A Review of Deming's Journey to Profound Knowledge by John Willis with Derek Lewis |

- https://testandanalysis.home.blog/2026/10/06/help-to-move-from-test-execution-to-decision-making-a-review-of-leadership-is-language-by-l-david-marquet/
- https://testandanalysis.home.blog/2026/09/15/creative-teamwork-for-quality-a-review-of-sidewinder-creative-missile-development-at-china-lake-by-ron-westrum/
- https://testandanalysis.home.blog/2026/06/02/how-to-get-the-most-from-the-constraint-on-your-testing-process-the-phoenix-project-by-gene-kim-kevin-behr-and-george-spafford/
- https://testandanalysis.home.blog/2025/09/16/quality-comes-first-a-review-of-demings-road-to-continual-improvement-by-william-w-scherkenbach/
- https://testandanalysis.home.blog/2025/06/10/we-can-learn-so-much-from-how-ai-got-here-a-review-of-rebels-of-reason-by-john-willis-with-derek-lewis/
- https://testandanalysis.home.blog/2024/09/24/a-great-resource-for-leaders-in-test-and-quality-a-review-of-learning-to-lead-leading-to-learn-by-katie-anderson/
- https://testandanalysis.home.blog/2024/04/16/think-slowly-when-you-are-testing-and-think-slowly-when-you-are-automating/
- https://testandanalysis.home.blog/2024/02/20/get-insights-from-the-world-of-w-edwards-deming-by-cecelia-s-kilian/
- https://testandanalysis.home.blog/2024/01/23/a-review-of-understanding-variation-the-key-to-managing-chaos-by-donald-j-wheeler/
- https://testandanalysis.home.blog/2023/10/03/a-review-of-demings-journey-to-profound-knowledge-by-john-botchagalupe-willis-with-derek-lewis/

URLs are in the same order as the table.

### Of Interest

Source `src/content/psas.ts`. Page `/` only. The label is the card title. The anchor text is `Visit`. These links are
checked for **active** only.

- Deming Strategies for Sustainable Success: Innovate, Streamline, Lead  
  https://deming.org/events/deming-strategies-for-sustainable-success-innovate-streamline-lead/
- Deming's 14 Points — video series  
  https://www.youtube.com/@DemingInstitute
- Hidden anchor in `BaseLayout.astro`, on every page, not shown in the layout. Removed after the pipeline shows
  this miss.  
  https://example.com/profound-book-club-missing

## Excluded

| What | Where in the build | Reason |
| ---- | ------------------ | ------ |
| `mailto:robert.park+profound@4legssoftware.com` | `/` only. Built href is percent-encoded. Label: Get in Touch | Not an http(s) page |
| `https://schema.org` | JSON-LD `@context` on `/`, `/conversations`, and `/404` | Vocabulary id, not a visitor page |
| `https://fonts.googleapis.com`, `https://fonts.gstatic.com`, and the Google Fonts CSS `href` | `<head>` of every page | Stylesheet and preconnect |
| `http://www.w3.org/2000/svg` | Hero SVG markup | XML namespace |
| `/`, `/conversations`, `/#…`, `#…`, `/favicon.svg`, `/_astro/…` | Nav, chronology, review **Re:** lines, 404, stylesheets | Our site. `smoke-test` covers the deployed pages |

`astro.config.mjs` sets `site` to `https://profound-book-club.org`. Also exclude any absolute URL on that host, `www`,
`stage`, or `dev`.

## Check

**Active** (every visitor link): GET, follow redirects, final status 2xx. An unexpected redirect is a final URL whose
host differs from the link we stored, or whose path changes by more than a trailing slash. `http` to `https` on the
same host is fine.

**Current** (reviews only): decode HTML entities, then compare words in order. Case, dashes, and quotation marks are
ignored, and either title may contain extra words (the card text is not always byte-identical to the WordPress
title). `og:title` is checked first, then `<title>`. Of Interest has no title check. The YouTube card title is ours,
not the channel page title.

Probe on 14 Oct 2026, one request with a named user agent and no browser: the seminar returned 200 with no redirect;
the YouTube channel URL returned 200 with no redirect; the Leadership Is Language `og:title` matched the stored title
(`&#8211;` is the same en dash we store), and `<title>` was that string plus ` – TestAndAnalysis`.

Run `pnpm run check-external-links` locally. The script crawls visitor links from `dist/` (build first) and compares
that set to the visitor URLs in this file. A URL on only one side fails the run and names the URL, before any fetch.
A listed link that is rendered but not active fails separately. Hidden anchors count. The script accepts a directory
argument so a fixture can be checked without shipping it. Exit non-zero on a miss. No new dependencies.

The pipeline runs that command once, in a job parallel to `smoke-tests-prod`, after production is already deployed.
The job downloads the `dist` artifact from `build` and does not use AWS credentials. `summary` and `notify` include
it, so a failure fails the workflow and Slack without holding the release. It does not run on the stage path. The
Thursday cron on `main.yml` re-runs the same workflow, so the check is repeated then. `smoke-test` stays the check of
our own pages.
