#!/usr/bin/env bash
# test-all.sh - run the repository's validation checks through their script entrypoints.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

run_step() {
  local label="$1"
  shift

  echo "==> ${label}"
  "$@"
}

run_step "Story migration regression" bash "$REPO_ROOT/scripts/test-s01-01-migration.sh"
run_step "Spec ownership validation" bash "$REPO_ROOT/scripts/check-specs.sh"
run_step "Kanban validation" bash "$REPO_ROOT/scripts/validate-kanban-all.sh"

echo "TEST ALL PASS"