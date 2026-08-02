# Story 3: Promote *Leadership Is Language* to current [sc-564]

**Epic:** Site Update — Rotate to *Leadership Is Language*

## Description

Set *Leadership Is Language* by L. David Marquet as the current book. Promotion overwrites the single current-book slot,
which vacates *Sidewinder* from it. Reading schedule is handled separately in Story 4.

## Acceptance criteria

- Current-book section shows title, author (L. David Marquet), cover image, and metadata
- Cover asset and publication details sourced before build
- Adjacency framing consistent with site voice (leadership, psychology, systems)
- Previous current book (*Sidewinder*) no longer shown in the current slot
- Deployed and verified per standard flow: dev from localhost → push to `main` → pipeline green to Production
