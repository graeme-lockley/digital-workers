# 13 — Testing

**Status:** Draft v0.1
**Owner:** Engineering / QA
**Related architecture:** Appendix C, §11 Development Workflow
**Related epics:** All

## Purpose

Define the testing strategy that governs every story.

## Scope

- Unit tests next to source.
- Contract tests in `packages/protocol` and `packages/test-utils`.
- Integration tests for multi-package flows.
- End-to-end tests per app.
- Boundary tests for security primitives (Risk R5 gate).
- Replay tests using historical message-log fixtures (Risk R10).

## Design

- A story is not `done` until tests for changed behaviour exist or an explicit rationale is recorded.
- Contract test helpers are imported by every consumer of a protocol schema.
- Boundary tests run on every push and gate releases.
- Test fixtures and mocks live in `packages/test-utils/src/`.
- The repository-level validation contract is `pnpm typecheck && pnpm lint && pnpm test`; stories that change shared tooling or cross-workspace behavior must run and report these commands.
- Turbo orchestrates `pnpm test` across workspace packages, but each package remains responsible for its own `test` script and local test discovery.
- The foundation CI workflow mirrors the local repository validation path by running `pnpm install --frozen-lockfile`, then `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm validate:kanban:all` on pull requests and pushes to `main`.
- Changes to shared tooling, root scripts, or workflow definitions must validate the same command order locally before they are considered ready for review.
- `pnpm format` remains available as a root quality command, but it is not part of the required green baseline for foundation CI until the repository's inherited formatting drift is cleaned up.

## Interfaces

- Test runner: `pnpm test` (Turbo orchestrates per-package).
- Static validation runners: `pnpm typecheck` and `pnpm lint` from repository root.
- CI validation entrypoint: `.github/workflows/validate.yml`.
- Targeted: `pnpm test:contract`, `pnpm test:integration`.

## Open questions

- Coverage thresholds per package.
- Whether to adopt mutation testing for protocol/config.

## Change log

- 2026-05-10: Clarified that the CI-required local reproduction path is the current green baseline and that `pnpm format` remains non-gating until repository formatting drift is resolved (S01-04).
- 2026-05-10: Added the canonical root validation workflow (`pnpm typecheck && pnpm lint && pnpm test`) and clarified Turbo's role in package test orchestration (S01-03).
- 2026-05-09: Initial stub.
