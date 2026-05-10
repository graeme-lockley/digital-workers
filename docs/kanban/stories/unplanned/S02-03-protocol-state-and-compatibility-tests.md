# Protocol State and Compatibility Tests

## Sequence: S02-03

## Tier: Foundation

## Former ID: (none)

## Epic

- Epic: [E02 Protocol Package](../../epics/unplanned/E02-protocol-package.md)

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

## Documentation and specs to update

- [docs/specs/01-protocol.md](../../../specs/01-protocol.md) to capture the persisted state, outcome, and compatibility-test contracts exported by the protocol package.

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
