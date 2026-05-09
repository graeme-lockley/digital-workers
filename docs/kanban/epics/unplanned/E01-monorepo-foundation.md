# Epic E01: Monorepo Foundation

## Summary

Establish a reproducible monorepo baseline so all future epics can build, lint, test, and release through a consistent Node.js and pnpm workflow.

## Problem Statement

The implementation strategy sequences all delivery behind a shared foundation. Without a defined monorepo toolchain, package layout, and CI automation, later epics cannot reliably validate changes or ship releasable increments.

## Scope

- Configure pnpm workspace boundaries and root scripts for shared development workflows.
- Restructure the current repository into the architecture target layout (`apps/`, `packages/`, `infra/`, `workspaces/`) without changing intended runtime behavior.
- Relocate the current single-app starter code into the architecture-aligned app location and wire imports/config so the project still runs.
- Define root TypeScript configuration and baseline lint/format/test command conventions.
- Add CI scaffolding that runs repository validation on push and pull requests.
- Align packaging/release placeholders with the spec guidance so release automation can be expanded in later stories.

## Non-Goals

- Building runtime features, worker orchestration, or protocol schemas.
- Implementing full release publication to external registries.
- Introducing non-Node runtimes or alternative package managers.

## Stories (ordered - implement sequentially)

1. S01-01 - monorepo toolchain baseline (to be created during story planning)

## Epic Completion Criteria

- [ ] All listed stories are in `docs/kanban/stories/done/`.
- [ ] Repository structure matches the architecture-defined monorepo layout, with current code migrated to the correct app/package locations.
- [ ] Runtime behavior matches architecture and acceptance criteria.
- [ ] Docs/specs updated where required.
- [ ] No open blocking issues remain.

## Risks

- Tooling drift between local development and CI runner environments can create false confidence.
- Restructuring file locations can break import paths, scripts, and tooling configuration if migration is incomplete.
- Over-constraining initial tooling may slow early implementation stories if the repo structure evolves.

## Notes

Source: `docs/specs/implementation-strategy.md` section "E01 - Monorepo Foundation".
