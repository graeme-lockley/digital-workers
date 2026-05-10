# Epic E02: Protocol Package

## Summary

Create the shared protocol package that defines every versioned schema consumed by the runtime, storage, and client surfaces. This package becomes the canonical contract boundary for the rest of the system.

## Problem Statement

The implementation strategy requires a stable protocol layer before later epics can wire config, storage, runtime, and UI together. Without a dedicated contract package, those surfaces would duplicate shapes, drift over time, and make compatibility testing impossible.

## Scope

- Create `packages/protocol` as the canonical home for all shared zod schemas and inferred TypeScript types.
- Define the versioned contract surface for worker messages, commands, runtime APIs, workspace config, outcomes, and persisted records.
- Publish a single public entrypoint from `packages/protocol/src/index.ts`.
- Add compatibility tests for the `canonical-v1` family so later epics can depend on stable schema evolution.

## Non-Goals

- Implementing runtime behaviour in core runtime, storage, sandbox, or worker adapters.
- Building any UI or CLI features that consume the schemas.
- Designing migrations for future `canonical-v2` shapes unless a breaking change is discovered during implementation.

## Stories (ordered - implement sequentially)

1. [S02-01-protocol-package-scaffold.md](../../stories/done/S02-01-protocol-package-scaffold.md) - Create the `packages/protocol` workspace package, public entrypoint, and shared versioning conventions used by every schema family.
2. [S02-02-protocol-message-and-api-contracts.md](../../stories/done/S02-02-protocol-message-and-api-contracts.md) - Define the event, worker message, worker command, API request/response, and workspace configuration schemas.
3. [S02-03-protocol-state-and-compatibility-tests.md](../../stories/done/S02-03-protocol-state-and-compatibility-tests.md) - Define persisted record, outcome, and compaction schemas plus the canonical-v1 compatibility tests.

_Stories 2 and 3 can be implemented in parallel after story 1 is complete._

## Epic Completion Criteria

- [x] `packages/protocol` exists and exports the canonical contract surface from `src/index.ts`.
- [x] All schemas listed in the protocol spec are implemented with versioned shapes.
- [x] Backward-compatibility tests cover the `canonical-v1` family.
- [x] Downstream specs and stories can import the package without duplicating schema definitions.
- [x] No open blocking issues remain.

## Risks

- Schema churn early in the project could force downstream epics to rewrite consumers if the package surface is not versioned carefully.
- Overlapping responsibility with future runtime or storage stories could cause duplicate schema ownership unless the package boundary stays strict.
- Compatibility tests may expose subtle drift once consumers begin to depend on the exported types.

## Notes

Source: `docs/specs/implementation-strategy.md` section "E02 - Protocol Package" and [01-protocol.md](../../../specs/01-protocol.md).
