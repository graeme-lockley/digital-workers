# 08 — Worker Runtime

**Status:** Draft v0.1
**Owner:** Worker runtime
**Related architecture:** §6 Digital Workers Model, §6.4 Single-Execution-Loop Principle, §6.5 Immediate Command Channel, §9.6 Inner-Loop Outcome, §9.7 Compaction Schema, Design Rules 4, 10–12, 14–15
**Related epics:** E07 (origin), E08 (integrated)

## Purpose

Define the adapter that runs `pi-mono` (or another conforming runtime) as a worker process, and the outer/inner loop mechanics on top of it.

## Scope

- `WorkerRuntime` interface; `pi-mono` adapter as the first implementation.
- Subprocess lifecycle (start, ready, run, abort, stop) with RPC transport.
- Outer loop: inbox/command-queue wait, message selection, objective derivation, completion evaluation, persistence.
- Inner loop: tool execution, cancellation token, structured `InnerLoopOutcome`.
- Command channel: `/status`, `/abandon`, `/shutdown` with FIFO command queue and preemption semantics.
- Cancellation propagation through `pi-mono` to the underlying LLM/tool calls (Risk R4).
- Compaction host: per-worker plugin invocation with mandatory crude fallback (Design Rule 12) and `CompactionArtifactV1` validation.

## Design

- One worker per OS process (Design Rule 10). The runtime never imports an agent in-process.
- Outer loop is the only place that decides which inbox message is processed next; inbox is a queue of pending work, not strict FIFO.
- `/abandon` is learning-oriented: persist transcript, distil learnings, write experience entry, clear objective context.
- Compaction triggers and thresholds come from worker config (architecture §6.1).

## Interfaces

- `WorkerRuntime` in `packages/core-runtime/src/worker/runtime.ts`.
- `pi-mono` adapter in `packages/core-runtime/src/worker/adapters/pi-mono.ts`.

## Open questions

- Default plugin command discovery (PATH lookup vs. workspace-relative).
- Whether `/status` should ever queue or always answer instantly from the side-channel snapshot.

## Change log

- 2026-05-09: Initial stub.
