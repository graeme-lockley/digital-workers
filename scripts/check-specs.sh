#!/usr/bin/env bash
# check-specs.sh - ensure every docs/specs/*.md (excluding README and adr/runbooks indexes)
# is listed in docs/specs/README.md and in the Spec Ownership Matrix in
# docs/specs/implementation-strategy.md.

set -u
shopt -s nullglob

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SPECS_DIR="$REPO_ROOT/docs/specs"
INDEX="$SPECS_DIR/README.md"
STRATEGY="$SPECS_DIR/implementation-strategy.md"

errors=0

if [[ ! -f "$INDEX" ]]; then
  echo "ERROR: docs/specs/README.md missing" >&2
  exit 1
fi
if [[ ! -f "$STRATEGY" ]]; then
  echo "ERROR: docs/specs/implementation-strategy.md missing" >&2
  exit 1
fi

# Top-level specs only (NN-name.md)
for spec in "$SPECS_DIR"/*.md; do
  base="$(basename "$spec")"
  case "$base" in
    README.md|implementation-strategy.md) continue ;;
  esac
  if ! grep -qF "$base" "$INDEX"; then
    echo "ERROR: $base not listed in docs/specs/README.md" >&2
    errors=$((errors + 1))
  fi
  if ! grep -qF "$base" "$STRATEGY"; then
    echo "ERROR: $base not listed in implementation-strategy.md (Spec Ownership Matrix)" >&2
    errors=$((errors + 1))
  fi
done

# Required stable indexes
for required in adr/README.md runbooks/README.md; do
  if [[ ! -f "$SPECS_DIR/$required" ]]; then
    echo "ERROR: docs/specs/$required missing" >&2
    errors=$((errors + 1))
  fi
done

if [[ "$errors" -gt 0 ]]; then
  echo "FAIL (${errors} error(s))" >&2
  exit 1
fi

echo "PASS"
exit 0
