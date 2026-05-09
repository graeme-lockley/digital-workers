#!/usr/bin/env bash
# check-epic.sh - lightweight validation for epic readiness and closure.

set -u
shopt -s nullglob

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KANBAN_DIR="$REPO_ROOT/docs/kanban"
EPICS_DIR="$KANBAN_DIR/epics"

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <epic-id-or-file>" >&2
  exit 2
fi

INPUT="$1"

found=()
for phase in unplanned planned doing done; do
  while IFS= read -r file; do
    found+=("${phase}|${file}")
  done < <(find "$EPICS_DIR/$phase" -maxdepth 1 -type f -name '*.md' \
    | grep -E "/(${INPUT}|${INPUT}-[^/]+)\\.md$" || true)
done

if [[ ${#found[@]} -eq 0 ]]; then
  echo "ERROR: epic not found for '$INPUT'" >&2
  exit 2
fi

if [[ ${#found[@]} -gt 1 ]]; then
  echo "ERROR: epic appears in multiple phases:" >&2
  for entry in "${found[@]}"; do
    echo "  - ${entry#*|}" >&2
  done
  exit 1
fi

PHASE="${found[0]%%|*}"
FILE="${found[0]#*|}"

echo "Epic  : $(basename "$FILE")"
echo "Phase : ${PHASE}"
echo "File  : ${FILE#$REPO_ROOT/}"

errors=0

if ! grep -qE '^# Epic E[0-9]+' "$FILE"; then
  echo "ERROR: missing or invalid epic title format (expected '# Epic E##: ...')" >&2
  errors=$((errors + 1))
fi

if ! grep -qE '^## Stories' "$FILE"; then
  echo "ERROR: missing '## Stories' section" >&2
  errors=$((errors + 1))
fi

if ! grep -qE '^## Epic Completion Criteria' "$FILE"; then
  echo "ERROR: missing '## Epic Completion Criteria' section" >&2
  errors=$((errors + 1))
fi

declare -a story_links=()
story_link_count=0
while IFS= read -r rel; do
  [[ -z "$rel" ]] && continue
  story_links+=("$rel")
  story_link_count=$((story_link_count + 1))
done < <(grep -oE '\(\.\./\.\./stories/(unplanned|planned|doing|done)/S[0-9]+-[0-9]+-[^)]+\.md\)' "$FILE" \
  | tr -d '()' || true)

if [[ "$PHASE" == "done" && "$story_link_count" -eq 0 ]]; then
  echo "ERROR: done epic must include at least one linked story" >&2
  errors=$((errors + 1))
fi

if [[ "$story_link_count" -gt 0 ]]; then
  for rel in "${story_links[@]}"; do
    target="$(cd "$(dirname "$FILE")" && cd "$(dirname "$rel")" 2>/dev/null && pwd)/$(basename "$rel")"
    if [[ ! -f "$target" ]]; then
      echo "ERROR: linked story missing: ${rel}" >&2
      errors=$((errors + 1))
      continue
    fi
    if [[ "$PHASE" == "done" ]]; then
      case "$target" in
        *"/docs/kanban/stories/done/"*) ;;
        *)
          echo "ERROR: done epic links to non-done story: ${target#$REPO_ROOT/}" >&2
          errors=$((errors + 1))
          ;;
      esac
    fi
  done
fi

if [[ "$PHASE" == "done" ]]; then
  unchecked_epic_criteria="$(awk '
    /^## / { if (in_criteria) exit }
    /^## Epic Completion Criteria([: ]|$)/ { in_criteria=1; next }
    in_criteria && /^- \[ \]/ { c++ }
    END { print c+0 }
  ' "$FILE")"
  if [[ "$unchecked_epic_criteria" -gt 0 ]]; then
    echo "ERROR: done epic has unchecked completion criteria (${unchecked_epic_criteria})" >&2
    errors=$((errors + 1))
  fi

  # Specs every done story claims to have updated must exist.
  if [[ "$story_link_count" -gt 0 ]]; then
    for rel in "${story_links[@]}"; do
      target="$(cd "$(dirname "$FILE")" && cd "$(dirname "$rel")" 2>/dev/null && pwd)/$(basename "$rel")"
      [[ -f "$target" ]] || continue
      while IFS= read -r spec_path; do
        [[ -z "$spec_path" ]] && continue
        if [[ ! -f "$REPO_ROOT/$spec_path" ]]; then
          echo "ERROR: spec referenced by ${target#$REPO_ROOT/} is missing on disk: $spec_path" >&2
          errors=$((errors + 1))
        fi
      done < <(awk '
        /^## / { if (in_specs) exit }
        /^## Spec Updates([: ]|$)/ { in_specs=1; next }
        in_specs { print }
      ' "$target" | grep -oE 'docs/specs/[A-Za-z0-9_./-]+\.md' | sort -u)
    done
  fi
fi

if [[ "$errors" -gt 0 ]]; then
  echo "FAIL (${errors} error(s))" >&2
  exit 1
fi

echo "PASS"
exit 0
