#!/usr/bin/env bash
# check-story.sh - lightweight validation for kanban story files.

set -u
shopt -s nullglob

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KANBAN_DIR="$REPO_ROOT/docs/kanban"
STORIES_DIR="$KANBAN_DIR/stories"

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <story-id-or-file>" >&2
  exit 2
fi

INPUT="$1"

story_dirs=("unplanned" "planned" "doing" "done")
found=()

for phase in "${story_dirs[@]}"; do
  while IFS= read -r file; do
    found+=("${phase}|${file}")
  done < <(find "$STORIES_DIR/$phase" -maxdepth 1 -type f -name '*.md' \
    | grep -E "/(${INPUT}|${INPUT}-[^/]+)\\.md$" || true)
done

if [[ ${#found[@]} -eq 0 ]]; then
  echo "ERROR: story not found for '$INPUT'" >&2
  exit 2
fi

if [[ ${#found[@]} -gt 1 ]]; then
  echo "ERROR: story appears in multiple phases:" >&2
  for entry in "${found[@]}"; do
    echo "  - ${entry#*|}" >&2
  done
  exit 1
fi

PHASE="${found[0]%%|*}"
FILE="${found[0]#*|}"
BASE="$(basename "$FILE")"

echo "Story : ${BASE}"
echo "Phase : ${PHASE}"
echo "File  : ${FILE#$REPO_ROOT/}"

errors=0

has_h2() {
  local name="$1"
  grep -qE "^## ${name}([: ]|$)" "$FILE"
}

count_unchecked_tasks() {
  awk '
    /^## / { if (in_tasks) exit }
    /^## Tasks([: ]|$)/ { in_tasks=1; next }
    in_tasks && /^- \[ \]/ { c++ }
    END { print c+0 }
  ' "$FILE"
}

if ! grep -qE '^# ' "$FILE"; then
  echo "ERROR: missing H1 title" >&2
  errors=$((errors + 1))
fi

for section in "Summary" "Acceptance Criteria"; do
  if ! has_h2 "$section"; then
    echo "ERROR: missing section '## ${section}'" >&2
    errors=$((errors + 1))
  fi
done

case "$PHASE" in
  unplanned)
    for section in "Current State" "Goals" "Spec References" "Risks / Notes"; do
      if ! has_h2 "$section"; then
        echo "ERROR: unplanned story missing '## ${section}'" >&2
        errors=$((errors + 1))
      fi
    done
    ;;
  planned)
    for section in "Impact analysis" "Tasks" "Tests to add" "Documentation and specs to update"; do
      if ! has_h2 "$section"; then
        echo "ERROR: planned story missing '## ${section}'" >&2
        errors=$((errors + 1))
      fi
    done
    ;;
  doing)
    if ! has_h2 "Build notes"; then
      echo "ERROR: doing story missing '## Build notes'" >&2
      errors=$((errors + 1))
    fi
    if ! has_h2 "Documentation and specs to update"; then
      echo "ERROR: doing story missing '## Documentation and specs to update' (carry forward from planned)" >&2
      errors=$((errors + 1))
    fi
    if ! has_h2 "Spec Updates"; then
      echo "ERROR: doing story missing '## Spec Updates' (record spec changes as you build)" >&2
      errors=$((errors + 1))
    fi
    ;;
  done)
    if ! has_h2 "Build notes"; then
      echo "ERROR: done story missing '## Build notes'" >&2
      errors=$((errors + 1))
    fi
    if ! has_h2 "Documentation and specs to update"; then
      echo "ERROR: done story missing '## Documentation and specs to update'" >&2
      errors=$((errors + 1))
    fi
    if ! has_h2 "Spec Updates"; then
      echo "ERROR: done story missing '## Spec Updates'" >&2
      errors=$((errors + 1))
    fi
    unchecked="$(count_unchecked_tasks)"
    if [[ "$unchecked" -gt 0 ]]; then
      echo "ERROR: done story has unchecked tasks (${unchecked})" >&2
      errors=$((errors + 1))
    fi
    ;;
esac

if [[ "$errors" -gt 0 ]]; then
  echo "FAIL (${errors} error(s))" >&2
  exit 1
fi

echo "PASS"
exit 0
