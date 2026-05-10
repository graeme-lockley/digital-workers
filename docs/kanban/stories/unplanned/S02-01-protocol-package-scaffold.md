# Protocol Package Scaffold

## Sequence: S02-01

## Tier: Foundation

## Former ID: (none)

## Epic

- Epic: [E02 Protocol Package](../../epics/unplanned/E02-protocol-package.md)

## Summary

Create the `packages/protocol` workspace package and its public entrypoint so later stories can add schemas without inventing package structure or versioning conventions.

## Current State

There is no dedicated protocol package yet, and no shared export surface for the schema families described in the protocol spec.

## Relationship to other stories

This is the dependency story for the rest of E02. Stories S02-02 and S02-03 should not start until the package boundary, tooling, and shared versioning conventions exist.

## Goals

- Add the new workspace package with the expected Node.js / pnpm metadata.
- Establish the source layout and public barrel for protocol exports.
- Introduce a shared versioning convention or helper that later schema stories can reuse.
- Add the minimum tests needed to prove the package is discoverable and importable.

## Documentation and specs to update

- [docs/specs/01-protocol.md](../../../specs/01-protocol.md) to keep the package boundary, export surface, and schema grouping aligned with the scaffolded protocol package.

## Acceptance Criteria

- `packages/protocol` exists as a workspace package and is included by the root workspace configuration.
- `packages/protocol/src/index.ts` exports the package’s public surface.
- The package can be built and imported by name from within the workspace.
- The package includes the shared versioning convention needed by the later schema stories.
- Package-level tests pass for the scaffolded surface.

## Spec References

- [docs/specs/01-protocol.md](../../../specs/01-protocol.md)
- [docs/specs/implementation-strategy.md](../../../specs/implementation-strategy.md)

## Risks / Notes

- Keep the scaffold minimal so the later schema stories do not need to undo placeholder exports or package metadata.
- The package name and public entrypoint should remain stable because every downstream contract will import from this surface.
