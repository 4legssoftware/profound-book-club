---
name: prepare-story
description: >-
  Prepares a phased story markdown: reads the parent epic for aligned intent, considers whether to
  split into multiple smaller Shortcut stories when scope warrants it, clarifying questions,
  Shortcut workflow reminder, implementation checklist split into independently deployable segments
  with verification-first ordering, and closing hygiene (coverage, long-files review).
  Use when the user prepares a story, references prepare, prepare-story, or story kickoff
  before implementation.
---

# Prepare story (Profound Book Club)

Use this when turning a **story markdown** (under `docs/e*-*/`, e.g. `docs/e1-website-foundation/`) into something ready
to implement. Repository conventions in `.cursor/rules/rules.mdc` still apply.

**Active epic:** `docs/e1-website-foundation/epic-website-foundation.md` — website foundation on AWS (dev manual, stage/prod
via pipeline), modeled on **4ls-site**. Work may span **`profound-book-club`** (app + CDK) and **`4ls-org`** (OU/accounts,
Route 53 DNS via Terraform).

## Git and delivery (TBD)

- **Trunk-based development:** Integrate to `main` frequently; **pushing to `main` is the normal path**.
- **Do not** create a feature branch or open a **PR** for routine story work unless the user explicitly wants that
  workflow. The epic commits to review → commit → push to `main` with no routine PR gate.
- **Local review:** Prefer **staged** diffs on `main` so pre-commit hooks and review stay easy (per project rules).

## Workflow

1. **Read the epic** that owns this story — usually a sibling `epic-*.md` under the same `docs/e*-*/` folder (e.g.
   `docs/e1-website-foundation/epic-website-foundation.md`), or linked from the story. Absorb **goal**, epic **in/out of
   scope**, sequencing, and **dependencies**. Use it so Questions, checklist segments, and scope stay **aligned with the
   epic** — do not widen the story beyond what the epic commits to. If the epic path is unclear, **ask** before assuming.
2. **Read** the story file the user gives: goal, acceptance criteria, scope boundaries, existing Notes/Questions.
3. **Assess split potential** — Could this responsibly become **two or more smaller Shortcut stories**? Look for clusters
   of acceptance criteria that stand alone, **orthogonal** concerns (e.g. AWS org setup vs repo scaffold vs DNS vs
   pipeline), **separate repos** (`profound-book-club` vs `4ls-org`) without a hard requirement to ship atomically, or a
   checklist that would stay large even after segmenting inside one ticket. Respect the **epic’s** planned story seams first
   — prefer not to second-guess boundaries that are already phased. When split potential is strong, surface a
   **`## Split recommendation`** in the doc (optional): proposed **child story titles/outlines**, **scope per story**,
   **order**, and **dependency arrows** (Story B after Story A). The user validates in Shortcut; optionally create or slice
   tickets there. When the epic **already** sized one story deliberately, explain briefly if you still recommend splitting
   or defer.
4. **Infer** from the codebase what you can (files, prior stories, **4ls-site** as reference for pipeline/CDK patterns) and
   add **Related implementation** or similar **without** changing acceptance criteria or intent.
5. **Questions** — Add a `## Questions` section with anything ambiguous or approach-changing. When implementing, resolve
   **one at a time** where possible (see the **story-kickoff** skill).
6. **Shortcut** — When the story doc is ready for implementation, **commit the refined story markdown** as the first
   story commit. Commit message must include the ticket id from the story title (e.g. `[sc-534]`) and **`[skip ci]`** so
   docs-only prep does not trigger CI. Shortcut integration moves the ticket to **In Progress** automatically — do **not**
   ask the user to move the ticket to Started manually.
7. **Implementation checklist** — See **Checklist shape** below; add or refresh `## Implementation Checklist` on the story
   doc.

## Checklist shape (required)

### Split vs segments (when to slice Shortcut tickets)

