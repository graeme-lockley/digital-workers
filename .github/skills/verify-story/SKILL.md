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

1. Read story and locate acceptance criteria, tasks, tests, and docs updates.
2. Validate referenced implementation changes exist.
3. Validate test evidence exists (or explicit rationale for no tests).
4. Return one of:
   - PASS: story is ready for `finish-story`
   - ISSUE: list concrete unmet criteria

## Hard rule

- This skill is read-only and must not modify files.
