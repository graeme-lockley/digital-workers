# 01 — Protocol

**Status:** Draft v0.1
**Owner:** Protocol
**Related architecture:** §4.2 Core Runtime API, §9 Communication and Routing, §15 State Stores
**Related epics:** E02 (origin), E08 (consumer)

## Purpose

Define the canonical, versioned schemas that every other package depends on. Schemas are the contract; specs link to source, they do not restate types.

## Scope

- Event envelope (`Event`).
- Worker messages (`WorkerMessage`) and commands (`WorkerCommand`).
- API request/response types for `SessionAPI`, `WorkerManagerAPI`, `RouterAPI`, `RuntimeConfigAPI`.
- Workspace configuration schema (`WorkspaceConfigSchema`).
- Persisted records: `TranscriptEntry`, `AuditEntry`, `MemoryEntry`, `TaskRecord`, `OuterContext`, `Session`.
- Outcome and compaction artefacts: `InnerLoopOutcome`, `CompactionArtifactV1`.

## Design

- All schemas live in `packages/protocol/src/`.
- Every persisted record carries a `schemaVersion` field (Risk R10).
- Backward compatibility is contract-tested; breaking changes increment the canonical version (`canonical-v1` → `canonical-v2`) and ship migrations.
- Zod schemas are the source; TypeScript types are inferred.

## Interfaces

- Source: `packages/protocol/src/`.
- Contract test helpers: `packages/test-utils/src/contract-helpers.ts`.

## Open questions

- Token-budget field on worker config (anticipated in architecture §14.2 T8).
- Provenance-tagging schema for ingested external content (Risk R3 spike, finalised in E08).

## Change log

- 2026-05-09: Initial stub.