**Segments** inside **one story** (`Segment 1 — …`) keep a single Shortcut ticket but order deployable increments. Prefer
segments when epic planning already carved this story deliberately.

Recommend **multiple Shortcut stories** (`## Split recommendation`) when the same work strains one ticket anyway: each
daughter story has its **own** AC set and **done**, reviews stay small, or **repos**/`workstreams` split cleanly. Do **not**
micro-split grunt work — a thin story stays one story even with two checklist segments.

### Independently deployable segments (minimum two when warranted)

Structure the checklist as **segments** (e.g. **Segment 1 — …**, **Segment 2 — …**), not one flat numbered list whenever
the story spans more than a single vertical slice.

- Each segment should be **deployable or merge-ready on its own**: e.g. `4ls-org` OU + accounts before DNS records; CDK
  stack before pipeline wiring; static site build before CloudFront alias.
- Order segments so the product stays coherent at each integration point (don’t strand dependencies across segments without
  calling it out).
- Call out **which repo** each segment targets (`profound-book-club`, `4ls-org`, or both).

### Verification-first ordering

Where the story touches **CDK** (`profound-book-club/infrastructure`), **Terraform** (`4ls-org`), or **site build**:

1. **Tests / verification before or with infra changes** — Prefer landing CDK snapshot tests + key resource assertions, or
   `pnpm run synth` / `terraform plan` verification, before or alongside implementation so regressions are caught early.
2. **Stop for review** when a segment adds substantial new infra or DNS — confirm plan/synth output before apply/deploy unless
   the user explicitly asks to continue in the same session.

Stories that are **org-only** (e.g. Story 1 AWS Organization) focus on Terraform/IAM verification and access checks rather
than site build steps.

### Commit size & segment granularity

When a story checklist would land **> ~400 added lines** or **> ~25 files** in one commit, split **sub-segments in the doc
first** (e.g. Segment 2a / 2b / 2c) before coding. Target one deployable or testable concern per commit, explainable in one
sentence.

| Signal | Action |
|--------|--------|
| Checklist ticks span **2+ layers** (CDK app stack + DNS records + pipeline in one pass) | Split into sub-segments in the story doc |
| **Multiple repos** without a hard atomic requirement | Separate segments per repo |
| **New infra bundled with content** | Infra + synth/plan first; site sync in the next commit |

During implementation, run `git diff --staged --stat` before each commit; pause and re-plan if over threshold.

### Final segment (closing the story)

The **last** checklist block (or last items under **Final**) should include:

1. **Verification** — CDK synth/snapshot tests pass where applicable; Terraform plan clean for org changes; site build
   succeeds; stage/prod pipeline smoke checks when Story 4+ scope applies.
2. **Coverage** — CDK stacks: snapshot tests plus assertions on key resource properties. Application code: follow project norms
   as the TypeScript scaffold grows (no arbitrary bar until tests exist).
3. **Long files** — Review large non-test files; prefer tightening files over **200 lines** **after** functional work is
   wrapped, unless the story explicitly includes that split.
4. **`story-kickoff` alignment** — If implementation has not started yet, see the **story-kickoff** skill for the full
   lifecycle (evaluation, refactor, constraints).

## Output

Produce or update the **story markdown** with:

- Alignment to the **epic** (explicit **Related epic** pointer in the doc if helpful: path + how the story inherits intent).
- **`## Split recommendation`** — only when warranted (otherwise a short note that one story suffices, or omit).
- Filled `## Questions` (and update as decisions land).
- **`## Implementation Checklist`** using **segments** (≥2 when the story warrants it), **verification-first** ordering,
   repo callouts, and a **Final** block as above.
- Remind the user to **commit** the refined story markdown with **`[sc-###]`** and **`[skip ci]`** in the message (Shortcut
  → **In Progress**); do not instruct a manual Started move.

Do **not** implement production code in this skill unless the user explicitly switches to implementation.
