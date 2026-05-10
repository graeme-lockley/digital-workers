# Protocol State and Compatibility Tests

## Sequence: S02-03

## Tier: Foundation

## Former ID: (none)

## Epic

- Epic: [E02 Protocol Package](../../epics/doing/E02-protocol-package.md)

## Summary

Define the state, outcome, and compaction schemas that downstream storage and runtime epics will persist, then lock the package with compatibility tests for the canonical-v1 family.

## Current State

There is no canonical schema package, no persisted record contract, and no compatibility test suite to guard schema drift.

## Relationship to other stories

Depends on S02-01 for the shared package scaffold. Can run in parallel with S02-02 once the base package exists.

## Goals

- Implement the persisted record schemas: `TranscriptEntry`, `AuditEntry`, `MemoryEntry`, `TaskRecord`, `OuterContext`, and `Session`.
- Implement the outcome and compaction schemas: `InnerLoopOutcome`, `CompactionArtifactV1`, `SessionConfig`, and `WorkerStatusSnapshot`.
- Add contract tests that verify the exported `canonical-v1` family remains backward compatible.
- Ensure the persisted schemas all carry the versioning convention required by the protocol spec.

## Impact analysis

This story extends the protocol package from transport, API, and workspace config into persisted state and compatibility coverage. The result should be a stable canonical-v1 contract surface for storage and runtime consumers, with tests that fail if those exported shapes drift incompatibly.

## Tasks

- [x] Add the persisted record schemas and export them from `packages/protocol/src/index.ts`.
- [x] Add the outcome, compaction, session-config, and worker-status snapshot schemas with the canonical-v1 version field.
- [x] Group the new schemas behind a clear public barrel so downstream code can import them without reaching into internal files.
- [x] Add compatibility checks that exercise the canonical-v1 export family and reject incompatible shape changes.

## Tests to add

- [x] Extend `packages/protocol/src/index.test.ts` with representative valid and invalid payloads for the new persisted and outcome schemas.
- [x] Add a contract-style test that enumerates the canonical-v1 exports and fails if a required schema is missing or renamed incompatibly.

## Documentation and specs to update

- [x] `docs/specs/01-protocol.md` — document the persisted state, outcome, compaction, session-config, and worker-status contracts plus the compatibility-test expectations.

## Acceptance Criteria

- The state and outcome schemas are exported from `packages/protocol/src/index.ts`.
- Each persisted record includes the versioning fields required by the protocol spec.
- Contract tests cover the canonical-v1 family and fail if exported shapes drift incompatibly.
- The schema set is sufficient for later storage and runtime stories to consume without redefining the types.

## Spec References

- [docs/specs/01-protocol.md](../../../specs/01-protocol.md)
- [docs/specs/implementation-strategy.md](../../../specs/implementation-strategy.md)

## Risks / Notes

- Compatibility tests should stay focused on the exported canonical family instead of encoding implementation details.
- `Session` and `SessionConfig` should be handled carefully so the contract stays aligned with the runtime and storage specs.

## Build notes

- 2026-05-10: Added the durable protocol state module, exported the canonical-v1 state family from `packages/protocol/src/index.ts`, and extended the protocol test suite with compatibility and representative payload coverage.

## Spec Updates

- `docs/specs/01-protocol.md` - documented the durable state module, canonical-v1 state bundle, and the compatibility-test expectations for persisted and runtime-shared state contracts.
