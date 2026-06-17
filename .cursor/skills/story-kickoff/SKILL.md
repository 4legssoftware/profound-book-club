---
name: story-kickoff
description: >-
  Runs the Profound Book Club story lifecycle: read the story doc, clarify questions interactively, add an
  implementation checklist, implement increment-by-increment (verification-first), evaluate coverage and synth/plan
  checks, and refactor long files. Use when the user says "start story", "let's work on story", references a story
  markdown file to begin implementation, or wants the full story workflow through delivery hygiene.
---

# Story kickoff (Profound Book Club)

Use in **`profound-book-club`** and follow **`4ls-org`** conventions when the story spans org/Terraform DNS work.
Repository conventions in `.cursor/rules/rules.mdc` still apply.

**Epic:** `docs/e1-website-foundation/epic-website-foundation.md`

For **pre-implementation doc prep** (epic alignment, split recommendation, segmented checklist shape), use the
**prepare-story** skill first when the story doc is not ready — or when the user asks to prepare rather than implement.

## Workflow — follow these steps in order

### 1. Read the story

- Read the story markdown file the user referenced (under `docs/e*-*/`)
- Identify: goal, acceptance criteria, scope boundaries, which repo(s) are in play, any open questions already noted

### 2. Update the story doc

- Fill in any missing context you can infer from the codebase (related files, affected constructs, dependencies, **4ls-site**
  reference patterns)
- Do not change the intent or acceptance criteria — only add clarity

### 3. Surface questions

- Identify anything ambiguous, underspecified, or that could meaningfully change the implementation approach
- Add a `## Questions` section to the story doc with your full list before asking anything aloud

### 4. Ask questions interactively

- Ask questions **one at a time** — do not dump the full list in chat
- Wait for the user's answer before asking the next one
- After each answer, update the story doc and the `## Questions` section to reflect the decision
- Continue until all questions are resolved

### 5. Add implementation checklist

- Once questions are resolved, add a `## Implementation Checklist` section to the story doc
- Break the work into concrete, ordered tasks (files to create/modify, CDK/Terraform changes, pipeline steps, etc.)
- Use **segments** and **verification-first** ordering from the **prepare-story** skill
- Get user confirmation before proceeding to implementation

### 5b. Commit refined story doc (Shortcut kickoff)

- Once the checklist is confirmed, the **first story commit** should be the refined story markdown (questions resolved,
  checklist in place).
- Commit message must include the Shortcut ticket from the story title (e.g. `[sc-534]`) and **`[skip ci]`**.
- Shortcut integration moves the ticket to **In Progress** automatically — do **not** ask the user to move the ticket to
  Started manually.

### 6. Implement

- Work through the checklist in order
- When a segment calls for **plan/synth review**, **stop** after that step for review — do not continue into apply/deploy
  in the same session unless the user explicitly asks to
- Follow all conventions in `rules.mdc`
- Commit logical units of work — do not bundle unrelated changes
- **Before each commit:** run `git diff --staged --stat`. If **> ~25 files** or **> ~400 insertions**, stop and split the
  increment (see **prepare-story** → Commit size & segment granularity). Each commit should map to one checklist sub-segment
  or one sentence of scope.

### 7. Evaluate verification & coverage

- **CDK** (`profound-book-club`): `pnpm run synth` in `infrastructure/`; snapshot tests plus key resource assertions where
  they exist
- **Terraform** (`4ls-org`): clean plan for the story’s scope; apply only when the story and user expect it
- **Site build**: production build script from `package.json` when the repo scaffold exists
- **Pipeline** (Story 4+): confirm workflow syntax and OIDC role assumptions match epic decisions

### 8. Check file size and refactor

- Identify any non-test files exceeding **200 lines**
- Refactor into cohesive units — split by responsibility, not arbitrarily
- Re-run verification after any refactor to confirm nothing regressed

## Story doc structure (for reference when editing)

```
## Summary
## Acceptance Criteria
## Scope
## Questions
## Implementation Checklist
## Notes
```

## Constraints

- Never skip the Q&A phase even if the story seems clear — at least confirm with the user
- Never implement before the checklist is confirmed
- **Story kickoff commit:** refined story markdown with **`[sc-###]`** + **`[skip ci]`** — not a manual Shortcut Started move
- Never close the story until verification and file-size checks pass
- **dev** deploy is manual from localhost; **stage/prod** go through the pipeline once Story 4 is in place
