# 06 — Storage

**Status:** Draft v0.1
**Owner:** Storage
**Related architecture:** §15 State Stores
**Related epics:** E05 (origin), E08 (consumer), E09 (audit integration)

## Purpose

Define the durable storage primitives for every state surface in the system. Every entry in architecture §15 has a writer, reader, growth bound, and rotation policy implemented here.

## Scope

- Append-only JSONL writer/reader with crash-safe append semantics.
- Path layout for `workspaces/<id>/...` and `state/...`.
- Transcript and audit-log abstractions per worker.
- Message log, dead-letter queue, sessions store.
- Per-worker outer-context snapshot file.
- Rotation and archival policies (size-based, time-based).
- Conflict detection on wiki content (delegated to wiki service in [11-agent-wiki.md](./11-agent-wiki.md)).

## Design

- All persisted records carry `schemaVersion` (per [01-protocol.md](./01-protocol.md)).
- Writers are crash-safe: append + fsync at sensible boundaries; no in-place updates to JSONL.
- Readers tolerate trailing partial lines (recovery after crash).
- Rotation produces immutable archive segments; current segment is always the active one.

## Interfaces

- `JsonlWriter`, `JsonlReader` in `packages/core-runtime/src/storage/filesystem.ts`.
- `TranscriptStore`, `AuditLogStore` in `packages/core-runtime/src/storage/`.

## Open questions

- Retention policy defaults (per architecture §15: `policy.maxTranscriptSizeMB`, `policy.auditLogRetentionDays`).
- Whether to expose a pluggable storage backend interface in the initial release.

## Change log

- 2026-05-09: Initial stub.
