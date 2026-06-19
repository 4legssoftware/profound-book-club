# Contributing

Thanks for your interest in [The Profound Book Club](https://profound-book-club.org) site. This repo is public and
contributions are welcome.

## Who can contribute

- **External contributors** do not get direct push access. Fork the repo, make changes on your fork, and open a pull
  request.
- **Maintainers** (members of the [4legssoftware](https://github.com/4legssoftware) organization) integrate work directly
  to `main` using trunk-based development.

Nothing merges to `main` without maintainer review and approval.

## Getting started

See [README.md](README.md) for prerequisites, setup, local development, and build commands.

In short:

```bash
nvm use
pnpm install
pnpm dev        # preview at http://localhost:3000
pnpm run lint   # before opening a PR
pnpm run build  # verify the production build
```

## Suggesting changes

### Before opening an issue

Anyone with a GitHub account can open an issue on this public repository. Before you do:

1. **Search first** — check [existing issues](https://github.com/4legssoftware/profound-book-club/issues) and avoid
   duplicates.
2. **Pick a template** — use **Bug report**, **Feature request**, or **Question** when you create an issue. Blank
   issues are disabled so reports stay structured.
3. **Bug reports** — say where you saw the problem (production, stage, dev, or local), how to reproduce it, and what you
   expected instead. Include the page URL or anchor and browser when relevant.
4. **Feature requests** — describe the problem and your proposed change. For substantial work, wait for maintainer
   feedback before opening a pull request.
5. **Questions** — read this guide and the [README](README.md) first; say what you already tried.
6. **Stay on topic** — issues are for the book club site and this repository. Requests for deploy access, org membership,
   or unrelated spam will be closed.

Maintainers triage, label, respond, and close issues. Opening an issue does not guarantee a change will be made.

### Issues

Open a [GitHub issue](https://github.com/4legssoftware/profound-book-club/issues/new/choose) for bugs, ideas, or
questions before starting large changes. That helps avoid duplicate work and confirms the approach is wanted.

### Pull requests

1. Fork [4legssoftware/profound-book-club](https://github.com/4legssoftware/profound-book-club).
2. Create a branch on your fork (any branch name is fine).
3. Make focused changes with a clear purpose.
4. Run `pnpm run lint` and `pnpm run build`.
5. Open a pull request against `main` with:
   - what changed and why
   - how you tested it
   - a link to a related issue, if one exists

Keep pull requests reasonably sized. Split unrelated changes into separate PRs when you can.

## Code style

Match the existing codebase:

- **TypeScript** and **pnpm** for dependencies
- Single quotes for strings
- 120-character line length where practical
- Trailing commas in objects and arrays
- Comments only when they explain *why*, not *what*

Run `pnpm run format` if Prettier adjusts files locally.

## Review and merge

A maintainer will review your pull request. We may ask for changes, discuss alternatives, or close a PR that does not
fit current goals. Approved PRs are merged by a maintainer; merged changes eventually flow to
[stage](https://stage.profound-book-club.org) and [production](https://profound-book-club.org) via the deployment
pipeline.

## What contributors cannot do

- Push directly to this repository (unless you are a maintainer)
- Deploy to dev, stage, or prod environments
- Merge your own pull request without maintainer approval

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE), the same license
that covers this project.
