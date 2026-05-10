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

1. [S01-01-monorepo-scaffold-and-app-migration.md](../../stories/done/S01-01-monorepo-scaffold-and-app-migration.md) - Create architecture-aligned top-level directories and migrate the starter app into `apps/digital-workers-tui/`.
2. [S01-02-pnpm-workspace-and-package-boundaries.md](../../stories/done/S01-02-pnpm-workspace-and-package-boundaries.md) - Define pnpm workspace boundaries and package manifests for the migrated app layout.
3. [S01-03-root-toolchain-and-quality-conventions.md](../../stories/done/S01-03-root-toolchain-and-quality-conventions.md) - Establish root TypeScript, lint, format, test, and task orchestration conventions.
4. [S01-04-ci-validation-workflow-scaffolding.md](../../stories/done/S01-04-ci-validation-workflow-scaffolding.md) - Add CI workflow scaffolding for install and quality validation on PR/push.
5. [S01-05-release-dry-run-placeholder.md](../../stories/unplanned/S01-05-release-dry-run-placeholder.md) - Add a non-publishing release workflow placeholder that runs in dry-run mode.

_Stories 4 and 5 can proceed in parallel after story 3 is complete._

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
