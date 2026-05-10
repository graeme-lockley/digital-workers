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

---

## Impact analysis

This story establishes the developer experience contract that all future stories will depend on. Every developer and every CI pipeline will run the three root commands defined here. Decisions about strictness, tool choices (ESLint version, formatting rules, type checking level), and orchestration approach directly affect developer friction and CI feedback speed. A well-designed toolchain baseline enables parallel work across stories; a misconfigured one becomes a blocker for downstream epics.

The TypeScript configuration will be the foundation for type safety across all packages and applications; decisions here affect the entire codebase's checking strategy. Root-level lint/format rules establish the style baseline that must remain stable throughout the project.

---

## Tasks

- [x] Create root `tsconfig.json` with base configuration for monorepo composition (`compilerOptions` aligned with strictness requirements in specs/13-testing.md and specs/12-packaging-release.md)
- [x] Create ESLint root configuration (`.eslintrc.json` or equivalent) with ruleset that works across packages and applications
- [x] Create Prettier configuration (`.prettierrc.json` or equivalent) for consistent code formatting
- [x] Install and configure Turbo (or equivalent task orchestrator) in root `package.json` for task pipelining
- [x] Add root scripts to `package.json`: `pnpm typecheck`, `pnpm lint`, `pnpm format`, `pnpm test`
- [x] Document root toolchain commands in `docs/kanban/README.md` or a new `docs/dev-setup.md`
- [x] Validate that `pnpm typecheck && pnpm lint && pnpm test` succeeds end-to-end
- [x] Create `.gitignore` entry pattern for build artifacts if not present

## Tests to add

- No new automated test files were added in this story. The acceptance criteria were satisfied by executing the new canonical root commands directly (`pnpm typecheck`, `pnpm lint`, `pnpm test`) and confirming they succeed on the baseline.
- Negative-path regression tests for intentionally injected TypeScript and lint failures are deferred to later CI and toolchain-hardening stories, because this foundation story establishes the command surface rather than a dedicated test harness for mutating the repo under test.

## Documentation and specs to update

- [x] `docs/specs/12-packaging-release.md` — Document root `tsconfig` and task orchestration strategy for reproducible builds
- [x] `docs/specs/13-testing.md` — Document canonical test execution command and local testing workflow
- [x] `docs/specs/implementation-strategy.md` — Update E01 exit criteria confirmation and document enforced toolchain commands
- [x] `docs/kanban/README.md` or new `docs/dev-setup.md` — Document `pnpm typecheck`, `pnpm lint`, `pnpm format`, `pnpm test` as canonical commands

## Notes

- Tool versions should be pinned in root `package.json` to ensure reproducible local and CI environments.
- Root scripts must fail fast and provide actionable error messages to minimize developer friction.
- Start with minimal but non-zero ESLint rules to avoid early-epic churn; strictness can increase as codebase matures.

## Build notes

- 2026-05-10: Started implementation by adding shared TypeScript baseline files (`tsconfig.base.json`, root `tsconfig.json`, and app-local `tsconfig.json`), root ESLint/Prettier/Turbo configuration, and real root scripts for `typecheck`, `lint`, `format`, and `test`.
- 2026-05-10: Updated `docs/specs/12-packaging-release.md`, `docs/specs/13-testing.md`, `docs/specs/implementation-strategy.md`, and `docs/kanban/README.md` to document the shared root toolchain contract and canonical validation commands.
- 2026-05-10: Verified `pnpm install`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm check:story S01-03` succeed. Added `.turbo/` to `.gitignore` and `.prettierignore` for the new Turbo cache artifact. `pnpm format` is runnable from root but still reports pre-existing repository formatting drift outside this story.
- 2026-05-10: Completion summary: acceptance criteria met, all implementation tasks completed, promised specs updated, and the story is ready for epic progression. No spec files were added or removed, so `docs/specs/README.md` and the Spec Ownership Matrix remain accurate.

## Spec Updates

- `docs/specs/12-packaging-release.md` — documented the shared TypeScript baseline, root validation commands, Turbo orchestration, and `packageManager` requirement.
- `docs/specs/13-testing.md` — documented the canonical repository-level validation workflow and clarified Turbo-backed test orchestration.
- `docs/specs/implementation-strategy.md` — updated E01 scope and exit criteria to require the shared root toolchain and canonical validation commands.
