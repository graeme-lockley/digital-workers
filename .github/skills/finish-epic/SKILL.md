---
name: finish-epic
version: 1.0.0
description: Close an epic by validating all stories are done and moving epic to epics/done.
outputs:
  - Epic moved from docs/kanban/epics/doing to docs/kanban/epics/done.
  - Epic completion checklist fully checked.
allowed-tools:
  - read
  - write
  - edit
  - grep
  - bash
forbids:
  - git push
---

# Simple-Agent kanban - finish an epic

Canonical rules: [docs/kanban/README.md](docs/kanban/README.md)

## Inputs

- Epic id (`E##`) or epic filename.

## Procedure

1. Locate epic file in `docs/kanban/epics/doing/`.
2. Parse `## Stories` links.
3. Verify each linked story exists in `docs/kanban/stories/done/`.
4. Ensure all `Epic Completion Criteria` checkboxes are checked.
5. Move epic file to `docs/kanban/epics/done/`.

## Quality gate

- No linked story points to `stories/unplanned`, `stories/planned`, or `stories/doing`.
- Epic exists only in `epics/done/`.
