# Monorepo Scaffold and App Migration

## Sequence: S01-01
## Tier: Foundation
## Former ID: (none)

## Epic

- Epic: [E01 Monorepo Foundation](../../epics/unplanned/E01-monorepo-foundation.md)

## Summary

Create the architecture-aligned top-level monorepo directories and migrate the current starter application from `src/` to `apps/digital-workers-tui/` without changing runtime behavior.

## Current State

The repository is a single-package TypeScript project with runtime entrypoint at `src/index.ts`. The target architecture requires app code under `apps/` and explicit top-level directories for `packages/`, `infra/`, and `workspaces/`.

## Relationship to other stories

- First story in E01; all later E01 stories depend on this layout migration.
- Unblocks workspace/package manifest wiring in S01-02.

## Goals

- Create baseline top-level directories required by architecture: `apps/`, `packages/`, `infra/`, `workspaces/`.
- Move the existing starter app code to `apps/digital-workers-tui/`.
- Preserve current runtime behavior and CLI semantics after file relocation.

## Acceptance Criteria

- `apps/digital-workers-tui/src/index.ts` exists and contains the migrated starter app entrypoint.
- Legacy root app source location (`src/index.ts`) is removed or replaced with an intentional compatibility bridge documented in this story.
- Repository contains architecture-required top-level directories (`apps/`, `packages/`, `infra/`, `workspaces/`) with committed placeholders where needed.
- Running the app through its updated location works with existing expected flags/behavior.

## Spec References

- [docs/architecture.md](../../../architecture.md)
- [docs/specs/implementation-strategy.md](../../../specs/implementation-strategy.md)
- [docs/specs/00-overview.md](../../../specs/00-overview.md)
- [docs/specs/12-packaging-release.md](../../../specs/12-packaging-release.md)

## Risks / Notes

- Path migration can silently break imports, script entrypoints, and tsconfig roots.
- Keep this story focused on structural migration only; tooling standardization happens in later stories.
