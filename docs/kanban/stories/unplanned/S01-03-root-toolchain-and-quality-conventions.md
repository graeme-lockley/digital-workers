# Root Toolchain and Quality Conventions

## Sequence: S01-03
## Tier: Foundation
## Former ID: (none)

## Epic

- Epic: [E01 Monorepo Foundation](../../epics/unplanned/E01-monorepo-foundation.md)

## Summary

Establish the shared TypeScript, lint, format, test, and task-orchestration baseline so local developer workflows and CI use the same command surface.

## Current State

Workspace boundaries may exist after S01-02, but cross-workspace quality gates are not yet standardized through root configs and orchestrated scripts.

## Relationship to other stories

- Depends on S01-02 to operate on valid workspace packages.
- Enables S01-04 and S01-05 by defining the canonical commands CI/release placeholders should execute.

## Goals

- Add shared TypeScript baseline (`tsconfig` base strategy) for monorepo packages/apps.
- Introduce lint/format tooling and conventions aligned with Node + TypeScript workflows.
- Add task orchestration configuration (for example Turbo) and root scripts for `typecheck`, `lint`, and `test`.

## Acceptance Criteria

- Root TypeScript configuration supports monorepo package/app composition without breaking existing strictness goals.
- Root scripts exist for `pnpm typecheck`, `pnpm lint`, and `pnpm test` and are documented as canonical checks.
- Lint and format configuration files are present and runnable from repository root.
- `pnpm typecheck && pnpm lint && pnpm test` succeeds on the migrated baseline.

## Spec References

- [docs/specs/12-packaging-release.md](../../../specs/12-packaging-release.md)
- [docs/specs/13-testing.md](../../../specs/13-testing.md)
- [docs/specs/implementation-strategy.md](../../../specs/implementation-strategy.md)

## Risks / Notes

- Overly strict initial rules can create avoidable churn in early epics; start minimal and enforce consistently.
- Keep command names stable because downstream workflows depend on them.
