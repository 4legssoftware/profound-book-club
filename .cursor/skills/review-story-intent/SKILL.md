---
name: review-story-intent
description: >-
  Compares implementation to the active story doc and epic: summarizes how well intent was met,
  surprises, and learnings. Use when the user asks for a story-intent review, post-implementation
  retrospective, or mentions review-story-intent; or after finishing work tied to a story markdown file.
---

# Review story intent

## Before you start

1. **Current story doc** — If the conversation does not clearly identify which story markdown file is “current,” **ask** for
   the path (or title) before reviewing.
2. **Epic** — Story docs often list an epic name or live beside one. If the epic document is not clear from context, **ask**
   which epic doc to use before reviewing epic fit.

Typical locations in this repo: `docs/e*-*/` for stories and epics (e.g. `docs/e1-website-foundation/website-foundation-summary.md`
`s1-aws-organization.md`). Work may span **`profound-book-club`** and **`4ls-org`**.

## What to read

1. The **story** markdown: goal, intent, acceptance criteria, in/out of scope, resolved questions.
2. The **epic** markdown (if applicable): epic goal and how stories roll up to it.
3. The **implementation**: relevant source, tests, and recent diffs in the workspace or `git` history as needed — in the repo(s)
   the story targeted.

## Output

Use this structure (clear headings, concise prose):

### How well we achieved the intent

- Map acceptance criteria and stated intent to what shipped.
- Call out gaps, partial delivery, or extras not in scope.

### Surprises

- Unexpected issues, scope creep, misleading assumptions, test or integration discoveries.

### What we learned

- Durable takeaways for process, design, or the codebase — not a repeat of “surprises” unless framed as learning.

### Fit with the epic

- How this story and the **current** implementation support (or strain) the epic’s intent.
- If epic scope is thin or missing in docs, say what was inferable and what stayed ambiguous.

## Constraints

- Do not invent a story or epic path; **ask** when unsure.
- Stay proportional: a small chore gets a short review; a large story gets more depth.
