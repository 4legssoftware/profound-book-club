# Prepare story

This workflow was moved to a **Cursor skill** so it can be discovered and applied consistently.

**Use the skill:** `prepare-story` — see `/.cursor/skills/prepare-story/SKILL.md` in the **profound-book-club** repo.

**Short trigger:** “Prepare this story” + path to the story markdown (e.g. `docs/e1-website-foundation/s1-aws-organization.md`).

**Epic:** `docs/e1-website-foundation/epic-website-foundation.md`

The skill covers: **read the parent epic** then the story (aligned intent); **assess whether to split** into multiple
Shortcut tickets vs one story with **segments**; clarifying questions; **commit refined story MD** with **`[sc-###]`** +
**`[skip ci]`** (Shortcut → **In Progress** automatically); **TBD** (no routine feature branches/PRs); checklist
**segments** or **Split recommendation**; verification-first ordering (CDK synth/snapshot, site build, Terraform plan where
applicable); and a **final** hygiene pass (coverage, long-files review).
