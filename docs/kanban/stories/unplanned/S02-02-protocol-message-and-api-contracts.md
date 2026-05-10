# Protocol Message and API Contracts

## Sequence: S02-02

## Tier: Foundation

## Former ID: (none)

## Epic

- Epic: [E02 Protocol Package](../../epics/unplanned/E02-protocol-package.md)

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

- [docs/specs/01-protocol.md](../../../specs/01-protocol.md) to capture the message, API, and workspace config contracts that live in `packages/protocol`.

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
