#!/usr/bin/env bash
# validate-kanban-all.sh - run all lightweight kanban validators.

set -u
shopt -s nullglob

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KANBAN_DIR="$REPO_ROOT/docs/kanban"

errors=0

run_check_story() {
  local f="$1"
  local id
  id="$(basename "$f" .md)"
  if ! bash "$REPO_ROOT/scripts/check-story.sh" "$id"; then
    errors=$((errors + 1))
  fi
}

run_check_epic() {
  local f="$1"
  local id
  id="$(basename "$f" .md)"
  if ! bash "$REPO_ROOT/scripts/check-epic.sh" "$id"; then
    errors=$((errors + 1))
  fi
}

echo "==> Lint skills"
if ! bash "$REPO_ROOT/scripts/lint-skills.sh"; then
  errors=$((errors + 1))
fi

echo "==> Check specs"
if ! bash "$REPO_ROOT/scripts/check-specs.sh"; then
  errors=$((errors + 1))
fi

echo "==> Validate stories"
for phase in unplanned planned doing done; do
  while IFS= read -r file; do
    run_check_story "$file"
  done < <(find "$KANBAN_DIR/stories/$phase" -maxdepth 1 -type f -name 'S*.md' | sort)
done

echo "==> Validate epics"
for phase in unplanned planned doing done; do
  while IFS= read -r file; do
    run_check_epic "$file"
  done < <(find "$KANBAN_DIR/epics/$phase" -maxdepth 1 -type f -name 'E*.md' | sort)
done

if [[ "$errors" -gt 0 ]]; then
  echo "KANBAN VALIDATION FAILED (${errors} error(s))" >&2
  exit 1
fi

echo "KANBAN VALIDATION PASS"
exit 0
