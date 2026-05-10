#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

EXPECTED_ENTRYPOINT="apps/digital-workers-tui/src/index.ts"
LEGACY_ENTRYPOINT="src/index.ts"

if [[ ! -f "$EXPECTED_ENTRYPOINT" ]]; then
  echo "FAIL: expected migrated entrypoint missing: $EXPECTED_ENTRYPOINT"
  exit 1
fi

if [[ -f "$LEGACY_ENTRYPOINT" ]]; then
  echo "FAIL: legacy entrypoint still exists: $LEGACY_ENTRYPOINT"
  exit 1
fi

if ! grep -q "tsx apps/digital-workers-tui/src/index.ts" package.json; then
  echo "FAIL: package.json start/dev scripts are not pointing at apps/digital-workers-tui/src/index.ts"
  exit 1
fi

echo "PASS: S01-01 migration regression checks succeeded"
echo "  - migrated entrypoint exists"
echo "  - legacy src/index.ts removed"
echo "  - package.json scripts target apps/digital-workers-tui/src/index.ts"
