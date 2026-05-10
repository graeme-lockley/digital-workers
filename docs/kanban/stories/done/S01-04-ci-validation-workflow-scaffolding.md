# CI Validation Workflow Scaffolding

## Sequence: S01-04

## Tier: Foundation

## Former ID: (none)

## Epic

- Epic: [E01 Monorepo Foundation](../../epics/unplanned/E01-monorepo-foundation.md)

## Summary

Add GitHub Actions workflow scaffolding that executes repository validation on pushes and pull requests using the same checks defined for local development.

## Current State

Local checks may be available after S01-03, but CI enforcement is incomplete and cannot yet be trusted as the source of truth for green builds.

## Relationship to other stories

- Depends on S01-03 for stable root validation commands.
- Can run in parallel with S01-05 once S01-03 is complete.

## Goals

- Define CI workflow(s) for pull requests and pushes that run install + quality checks.
- Ensure Node/pnpm versions are pinned or consistently selected in CI.
- Keep workflow naming and triggers aligned with repository release strategy.

## Acceptance Criteria

- `.github/workflows/` contains CI validation workflow definitions that trigger on PR and push events.
- Workflow runs `pnpm install` and the current green root validation baseline enabled by S01-03 (`pnpm typecheck`, `pnpm lint`, and `pnpm test`).
- CI configuration documents or encodes runtime version assumptions (Node and pnpm).
- A test PR or equivalent workflow run demonstrates successful execution on baseline.

## Spec References

- [docs/specs/12-packaging-release.md](../../../specs/12-packaging-release.md)
- [docs/specs/13-testing.md](../../../specs/13-testing.md)
- [docs/specs/implementation-strategy.md](../../../specs/implementation-strategy.md)

## Risks / Notes

- Version drift between local and CI can hide failures; lock versions early.
- Keep this story focused on validation scaffolding, not full release publication.

## Impact analysis

- The current `.github/workflows/validate.yml` file only runs repository validators, so the story expands it into a CI gate that also installs dependencies and runs the core quality commands.
- The change should make CI the authoritative execution path for the same checks developers use locally, without introducing release publishing or deployment work.
- `pnpm format` remains part of the root developer toolchain from S01-03, but it cannot become a CI gate in this story because the repository still has inherited formatting drift outside the scope of this workflow change.

## Tasks

- [x] Update `.github/workflows/validate.yml` so the validation job runs on both push and pull request events with pinned Node.js and pnpm versions.
- [x] Replace or extend the current validator-only step with the repository install and root quality checks that CI must enforce.
- [x] Verify the workflow step naming and trigger behavior match the release/testing expectations documented in the specs.

## Tests to add

- [x] Run the workflow command set locally in the same order as CI to confirm `pnpm install`, `pnpm typecheck`, `pnpm lint`, and `pnpm test` are valid on the baseline.
- [x] Confirm the repository validators still pass after the workflow change with `pnpm validate:kanban:all`.
- [x] Confirm `pnpm format` is still non-green because of pre-existing repository formatting drift, so the workflow baseline remains limited to the checks above.

## Documentation and specs to update

- [x] [docs/specs/12-packaging-release.md](../../../specs/12-packaging-release.md) — document the CI workflow shape, pinned toolchain assumptions, and the validation commands the release pipeline depends on.
- [x] [docs/specs/13-testing.md](../../../specs/13-testing.md) — record CI as the source of truth for green builds and align the test strategy with the workflow-backed validation path.

## Notes

The repo already has a `validate.yml` scaffold, so implementation should adjust that workflow rather than invent a separate validation path.

## Build notes

- 2026-05-10: Expanded `.github/workflows/validate.yml` from kanban-only validation into the foundation CI path, updated the packaging/release and testing specs to describe that contract, and prepared the story for local workflow-sequence validation.
- 2026-05-10: Ran `pnpm install --frozen-lockfile && pnpm typecheck && pnpm lint && pnpm test && pnpm validate:kanban:all` locally as the workflow-equivalent baseline; the only defect was a stale epic link to the story's previous phase, which was corrected in `E01-monorepo-foundation.md`.
- 2026-05-10: Verified that `pnpm format` still fails because of repository-wide pre-existing formatting drift outside this story, so S01-04 keeps CI aligned to the current green baseline instead of broadening scope into a formatting cleanup.
- 2026-05-10: Completion summary: acceptance criteria met, workflow and spec updates are in place, local CI-equivalent validation passed, and the story is ready for epic progression.

## Spec Updates

- [docs/specs/12-packaging-release.md](../../../specs/12-packaging-release.md) — defined `validate.yml` as the current green CI baseline and documented why `pnpm format` remains non-gating for now.
- [docs/specs/13-testing.md](../../../specs/13-testing.md) — documented the CI-required local reproduction sequence and clarified that formatting drift keeps `pnpm format` out of the foundation green baseline.
