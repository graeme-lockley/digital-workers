# 01 — Protocol

**Status:** Draft v0.1
**Owner:** Protocol
**Related architecture:** §4.2 Core Runtime API, §9 Communication and Routing, §15 State Stores
**Related epics:** E02 (origin), E08 (consumer)

## Purpose

Define the canonical, versioned schemas that every other package depends on. Schemas are the contract; specs link to source, they do not restate types.

This spec is the design source for `packages/protocol`, the workspace package that exports the shared contract surface used by runtime, storage, config, and client epics.

## Scope

- Event envelope (`Event`).
- Worker messages (`WorkerMessage`) and commands (`WorkerCommand`).
- API request/response types for `SessionAPI`, `WorkerManagerAPI`, `RouterAPI`, `RuntimeConfigAPI`.
- Workspace configuration schema (`WorkspaceConfigSchema`).
- Durable state and runtime-shared snapshots: `TranscriptEntry`, `AuditEntry`, `MemoryEntry`, `TaskRecord`, `OuterContext`, `Session`, `InnerLoopOutcome`, `CompactionArtifactV1`, `SessionConfig`, `WorkerStatusSnapshot`.

## Design

- All schemas live in `packages/protocol/src/` and are exported through `packages/protocol/src/index.ts`.
- Zod schemas are the source; TypeScript types are inferred.
- S02-02 implements the transport, API, and config contracts in three concrete modules:
  - `packages/protocol/src/transport.ts` (`EventSchema`, `WorkerMessageSchema`, `WorkerCommandSchema`),
  - `packages/protocol/src/api.ts` (`SessionAPI`, `WorkerManagerAPI`, `RouterAPI`, `RuntimeConfigAPI` request/response schemas),
  - `packages/protocol/src/workspace-config.ts` (`WorkspaceConfigSchema`, `WorkerConfigSchema`).
- The package groups schemas by concern rather than by consumer:
  - transport and messaging contracts (`Event`, `WorkerMessage`, `WorkerCommand`),
  - API contracts (`SessionAPI`, `WorkerManagerAPI`, `RouterAPI`, `RuntimeConfigAPI`),
  - workspace configuration (`WorkspaceConfigSchema`),
  - durable state and snapshots (`TranscriptEntry`, `AuditEntry`, `MemoryEntry`, `TaskRecord`, `OuterContext`, `Session`, `InnerLoopOutcome`, `CompactionArtifactV1`, `SessionConfig`, `WorkerStatusSnapshot`).
- Every persisted record carries a `schemaVersion` field (Risk R10).
- Backward compatibility is contract-tested; breaking changes increment the canonical version (`canonical-v1` → `canonical-v2`) and ship migrations.
- The package preserves a stable public export surface so later epics can import contracts without duplicating shapes.
- S02-03 adds `packages/protocol/src/state.ts` as the concrete home for the durable-state family and exports a `CanonicalV1StateSchemas` bundle so compatibility tests can detect renamed or missing contracts.

## Interfaces

- Source: `packages/protocol/src/`.
- Public entrypoint: `packages/protocol/src/index.ts`.
- Package name: `@digital-workers/protocol`.
- Canonical version primitive: `CANONICAL_PROTOCOL_VERSION` (currently `canonical-v1`) exported from the public entrypoint.
- Transport contracts: `EventSchema`, `WorkerMessageSchema`, and `WorkerCommandSchema` require `schemaVersion: canonical-v1`, strict object parsing, and non-empty correlation/session identifiers.
- API contracts: every request/response schema in `SessionAPI`, `WorkerManagerAPI`, `RouterAPI`, and `RuntimeConfigAPI` carries `schemaVersion: canonical-v1` and explicit `requestType` or `responseType` discriminators.
- Workspace config contract: `WorkspaceConfigSchema` requires `schemaVersion`, workspace identity/root, and at least one worker entry; worker entries are validated by `WorkerConfigSchema`.
- Contract test helpers: `packages/test-utils/src/contract-helpers.ts`.
- Downstream consumers: core runtime, storage, config, worker runtime, TUI, and wiki-related stories as they mature.
- Durable-state contracts: `TranscriptEntry`, `AuditEntry`, `MemoryEntry`, `TaskRecord`, `OuterContext`, `Session`, `InnerLoopOutcome`, `CompactionArtifactV1`, `SessionConfig`, and `WorkerStatusSnapshot` all require `schemaVersion: canonical-v1` and strict object parsing; compatibility tests enumerate the exported canonical-v1 state family.

## Open questions

- Token-budget field on worker config (anticipated in architecture §14.2 T8).
- Provenance-tagging schema for ingested external content (Risk R3 spike, finalised in E08).
- Whether future canonical versions should live beside v1 exports in the same package or be split into versioned submodules.

## Change log

- 2026-05-10: S02-03 added the durable state, outcome, compaction, session-config, and worker-status protocol schemas plus canonical-v1 compatibility coverage.
- 2026-05-10: S02-02 added concrete transport, API, and workspace config zod schemas plus canonical-v1 request/response discriminator requirements.
- 2026-05-10: S02-01 scaffolded `packages/protocol` with package metadata, a stable public barrel, and the initial canonical version export for downstream imports.
- 2026-05-10: Expanded the protocol spec to match the E02 package/stories plan and the canonical-v1 export boundary.
- 2026-05-09: Initial stub.
