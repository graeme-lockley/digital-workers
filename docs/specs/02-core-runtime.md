# 02 — Core Runtime

**Status:** Draft v0.1
**Owner:** Runtime
**Related architecture:** §4 Core Runtime Layer, §9 Communication and Routing, §10 Execution Model
**Related epics:** E08 (origin), E07 (worker integration), E10/E11 (clients)

## Purpose

Define the headless runtime that owns sessions, workers, routing, and the API surface every interface consumes.

## Scope

- `SessionManager` and session lifecycle (create, resume, fork, terminate, status).
- `WorkerManager` and worker lifecycle (start, stop, restart, status, transcript).
- `Router` / `MessageBus` (durable-before-deliver, correlation IDs, allowlist enforcement, inbox depth limits).
- `RuntimeConfigAPI` for workspace discovery.
- Local IPC transport between runtime and clients (TUI, gateway).
- Provenance-tagging hooks for content ingested from external sources (Risk R3).

## Design

- Runtime is a single Node.js process. Workers run as separate OS processes (Design Rule 10).
- The router is plumbing only — no orchestration, ranking, or scheduling (architecture §9.4).
- All durable state goes through [06-storage.md](./06-storage.md).
- API definitions are imported from [01-protocol.md](./01-protocol.md).

## Interfaces

- API surface defined in `packages/protocol/src/api-types.ts`.
- Implementation in `packages/core-runtime/src/{session,worker,router,api}/`.

## Open questions

- gRPC vs. plain JSON over Unix domain socket as the default transport.
- Whether `subscribeToEvents` should expose backpressure to clients explicitly.

## Change log

- 2026-05-09: Initial stub.
