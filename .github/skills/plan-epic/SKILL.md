---
name: plan-epic
version: 1.0.0
description: Decompose an epic into an ordered set of unplanned stories and update the epic story list.
outputs:
  - One or more new story files in docs/kanban/stories/unplanned.
  - Epic ## Stories section updated with ordered links to created stories.
allowed-tools:
  - read
  - write
  - edit
  - grep
  - bash
forbids:
  - git push
---

# Simple-Agent kanban - plan an epic

Canonical rules: [docs/kanban/README.md](docs/kanban/README.md)

## Inputs

- Epic id (`E##`) or full epic filename.

## Outputs / Side effects

- Creates one or more `docs/kanban/stories/unplanned/S##-##-slug.md` files.
- Replaces the epic `## Stories (ordered - implement sequentially)` section with the ordered story list.
- No commits. The author commits.

## Procedure

1. Locate the epic file in `docs/kanban/epics/unplanned/`.
2. Read the epic completely:
   - `Summary`
   - `Problem Statement`
   - `Scope`
   - `Non-Goals`
   - `Epic Completion Criteria`
   - `Risks`
3. Explore relevant specs and architecture before decomposing:
   - [docs/architecture.md](../../../docs/architecture.md)
   - [docs/specs/implementation-strategy.md](../../../docs/specs/implementation-strategy.md)
   - any directly impacted `docs/specs/*.md`
4. Decompose the epic into smallest independently reviewable stories:
   - each story has a clear testable done state
   - dependencies appear earlier in order
   - independent stories are called out as parallelizable notes
5. Allocate story ids for this epic:
   - story prefix is `S<epic-number>`
   - choose next free story sequence by scanning `docs/kanban/stories/{unplanned,planned,doing,done}/`
6. Create each story file in `docs/kanban/stories/unplanned/` using [../\_templates/story-unplanned.md](../_templates/story-unplanned.md).
7. Fill all required sections with concrete content derived from epic/spec context:
   - `Summary`, `Current State`, `Relationship to other stories`, `Goals`, `Acceptance Criteria`, `Spec References`, `Risks / Notes`
8. Replace epic `## Stories` section using [../\_templates/epic-stories-ordered.md](../_templates/epic-stories-ordered.md):
   - include ordered links to created story files
   - include one-line description per story
   - include a short note if any stories can be done in parallel

## Quality gate

- Epic remains in `docs/kanban/epics/unplanned/`.
- At least one new `S##-##-slug.md` file exists for that epic under `docs/kanban/stories/unplanned/`.
- Every created story links back to the epic file.
- Every story id listed in epic `## Stories` resolves to an existing story file.
- No placeholder text remains in created stories.

## Related

- Create epic first: [../create-epic/SKILL.md](../create-epic/SKILL.md)
- Plan one story: [../plan-story/SKILL.md](../plan-story/SKILL.md)
- Build a story: [../build-story/SKILL.md](../build-story/SKILL.md)
