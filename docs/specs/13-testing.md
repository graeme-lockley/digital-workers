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

## Interfaces

- Test runner: `pnpm test` (Turbo orchestrates per-package).
- Targeted: `pnpm test:contract`, `pnpm test:integration`.

## Open questions

- Coverage thresholds per package.
- Whether to adopt mutation testing for protocol/config.

## Change log

- 2026-05-09: Initial stub.
