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

## Impact analysis

- Source root relocation from `src/` to `apps/digital-workers-tui/src/` affects entrypoint paths, TypeScript include/extends behavior, and npm script references.
- Creating top-level architecture directories adds repository structure with placeholder files and may require updated documentation examples.
- Behavior should remain unchanged, so risk is mainly integration breakage from stale paths rather than runtime logic.

## Tasks

- [x] Create top-level directories: `apps/`, `packages/`, `infra/`, and `workspaces/`, each with committed placeholders as needed.
- [x] Move app source from `src/index.ts` to `apps/digital-workers-tui/src/index.ts`.
- [x] Remove legacy `src/index.ts` or replace it with an intentional compatibility bridge and document the decision.
- [x] Update scripts/configuration so the app runs from its new location with the same behavior.
- [x] Run relevant validation checks (typecheck/test/lint) and capture outcomes in story build notes during implementation.

## Tests to add

- [x] Added regression script `scripts/test-s01-01-migration.sh` and npm script `pnpm test:s01-01` to validate migrated entrypoint presence, legacy `src/index.ts` removal, and updated `package.json` script paths.
- [x] Executed startup smoke run using `pnpm start -- --no-session --verbose` to confirm the app boots from `apps/digital-workers-tui/src/index.ts`.

## Documentation and specs to update

- `docs/specs/00-overview.md` — reflect monorepo top-level layout and app location under `apps/`.
- `docs/specs/12-packaging-release.md` — update packaging/release path assumptions for relocated app entrypoint.
- `docs/specs/implementation-strategy.md` — align implementation sequencing notes with the completed scaffold + migration shape.

## Notes

- This story intentionally excludes workspace boundary enforcement and CI workflow details; those are handled by S01-02 through S01-05.

## Build notes

- 2026-05-10: Migrated app entrypoint from `src/index.ts` to `apps/digital-workers-tui/src/index.ts`; updated `package.json` start/dev scripts and `tsconfig.json` include root to `apps/**/*`; created architecture scaffolding directories `packages/`, `infra/`, and `workspaces/` with `.gitkeep` placeholders.
- 2026-05-10: Updated required specs (`00-overview.md`, `12-packaging-release.md`, `implementation-strategy.md`) to reflect the S01-01 scaffold and migration decisions.
- 2026-05-10: Validation run recorded in this story: `pnpm exec tsc --noEmit` and `pnpm check:story -- S01-01`.
- 2026-05-10: Added and executed migration regression test `pnpm test:s01-01` (PASS) and re-ran `pnpm check:story S01-01` (PASS).
- 2026-05-10: Story completed successfully; acceptance criteria met and the story moved to `docs/kanban/stories/done/` after epic reference update.

## Spec Updates

- `docs/specs/00-overview.md` — documented baseline monorepo layout and the initial app entrypoint at `apps/digital-workers-tui/src/index.ts`.
- `docs/specs/12-packaging-release.md` — updated packaging/release assumptions to use `apps/digital-workers-tui/src/index.ts` and codified top-level scaffolding directories.
- `docs/specs/implementation-strategy.md` — clarified E01 scope and exit criteria to explicitly require migration from `src/index.ts` to `apps/digital-workers-tui/src/index.ts`.
