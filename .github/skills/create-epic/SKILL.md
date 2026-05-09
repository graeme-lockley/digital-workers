---
name: create-epic
version: 1.0.0
description: Create a new epic file in docs/kanban/epics/unplanned using the canonical epic template.
outputs:
  - New epic markdown file in docs/kanban/epics/unplanned.
  - Epic metadata populated and ready for stories.
allowed-tools:
  - read
  - write
  - edit
  - grep
  - bash
forbids:
  - git push
---

# Simple-Agent kanban - create an epic

Canonical rules: [docs/kanban/README.md](docs/kanban/README.md)

## Inputs

- Epic title
- Problem statement / summary
- Scope and non-goals

## Procedure

1. Determine next epic id:
  - Inspect `docs/kanban/epics/{unplanned,planned,doing,done}/` for highest `E##`.
   - Use next numeric id, zero-padded to 2 digits.
2. Create slug from epic title (lowercase, hyphen-separated).
3. Create file: `docs/kanban/epics/unplanned/E##-<slug>.md`.
4. Populate from template: [../_templates/epic.md](../_templates/epic.md).
5. Fill required sections with concrete project context.
6. Add at least one placeholder story entry using `S##-##` id pattern.

## Quality gate

- File exists under `epics/unplanned/`.
- Title and id match filename.
- `Epic Completion Criteria` section exists with unchecked boxes.
