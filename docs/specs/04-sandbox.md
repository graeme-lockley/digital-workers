# 04 — Sandbox

**Status:** Draft v0.1
**Owner:** Sandbox
**Related architecture:** §4.3 Sandbox Architecture, §6.3 Worker Isolation, §8.3 Sandbox Persistence, Design Rules 13–16
**Related epics:** E06 (origin), E07 (consumer)

## Purpose

Define the pluggable sandbox contract that isolates each worker's filesystem and shell access.

## Scope

- `SandboxProvider` contract (creation, teardown, fs handle, shell handle, persistence policy).
- Adapters: `local-fs`, `virtual-fs` (test seam), `constrained-bash`, `remote-container` (placeholder).
- Persistence policies: `ephemeral`, `objective`, `worker`, `workspace`.
- Shell allowlist semantics: absolute path pinning, argv regex, metacharacter rejection, no system shell.
- Integration with [05-security.md](./05-security.md) workspace-boundary.

## Design

- One sandbox per worker, created at worker startup, lifetime equal to the worker.
- Sandbox configuration is passed to the worker as part of its pi-mono startup; the worker owns I/O within that boundary.
- Persistence policy determines what is cleared on objective end vs. worker end vs. workspace end.

## Interfaces

- `SandboxProvider` interface in `packages/sandbox-adapters/src/provider.ts`.
- Adapters in `packages/sandbox-adapters/src/{local-fs,virtual-fs,constrained-bash,remote-container}.ts`.

## Open questions

- Whether `remote-container` needs to land in E06 or can be deferred behind the contract.

## Change log

- 2026-05-09: Initial stub.
