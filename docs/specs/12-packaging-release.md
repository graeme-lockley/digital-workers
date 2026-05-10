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
- Root scripts and TypeScript include roots that target app entrypoints under `apps/` (initially `apps/digital-workers-tui/src/index.ts`).
- **Workspace package boundaries:** pnpm-workspace.yaml declares workspace membership via globs: `apps/*`, `packages/*`, `infra`, and `workspaces/*`. Each workspace member must have a `package.json` with a scoped name (e.g., `@digital-workers/tui` for the TUI app).
- **Dependency resolution:** All workspace members resolve dependencies through the root lockfile (`pnpm-lock.yaml`); shared dependencies are hoisted to `.pnpm/` by default.
- **Workspace-aware scripts:** Root `package.json` uses pnpm filters (e.g., `pnpm --filter @digital-workers/tui`) to orchestrate per-package commands; utility scripts like `pnpm -w typecheck` run in workspace mode for cross-package runs.
- CI workflows under `.github/workflows/`; foundation starts with `validate.yml` for repository validation, and later stories can add release-oriented workflows.
- Conventional Commits enforcement (already implemented via `.githooks/commit-msg`).
- Versioning strategy (per-package semver; coordinated release for runtime + protocol).
- Docker images for runtime and gateway (`infra/docker/`).
- Cloudflare Tunnel and Access configuration (`infra/cloudflare/`).

## Design

- Single Node.js toolchain (Design Rule 17).
- CI is the source of truth for "green"; local checks must mirror CI.
- Release pipeline is dry-runnable from day one and only enabled per-package as that package stabilises.
- The foundation story provides `.github/workflows/release.yml` as a manual dry-run scaffold that mirrors repository validation, then ends with a non-publishing simulation step.
- Repository root keeps architecture-required top-level scaffolding directories (`apps/`, `packages/`, `infra/`, `workspaces/`) in version control from the first foundation story.
- Root TypeScript configuration is split into `tsconfig.base.json` for shared compiler defaults and a root `tsconfig.json` for workspace-wide include roots; each workspace package or app extends the base config with local `rootDir` and `outDir` settings.
- Root validation commands are canonical and must remain stable: `pnpm typecheck`, `pnpm lint`, `pnpm format`, and `pnpm test`.
- Turbo orchestrates cross-workspace `typecheck`, `lint`, and `test` runs from the repository root, while package-local scripts remain the execution units Turbo invokes.
- The root `package.json` must declare a `packageManager` field so workspace tooling resolves consistently in local development and CI.
- `.github/workflows/validate.yml` is the source-of-truth validation workflow for foundation work: it installs dependencies with `pnpm install --frozen-lockfile`, then runs the current green baseline checks `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm validate:kanban:all` on pushes to `main` and on pull requests.
- `pnpm format` remains part of the canonical root command surface, but it is not a CI gate in the foundation workflow until repository-wide formatting drift is cleaned up in a dedicated follow-on change.
- The validation workflow pins pnpm to the version declared in the root `packageManager` field and uses Node.js 22 so CI and local development select the same toolchain family.

## Interfaces

- `.github/workflows/validate.yml`, `pnpm-workspace.yaml`, `turbo.json`, `package.json` scripts.
- `tsconfig.base.json`, root `tsconfig.json`, and per-workspace `tsconfig.json` files.
- `eslint.config.js` and `.prettierrc.json` at repository root.
- `package.json` start/dev entrypoint path: `apps/digital-workers-tui/src/index.ts`.

## Open questions

- Whether to publish protocol/config/security as standalone npm packages or keep them workspace-internal initially.

## Change log

- 2026-05-10: Clarified that `validate.yml` enforces the current green baseline (`typecheck`, `lint`, `test`, kanban validators) while `pnpm format` remains a non-gating canonical root command until repository formatting drift is resolved (S01-04).
- 2026-05-10: Documented the manual dry-run release workflow scaffold and its no-publish simulation step for S01-05.
- 2026-05-10: Added the root TypeScript base strategy, canonical root validation commands, Turbo orchestration expectations, and the `packageManager` requirement (S01-03).
- 2026-05-10: Documented pnpm workspace package boundaries, dependency resolution strategy, and workspace-aware script patterns (S01-02).
- 2026-05-10: Added entrypoint path and top-level scaffold requirements for the S01-01 migration.
- 2026-05-09: Initial stub.
