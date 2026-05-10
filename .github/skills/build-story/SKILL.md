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
5. **Update every `docs/specs/*` file listed in `## Documentation and specs to update`** in the same change set as the code. If a new spec is required, create it and add it to [docs/specs/README.md](../../../docs/specs/README.md) and to the Spec Ownership Matrix in [docs/specs/implementation-strategy.md §6](../../../docs/specs/implementation-strategy.md#6-spec-ownership-matrix).
6. Append a `## Spec Updates` section to the story (or update it) listing each `docs/specs/*` file changed with a one-line description. If `_No spec impact_` was recorded in planning, restate that here with the same rationale.
7. Tick completed `Tasks` checkboxes in the story.
8. Run project checks relevant to changed areas (`test`, `typecheck`, `lint` as available).
9. If acceptance criteria are fully met, leave story in `doing/` and hand off to `verify-story` + `finish-story`.
10. Open the linked epic (any phase under `docs/kanban/epics/`) and update the story entry in its `Stories` section to point at `../../stories/doing/<story>.md`.

## Quality gate

- Story is in `stories/doing/` while implementation is active.
- Build notes include at least one dated entry.
- Tasks reflect actual progress.
- Every spec promised in `## Documentation and specs to update` is updated, or `## Spec Updates` records `_No spec impact_` with the planning-time rationale.
- The spec index ([docs/specs/README.md](../../../docs/specs/README.md)) lists every spec the story added.
- Epic references the current doing path for the story.
