# Protocol Package Scaffold

## Sequence: S02-01

## Tier: Foundation

## Former ID: (none)

## Epic

- Epic: [E02 Protocol Package](../../epics/doing/E02-protocol-package.md)

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

## Impact analysis

Creating `packages/protocol` unblocks all E02 contract work and establishes a stable import surface for downstream runtime, config, and storage stories. The main delivery risk is introducing placeholder exports or metadata that later stories need to break, so this plan keeps the scaffold strict and minimal.

## Tasks

- [x] Create `packages/protocol` with package metadata (`package.json`, `tsconfig.json`) aligned to workspace conventions.
- [x] Add `src/index.ts` as the only initial public barrel and wire package exports/types fields.
- [x] Add shared protocol versioning primitive(s) for the canonical contract family used by later stories.
- [x] Register the package in workspace and root TypeScript project references as required.
- [x] Add initial package tests proving importability and baseline versioning surface.

## Tests to add

- Add a protocol package smoke test that imports from the package name and verifies the public barrel resolves.
- Add a unit test for the shared versioning primitive(s) to confirm expected canonical version identifier behaviour.
- Add a workspace integration check (typecheck or test fixture) that consumes the new package from another workspace package/app.

## Documentation and specs to update

- [x] `docs/specs/01-protocol.md` — document the new `packages/protocol` package boundary, public entrypoint, and initial versioning convention.
- [x] `docs/specs/13-testing.md` — record the package-level smoke/contract test expectations for protocol scaffold validation.

## Build notes

- 2026-05-10: Moved story to doing, scaffolded `packages/protocol` with workspace metadata, added canonical version export and package tests, and wired a TUI workspace smoke import of `@digital-workers/protocol`.
- 2026-05-10: Completion summary: acceptance criteria met, package build/test evidence captured, and spec updates for `01-protocol` and `13-testing` landed.

## Spec Updates

- `docs/specs/01-protocol.md` — documented the concrete scaffold artifacts (`@digital-workers/protocol`, public barrel, and canonical version constant) produced by S02-01.
- `docs/specs/13-testing.md` — documented S02-01 protocol scaffold testing requirements (package barrel smoke test, canonical version unit test, and cross-workspace import validation).

## Notes

Scope must stay scaffold-only: no schema family implementation belongs in this story.
