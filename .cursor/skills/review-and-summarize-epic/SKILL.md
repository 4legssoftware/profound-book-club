---
name: review-and-summarize-epic
description: >-
  Reviews a completed epic against stated intent and scope drift, summarizes story docs, suggests
  decisions and architecture follow-ups worth keeping (user chooses which get separate drafted
  docs), writes a short Slack-style summary with links to retained artifacts, then removes
  superseded per-epic and per-story markdown under docs/. Use when epic story work is done, the
  user asks for epic wrap-up or review-and-summarize-epic, or when consolidating epic docs after
  promotion.
---

# Review and summarize epic

## Before you start

1. **Epic identity** — If unclear, **ask** for the epic document path or title (e.g.
   `docs/e1-website-foundation/epic-website-foundation.md`).
2. **Story set** — Discover story files linked from the epic or co-located in the same `docs/e*-*/` folder (`s*.md`,
   `story-*.md`, or names listed in the epic). If ambiguous, **ask** which files belong to this epic.
3. **Repos** — Note whether work spanned **`profound-book-club`** and **`4ls-org`** (and **4ls-site** as reference);
   read implementation and tests in each as needed for the review sections.

## 1. Review

Answer in clear prose (headings optional, stay proportional to epic size).

### Intent

- **Did we accomplish the stated intent of the epic?** Tie evidence to the epic’s goal, in-scope items, and acceptance-style
  statements. Call out partial delivery or explicit deferrals (e.g. Astro stretch story skipped).

### Scope drift

- **How much additional or reduced scope landed versus the epic’s original plan?** Use story docs, epic edits, git history,
  and split/spun stories as sources.
- Separate **intentional** changes (documented splits, explicit “out of scope” moves) from **emergent** scope (bugs,
  integration surprises).
- If quantification isn’t possible, say what was measurable (story count, file/line deltas) and what stayed fuzzy.

## 2. Summarize

Flow: story synthesis → **suggested** decisions and architecture items → **user chooses** what gets dedicated drafted docs →
write those **only** → write the **brief epic summary** (linking to new or existing artifacts) → then section 3.

### Story documents

- **Synthesize** what the epic’s story files collectively say about delivery order, dependencies, and outcomes — not a
  file-by-file dump unless the user asks.
- Call out **themes**: AWS org/accounts, DNS, CDK app infra, pipeline, static site delivery, etc.

### Decisions worth keeping

- List **decisions** that future readers would need to re-derive otherwise (trade-offs, rejected alternatives, “we chose X
  because…”).
- Prefer pointers to **code or existing docs** that already encode the decision; only duplicate when no durable home exists
  yet.
- This is a **suggestion list only**. **Do not** draft new standalone decision docs (ADRs, new pages, etc.) from this list
  until the **user says which items** should get that treatment.

### Architectural concerns for later

- List **architecture** items: boundaries, data flows, deployment, security, performance, coupling between repos, and
  follow-up tech debt that did not get a story.
- Mark each as **documented elsewhere**, **should live in** a long-lived doc (e.g. README or runbook), or **new doc
  candidate** — minimal duplication.
- Same rule as decisions: **suggestions first**; **wait for the user to choose** which items (if any) merit a **dedicated**
  drafted doc.

### Dedicated docs (only what the user selects)

- After the **decisions** and **architectural concerns** lists, **pause for user input**: which bullets should become **separate**
  written artifacts (and where — e.g. new file path vs section of README).
- **Draft only** those selected items. Leave unselected items as narrative bullets in the epic summary (below) or as pointers
  to existing code/docs — do not expand them into new files unless chosen.

### Brief summary doc (new file)

- Add **one** concise summary markdown intended to live on after the epic’s working documents are removed. Suggested filename:
  `docs/e1-website-foundation/website-foundation-summary.md` (or `<epic-slug>-summary.md` under the epic folder).
- **Voice**: suitable for a team Slack post — short paragraphs, concrete outcomes, names of key behaviors or endpoints only
  when useful.
- **Links**: include relative links to any **retained** artifacts (runbooks, diagrams, and **any dedicated docs the user
  approved** in the prior step). This file becomes the **canonical entry point** for “what happened in this epic.”
- Do **not** link to per-story files that will be deleted in step 3; fold their essential facts into this summary or into the
  decision/architecture bullets above.

## 3. Delete superseded docs (last)

**Only after** sections 1–2 are done — including any **user-selected** dedicated docs — and the new epic summary (and any
other agreed retention files) are written.

- Remove the **epic** markdown for this effort and the **per-story** markdown files that belonged to it, as identified at the
  start.
- Do **not** delete repo-wide references (README, etc.) unless the user explicitly asks.
- **Confirm with the user** once before deleting if the set of paths to delete was not explicitly confirmed earlier —
  deletion is irreversible in normal workflows.

## Constraints

- Do not invent paths; **ask** when the epic or story list is unclear.
- Keep the skill proportional: a small epic gets a short review; a large one gets more structure.
- Prefer **moving durable content** into the summary or long-lived docs **before** deleting working story files.
