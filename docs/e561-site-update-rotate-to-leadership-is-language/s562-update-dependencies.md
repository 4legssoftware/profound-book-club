# Story 1: Update dependencies [sc-562]

**Epic:** Site Update — Rotate to *Leadership Is Language*

## Description

Bring the project's PNPM dependencies current before any content edits, so the book rotation ships from a clean,
known-good base. Scope is the update and verification only — no framework change (Astro migration stays out of scope).

## Acceptance criteria

- First tag the current main branch as v1.0.0 in Git
- `pnpm outdated` reviewed; minor/patch updates applied
- Major-version bumps evaluated individually — applied if low-risk, otherwise logged and deferred as a follow-up
- `pnpm-lock.yaml` updated and committed
- `cdk synth` / build passes clean
- Deployed to dev from localhost; site renders correctly (fonts, hero control chart, current + chronology sections) with
  no console errors
- Committed and pushed to `main`; pipeline green through Acceptance → Production

## Scope

**In:** `profound-book-club` root and `infrastructure/` PNPM deps + lockfiles (including CDK `aws-cdk` /
`aws-cdk-lib` / `constructs`); GitHub Actions SHA pins; annotated `v1.0.0` tag on current `main` **before** dependency
bumps; evaluation of major bumps (Segment 2b); lint/build/synth verification; manual dev deploy + visual smoke; push to
`main` for stage→prod pipeline.

**Out:** Site content / book rotation (Stories 2–4); Astro or other framework migration; `4ls-org` Terraform; new
features or design changes.

## Related epic

[`e561-site-update-rotate-to-leadership-is-language.md`](./e561-site-update-rotate-to-leadership-is-language.md) —
Story 1 is **do first**. Epic delivery: trunk-based commits to `main` (Commit → Acceptance → Production); **dev** is
manual from localhost. Do not widen into content rotation.

E1 website foundation is **complete** — see
[`docs/e1-website-foundation/website-foundation-summary.md`](../e1-website-foundation/website-foundation-summary.md).

## Split recommendation

**Keep as one Shortcut story.** The epic already sized this as a deliberate first seam (deps only, before content).
Root + infrastructure + Actions are one maintenance pass with a single “known-good base” outcome; segments below keep
commits reviewable without extra tickets.

## Related implementation

| Piece | Path / note |
| ----- | ----------- |
| Package-update workflow | `.cursor/commands/package-updates-book-club.md` + skill `package-updates-book-club` |
| Dev deploy | `.cursor/commands/deploy-dev-book-club.md` → `./scripts/deploy-content-dev.sh` (infra only if CDK deps force it) |
| Prior dep refresh | `f6e8c84` — root + infrastructure lockfiles + Actions SHA pins |
| Root packages | `package.json`, `pnpm-lock.yaml` (Astro 7 site) |
| Infra packages | `infrastructure/package.json`, `infrastructure/pnpm-lock.yaml` |
| Infra override | `infrastructure/pnpm-workspace.yaml` pins `js-yaml: 4.2.0` (Dependabot; re-check necessity) |
| Workflows | `.github/workflows/main.yml`, `.github/workflows/pr.yml` (SHA-pinned actions) |
| Actions checker | Port from 4ls-site: `pnpm run check-action-versions` → `scripts/check-action-versions.ts` |

**Repo:** `profound-book-club` only (`4ls-org` not involved).

## Questions

1. **`v1.0.0` tag shape:** ~~Annotated tag on current `origin/main` (tip before dep bumps), push `refs/tags/v1.0.0`?~~
   **Resolved:** Annotated tag on current `origin/main` before dep bumps; push to origin. Message:
   `v1.0.0 — website foundation complete (Sidewinder completed)`.
2. **GitHub Actions pins:** ~~Include SHA/minor Actions refresh?~~ **Resolved:** Yes — refresh Actions SHA/minor pins
   in this story. Also include CDK package updates (`aws-cdk`, `aws-cdk-lib`, `constructs`, related infra tooling) in
   Segment 2 minor/patch pass, with majors considered in Segment 2b.
