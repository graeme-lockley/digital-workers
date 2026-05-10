# pnpm Workspace and Package Boundaries

## Sequence: S01-02
## Tier: Foundation
## Former ID: (none)

## Epic

- Epic: [E01 Monorepo Foundation](../../epics/unplanned/E01-monorepo-foundation.md)

## Summary

Define workspace boundaries and package manifests for the migrated app so dependency installation and script execution operate as a real pnpm monorepo.

## Current State

After S01-01, code is expected under architecture-aligned directories, but workspace membership and package boundaries are not yet explicitly declared for pnpm.

## Relationship to other stories

- Depends on S01-01 for final app path and directory layout.
- Unblocks S01-03 by making workspace packages discoverable to task orchestration.

## Goals

- Add root `pnpm-workspace.yaml` that includes `apps/*`, `packages/*`, and other required workspace globs.
- Define root and app-level package manifests consistent with the new structure.
- Ensure `pnpm install` resolves successfully in workspace mode.

## Acceptance Criteria

- `pnpm-workspace.yaml` exists and correctly scopes workspace package locations.
- `apps/digital-workers-tui/package.json` is present with valid scripts/dependencies for the migrated starter app.
- Root `package.json` scripts reference workspace-aware commands and no longer assume a single-package layout.
- `pnpm install` completes successfully from repository root with lockfile/workspace metadata updated.

## Spec References

- [docs/specs/implementation-strategy.md](../../../specs/implementation-strategy.md)
- [docs/specs/12-packaging-release.md](../../../specs/12-packaging-release.md)
- [docs/specs/00-overview.md](../../../specs/00-overview.md)

## Risks / Notes

- Mis-scoped workspace globs can hide packages and cause false-green local checks.
- Keep workspace boundaries minimal in this story; additional packages can be added in later epics.

## Impact analysis

- Adding `pnpm-workspace.yaml` enables workspace-aware package resolution and unified dependency management across multiple package trees.
- Creating and updating root and app-level `package.json` manifests establishes dependency boundaries and enables script orchestration via pnpm filters.
- Running `pnpm install` in workspace mode ensures all transitive dependencies resolve correctly and the lockfile reflects the complete monorepo state.
- Risk: workspace globs that are too broad could accidentally include directories that should not be packages; careful scoping minimizes this.

## Tasks

- [x] Create `pnpm-workspace.yaml` at repository root with workspace globs for `apps/*`, `packages/*`, `infra/`, and `workspaces/`.
- [x] Define or update root `package.json` with workspace-aware scripts and metadata (name, version, description, workspaces field if needed).
- [x] Create or update `apps/digital-workers-tui/package.json` with valid dependencies, scripts (e.g., `start`, `dev`, `typecheck`, `lint`, `test`), and package metadata.
- [x] Run `pnpm install` from repository root to validate workspace resolution and update lockfile and `.pnpmfile.cjs` if needed.
- [x] Verify workspace commands work correctly (e.g., `pnpm -w list`, `pnpm --filter apps/digital-workers-tui start`).
- [x] Update any scripts in `package.json` that should now use workspace-aware pnpm commands.

## Tests to add

- [x] Add regression test to validate `pnpm-workspace.yaml` syntax and structure (presence of required globs).
- [x] Test that `pnpm install` succeeds from repository root without errors or warnings related to workspace resolution.
- [x] Test that workspace commands discover packages correctly (e.g., `pnpm -w list` outputs all workspace packages).
- [x] Verify `apps/digital-workers-tui` is recognized as a workspace member and its scripts are executable via pnpm filters.

## Documentation and specs to update

- `docs/specs/00-overview.md` — describe the monorepo workspace structure and the role of `pnpm-workspace.yaml`.
- `docs/specs/12-packaging-release.md` — document workspace package boundaries, dependency resolution strategy, and workspace member listing.
- `docs/specs/implementation-strategy.md` — align workspace scope with E01 exit criteria and clarify the role of pnpm in the build pipeline.

## Build notes

- 2026-05-10: Created `pnpm-workspace.yaml` with workspace globs for `apps/*`, `packages/*`, `infra/`, and `workspaces/*` and included patchedDependencies section.
- 2026-05-10: Created `apps/digital-workers-tui/package.json` with scoped name `@digital-workers/tui`, workspace-appropriate scripts (`start`, `dev`, `typecheck`, `lint`, `test`), and shared dependencies.
- 2026-05-10: Updated root `package.json` with workspace-aware scripts using pnpm filters (`--filter @digital-workers/tui` for app-specific commands) and direct implementations for root-level commands (`tsc --noEmit` for typecheck).
- 2026-05-10: Executed `pnpm install` successfully; output confirmed "Scope: all 2 workspace projects" and resolved all dependencies without errors.
- 2026-05-10: Verified workspace discovery: `pnpm -w list` outputs root workspace, `pnpm --filter @digital-workers/tui list` correctly discovers and scopes to the TUI app package.
- 2026-05-10: Verified `pnpm typecheck` completes successfully without errors (no recursive script invocation).
- 2026-05-10: Verified app entrypoint works via filter: `pnpm start` launches the TUI app from `apps/digital-workers-tui/src/index.ts`.
- 2026-05-10: Updated specs (00-overview.md, 12-packaging-release.md, implementation-strategy.md) to document workspace structure, package boundaries, and workspace-aware script patterns.
- 2026-05-10: Completion summary: all acceptance criteria met, all tasks/tests checked, and spec updates completed for handoff to finish-story.

## Spec Updates

- `docs/specs/00-overview.md` — documented pnpm workspaces structure and workspace package scoping with scoped package names (S01-02).
- `docs/specs/12-packaging-release.md` — documented workspace package boundaries via `pnpm-workspace.yaml` globs, dependency resolution strategy with hoisted dependencies, and workspace-aware script patterns using pnpm filters (S01-02).
- `docs/specs/implementation-strategy.md` — updated E01 scope to explicitly mention workspace boundaries and `pnpm-workspace.yaml` configuration; updated exit criteria to require workspace configuration and all packages discoverable (S01-02).
