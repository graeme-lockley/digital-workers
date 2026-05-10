# Implementation Strategy

**Document status:** Draft v0.1
**Date:** 2026-05-09
**Owner:** Architecture
**Companion to:** [docs/architecture.md](../architecture.md)

## Purpose

The architecture document defines *what* digital-workers is. This document defines *how* and *in what order* it will be built. Architecture is the destination; this document is the route. Changing the route does not change the destination.

This document covers the full implementation: epic sequence, release train, exit criteria per epic, the spec set required to build the solution, the testing and risk strategy, and the spec-maintenance discipline that every story must follow.

---

## 1. Guiding Principles

1. **Each epic produces a releasable, runnable outcome.** No epic ends with code that cannot be exercised end-to-end on at least one supported surface.
2. **Foundations before features.** Protocol schemas, config, security primitives, and storage must exist before runtime, runtime before UI, UI before remote access.
3. **The runtime is the product.** The TUI and gateway are clients; they cannot lead the design.
4. **Specs lead code, code updates specs.** A spec exists before the first story implementing it; every story keeps its specs current as the last gate before `done`.
5. **Risks resolved early are not risks.** Spikes called out in `architecture.md` §16 (R3 prompt-injection, R4 cancellation, R5 sandbox boundary on macOS) are scheduled into the earliest epic that touches them.
6. **Single Node.js toolchain.** No Deno. No alternative runtimes. (Architecture Design Rule 17.)

---

## 2. Epic Sequence (Twelve Releasable Outcomes)

Each epic below is a delivery unit. Every epic lists: scope, primary specs touched, exit criteria (what makes it releasable), and downstream dependencies it unlocks.

### E01 — Monorepo Foundation

- **Scope:** pnpm workspaces, Turbo orchestration, root TypeScript baseline (`tsconfig.base.json` plus root/package configs), ESLint, Prettier, conventional-commit hook (already present), CI workflow scaffolding under `.github/workflows/`, and migration of the current codebase into the architecture-defined monorepo layout (`apps/`, `packages/`, `infra/`, `workspaces/`) with starter code moved from `src/index.ts` to `apps/digital-workers-tui/src/index.ts`. Workspace boundaries declared via `pnpm-workspace.yaml` with globs for `apps/*`, `packages/*`, `infra`, and `workspaces/*`.
- **Specs:** [00-overview.md](./00-overview.md), [12-packaging-release.md](./12-packaging-release.md).
- **Exit criteria:** Architecture-aligned folder structure exists in-repo with current starter code migrated to `apps/digital-workers-tui/src/index.ts`, pnpm workspaces configured via `pnpm-workspace.yaml` with all packages discoverable, canonical root validation commands (`pnpm typecheck`, `pnpm lint`, `pnpm test`) are backed by Turbo-orchestrated workspace scripts, `pnpm install && pnpm typecheck && pnpm lint && pnpm test` succeed on the migrated baseline, CI runs on PR, and release pipeline placeholder runs in dry-run.
- **Releasable outcome:** Reproducible build/test environment on an architecture-conformant repository layout with workspace-aware dependency management.

### E02 — Protocol Package

- **Scope:** `packages/protocol` with zod schemas for `Event`, `WorkerMessage`, `WorkerCommand`, REST API request/response types, `WorkspaceConfigSchema`, `CompactionArtifactV1`, `InnerLoopOutcome`, `OuterContext`, `SessionConfig`, `WorkerStatusSnapshot`, `TranscriptEntry`, `AuditEntry`, `MemoryEntry`, `TaskRecord`. All schemas versioned.
- **Specs:** [01-protocol.md](./01-protocol.md).
- **Exit criteria:** Schemas exported, contract tests assert backward compatibility for the `canonical-v1` family; published from `packages/protocol/src/index.ts`.
- **Releasable outcome:** A consumable contract package the rest of the system depends on.

### E03 — Config Package

- **Scope:** `packages/config` loader, validator, defaults, types. YAML loading, path resolution relative to workspace, structural validation against `WorkspaceConfigSchema`, helpful error messages.
- **Specs:** [03-config.md](./03-config.md).
- **Exit criteria:** A canned `workspaces/default/config.yaml` loads cleanly; invalid configs fail with locatable errors; CLI `pnpm config:validate <path>` returns non-zero on bad input.
- **Releasable outcome:** Workspace configuration is real and validated.

