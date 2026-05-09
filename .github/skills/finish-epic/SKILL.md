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
5. Confirm spec consistency:
   - Every spec named in this epic's stories under `## Spec Updates` exists in `docs/specs/`.
   - [docs/specs/README.md](../../../docs/specs/README.md) lists every `docs/specs/*` file currently on disk.
   - The Spec Ownership Matrix in [docs/specs/implementation-strategy.md §6](../../../docs/specs/implementation-strategy.md#6-spec-ownership-matrix) lists every spec and the epics that mature it.
6. Move epic file to `docs/kanban/epics/done/`.

## Quality gate

- No linked story points to `stories/unplanned`, `stories/planned`, or `stories/doing`.
- Epic exists only in `epics/done/`.
- Spec index and ownership matrix are accurate.
