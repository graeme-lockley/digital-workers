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