### E04 — Security Package

- **Scope:** `packages/security` with `workspace-boundary` (`realpath` resolution, symlink and case-folding handling, TOCTOU guard), `auth` (Cloudflare Access header validation primitives), `secrets` (redaction, env-name indirection helpers).
- **Specs:** [05-security.md](./05-security.md).
- **Exit criteria:** Targeted boundary test suite (Risk R5) passes on macOS and Linux; redaction round-trip tests pass; no boundary control depends on a not-yet-existing component.
- **Releasable outcome:** Reusable security primitives with proven behaviour.

### E05 — Storage Package

- **Scope:** `packages/core-runtime/src/storage` (split out as needed): filesystem helpers, append-only JSONL writers/readers, rotation policy, transcript and audit-log abstractions, message log, DLQ, sessions store, per-worker outer-context snapshot.
- **Specs:** [06-storage.md](./06-storage.md).
- **Exit criteria:** All durable surfaces from architecture §15 have a writer, reader, rotation policy, and tests; corruption-resistant append semantics verified.
- **Releasable outcome:** Durable state primitives that future epics can write to.

### E06 — Sandbox Package

- **Scope:** `packages/sandbox-adapters` provider contract, `local-fs` adapter, `constrained-bash` adapter, `virtual-fs` adapter (test seam), persistence policy (`ephemeral`, `objective`, `worker`, `workspace`).
- **Specs:** [04-sandbox.md](./04-sandbox.md).
- **Exit criteria:** Provider contract tests run against every adapter; shell allowlist tests cover absolute paths, argv regex, metacharacter rejection; persistence policies verified; integrated with `workspace-boundary`.
- **Releasable outcome:** A worker can be given a fully-isolated sandbox in tests, even before the runtime exists.

### E07 — Worker Runtime Adapter

- **Scope:** Adapter that launches `pi-mono` in RPC mode as a subprocess, wires outer/inner loop, command channel (`/status`, `/abandon`, `/shutdown`), cancellation propagation (Risk R4), inner-loop outcome reporting, compaction plugin host with mandatory crude fallback (Design Rule 12).
- **Specs:** [08-worker-runtime.md](./08-worker-runtime.md).
- **Exit criteria:** A standalone harness can launch a worker against a fixture sandbox/config, send a request, observe an `InnerLoopOutcome`, abort mid-run, and shut down cleanly. Cancellation latency measured and documented.
- **Releasable outcome:** An executable worker, headless, callable from a test harness.

### E08 — Core Runtime

- **Scope:** `packages/core-runtime` Session Manager, Worker Manager, Router/MessageBus, RuntimeConfigAPI, SessionAPI, WorkerManagerAPI, RouterAPI implementations. Local IPC transport. Wires E02–E07 together. Implements provenance-tagging hooks for ingested external content (Risk R3 spike).
- **Specs:** [02-core-runtime.md](./02-core-runtime.md), [01-protocol.md](./01-protocol.md).
- **Exit criteria:** Headless runtime starts from a workspace config, launches the configured workers, accepts session create + sendMessage, streams events with correlation IDs, persists to all stores, handles `/abandon` end-to-end. Runs as `pnpm dev:runtime`.
- **Releasable outcome:** A daemon that workers run inside of and any client can talk to.

### E09 — Observability Package

- **Scope:** `packages/observability` structured logging (JSON), metrics counters/histograms with pluggable sink, tracing spans around session/run/tool boundaries, audit-log integration.
- **Specs:** [07-observability.md](./07-observability.md).
- **Exit criteria:** Runtime emits a structured log per request, per worker lifecycle event, and per tool call; `/status` snapshot is sourced from the same metric store; redaction (E04) is applied to all log writes.
- **Releasable outcome:** The runtime is operable: incidents can be diagnosed from logs + audit alone.

### E10 — TUI Application

