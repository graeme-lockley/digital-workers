#!/usr/bin/env bash
# check-release-workflow.sh - validate the release workflow scaffold stays dry-run only.

set -u

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORKFLOW_FILE="$REPO_ROOT/.github/workflows/release.yml"

fail() {
  echo "ERROR: $1" >&2
  exit 1
}

[[ -f "$WORKFLOW_FILE" ]] || fail "missing workflow file: .github/workflows/release.yml"

if command -v pnpm >/dev/null 2>&1; then
  pnpm exec prettier --check "$WORKFLOW_FILE" >/dev/null || fail "workflow file is not valid YAML/formatting"
else
  fail "pnpm is required to validate the workflow file"
fi

required_patterns=(
  '^on:$'
  '^  workflow_dispatch:$'
  'Checkout repository'
  'Setup pnpm'
  'Setup Node.js'
  'Install dependencies'
  'Run typecheck'
  'Run lint'
  'Run tests'
  'Run all repository validators'
  'Simulate release'
)

for pattern in "${required_patterns[@]}"; do
  if ! grep -Eq "$pattern" "$WORKFLOW_FILE"; then
    fail "workflow file is missing required pattern: $pattern"
  fi
done

for forbidden in 'pnpm publish' 'npm publish' 'yarn publish' 'gh release create' 'semantic-release' 'release-it' 'changeset publish'; do
  if grep -Eq "$forbidden" "$WORKFLOW_FILE"; then
    fail "workflow file contains forbidden publish command pattern: $forbidden"
  fi
done

echo "Release workflow validation PASS"
exit 0