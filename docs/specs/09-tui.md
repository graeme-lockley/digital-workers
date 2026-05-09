# 09 — TUI

**Status:** Draft v0.1
**Owner:** TUI app
**Related architecture:** §5.1 TUI, §10.2 TUI User Sends a Message
**Related epics:** E10 (origin)

## Purpose

Define the terminal user interface and its IPC contract with the core runtime.

## Scope

- `apps/simple-agent-tui` migrated from the current starter `src/index.ts`.
- Session lifecycle UI (create, resume, fork, terminate, status).
- Streamed event rendering filtered by `correlationId`.
- Worker roster and `/status` panel.
- Command surface (`/abandon`, `/shutdown`, etc.).

## Design

- The TUI never owns state; it sends intents and renders events (Design Rule 2).
- IPC transport is the local socket established by [02-core-runtime.md](./02-core-runtime.md).
- Multiple concurrent exchanges are demultiplexed by `correlationId`.

## Interfaces

- Calls `SessionAPI`, `WorkerManagerAPI`, `RuntimeConfigAPI`.

## Open questions

- Choice of TUI framework (ink vs. blessed vs. custom).

## Change log

- 2026-05-09: Initial stub.
