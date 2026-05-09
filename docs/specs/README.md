# docs/specs

This directory is the **buildable definition of the system**. The architecture (`docs/architecture.md`) defines intent; these specs define how each facet is built. Stories implement and update these specs.

## Index

| # | Spec | Scope |
|---|------|-------|
| — | [implementation-strategy.md](./implementation-strategy.md) | Epic sequence, release train, risk schedule, spec-maintenance discipline. |
| 00 | [00-overview.md](./00-overview.md) | Map of the spec set; conventions; how to add a new spec. |
| 01 | [01-protocol.md](./01-protocol.md) | Schemas: events, worker messages, commands, API types, config, compaction, outcomes. |
| 02 | [02-core-runtime.md](./02-core-runtime.md) | Session manager, worker manager, router, RuntimeConfigAPI, transports. |
| 03 | [03-config.md](./03-config.md) | Workspace config loader, validator, defaults. |
| 04 | [04-sandbox.md](./04-sandbox.md) | Sandbox provider contract, adapters, persistence policies, shell allowlist. |
| 05 | [05-security.md](./05-security.md) | Workspace boundary, auth, secrets, threat-model controls. |
| 06 | [06-storage.md](./06-storage.md) | Durable surfaces: transcripts, audit, message log, DLQ, sessions, outer-context, task graph. |
| 07 | [07-observability.md](./07-observability.md) | Logging, tracing, metrics, redaction integration. |
| 08 | [08-worker-runtime.md](./08-worker-runtime.md) | pi-mono RPC adapter, outer/inner loop, commands, cancellation, compaction host. |
| 09 | [09-tui.md](./09-tui.md) | TUI app design and IPC contract with the runtime. |
| 10 | [10-mobile-gateway.md](./10-mobile-gateway.md) | Cloudflare Access, SSE, audit, rate-limiting. |
| 11 | [11-agent-wiki.md](./11-agent-wiki.md) | Wiki service, CLI, web UI, worker tool integration. |
| 12 | [12-packaging-release.md](./12-packaging-release.md) | Build orchestration, CI, release pipeline, infra-as-code. |
| 13 | [13-testing.md](./13-testing.md) | Test strategy: unit, contract, integration, e2e, boundary, replay. |
| — | [adr/](./adr/) | Architecture Decision Records. |
| — | [runbooks/](./runbooks/) | Operational runbooks. |

## Source PRDs

- [agent-wiki-prd.md](../agent-wiki-prd.md)
- [pi-mono-iphone-gateway-prd.md](../pi-mono-iphone-gateway-prd.md)

## Spec authoring conventions

1. Every spec opens with: status, owner, related architecture sections, related epics.
2. Every spec has these sections at minimum: `## Purpose`, `## Scope`, `## Design`, `## Interfaces`, `## Open questions`, `## Change log`.
3. Specs reference architecture rules by section number rather than restating them.
4. Schemas live in `packages/protocol`; specs link to the source rather than duplicating types.
5. Every story that touches a facet updates the spec for that facet in the same change set (see [implementation-strategy.md §7](./implementation-strategy.md#7-spec-maintenance-discipline-required-of-every-story)).

## Adding a new spec

1. Create `NN-name.md` using the section list above.
2. Add a row to the index in this README.
3. Add a row to the **Spec Ownership Matrix** in [implementation-strategy.md §6](./implementation-strategy.md#6-spec-ownership-matrix).
4. Link the spec from any affected ADRs or runbooks.
