#!/usr/bin/env bash
# setup-git-hooks.sh - configure local git hooks for this repository

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! -d "$REPO_ROOT/.git" ]]; then
  echo "ERROR: .git directory not found at $REPO_ROOT" >&2
  echo "Run git init first." >&2
  exit 1
fi

git -C "$REPO_ROOT" config core.hooksPath .githooks

chmod +x "$REPO_ROOT/.githooks/commit-msg"
chmod +x "$REPO_ROOT/.githooks/pre-commit"
chmod +x "$REPO_ROOT/scripts/validate-commit-msg.sh"

echo "Configured git hooks path to .githooks"
echo "Prettier validation is now active on pre-commit"
echo "Conventional Commit validation is now active on commit-msg"
