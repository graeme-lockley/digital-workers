---
name: plan-story
version: 1.0.0
description: Move one story from unplanned to planned and add implementation planning sections.
outputs:
  - Story moved to docs/kanban/stories/planned.
  - Planned sections populated: impact analysis, tasks, tests, docs updates.
allowed-tools:
  - read
  - write
  - edit
  - grep
  - bash
forbids:
  - git push
---

# Simple-Agent kanban - plan a story

Canonical rules: [docs/kanban/README.md](docs/kanban/README.md)

## Inputs

- Story id (`S##-##`) or full story filename.

## Procedure

1. Locate source file in `docs/kanban/stories/unplanned/`.
2. Ensure unplanned sections are present and filled.
3. Append missing planned sections from [../_templates/story-planned-additions.md](../_templates/story-planned-additions.md).
4. Populate:
   - `Impact analysis`
   - `Tasks` with actionable checkbox items
   - `Tests to add`
   - `Documentation and specs to update`
5. Move file to `docs/kanban/stories/planned/` with same filename.

## Quality gate

- No unchecked placeholder text remains.
- At least one task checkbox exists.
- Story exists only in `stories/planned/` (not `stories/unplanned/`).
