# S5 - Migrate to Astro [sc-539]

**Description**
Rebuild the single page on Astro while leaving infrastructure and the pipeline untouched — only the build output
changes. Optional for this epic.

**Acceptance criteria**

- [ ] Astro project replaces the static page; `pnpm build` emits Astro's `dist`

- [ ] Design tokens (`--paper`, `--ink`, `--accent`, `--rule`, `--gold`, etc.) live in a global stylesheet; component
  styles use Astro's scoped default; `is:global` for Markdown content; `define:vars` for dynamic values

- [ ] Single-page layout and top anchor nav preserved

- [ ] Smoke tests updated to Astro's actual asset structure

- [ ] No infra or pipeline changes required beyond the build output

**Dependencies:** Story 4
**Suggested labels:** `astro`, `migration`
