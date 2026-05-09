---
name: create-story
version: 1.0.0
description: Create a story markdown file using canonical template and link it to an open epic.
outputs:
  - New story in docs/kanban/stories/unplanned.
  - Epic story list updated with link to the new story.
allowed-tools:
  - read
  - write
  - edit
  - grep
  - bash
forbids:
  - git push
---

# Simple-Agent kanban - create a story

Canonical rules: [docs/kanban/README.md](docs/kanban/README.md)

## Inputs

- Story title
- Target epic id (`E##`)
- Optional target phase (`unplanned`, `planned`, `doing`, `done`; default `unplanned`)

## Procedure

1. Resolve epic file in `docs/kanban/epics/unplanned/`.
2. Compute story id:
   - Epic prefix is `S<epic-number>`.
   - Find next sequence number for that epic across all story folders.
3. Create slug from story title.
4. Create story file path:
  - default: `docs/kanban/stories/unplanned/S##-##-<slug>.md`
  - optional: `docs/kanban/stories/<phase>/S##-##-<slug>.md`
5. For unplanned stories, populate from [../_templates/story-unplanned.md](../_templates/story-unplanned.md).
6. Fill all sections with concrete content.
7. Update epic `## Stories (ordered - implement sequentially)` with link to this story.

## Quality gate

- Story file exists in requested folder.
- `## Sequence` matches filename.
- Epic link points to existing `E##` file.