- **Scope:** `apps/digital-workers-tui` migrated from current starter (`src/index.ts`); calls SessionAPI and WorkerManagerAPI over local IPC; renders streamed events; supports session create/resume/fork/terminate; surfaces commands.
- **Specs:** [09-tui.md](./09-tui.md).
- **Exit criteria:** End-to-end demo: start runtime, launch TUI, send message to a configured worker, observe streamed reply, abandon, reissue, exit cleanly.
- **Releasable outcome:** First end-user surface; the system is usable locally.

### E11 — Mobile Gateway

- **Scope:** `apps/pi-mobile-gateway` Cloudflare Access integration (E04 primitives), SSE streaming filtered by correlation ID, audit log, per-identity rate limiting (Threat T10), allowlist enforcement. Includes Cloudflare Tunnel and Access infra-as-code under `infra/cloudflare/`.
- **Specs:** [10-mobile-gateway.md](./10-mobile-gateway.md), [05-security.md](./05-security.md).
- **Exit criteria:** Authenticated remote client can create a session, send a message, receive streamed events, all gated by a verified `X-Forwarded-Email`. Audit and DLQ paths exercised.
- **Releasable outcome:** Remote access works safely; iPhone client (any HTTP/SSE client) can drive workers.

### E12 — Agent Wiki

- **Scope:** `apps/agent-wiki-cli` (read, search, create, append, delete, link/backlink validation, index maintenance), `apps/agent-wiki-web` (Astro UI calling the same wiki service), shared wiki core service. Wiki capability is exposed to workers via skills/tools, not as a runtime API surface (architecture §4.2).
- **Specs:** [11-agent-wiki.md](./11-agent-wiki.md), [docs/agent-wiki-prd.md](../agent-wiki-prd.md).
- **Exit criteria:** A worker can read and (per permissions) append wiki content; CLI and web UI operate on the same store; index rebuild is deterministic.
- **Releasable outcome:** Shared organisational memory works.

---

## 3. Release Train

| Train | Epics | Theme | Externally Visible Result |
|-------|-------|-------|---------------------------|
| A — Foundations | E01, E02, E03 | Build, contracts, configuration | Repo is buildable; contracts and config are real. |
| B — Isolation primitives | E04, E05, E06 | Security, storage, sandbox | All non-runtime primitives proven in isolation. |
| C — Executable runtime | E07, E08 | Workers and the runtime they live in | Headless runtime + worker can serve a programmatic client. |
| D — First user surface | E09, E10 | Operability and TUI | A human can use the system locally. |
| E — Remote and knowledge | E11, E12 | Mobile gateway and wiki | Remote use and shared knowledge are live. |

Trains are sequential. Within a train, epics may overlap if their specs are stable.

---

## 4. Cross-Cutting Risk Schedule

| Risk (architecture §16) | First epic that must address it | How |
|-------------------------|----------------------------------|-----|
| R1 `pi-mono` RPC drift | E07 | Pin version; abstract behind `WorkerRuntime` interface; one alternative adapter scaffolded. |
| R2 Compaction plugin quality | E07 | Mandatory crude fallback implemented and tested before plugin path. |
| R3 Prompt injection | E08 (spike), E12 (enforced for wiki ingest) | Provenance-tagging protocol designed in E08; enforced in worker tool dispatch. |
| R4 Cancellation propagation | E07 | Measured `AbortController` propagation through pi-mono; latency documented. |
| R5 macOS sandbox boundary holes | E04 | Boundary test suite is the exit gate of E04. |
| R6 Astro fit for wiki UI | E12 | Decision is reversible; wiki service boundary is the contract. |
| R7 Cloudflare misconfig | E11 | Infra-as-code + independent gateway header validation. |
| R8 Per-process worker overhead | E07 | Measured at exit gate; in-process adapter remains an option. |
| R9 JSONL scale | E05 | Rotation/archival is part of E05 exit criteria. |
| R10 Schema drift | E02 | `schemaVersion` in every persisted record from day one. |

---

## 5. Testing Strategy

1. **Contract tests** live in `packages/protocol` and `packages/test-utils`; every consumer of a schema imports the contract test helpers.
2. **Unit tests** sit beside their code; required for every non-trivial module before its story is marked `done`.
3. **Integration tests** under `packages/test-utils` exercise multi-package flows (e.g. config → runtime → worker → router → storage).
4. **End-to-end tests** under each app validate user-visible flows (TUI session, gateway SSE round-trip, wiki CLI lifecycle).
5. **Boundary tests** (security) run on every push and as a release gate.
6. **Replay tests** consume historical message-log fixtures to detect schema drift (R10).

