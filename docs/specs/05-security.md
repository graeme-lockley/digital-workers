# 05 — Security

**Status:** Draft v0.1
**Owner:** Security
**Related architecture:** §8.4 Workspace Boundaries, §14 Threat Model, Design Rules 7, 16
**Related epics:** E04 (origin), E11 (gateway integration)

## Purpose

Define the security primitives every other package depends on, and the controls that implement the threat model.

## Scope

- `workspace-boundary`: `realpath` resolution, symlink handling, case-folded filesystem handling, TOCTOU mitigation.
- `auth`: Cloudflare Access header validation primitives, allowlist matching.
- `secrets`: redaction patterns, env-name indirection, redaction applied at log/transcript/audit boundaries.
- Threat-to-control mapping for architecture §14.2.

## Design

- Boundary checks resolve `realpath` and re-check immediately before privileged operations (Threat T7).
- Symlink targets must resolve under the allowed root; otherwise the operation is rejected.
- Redaction runs before any write to transcript, audit, or log surfaces.
- Auth primitives are transport-agnostic; the gateway wires them to HTTP headers.

## Interfaces

- `assertWithinWorkspace(path, root)` in `packages/security/src/workspace-boundary.ts`.
- `validateCloudflareIdentity(headers, allowlist)` in `packages/security/src/auth.ts`.
- `redact(value)` in `packages/security/src/secrets.ts`.

## Open questions

- Tamper-evident audit log (architecture §14.3 — currently out of scope).
- Provenance-tagging protocol for ingested external content (Risk R3 — designed in E08, enforced here).

## Change log

- 2026-05-09: Initial stub.
