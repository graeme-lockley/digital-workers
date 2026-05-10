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
- Workflow runs `pnpm install` and canonical root checks from S01-03.
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

## Tasks

- [ ] Update `.github/workflows/validate.yml` so the validation job runs on both push and pull request events with pinned Node.js and pnpm versions.
- [ ] Replace or extend the current validator-only step with the repository install and root quality checks that CI must enforce.
- [ ] Verify the workflow step naming and trigger behavior match the release/testing expectations documented in the specs.

## Tests to add

- [ ] Run the workflow command set locally in the same order as CI to confirm `pnpm install`, `pnpm typecheck`, `pnpm lint`, and `pnpm test` are valid on the baseline.
- [ ] Confirm the repository validators still pass after the workflow change with `pnpm validate:kanban:all`.

## Documentation and specs to update

- [ ] [docs/specs/12-packaging-release.md](../../../specs/12-packaging-release.md) — document the CI workflow shape, pinned toolchain assumptions, and the validation commands the release pipeline depends on.
- [ ] [docs/specs/13-testing.md](../../../specs/13-testing.md) — record CI as the source of truth for green builds and align the test strategy with the workflow-backed validation path.

## Notes

The repo already has a `validate.yml` scaffold, so implementation should adjust that workflow rather than invent a separate validation path.