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
3. Append missing planned sections from [../\_templates/story-planned-additions.md](../_templates/story-planned-additions.md).
4. Populate planned sections (or refine if already present from epic planning):
   - `Impact analysis`
   - `Tasks` with actionable checkbox items
   - `Tests to add`
   - `Documentation and specs to update` — enumerate every `docs/specs/*` file the story will change (one bullet per spec). If no spec is impacted, write `_No spec impact_` followed by a one-line justification. If an unplanned epic has already sketched this section, validate and refine the list to ensure accuracy.
5. Move file to `docs/kanban/stories/planned/` with same filename.
6. Open the linked epic (any phase under `docs/kanban/epics/`) and update the story entry in its `Stories` section to point at `../../stories/planned/<story>.md`.

## Quality gate

- No unchecked placeholder text remains.
- At least one task checkbox exists.
- `Documentation and specs to update` either lists at least one `docs/specs/*` file or contains `_No spec impact_` with rationale.
- Story exists only in `stories/planned/` (not `stories/unplanned/`).
- Epic references the new planned path for the story.

## Spec-maintenance contract

This skill is the entry point for the spec-maintenance discipline defined in [docs/specs/implementation-strategy.md §7](../../../docs/specs/implementation-strategy.md#7-spec-maintenance-discipline-required-of-every-story). The specs listed here are the contract that `build-story`, `verify-story`, and `finish-story` will enforce.
