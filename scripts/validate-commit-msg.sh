#!/usr/bin/env bash
# validate-commit-msg.sh - validate commit messages against Conventional Commits 1.0.0

set -u

show_error() {
  echo "ERROR: commit message does not follow Conventional Commits 1.0.0" >&2
  echo "Expected format:" >&2
  echo "  <type>[optional scope][!]: <description>" >&2
  echo "" >&2
  echo "Allowed types:" >&2
  echo "  feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert" >&2
  echo "" >&2
  echo "Examples:" >&2
  echo "  feat(router): add correlation id propagation" >&2
  echo "  fix!: remove deprecated session API" >&2
  echo "  docs(kanban): align stories folder structure" >&2
}

first_line=""

if [[ $# -ge 1 && "$1" == "--" ]]; then
  shift
fi

if [[ $# -eq 1 && -f "$1" ]]; then
  first_line="$(head -n 1 "$1")"
elif [[ $# -ge 1 ]]; then
  first_line="$1"
else
  echo "usage: $0 <commit-msg-file | commit-title>" >&2
  exit 2
fi

# Allow Git-generated merge commits.
if [[ "$first_line" =~ ^Merge\  ]]; then
  exit 0
fi

# Conventional Commits title pattern.
pattern='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9._/-]+\))?(!)?: .+$'

if [[ "$first_line" =~ $pattern ]]; then
  exit 0
fi

show_error
echo "Got:" >&2
echo "  $first_line" >&2
exit 1
