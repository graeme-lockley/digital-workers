# Release Dry-Run Placeholder

## Sequence: S01-05

## Tier: Foundation

## Former ID: (none)

## Epic

- Epic: [E01 Monorepo Foundation](../../epics/doing/E01-monorepo-foundation.md)

## Summary

Create an initial release pipeline placeholder that can execute in dry-run mode, proving the repository is prepared for later package publication and deployment automation.

## Current State

Validation CI may exist after S01-04, but release automation is not yet represented as an executable workflow with safe dry-run behavior.

## Relationship to other stories

- Depends on S01-03 command conventions and benefits from CI groundwork in S01-04.
- Can run in parallel with S01-04 after S01-03 is complete.

## Goals

- Add a release-oriented workflow scaffold that runs in dry-run mode only.
- Encode release preconditions and no-op publication steps for future extension.
- Align release placeholders with packaging/release spec direction.

## Acceptance Criteria

- `.github/workflows/release.yml` (or equivalent release workflow) exists and is valid.
- Release workflow can be manually triggered and/or conditionally triggered without publishing artifacts.
- Dry-run output demonstrates expected pipeline stages (checkout, install, validation, release simulation).
- Release placeholder behavior is documented for future stories that implement real publishing.

## Spec References

- [docs/specs/12-packaging-release.md](../../../specs/12-packaging-release.md)
- [docs/specs/implementation-strategy.md](../../../specs/implementation-strategy.md)
- [docs/specs/00-overview.md](../../../specs/00-overview.md)

## Risks / Notes

- Placeholder workflows can decay if not exercised; keep at least one scheduled or manual verification path.
- Avoid accidental publish permissions in this epic; dry-run only.

## Impact analysis

- Delivery impact: introduces a non-publishing release workflow path so maintainers can validate release orchestration safely.
- Technical impact: adds CI workflow logic and documentation references, without changing runtime application behavior.
- Risk impact: must explicitly constrain permissions and execution steps to prevent accidental publication.

## Tasks

- [x] Create `.github/workflows/release.yml` with `workflow_dispatch` trigger and explicit dry-run-only behavior.
- [x] Add release stages for checkout, dependency install, repository validation, and release simulation.
- [x] Configure minimal permissions and guards to ensure no package publish or deployment side effects occur.
- [x] Document dry-run workflow intent and extension points in repository docs aligned to release specs.
- [x] Verify workflow syntax and execution path using repository validation commands.

## Tests to add

- [x] Add a workflow-focused validation check that confirms release workflow YAML is valid and triggerable.
- [x] Add or update a script/check assertion that release flow remains dry-run only (no publish command execution).

## Documentation and specs to update

- [x] `docs/specs/12-packaging-release.md` - define the dry-run release workflow stages and safety constraints.
- [x] `docs/specs/13-testing.md` - capture how release workflow validation is executed and checked.
- [x] `docs/specs/implementation-strategy.md` - record sequencing and follow-on stories for full publishing enablement.

## Notes

- Keep this story strictly dry-run scoped; real publishing credentials and release writes are deferred to later stories.

## Build notes

- 2026-05-10: Started the dry-run release scaffold. Added the release workflow placeholder, local workflow validator, and updated the story to the doing lane.
- 2026-05-10: Completed the dry-run release scaffold, validated the workflow and kanban state, and prepared the story for finish-story.

## Spec Updates

- `docs/specs/12-packaging-release.md` - documented the manual dry-run release workflow and its non-publishing simulation stage.
- `docs/specs/13-testing.md` - documented the local release-workflow validator and the required dry-run-only checks.
- `docs/specs/implementation-strategy.md` - noted that E01 now includes the release workflow placeholder as part of the foundation exit criteria.
