# 12 — Packaging and Release

**Status:** Draft v0.1
**Owner:** Release engineering
**Related architecture:** §3 Monorepo Structure, §11 Development Workflow
**Related epics:** E01 (origin), E11 (infra)

## Purpose

Define how the monorepo is built, tested, versioned, and released, and how infrastructure is provisioned.

## Scope

- pnpm workspaces and Turbo task graph.
- Root `tsconfig`, ESLint, Prettier configuration.
- CI workflows under `.github/workflow/`: `ci.yml`, `test.yml`, `release.yml`.
- Conventional Commits enforcement (already implemented via `.githooks/commit-msg`).
- Versioning strategy (per-package semver; coordinated release for runtime + protocol).
- Docker images for runtime and gateway (`infra/docker/`).
- Cloudflare Tunnel and Access configuration (`infra/cloudflare/`).

## Design

- Single Node.js toolchain (Design Rule 17).
- CI is the source of truth for "green"; local checks must mirror CI.
- Release pipeline is dry-runnable from day one and only enabled per-package as that package stabilises.

## Interfaces

- `pnpm-workspace.yaml`, `turbo.json`, `package.json` scripts.

## Open questions

- Whether to publish protocol/config/security as standalone npm packages or keep them workspace-internal initially.

## Change log

- 2026-05-09: Initial stub.
