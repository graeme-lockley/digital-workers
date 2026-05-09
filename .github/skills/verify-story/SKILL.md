---
name: verify-story
version: 1.0.0
description: Perform a read-only verification of a story against acceptance criteria and completion gates.
outputs:
  - Verification verdict (pass or issues).
  - List of concrete gaps when verification fails.
allowed-tools:
  - read
  - grep
  - bash
forbids:
  - write
  - edit
  - git push
---

# Simple-Agent kanban - verify a story

Canonical rules: [docs/kanban/README.md](docs/kanban/README.md)

## Inputs

- Story id (`S##-##`) or filename (normally from `docs/kanban/stories/doing/`).

## Procedure

1. Read story and locate acceptance criteria, tasks, tests, and docs/spec updates.
2. Validate referenced implementation changes exist.
3. Validate test evidence exists (or explicit rationale for no tests).
4. Validate spec maintenance:
   - Cross-check `## Documentation and specs to update` against `## Spec Updates`. Every spec promised in planning must appear in `## Spec Updates` (or both must agree on `_No spec impact_`).
   - Confirm each listed `docs/specs/*` file actually changed in this story's change set.
   - Confirm any newly created spec is linked from [docs/specs/README.md](../../../docs/specs/README.md) and the Spec Ownership Matrix in [docs/specs/implementation-strategy.md §6](../../../docs/specs/implementation-strategy.md#6-spec-ownership-matrix).
5. Return one of:
   - PASS: story is ready for `finish-story`
   - ISSUE: list concrete unmet criteria (including spec drift)

## Hard rule

- This skill is read-only and must not modify files.
