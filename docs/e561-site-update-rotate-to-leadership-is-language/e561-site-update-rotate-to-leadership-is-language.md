# Epic: Site Update — Rotate to *Leadership Is Language*

## Objective

Refresh profound-book-club.org for the new book cycle: bring dependencies current first, retire *Sidewinder* to the
Chronology, promote *Leadership Is Language* (L. David Marquet) as the current book, and publish its reading schedule.

## Context

Standard content rotation on the static site (CDK + CloudFront/S3, trunk-based). Work commits and deploys
incrementally — at least once per story — through the pipeline: review → commit → push to `main` → Commit → Acceptance →
Production. Dev is refreshed manually from localhost.

## Stories

### 1. Update dependencies (do first)

Bring PNPM packages current before touching content, so the rotation ships from a clean, known-good base.

### 2. Retire *Sidewinder* to the Chronology

Move the current-book entry into the completed Chronology list, with author Dr. Ron Westrum and completion date.

### 3. Promote *Leadership Is Language* to current

Set *Leadership Is Language* by L. David Marquet as the current book, with cover and metadata.

### 4. Add the *Leadership Is Language* reading schedule

Publish the reading schedule (session dates and chapter assignments) in the current-book section.

## Dependencies / Open questions

- **Schedule source data** — needed before Story 4 (you have it)
- **Cover + metadata** for *Leadership Is Language* (image asset, publication details)
- ***Sidewinder* completion date** to stamp on the Chronology entry
- While editing the Chronology list, confirm whether any adjacent missing-author entries want cleaning up in the same
  pass
