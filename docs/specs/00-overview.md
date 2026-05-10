# 00 — Overview

**Status:** Draft v0.1
**Owner:** Architecture liaison
**Related architecture:** §1 Executive Summary, §2 System Architecture, §13 Design Rules
**Related epics:** E01

## Purpose

Orient contributors to the spec set, the conventions all specs share, and how specs relate to the architecture and the kanban workflow.

## Scope

- The spec catalogue and how to navigate it.
- Cross-cutting conventions (status, ownership, change log).
- The contract between specs and stories.
- Baseline monorepo layout conventions for the first foundation epic (`apps/`, `packages/`, `infra/`, `workspaces/`) and the initial app entrypoint location under `apps/digital-workers-tui/src/`.
- **pnpm workspaces structure:** Repository uses pnpm workspaces configured via `pnpm-workspace.yaml` to define package boundaries across `apps/*`, `packages/*`, `infra/`, and `workspaces/*` globs. Each workspace member has its own `package.json` with scoped package names (e.g., `@digital-workers/tui`).

## Design

- Architecture defines intent; specs define the buildable design; stories deliver it.
- Specs are versioned alongside code. Drift is a defect.
- Each spec maps to one or more architecture sections and to the epics that mature it (see [implementation-strategy.md §6](./implementation-strategy.md#6-spec-ownership-matrix)).

## Interfaces

- Index: [docs/specs/README.md](./README.md).
- Strategy: [implementation-strategy.md](./implementation-strategy.md).
- Current app surface: `apps/digital-workers-tui/src/index.ts`.

## Open questions

- None.

## Change log

- 2026-05-10: Documented pnpm workspaces structure and workspace package scoping (S01-02).
- 2026-05-10: Documented baseline monorepo layout and initial app path under `apps/digital-workers-tui/src/`.
- 2026-05-09: Initial stub.
