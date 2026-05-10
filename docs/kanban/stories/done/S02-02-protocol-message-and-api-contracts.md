# Protocol Message and API Contracts

## Sequence: S02-02

## Tier: Foundation

## Former ID: (none)

## Epic

- Epic: [E02 Protocol Package](../../epics/doing/E02-protocol-package.md)

## Summary

Define the protocol surface for runtime communication and configuration: events, worker messages, worker commands, API request/response types, and workspace configuration.

## Current State

The repo has no canonical schema package yet, so runtime-facing shapes are currently implicit and unversioned.

## Relationship to other stories

Depends on S02-01 for the package scaffold and shared versioning helper. This story can proceed in parallel with S02-03 once that foundation exists.

## Goals

- Implement the `Event`, `WorkerMessage`, and `WorkerCommand` schema families.
- Implement the request/response schemas for `SessionAPI`, `WorkerManagerAPI`, `RouterAPI`, and `RuntimeConfigAPI`.
- Implement `WorkspaceConfigSchema` as the canonical config contract used by later configuration work.
- Export the schema types and inferred TypeScript types from the package entrypoint.

## Documentation and specs to update

- [x] `docs/specs/01-protocol.md` - capture the concrete event/message/command and API request-response schemas exported by `packages/protocol`.
- [x] `docs/specs/03-config.md` - align the config spec wording with the finalized `WorkspaceConfigSchema` contract and validation expectations.
- [x] `docs/specs/13-testing.md` - add protocol contract-test expectations for message/API/config schema validation coverage introduced by this story.

## Acceptance Criteria

- The runtime communication schemas exist as zod definitions and inferred TypeScript types.
- The API request/response schemas are versioned and exported from the package entrypoint.
- `WorkspaceConfigSchema` is exported and can validate representative configuration data.
- Tests cover the happy-path validation and a small set of representative invalid inputs.

## Spec References

- [docs/specs/01-protocol.md](../../../specs/01-protocol.md)
- [docs/specs/implementation-strategy.md](../../../specs/implementation-strategy.md)

## Risks / Notes

- Keep the API shapes narrow and spec-driven so later runtime stories do not inherit unnecessary fields.
- Make version tags explicit from the start to avoid ad hoc compatibility rules later.

## Impact analysis

This story establishes the first full protocol contract slice consumed by runtime, config, and interface layers. The highest risk is schema overreach or naming drift that forces downstream consumers to adapt to unstable contracts, so the implementation should stay tightly aligned to `docs/specs/01-protocol.md` and keep versioning explicit.

## Tasks

- [x] Add protocol transport schemas for `Event`, `WorkerMessage`, and `WorkerCommand` with explicit version tagging and strict zod validation.
- [x] Add API request/response schemas for `SessionAPI`, `WorkerManagerAPI`, `RouterAPI`, and `RuntimeConfigAPI`.
- [x] Implement and export `WorkspaceConfigSchema` and inferred TypeScript types from the package entrypoint.
- [x] Add unit tests for representative valid and invalid payloads across transport, API, and workspace config schemas.
- [x] Verify all newly introduced schema families are exported from `packages/protocol/src/index.ts` with stable names.

## Tests to add

- Add schema validation tests covering successful parsing for representative `Event`, `WorkerMessage`, and `WorkerCommand` payloads.
- Add API contract tests for each request/response pair in `SessionAPI`, `WorkerManagerAPI`, `RouterAPI`, and `RuntimeConfigAPI`.
- Add `WorkspaceConfigSchema` tests for valid minimal and fully populated configs plus representative invalid cases.
- Add export-surface tests to confirm the new schema families and inferred types are reachable from the package public entrypoint.

## Notes

Keep this story limited to message/API/config contracts. Persisted record and outcome contracts belong to S02-03.

## Build notes

- 2026-05-10: Implemented `Event`, `WorkerMessage`, `WorkerCommand`, API request-response schema families, and `WorkspaceConfigSchema` in `packages/protocol`; expanded package tests to cover representative valid/invalid payloads and verified package typecheck/lint/test.
- 2026-05-10: Completion summary: S02-02 acceptance criteria are met, protocol schemas are exported from the package entrypoint, and all required validation checks passed.

## Spec Updates

- `docs/specs/01-protocol.md` - documented concrete S02-02 transport/API/config schema modules and canonical-v1 discriminator expectations.
- `docs/specs/03-config.md` - aligned config validation contract with `WorkspaceConfigSchema` and `WorkerConfigSchema` requirements.
- `docs/specs/13-testing.md` - added protocol test requirements for transport, API, and workspace config schema validation.
