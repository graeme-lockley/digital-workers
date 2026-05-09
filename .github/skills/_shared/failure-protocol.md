# Failure Protocol

If any step fails:

1. Stop and report the exact failing step.
2. Preserve current file locations; do not partially move a story/epic and continue.
3. Record a short note in `## Build notes` if a story file is already in `doing/`.
4. Keep worktree safe: do not delete user changes.
5. Ask for direction if requirements are ambiguous or conflicting.
