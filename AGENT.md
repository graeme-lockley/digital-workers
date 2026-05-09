# Agent Guide for simple-agent

This file documents the current agent workflow baseline for this repository.

## Current State

The repo has moved from an early single-app layout toward the architecture direction in `docs/architecture.md`.

Implemented now:

- Architecture-aligned kanban directory structure under `docs/kanban/`
- Workflow skills under `.github/skills/`
- Lightweight validation scripts under `scripts/`
- `pnpm` script wiring for skill and kanban validation

Not yet implemented:

- Full monorepo package/app split shown in `docs/architecture.md`
- Runtime/router/worker services described by architecture

## Source of Truth

- Architecture (intent): `docs/architecture.md`
- Implementation strategy and spec ownership: `docs/specs/implementation-strategy.md`
- Spec set (buildable design): `docs/specs/`
- Kanban policy and folder conventions: `docs/kanban/README.md`
- Skills catalog: `.github/skills/README.md`

When there is any mismatch, prefer `docs/architecture.md`. Specs derive from it; the implementation strategy sequences delivery.

## Kanban Structure (Canonical)

```text
docs/kanban/
  README.md
  epics/
    unplanned/
    planned/
    doing/
    done/
  stories/
    unplanned/
    planned/
    doing/
    done/
```

## Skills Installed

```text
.github/skills/
  create-epic/
  create-story/
  plan-story/
  build-story/
  verify-story/
  finish-story/
  finish-epic/
  _shared/
  _templates/
```

These skills are designed to move story and epic files through kanban phases.

## Validation Scripts

- `scripts/check-story.sh`
  - Validates a single story file by ID or filename.
- `scripts/check-epic.sh`
  - Validates a single epic file by ID or filename, including spec references in done epics.
- `scripts/check-specs.sh`
  - Confirms every `docs/specs/NN-*.md` is listed in the spec index and the Spec Ownership Matrix.
- `scripts/lint-skills.sh`
  - Lints skill frontmatter and references.
- `scripts/validate-kanban-all.sh`
  - Runs skill lint + spec check + all story checks + all epic checks.

## PNPM Commands

- `pnpm lint:skills`
- `pnpm lint:commit-msg -- "feat(scope): message"`
- `pnpm setup:hooks`
- `pnpm check:story -- S##-##`
- `pnpm check:epic -- E##`
- `pnpm check:specs`
- `pnpm validate:kanban`
- `pnpm validate:kanban:all`

## Conventional Commits

All commit messages must follow Conventional Commits 1.0.0:

- https://www.conventionalcommits.org/en/v1.0.0/

Required title format:

`<type>[optional scope][!]: <description>`

The repository includes:

- `.githooks/commit-msg` hook
- `scripts/validate-commit-msg.sh` validator

After `git init`, run `pnpm setup:hooks` to enforce commit message validation locally.

## Workflow Expectations

1. Use skills for kanban transitions.
2. Keep story and epic templates consistent with `.github/skills/_templates/`.
3. Every story keeps the `docs/specs/` set current — see [docs/specs/implementation-strategy.md §7](docs/specs/implementation-strategy.md#7-spec-maintenance-discipline-required-of-every-story).
4. Run `pnpm validate:kanban:all` before merging or releasing documentation/process changes.
5. Keep architecture, specs, and kanban docs aligned when structure changes.

## Editing Rules for Agents

- Make minimal, focused changes.
- Do not reintroduce old `docs/kanban/{unplanned,planned,doing,done}` root paths.
- Use `docs/kanban/stories/*` and `docs/kanban/epics/*` only.
- Do not add new workflow phases without updating:
  - `docs/kanban/README.md`
  - `.github/skills/*`
  - `scripts/check-story.sh`
  - `scripts/check-epic.sh`
  - `scripts/validate-kanban-all.sh`

## Next Suggested Milestones

- Add CI job to run `pnpm validate:kanban:all`.
- Add seeded example epic and story files to demonstrate templates.
- Start introducing architecture monorepo folders (`apps/`, `packages/`) as executable increments.
