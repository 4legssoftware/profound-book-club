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

### Issues

Open a [GitHub issue](https://github.com/4legssoftware/profound-book-club/issues) for bugs, ideas, or questions before
starting large changes. That helps avoid duplicate work and confirms the approach is wanted.

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
