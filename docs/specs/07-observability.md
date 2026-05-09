# 07 — Observability

**Status:** Draft v0.1
**Owner:** Observability
**Related architecture:** §4.6 API Surface, §10 Execution Model
**Related epics:** E09 (origin)

## Purpose

Make the runtime operable: every incident must be diagnosable from logs, metrics, traces, and the audit log alone.

## Scope

- Structured JSON logging with consistent field names (`workerId`, `sessionId`, `correlationId`, `runId`).
- Metrics: counters and histograms for session events, worker events, tool calls, router throughput, inbox depth.
- Tracing: spans around session/run/tool boundaries, with correlation-id propagation.
- Integration with [05-security.md](./05-security.md) redaction at the log boundary.
- `/status` snapshot is sourced from the same metric store.

## Design

- Sinks are pluggable; default sink is stdout JSON.
- No PII or secret may be logged unredacted; redaction is enforced by the logger.
- Tracing uses OpenTelemetry conventions where they exist; otherwise a minimal internal span format.

## Interfaces

- `logger`, `metrics`, `tracer` in `packages/observability/src/`.

## Open questions

- Whether to bundle an OTLP exporter in the initial release.

## Change log

- 2026-05-09: Initial stub.
