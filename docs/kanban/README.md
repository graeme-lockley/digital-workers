# Kanban

This workspace follows the architecture-defined kanban layout.

Stories live in `docs/kanban/stories/` and move through:

- `stories/unplanned/`
- `stories/planned/`
- `stories/doing/`
- `stories/done/`

Epics live in `docs/kanban/epics/` and move through:

- `epics/unplanned/`
- `epics/planned/`
- `epics/doing/`
- `epics/done/`

## Story IDs

- Story filename format: `S##-##-slug.md`
- `S##` is the epic number (matches `E##`)
- second `##` is sequence within the epic

Example: `S03-02-runtime-router-contract.md` belongs to `E03` and is story 2 in that epic.

## Epic IDs

- Epic filename format: `E##-slug.md`

Example: `E03-runtime-router.md`.

## Required Flow

1. Story `unplanned` -> `planned` via `plan-story`
2. Story `planned` -> `doing` -> `done` via `build-story` and `finish-story`
3. Epic `unplanned` -> `planned` -> `doing` -> `done` as delivery progresses

Do not skip `planned` for implementation work.

## Canonical Templates

- Epic template: `.github/skills/_templates/epic.md`
- Story base template: `.github/skills/_templates/story-unplanned.md`
- Story planned additions: `.github/skills/_templates/story-planned-additions.md`
- Story doing additions: `.github/skills/_templates/story-doing-additions.md`

## Acceptance Rules

- A story in `stories/done/` must have:
  - acceptance criteria clearly satisfied in code/docs
  - tasks checked
  - tests added/updated or explicit rationale
  - `Build notes` with dated summary
  - `## Documentation and specs to update` carried forward from planning
  - `## Spec Updates` listing every `docs/specs/*` file changed (or `_No spec impact_` with rationale)
- An epic in `epics/done/` must have:
  - all linked story files in `docs/kanban/stories/done/`
  - `Epic Completion Criteria` all checked
  - every spec referenced by its stories present on disk
  - `docs/specs/README.md` and the Spec Ownership Matrix in [`docs/specs/implementation-strategy.md`](../specs/implementation-strategy.md#6-spec-ownership-matrix) up to date

## Spec maintenance

Every story keeps the spec set current. The full discipline is defined in
[docs/specs/implementation-strategy.md §7](../specs/implementation-strategy.md#7-spec-maintenance-discipline-required-of-every-story)
and enforced by `plan-story`, `build-story`, `verify-story`, `finish-story`, `finish-epic`,
and the validators `pnpm check:story`, `pnpm check:epic`, and `pnpm check:specs`.
