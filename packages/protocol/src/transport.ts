import { z } from "zod";

import { CANONICAL_PROTOCOL_VERSION } from "./version.js";

const VersionTagSchema = z.literal(CANONICAL_PROTOCOL_VERSION);

const MetadataSchema = z.record(z.string(), z.unknown());

export const EventSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    eventType: z.enum([
      "session.created",
      "session.updated",
      "worker.started",
      "worker.stopped",
      "worker.output",
      "worker.error"
    ]),
    sessionId: z.string().min(1),
    workerId: z.string().min(1).optional(),
    correlationId: z.string().min(1),
    timestamp: z.string().min(1),
    payload: MetadataSchema
  })
  .strict();

export type Event = z.infer<typeof EventSchema>;

export const WorkerMessageSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    messageType: z.enum(["user", "assistant", "system", "tool"]),
    sessionId: z.string().min(1),
    workerId: z.string().min(1),
    correlationId: z.string().min(1),
    text: z.string().min(1),
    metadata: MetadataSchema.optional()
  })
  .strict();

export type WorkerMessage = z.infer<typeof WorkerMessageSchema>;

export const WorkerCommandSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    command: z.enum(["status", "abandon", "shutdown"]),
    sessionId: z.string().min(1).optional(),
    workerId: z.string().min(1).optional(),
    correlationId: z.string().min(1),
    args: MetadataSchema.optional()
  })
  .strict();

export type WorkerCommand = z.infer<typeof WorkerCommandSchema>;