A story is not `done` until: tests for changed behaviour exist (or the story records an explicit rationale for none), and `pnpm test` is green for affected packages.

---

## 6. Spec Ownership Matrix

The architecture is the source of truth for *intent*. Specs are the source of truth for *the buildable design of each facet*. Stories implement specs; every story keeps its specs current.

| Spec | Owner area | Primary epics that mature it |
|------|-----------|------------------------------|
| [00-overview.md](./00-overview.md) | Architecture liaison | E01 |
| [01-protocol.md](./01-protocol.md) | Protocol | E02, E08 |
| [02-core-runtime.md](./02-core-runtime.md) | Runtime | E08 |
| [03-config.md](./03-config.md) | Config | E03 |
| [04-sandbox.md](./04-sandbox.md) | Sandbox | E06 |
| [05-security.md](./05-security.md) | Security | E04, E11 |
| [06-storage.md](./06-storage.md) | Storage | E05, E08 |
| [07-observability.md](./07-observability.md) | Observability | E09 |
| [08-worker-runtime.md](./08-worker-runtime.md) | Worker runtime | E07 |
| [09-tui.md](./09-tui.md) | TUI app | E10 |
| [10-mobile-gateway.md](./10-mobile-gateway.md) | Gateway | E11 |
| [11-agent-wiki.md](./11-agent-wiki.md) | Wiki | E12 |
| [12-packaging-release.md](./12-packaging-release.md) | Release engineering | E01, E11 |
| [13-testing.md](./13-testing.md) | QA / engineering | All |
| [adr/README.md](./adr/README.md) | Architecture | All |
| [runbooks/README.md](./runbooks/README.md) | Operations | E08, E10, E11 |

The spec index lives at [docs/specs/README.md](./README.md).

---

## 7. Spec-Maintenance Discipline (Required of Every Story)

Specs are not a parallel artefact; they are the design of the system. To prevent drift:

1. **`plan-story` must enumerate** the specs the story will change in `## Documentation and specs to update`. If no spec is impacted, the story must justify why.
2. **`build-story` must update** those specs in the same change set as the code, before requesting verification.
3. **`verify-story` must check** that every spec listed under `## Documentation and specs to update` was actually modified (or that the section explicitly records "no spec impact" with rationale).
4. **`finish-story` must include** a `## Spec Updates` section in the story summarising the spec changes (paths + one-line description per spec).
5. **`finish-epic` must confirm** that the spec index ([docs/specs/README.md](./README.md)) and the spec ownership matrix in this document remain accurate.
6. **Validators enforce** these gates: `scripts/check-story.sh` requires `## Documentation and specs to update` for `planned`+ and `## Spec Updates` for `done`; `scripts/check-epic.sh` requires the spec set to remain present.

If a story discovers that a spec is wrong, the story fixes the spec. If a story discovers that a new spec is required, the story creates it and links it from `docs/specs/README.md` in the same change set.

---

## 8. Out of Scope (Deferred)

- Multi-tenant deployment.
- Cross-machine distributed worker manager.
- Tamper-evident audit log (current model is append-only files).
- Native iPhone client (the gateway is the contract; the client is a follow-on).
- Persistent SQL storage backend (JSONL is sufficient for the trains above).

These items remain in `architecture.md` §17 as future extensibility and are intentionally not sequenced here.

---

## 9. Change Control

- Changes to the **epic sequence** require updating §2 and §3 of this document.
- Changes to the **spec set** require updating §6 here and `docs/specs/README.md`.
- Changes to **architecture** (intent, not delivery) belong in `docs/architecture.md` and may invalidate parts of this strategy; in that case both documents are updated in the same change.

## Change log

- 2026-05-10: Added the E01 root toolchain baseline requirement for shared TypeScript config, ESLint, Prettier, and Turbo-backed canonical validation commands (S01-03).
- 2026-05-10: Clarified E01 migration path from `src/index.ts` to `apps/digital-workers-tui/src/index.ts` and made the path explicit in E01 exit criteria.
