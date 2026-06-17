---
permissions: ["all"]
---

# Update minor & patch level package updates and verify

Modeled on **4ls-site**; run from the **profound-book-club** repo root once Story 2 scaffold exists.

* Check for available package updates using `pnpm outdated`
* Update all minor & patch versions to latest using `pnpm update` with specific packages
* Run lint via `pnpm run lint` to ensure no code style issues
* Run the production site build via the script defined in `package.json` (e.g. `pnpm run build` or `pnpm run site:build`)
  to verify the static site build succeeds
* List out any major updates available, but do not update at this point
* Re-check `package.json` `pnpm.overrides` to ensure each override is still necessary (and still the right minimum patched
  version); remove overrides that are no longer needed and re-run `pnpm install --no-frozen-lockfile` + `pnpm run lint` +
  the site build script

# Update minor & patch level package updates and verify for `/infrastructure`

* Navigate to `infrastructure` directory
* Check for available package updates using `pnpm outdated`
* Update all minor & patch versions to latest using `pnpm update` with specific packages
* Build TypeScript via `pnpm run build` to verify compilation succeeds
* Synthesize CDK stack via `pnpm run synth` to verify CDK synthesis works
* List out any major updates available, but do not update at this point

# Update GitHub Actions and verify

* Check for available GitHub Actions updates using `pnpm run check-action-versions`
    * **Important**: Set `GITHUB_TOKEN` env var to avoid rate limits (if not already in shell env): `GITHUB_TOKEN=your_token pnpm run check-action-versions`
    * The script will exit with code 1 if rate limits prevent checking - set GITHUB_TOKEN and retry
* Update all GitHub Actions to latest patch/minor versions (actions pinned by SHA should be updated to latest SHA)
    * For actions pinned by SHA only, update to latest SHA for the current major version
* Verify workflow syntax is valid (if yamllint or yq available, use those; otherwise manual review)
* List out any major updates available (e.g., v5.x -> v6.x), but do not update at this point
