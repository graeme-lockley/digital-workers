---
name: finish-story
version: 1.0.0
description: Finalize a completed story by moving it to done and updating epic linkage/checklists.
outputs:
  - Story moved from stories/doing to stories/done.
  - Epic story link points to done path for that story.
allowed-tools:
  - read
  - write
  - edit
  - grep
  - bash
forbids:
  - git push
---

# Simple-Agent kanban - finish a story

Canonical rules: [docs/kanban/README.md](docs/kanban/README.md)

## Inputs

- Story id (`S##-##`) in `docs/kanban/stories/doing/`.

## Procedure

1. Confirm story completion gates:
   - acceptance criteria met
   - tasks checked
   - tests/docs sections updated
   - build notes include completion summary
2. Move story: `docs/kanban/stories/doing/<story>.md` -> `docs/kanban/stories/done/<story>.md`.
3. Open linked epic in `docs/kanban/epics/unplanned/`.
4. Update the story link in epic `Stories` section to point at `../../stories/done/<story>.md`.
5. If epic has story checklist items, tick this story item.

## Quality gate

- Story exists only in `stories/done/`.
- Epic references the new done path.
