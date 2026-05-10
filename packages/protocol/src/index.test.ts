import { test } from "node:test";
import assert from "node:assert/strict";

import {
  CANONICAL_PROTOCOL_VERSION,
  EventSchema,
  RuntimeConfigValidateResponseSchema,
  SessionCreateRequestSchema,
  SessionSendMessageRequestSchema,
  WorkerCommandSchema,
  WorkerMessageSchema,
  WorkspaceConfigSchema,
  type CanonicalProtocolVersion
} from "@digital-workers/protocol";

test("public barrel exports canonical protocol version", () => {
  const version: CanonicalProtocolVersion = CANONICAL_PROTOCOL_VERSION;
  assert.equal(version, "canonical-v1");
});

test("Event schema accepts canonical worker output payload", () => {
  const parseResult = EventSchema.safeParse({
    schemaVersion: CANONICAL_PROTOCOL_VERSION,
    eventType: "worker.output",
    sessionId: "session-1",
    workerId: "worker-1",
    correlationId: "corr-1",
    timestamp: "2026-05-10T10:00:00.000Z",
    payload: {
      content: "hello"
    }
  });

  assert.equal(parseResult.success, true);
});

test("Worker message schema rejects empty text", () => {
  const parseResult = WorkerMessageSchema.safeParse({
    schemaVersion: CANONICAL_PROTOCOL_VERSION,
    messageType: "user",
    sessionId: "session-1",
    workerId: "worker-1",
    correlationId: "corr-1",
    text: ""
  });

  assert.equal(parseResult.success, false);
});

test("Worker command schema rejects unknown command", () => {
  const parseResult = WorkerCommandSchema.safeParse({
    schemaVersion: CANONICAL_PROTOCOL_VERSION,
    command: "resume",
    correlationId: "corr-1"
  });

  assert.equal(parseResult.success, false);
});

test("Session API request schemas validate representative payloads", () => {
  const createRequest = SessionCreateRequestSchema.safeParse({
    schemaVersion: CANONICAL_PROTOCOL_VERSION,
    requestType: "session.create",
    workspaceId: "default",
    initialMessage: "Begin run"
  });

  const sendMessageRequest = SessionSendMessageRequestSchema.safeParse({
    schemaVersion: CANONICAL_PROTOCOL_VERSION,
    requestType: "session.sendMessage",
    sessionId: "session-1",
    message: {
      schemaVersion: CANONICAL_PROTOCOL_VERSION,
      messageType: "user",
      sessionId: "session-1",
      workerId: "worker-1",
      correlationId: "corr-1",
      text: "Please summarize"
    }
  });

  assert.equal(createRequest.success, true);
  assert.equal(sendMessageRequest.success, true);
});

test("Runtime config API response enforces non-empty error strings", () => {
  const invalidResponse = RuntimeConfigValidateResponseSchema.safeParse({
    schemaVersion: CANONICAL_PROTOCOL_VERSION,
    responseType: "runtimeConfig.validate",
    valid: false,
    errors: [""]
  });

  const validResponse = RuntimeConfigValidateResponseSchema.safeParse({
    schemaVersion: CANONICAL_PROTOCOL_VERSION,
    responseType: "runtimeConfig.validate",
    valid: false,
    errors: ["workers[0].model is required"]
  });

  assert.equal(invalidResponse.success, false);
  assert.equal(validResponse.success, true);
});

test("Workspace config schema validates minimal valid config", () => {
  const parseResult = WorkspaceConfigSchema.safeParse({
    schemaVersion: CANONICAL_PROTOCOL_VERSION,
    workspaceId: "default",
    workspaceRoot: "workspaces/default",
    workers: [
      {
        workerId: "worker-1",
        model: "gpt-5.3-codex",
        systemPrompt: "You are a coding assistant",
        transport: "stdio",
        sandbox: {
          type: "local-fs",
          root: "workspaces/default"
        }
      }
    ]
  });

  assert.equal(parseResult.success, true);
});

test("Workspace config schema rejects empty worker arrays", () => {
  const parseResult = WorkspaceConfigSchema.safeParse({
    schemaVersion: CANONICAL_PROTOCOL_VERSION,
    workspaceId: "default",
    workspaceRoot: "workspaces/default",
    workers: []
  });

  assert.equal(parseResult.success, false);
});
