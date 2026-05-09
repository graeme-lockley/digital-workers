# 03 — Config

**Status:** Draft v0.1
**Owner:** Config
**Related architecture:** §7 Configuration Model, §8 Workspace Management
**Related epics:** E03 (origin), E08 (consumer)

## Purpose

Define how workspace configuration is loaded, validated, and surfaced to the rest of the system.

## Scope

- YAML loading from `workspaces/<id>/config.yaml`.
- Schema validation against `WorkspaceConfigSchema` (see [01-protocol.md](./01-protocol.md)).
- Path resolution relative to workspace root.
- Defaults and merging policy.
- CLI surface for validating a config file (`pnpm config:validate <path>`).

## Design

- Loader returns a strongly-typed, fully-resolved `WorkspaceConfiguration`.
- Errors include path, location in YAML, and actionable remediation.
- No environment-variable interpolation beyond `apiEnvName` indirection (architecture Threat T6).
- Config is read once at startup; live reload is out of scope for the initial release.

## Interfaces

- `loadWorkspaceConfig(path: string): Promise<WorkspaceConfiguration>` in `packages/config/src/loader.ts`.
- `validateWorkspaceConfig(raw: unknown): WorkspaceConfiguration` in `packages/config/src/validator.ts`.

## Open questions

- Whether to support a workspace-level `extends:` mechanism for shared baselines.

## Change log

- 2026-05-09: Initial stub.
