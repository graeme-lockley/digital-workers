# 11 — Agent Wiki

**Status:** Draft v0.1
**Owner:** Wiki
**Related architecture:** §4.2 Wiki access semantics, §5.5 Agent Wiki CLI, §5.6 Agent Wiki Web UI, §15 State Stores
**Related epics:** E12 (origin)
**Source PRD:** [agent-wiki-prd.md](../agent-wiki-prd.md)

## Purpose

Define the shared organisational knowledge surface and the contracts by which workers, the CLI, and the web UI interact with it.

## Scope

- Wiki service contract (read, search, create, append, delete, link/backlink validation, index maintenance).
- `apps/agent-wiki-cli`: command surface and exit-code contract.
- `apps/agent-wiki-web`: Astro-based browser UI.
- Worker integration via skills/tools (architecture §4.2: wiki is not exposed on the runtime API surface).
- Index format and rebuild semantics.
- Permission gating for worker writes (per worker config; architecture §6.1).

## Design

- One wiki service consumed by CLI, web UI, and worker tools.
- Wiki content lives at `workspaces/<id>/wiki/` and is git-friendly markdown with frontmatter.
- Index is rebuildable from content; no information lives only in the index.
- Wiki revision/versioning behaviour is defined by the source PRD.

## Interfaces

- Wiki service exported from `apps/agent-wiki-cli/src/core/`.

## Open questions

- Whether the web UI should be co-located with the CLI app or a separate package.
- Conflict resolution policy for concurrent writes from multiple workers.

## Change log

- 2026-05-09: Initial stub.
