import { test } from "node:test";
import assert from "node:assert/strict";

import {
  CANONICAL_PROTOCOL_VERSION,
  CanonicalV1StateSchemas,
  CompactionArtifactV1Schema,
  EventSchema,
  InnerLoopOutcomeSchema,
  MemoryEntrySchema,
  OuterContextSchema,
  SessionConfigSchema,
  SessionSchema,
  RuntimeConfigValidateResponseSchema,
  SessionCreateRequestSchema,
  SessionSendMessageRequestSchema,
  TaskRecordSchema,
  WorkerCommandSchema,
  WorkerMessageSchema,
  WorkerStatusSnapshotSchema,
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

test("canonical v1 state schemas are exported under stable names", () => {
  assert.deepEqual(Object.keys(CanonicalV1StateSchemas), [
    "TranscriptEntrySchema",
    "AuditEntrySchema",
    "MemoryEntrySchema",
    "TaskRecordSchema",
    "OuterContextSchema",
    "SessionSchema",
    "InnerLoopOutcomeSchema",
    "CompactionArtifactV1Schema",
    "SessionConfigSchema",
    "WorkerStatusSnapshotSchema"
  ]);
});

test("state schemas accept representative canonical v1 payloads", () => {
  const sessionConfig = SessionConfigSchema.safeParse({
    schemaVersion: CANONICAL_PROTOCOL_VERSION,
    sessionId: "session-1",
    workspaceId: "workspace-1",
    workerId: "worker-1",
    model: "gpt-5.3-codex",
    systemPrompt: "You are a coding assistant",
    transport: "stdio",
    sandbox: {
      type: "local-fs",
      root: "workspaces/default"
    }
  });

  const transcriptEntry = MemoryEntrySchema.safeParse({
    schemaVersion: CANONICAL_PROTOCOL_VERSION,
    entryId: "memory-1",
    sessionId: "session-1",
    scope: "session",
    key: "summary",
    value: "Needs follow up",
    createdAt: "2026-05-10T10:00:00.000Z",
    updatedAt: "2026-05-10T10:00:00.000Z"
  });

  const taskRecord = TaskRecordSchema.safeParse({
    schemaVersion: CANONICAL_PROTOCOL_VERSION,
    taskId: "task-1",
    sessionId: "session-1",
    title: "Write summary",
    status: "completed",
    createdAt: "2026-05-10T10:00:00.000Z",
    updatedAt: "2026-05-10T10:00:00.000Z"
  });

  const outerContext = OuterContextSchema.safeParse({
    schemaVersion: CANONICAL_PROTOCOL_VERSION,
    sessionId: "session-1",
    workerId: "worker-1",
    transcriptEntries: [
      {
        schemaVersion: CANONICAL_PROTOCOL_VERSION,
        entryId: "transcript-1",
        sessionId: "session-1",
        workerId: "worker-1",
        role: "user",
        text: "Summarize the run",
        timestamp: "2026-05-10T10:00:00.000Z"
      }
    ],
    auditEntries: [
      {
        schemaVersion: CANONICAL_PROTOCOL_VERSION,
        entryId: "audit-1",
        category: "runtime",
        action: "session.created",
        message: "Session created",
        timestamp: "2026-05-10T10:00:00.000Z"
      }
    ],
    memoryEntries: [
      {
        schemaVersion: CANONICAL_PROTOCOL_VERSION,
        entryId: "memory-1",
        sessionId: "session-1",
        scope: "session",
        key: "summary",
        value: "Needs follow up",
        createdAt: "2026-05-10T10:00:00.000Z",
        updatedAt: "2026-05-10T10:00:00.000Z"
      }
    ],
    taskRecords: [
      {
        schemaVersion: CANONICAL_PROTOCOL_VERSION,
        taskId: "task-1",
        sessionId: "session-1",
        title: "Write summary",
        status: "completed",
        createdAt: "2026-05-10T10:00:00.000Z",
        updatedAt: "2026-05-10T10:00:00.000Z"
      }
    ],
    summary: "Ready for storage",
    updatedAt: "2026-05-10T10:00:00.000Z"
  });

  const session = SessionSchema.safeParse({
    schemaVersion: CANONICAL_PROTOCOL_VERSION,
    sessionId: "session-1",
    workspaceId: "workspace-1",
    status: "running",
    config: {
      schemaVersion: CANONICAL_PROTOCOL_VERSION,
      sessionId: "session-1",
      workspaceId: "workspace-1",
      workerId: "worker-1",
      model: "gpt-5.3-codex",
      systemPrompt: "You are a coding assistant",
      transport: "stdio",
      sandbox: {
        type: "local-fs",
        root: "workspaces/default"
      }
    },
    outerContext: {
      schemaVersion: CANONICAL_PROTOCOL_VERSION,
      sessionId: "session-1",
      workerId: "worker-1",
      transcriptEntries: [
        {
          schemaVersion: CANONICAL_PROTOCOL_VERSION,
          entryId: "transcript-1",
          sessionId: "session-1",
          workerId: "worker-1",
          role: "user",
          text: "Summarize the run",
          timestamp: "2026-05-10T10:00:00.000Z"
        }
      ],
      auditEntries: [],
      memoryEntries: [],
      taskRecords: [],
      updatedAt: "2026-05-10T10:00:00.000Z"
    },
    createdAt: "2026-05-10T10:00:00.000Z",
    updatedAt: "2026-05-10T10:10:00.000Z"
  });

  const innerLoopOutcome = InnerLoopOutcomeSchema.safeParse({
    schemaVersion: CANONICAL_PROTOCOL_VERSION,
    outcomeStatus: "completed",
    sessionId: "session-1",
    workerId: "worker-1",
    correlationId: "corr-1",
    summary: "Finished successfully",
    timestamp: "2026-05-10T10:00:00.000Z"
  });

  const compactionArtifact = CompactionArtifactV1Schema.safeParse({
    schemaVersion: CANONICAL_PROTOCOL_VERSION,
    sessionId: "session-1",
    workerId: "worker-1",
    sourceEntryIds: ["transcript-1"],
    summary: "Compact transcript",
    createdAt: "2026-05-10T10:00:00.000Z"
  });

  const workerStatusSnapshot = WorkerStatusSnapshotSchema.safeParse({
    schemaVersion: CANONICAL_PROTOCOL_VERSION,
    workerId: "worker-1",
    sessionId: "session-1",
    status: "running",
    currentTaskId: "task-1",
    updatedAt: "2026-05-10T10:00:00.000Z"
  });

  const invalidSessionConfig = SessionConfigSchema.safeParse({
    schemaVersion: CANONICAL_PROTOCOL_VERSION,
    sessionId: "session-1",
    workspaceId: "workspace-1",
    workerId: "worker-1",
    model: "gpt-5.3-codex",
    systemPrompt: "",
    transport: "stdio",
    sandbox: {
      type: "local-fs"
    }
  });

  assert.equal(sessionConfig.success, true);
  assert.equal(transcriptEntry.success, true);
  assert.equal(taskRecord.success, true);
  assert.equal(outerContext.success, true);
  assert.equal(session.success, true);
  assert.equal(innerLoopOutcome.success, true);
  assert.equal(compactionArtifact.success, true);
  assert.equal(workerStatusSnapshot.success, true);
  assert.equal(invalidSessionConfig.success, false);
});
