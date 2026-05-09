---
name: build-story
version: 1.0.0
description: Implement a planned story, track execution notes, and progress it from planned to doing and potentially done.
outputs:
  - Story moved to docs/kanban/stories/doing during implementation.
  - Tasks and build notes updated.
  - Story ready for verify-story and finish-story.
allowed-tools:
  - read
  - write
  - edit
  - grep
  - bash
forbids:
  - git push
---

# Simple-Agent kanban - build a story

Canonical rules: [docs/kanban/README.md](docs/kanban/README.md)

## Inputs

- Story id (`S##-##`) or full filename.

## Procedure

1. Locate story:
  - preferred source: `docs/kanban/stories/planned/`
  - if already in `stories/doing/`, continue work in-place.
2. If source is `stories/planned/`, move to `docs/kanban/stories/doing/`.
3. Ensure `## Build notes` exists; append entry using `YYYY-MM-DD` date format.
4. Implement code and documentation changes needed by acceptance criteria.
5. Tick completed `Tasks` checkboxes in the story.
6. Run project checks relevant to changed areas (`test`, `typecheck`, `lint` as available).
7. If acceptance criteria are fully met, leave story in `doing/` and hand off to `verify-story` + `finish-story`.

## Quality gate

- Story is in `stories/doing/` while implementation is active.
- Build notes include at least one dated entry.
- Tasks reflect actual progress.
