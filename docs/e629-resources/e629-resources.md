# Epic: Resources — companion documents for the books we read

**Shortcut:** [epic 629](https://app.shortcut.com/4legssoftware/epic/629)

## Objective

Give the club's companion documents a home on profound-book-club.org: a Resources page that visitors can search by
title, book, and topic, with a link to each PDF. The current book lists its own resources and links straight to the
PDFs. Chronology rows link to the Resources page, filtered to that book.

## Context

The live site has a home page and `/conversations`. Neither mentions resources. Chronology books already have stable ids
(`demings-journey`, `leaders-handbook`, …) from the Conversations epic, and chronology rows already show a
`See conversation` pill.

`profound-conversations` (Lovable) is the design reference. It adds:

- **Catalog** — `src/content/resources.ts` is a typed, static list of about 80 resources by Dennis Sergent (The Sergent
  Results Group). Each has a title, attribution, description, related book ids, topics, and files. Each file has a
  `permitted` flag, and only permitted files get a link. Every file list is empty today, so each row reads
  `Not yet available`. The prototype's book ids match the live chronology ids.
- **Resources page** — `/resources` has a search box, a book filter, a topic filter, a reset button, and a result count.
  The filters are kept in URL query parameters (`?book=&topic=&q=`) so a filtered view can be shared or linked.
- **Nav** — a `Resources` item.
- **Current book** — an `Additional Resources` block lists that book's resources, credits Dennis Sergent with a link to
  sergentresults.com, and ends with `Browse resources →`. In the prototype each title opens the Resources page. This
  epic links each title **straight to its PDF** instead.
- **Chronology** — rows with resources show a `See resources` pill that opens `/resources?book={id}`.

### Delivery decisions (made before this epic)

- **PDFs only.** Any PowerPoint source is converted to PDF before it is published. The site never serves `.ppt` or
  `.pptx`.
- **Public files, served by the existing CloudFront distribution** over HTTPS, from S3 through Origin Access Control
  (OAC). There is no sign-in and no signed URL.
- **Shown in the browser's built-in PDF viewer** through a plain link (`Content-Type: application/pdf`,
  `Content-Disposition: inline`). There is no embedded viewer and no PDF.js.

### How it fits the current site

The Resources page is one more static Astro page. The search and filters run in the browser with a small script. With
JavaScript off, the page still lists every resource. Book rotation — current book, upcoming book, and which titles sit
in the chronology — stays as it is.

The PDFs are the epic's only infrastructure change. The application deploy runs `aws s3 sync dist/ … --delete`, so
PDFs uploaded to the website bucket outside `dist/` would be deleted on the next deploy. They need their own home
(see Open questions).

Work commits and deploys incrementally — at least once per story — through the pipeline: review → commit → push to
`main` → Commit → Acceptance → Production. Dev is refreshed manually from localhost.

## Stories

### 1. Add the resource catalog and a Resources page [sc-630]

Port the typed catalog from the prototype into `src/content/resources.ts`, using the existing chronology book ids. Add
`/resources`: intro, attribution to Dennis Sergent with a link to sergentresults.com, every resource (title, topic,
related books, description), and `Not yet available` where there is no permitted PDF yet. Add a `Resources` nav item.
Add `/resources` to the smoke tests. Add sergentresults.com to the external link check.

### 2. Search and filter resources by title, book, and topic [sc-631]

Add a search box (title and description), a book filter, and a topic filter, plus a reset control and a live result
count. Keep the state in `?book=&topic=&q=` so filtered views can be shared and linked to. Clicking a related book on a
resource applies that book's filter. With JavaScript off, the full list still shows.

### 3. Link chronology entries to their resources [sc-632]

Chronology rows with at least one resource show `See resources`, linking to `/resources?book={id}`. It sits next to
the existing `See conversation` pill and must still lay out cleanly on mobile when a row has both.

### 4. Host the resource PDFs and link them from the Resources page [sc-633]

Give PDFs a home that the deploy's `--delete` sync can't touch. Serve them through the existing distribution under
their own path, using OAC, with `application/pdf`, `Content-Disposition: inline`, and `X-Content-Type-Options: nosniff`.
Make the upload repeatable for dev, stage, and prod. Show an `Open PDF` link on each resource that has a permitted file.
Before publishing, convert any PowerPoint sources and strip document metadata. Add CDK snapshot tests and assertions for
the new behavior, and smoke-check one PDF URL.

### 5. List the current book's resources with direct PDF links [sc-634]

Add the `Additional Resources` block to the current-book section. It lists that book's resources, credits Dennis
Sergent, and ends with `Browse resources →` (`/resources?book={current id}`). A title with a permitted PDF links
straight to the PDF and opens it in a new tab. A title without one links to its entry on the Resources page. The block
follows the current book through rotation without extra editing beyond the catalog.

Stories 1 → 2 → 3 need no PDFs and can ship before any files are ready. Stories 4 → 5 depend on the files and on
permission to share them.

## Dependencies / Open questions

Resolve before the story that needs them:

- **Permission to publish** — Story 4. Has Dennis Sergent / The Sergent Results Group confirmed that these documents
  can be shared publicly? Is that confirmation per document or blanket? The prototype's `permitted` flag assumes per
  file.
- **Where the PDFs live** — Story 4. Choose between (a) a separate S3 bucket per environment plus a second CloudFront
  behavior, uploaded manually or by a pipeline step from a source folder, and (b) committing the PDFs under `public/`
  so they ship in `dist/` like everything else. (b) is simpler and versions the files with the site, but puts roughly
  80 binaries in git. The total size of the files decides this.
- **PDF URL path** — Story 4. `/resources/` is the page, so the files need a path that doesn't collide with it (e.g.
  `/resource-files/{resource-id}.pdf`). Use the catalog id as the filename so links stay stable.
- **Descriptions** — Story 1. The prototype's descriptions are editorial guesses inferred from the titles. Should they
  ship as they are, be reviewed with Dennis, or be left off until confirmed?
- **Topics** — Story 1. Confirm the seven prototype topics (Leadership & culture, Profound Knowledge, Systems & flow,
  Improvement & PDSA, Measurement & variation, Teams & design, Thinking & learning) and each resource's book pairings.
- **Unavailable entries** — Story 1. Show catalog entries that have no PDF yet as `Not yet available`, as the prototype
  does, or hide them until a file is published?