3. **Majors policy:** ~~Apply low-risk majors automatically vs list-only?~~ **Resolved:** At Segment 2b, discuss each
   available major with the user before applying or deferring; record decisions in **Notes**.
4. **`check-action-versions`:** ~~Port 4ls-site script vs manual check?~~ **Resolved:** Port
   `scripts/check-action-versions.ts` (+ `pnpm run check-action-versions`) from 4ls-site into this repo as part of
   Segment 3; use it to refresh SHA pins.

## Implementation Checklist

**Repo:** `profound-book-club`.

### Segment 1 — Tag `v1.0.0` (before bumps)

- [x] Confirm working tree is clean for untagged tip of `main` (or tag the intended SHA explicitly); no tags named
      `v1.0.0` exist locally or on `origin` today.
- [x] Create annotated tag `v1.0.0` on current `main` **before** dependency edits (message:
      `v1.0.0 — website foundation complete (Sidewinder completed)`); push tag to `origin`.
- [x] **Verify:** `git show v1.0.0` points at the pre-update commit; `git ls-remote --tags origin 'v1.0.0'` succeeds.

### Segment 2 — Root + infrastructure minor/patch (incl. CDK)

- [ ] Root: `pnpm outdated`; apply minor/patch via targeted `pnpm update <pkg>…`; list available majors for Segment 2b.
- [ ] Root verify: `pnpm run lint`, `pnpm run build` (and `pnpm run check` if useful); lockfile committed with
      `package.json`.
- [ ] `infrastructure/`: `pnpm outdated`; apply minor/patch for CDK CLI/lib (`aws-cdk`, `aws-cdk-lib`), `constructs`,
      and other infra deps; re-check `js-yaml` override in `pnpm-workspace.yaml` (keep, bump floor, or remove if
      unnecessary) and reinstall if changed.
- [ ] Infra verify: `pnpm run build`, `pnpm run synth`, `pnpm test` (CDK snapshots / key assertions).
- [ ] **Stop for review** if synth/diff shows material CDK resource churn before any deploy.

### Segment 2b — Evaluate (and possibly take) major updates

- [ ] List major bumps from root + `infrastructure/` (and Actions majors if any) with brief changelog/risk notes.
- [ ] **Discuss each major with the user** before applying or deferring; do not silent-bump.
- [ ] For accepted majors: apply, then re-run lint/build (root) and/or build/synth/test (infra) as appropriate.
- [ ] Log apply/defer decisions under **Notes** with a one-line reason each.
- [ ] **Stop for review** before deploy if any major CDK bump changes synth output materially.

### Segment 3 — GitHub Actions pins + checker script

- [ ] Port `check-action-versions` from 4ls-site (`scripts/check-action-versions.ts`, root `package.json` script, any
      deps such as `tsx` if required).
- [ ] Run `GITHUB_TOKEN=… pnpm run check-action-versions`; refresh action SHAs for current majors in `main.yml` /
      `pr.yml`.
- [ ] List major Action upgrades available; fold into Segment 2b evaluation (do not silent-bump majors).
- [ ] **Verify:** checker exits clean (or only reports deferred majors); workflow YAML review.

### Final — Dev deploy, pipeline, close

- [ ] **Verification:** root lint + build green; infra build + synth + tests green.
- [ ] **Deploy:** refresh dev (`deploy-content-dev.sh`; run infra deploy only if CDK output/deps require it); confirm
      fonts, hero control chart, Current + Chronology, no console errors at
      `https://dev.profound-book-club.org`.
- [ ] **Ship:** commit dep/Actions changes (segment-sized if large); push to `main`; confirm pipeline green through
      Acceptance → Production.
- [ ] **Coverage:** CDK tests still assert key stack properties after any infra dep bumps.
- [ ] **Long files:** no intentional file growth; skip drive-by refactors.
- [ ] Record deferred majors / override decisions in **Notes** below.

## Notes

- **Tag:** `v1.0.0` → commit `6c89349` (`v1.0.0 — website foundation complete (Sidewinder completed)`); pushed to
  `origin`.
- _(Deferred majors, override keep/drop, pipeline run URL — fill in later segments.)_
