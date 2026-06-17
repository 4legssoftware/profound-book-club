---
permissions: ["all"]
---

* run `pnpm lint` (if not already done and the repo has a lint script)

# Commit --> Push

Format a commit and get the appropriate confirmations through to git push.

Trunk-based delivery: pushing to `main` triggers the stage/prod pipeline once Story 4 is in place. Dev deploy remains manual.

* author a commit message (include `[sc-###]` when tied to a Shortcut story; use `[skip ci]` for docs-only prep commits)
* stage all edited files
* **STOP AND WAIT FOR CONFIRMATION TO PROCEED**
* commit
* push
