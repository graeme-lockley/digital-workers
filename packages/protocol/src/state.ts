import { z } from "zod";

import { CANONICAL_PROTOCOL_VERSION } from "./version.js";

const VersionTagSchema = z.literal(CANONICAL_PROTOCOL_VERSION);
const MetadataSchema = z.record(z.string(), z.unknown());
const TimestampSchema = z.string().min(1);
const SessionStatusSchema = z.enum([
  "starting",
  "ready",
  "running",
  "idle",
  "stopping",
  "stopped",
  "error"
]);
const WorkerStatusSchema = z.enum(["idle", "running", "stopped", "error"]);
const EntryRoleSchema = z.enum(["user", "assistant", "system", "tool"]);
const TaskStatusSchema = z.enum([
  "pending",
  "running",
  "blocked",
  "completed",
  "failed"
]);
const OutcomeStatusSchema = z.enum([
  "completed",
  "abandoned",
  "cancelled",
  "failed"
]);
const SandboxSchema = z
  .object({
    type: z.enum(["local-fs", "constrained-bash", "virtual-fs"]),
    root: z.string().min(1).optional()
  })
  .strict();

export const TranscriptEntrySchema = z
  .object({
    schemaVersion: VersionTagSchema,
    entryId: z.string().min(1),
    sessionId: z.string().min(1),
    workerId: z.string().min(1).optional(),
    role: EntryRoleSchema,
    text: z.string().min(1),
    timestamp: TimestampSchema,
    metadata: MetadataSchema.optional()
  })
  .strict();
export type TranscriptEntry = z.infer<typeof TranscriptEntrySchema>;

export const AuditEntrySchema = z
  .object({
    schemaVersion: VersionTagSchema,
    entryId: z.string().min(1),
    sessionId: z.string().min(1).optional(),
    workerId: z.string().min(1).optional(),
    category: z.enum(["session", "worker", "storage", "runtime", "security"]),
    action: z.string().min(1),
    message: z.string().min(1),
    timestamp: TimestampSchema,
    metadata: MetadataSchema.optional()
  })
  .strict();
export type AuditEntry = z.infer<typeof AuditEntrySchema>;

export const MemoryEntrySchema = z
  .object({
    schemaVersion: VersionTagSchema,
    entryId: z.string().min(1),
    sessionId: z.string().min(1).optional(),
    scope: z.enum(["session", "worker", "workspace", "global"]),
    key: z.string().min(1),
    value: z.string().min(1),
    createdAt: TimestampSchema,
    updatedAt: TimestampSchema,
    metadata: MetadataSchema.optional()
  })
  .strict();
export type MemoryEntry = z.infer<typeof MemoryEntrySchema>;

export const TaskRecordSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    taskId: z.string().min(1),
    sessionId: z.string().min(1),
    title: z.string().min(1),
    status: TaskStatusSchema,
    createdAt: TimestampSchema,
    updatedAt: TimestampSchema,
    metadata: MetadataSchema.optional()
  })
  .strict();
export type TaskRecord = z.infer<typeof TaskRecordSchema>;

export const SessionConfigSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    sessionId: z.string().min(1),
    workspaceId: z.string().min(1),
    workerId: z.string().min(1),
    model: z.string().min(1),
    systemPrompt: z.string().min(1),
    transport: z.enum(["stdio", "http", "inproc"]),
    sandbox: SandboxSchema,
    metadata: MetadataSchema.optional()
  })
  .strict();
export type SessionConfig = z.infer<typeof SessionConfigSchema>;

export const InnerLoopOutcomeSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    outcomeStatus: OutcomeStatusSchema,
    sessionId: z.string().min(1),
    workerId: z.string().min(1),
    correlationId: z.string().min(1),
    summary: z.string().min(1),
    timestamp: TimestampSchema,
    metadata: MetadataSchema.optional()
  })
  .strict();
export type InnerLoopOutcome = z.infer<typeof InnerLoopOutcomeSchema>;

export const CompactionArtifactV1Schema = z
  .object({
    schemaVersion: VersionTagSchema,
    sessionId: z.string().min(1),
    workerId: z.string().min(1).optional(),
    sourceEntryIds: z.array(z.string().min(1)).min(1),
    summary: z.string().min(1),
    createdAt: TimestampSchema,
    metadata: MetadataSchema.optional()
  })
  .strict();
export type CompactionArtifactV1 = z.infer<typeof CompactionArtifactV1Schema>;

export const WorkerStatusSnapshotSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    workerId: z.string().min(1),
    sessionId: z.string().min(1).optional(),
    status: WorkerStatusSchema,
    currentTaskId: z.string().min(1).optional(),
    updatedAt: TimestampSchema,
    metadata: MetadataSchema.optional()
  })
  .strict();
export type WorkerStatusSnapshot = z.infer<typeof WorkerStatusSnapshotSchema>;

export const OuterContextSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    sessionId: z.string().min(1),
    workerId: z.string().min(1),
    transcriptEntries: z.array(TranscriptEntrySchema),
    auditEntries: z.array(AuditEntrySchema),
    memoryEntries: z.array(MemoryEntrySchema),
    taskRecords: z.array(TaskRecordSchema),
    summary: z.string().min(1).optional(),
    updatedAt: TimestampSchema,
    metadata: MetadataSchema.optional()
  })
  .strict();
export type OuterContext = z.infer<typeof OuterContextSchema>;

export const SessionSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    sessionId: z.string().min(1),
    workspaceId: z.string().min(1),
    status: SessionStatusSchema,
    config: SessionConfigSchema,
    outerContext: OuterContextSchema.optional(),
    createdAt: TimestampSchema,
    updatedAt: TimestampSchema,
    metadata: MetadataSchema.optional()
  })
  .strict();
export type Session = z.infer<typeof SessionSchema>;

export const CanonicalV1StateSchemas = {
  TranscriptEntrySchema,
  AuditEntrySchema,
  MemoryEntrySchema,
  TaskRecordSchema,
  OuterContextSchema,
  SessionSchema,
  InnerLoopOutcomeSchema,
  CompactionArtifactV1Schema,
  SessionConfigSchema,
  WorkerStatusSnapshotSchema
} as const;
