# 10 — Mobile Gateway

**Status:** Draft v0.1
**Owner:** Gateway
**Related architecture:** §5.2 Mobile Gateway, §10.3 Mobile Client (Remote), §14 Threat Model
**Related epics:** E11 (origin)
**Source PRD:** [pi-mono-iphone-gateway-prd.md](../pi-mono-iphone-gateway-prd.md)

## Purpose

Define the secure remote ingress gateway. The gateway is the only path by which non-local clients (iPhone app, web UI) talk to the runtime.

## Scope

- Cloudflare Access integration: `X-Forwarded-Email` validation, allowlist matching, rejection of unauthenticated requests (Threat T1).
- Session and chat HTTP APIs that proxy to `SessionAPI`.
- Server-Sent Events stream filtered by `correlationId`.
- Audit log of every request and decision (Threat T1, T6).
- Per-identity rate limiting (Threat T10).
- Cloudflare Tunnel and Access infra-as-code under `infra/cloudflare/`.

## Design

- Gateway never touches storage directly; everything flows through runtime APIs.
- Auth is enforced both at Cloudflare Access *and* independently at the gateway (defence in depth).
- The gateway forwards `correlationId` to the client so the client can demultiplex.

## Interfaces

- HTTP routes in `apps/pi-mobile-gateway/src/api/routes.ts`.
- Runtime client in `apps/pi-mobile-gateway/src/runtime-client.ts`.

## Open questions

- Session affinity strategy across gateway restarts.
- Whether to expose a websocket alternative to SSE for clients on flaky networks.

## Change log

- 2026-05-09: Initial stub.
