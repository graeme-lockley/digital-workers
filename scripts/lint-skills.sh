#!/usr/bin/env bash
# lint-skills.sh - lightweight linter for .github/skills.

set -u
shopt -s nullglob

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS_DIR="$REPO_ROOT/.github/skills"

if [[ ! -d "$SKILLS_DIR" ]]; then
  echo "FAIL: $SKILLS_DIR does not exist" >&2
  exit 1
fi

errors=0
ok() { echo "  ok   ($1): $2"; }
err() { echo "  ERROR ($1): $2"; errors=$((errors + 1)); }

required_keys=("name" "version" "description" "outputs" "allowed-tools" "forbids")

declare -a skills=()
for d in "$SKILLS_DIR"/*/; do
  n="$(basename "$d")"
  case "$n" in
    _*) continue ;;
  esac
  skills+=("$n")
done

echo "Linting ${#skills[@]} skill(s)"

for skill in "${skills[@]}"; do
  file="$SKILLS_DIR/$skill/SKILL.md"
  if [[ ! -f "$file" ]]; then
    err "$skill" "missing SKILL.md"
    continue
  fi

  fm="$(awk 'BEGIN{n=0} /^---$/{n++; if(n==2) exit; next} n==1 {print}' "$file")"
  if [[ -z "$fm" ]]; then
    err "$skill" "missing YAML frontmatter"
    continue
  fi

  for k in "${required_keys[@]}"; do
    if ! echo "$fm" | grep -qE "^${k}:"; then
      err "$skill" "frontmatter missing key '${k}'"
    fi
  done

  fm_name="$(echo "$fm" | awk -F': *' '/^name:/{print $2; exit}')"
  if [[ "$fm_name" != "$skill" ]]; then
    err "$skill" "frontmatter name '$fm_name' does not match folder '$skill'"
  fi

  while IFS= read -r ref; do
    case "$ref" in
      http*|"#"*|"") continue ;;
    esac
    target="${ref%%#*}"
    [[ -z "$target" ]] && continue
    skill_dir="$(dirname "$file")"
    candidates=("$skill_dir/$target" "$REPO_ROOT/$target")
    found=""
    for c in "${candidates[@]}"; do
      if [[ -e "$c" ]]; then
        found="$c"
        break
      fi
    done
    if [[ -z "$found" ]]; then
      err "$skill" "broken link/reference: $ref"
    fi
  done < <(grep -oE '\]\([^)]+\)' "$file" | sed 's/^]('// | sed 's/)$//' || true)

  ok "$skill" "frontmatter and refs checked"
done

for asset in README.md _shared/conventions.md _shared/failure-protocol.md _templates/README.md _templates/epic.md _templates/story-unplanned.md _templates/story-planned-additions.md _templates/story-doing-additions.md; do
  if [[ -f "$SKILLS_DIR/$asset" ]]; then
    ok "shared" "$asset exists"
  else
    err "shared" "missing $asset"
  fi
done

if [[ "$errors" -gt 0 ]]; then
  echo "FAIL ($errors error(s))" >&2
  exit 1
fi

echo "PASS"
exit 0
