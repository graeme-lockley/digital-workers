import { test } from "node:test";
import assert from "node:assert/strict";

import {
  CANONICAL_PROTOCOL_VERSION,
  type CanonicalProtocolVersion
} from "@digital-workers/protocol";

test("public barrel exports canonical protocol version", () => {
  const version: CanonicalProtocolVersion = CANONICAL_PROTOCOL_VERSION;
  assert.equal(version, "canonical-v1");
});
