import { z } from "zod";

import { CANONICAL_PROTOCOL_VERSION } from "./version.js";
import {
  EventSchema,
  WorkerCommandSchema,
  WorkerMessageSchema
} from "./transport.js";

const VersionTagSchema = z.literal(CANONICAL_PROTOCOL_VERSION);
const MetadataSchema = z.record(z.string(), z.unknown());

export const SessionCreateRequestSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    requestType: z.literal("session.create"),
    workspaceId: z.string().min(1),
    initialMessage: WorkerMessageSchema.pick({
      text: true
    }).shape.text.optional()
  })
  .strict();
export type SessionCreateRequest = z.infer<typeof SessionCreateRequestSchema>;

export const SessionCreateResponseSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    responseType: z.literal("session.create"),
    sessionId: z.string().min(1)
  })
  .strict();
export type SessionCreateResponse = z.infer<typeof SessionCreateResponseSchema>;

export const SessionSendMessageRequestSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    requestType: z.literal("session.sendMessage"),
    sessionId: z.string().min(1),
    message: WorkerMessageSchema
  })
  .strict();
export type SessionSendMessageRequest = z.infer<
  typeof SessionSendMessageRequestSchema
>;

export const SessionSendMessageResponseSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    responseType: z.literal("session.sendMessage"),
    accepted: z.boolean(),
    correlationId: z.string().min(1)
  })
  .strict();
export type SessionSendMessageResponse = z.infer<
  typeof SessionSendMessageResponseSchema
>;

export const SessionAPI = {
  SessionCreateRequestSchema,
  SessionCreateResponseSchema,
  SessionSendMessageRequestSchema,
  SessionSendMessageResponseSchema
} as const;

export const WorkerManagerListRequestSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    requestType: z.literal("workerManager.list")
  })
  .strict();
export type WorkerManagerListRequest = z.infer<
  typeof WorkerManagerListRequestSchema
>;

export const WorkerManagerListResponseSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    responseType: z.literal("workerManager.list"),
    workers: z.array(
      z
        .object({
          workerId: z.string().min(1),
          status: z.enum(["idle", "running", "stopped"])
        })
        .strict()
    )
  })
  .strict();
export type WorkerManagerListResponse = z.infer<
  typeof WorkerManagerListResponseSchema
>;

export const WorkerManagerCommandRequestSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    requestType: z.literal("workerManager.command"),
    command: WorkerCommandSchema
  })
  .strict();
export type WorkerManagerCommandRequest = z.infer<
  typeof WorkerManagerCommandRequestSchema
>;

export const WorkerManagerCommandResponseSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    responseType: z.literal("workerManager.command"),
    accepted: z.boolean(),
    message: z.string().min(1).optional()
  })
  .strict();
export type WorkerManagerCommandResponse = z.infer<
  typeof WorkerManagerCommandResponseSchema
>;

export const WorkerManagerAPI = {
  WorkerManagerListRequestSchema,
  WorkerManagerListResponseSchema,
  WorkerManagerCommandRequestSchema,
  WorkerManagerCommandResponseSchema
} as const;

export const RouterPublishRequestSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    requestType: z.literal("router.publish"),
    event: EventSchema
  })
  .strict();
export type RouterPublishRequest = z.infer<typeof RouterPublishRequestSchema>;

export const RouterPublishResponseSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    responseType: z.literal("router.publish"),
    delivered: z.boolean()
  })
  .strict();
export type RouterPublishResponse = z.infer<typeof RouterPublishResponseSchema>;

export const RouterSubscribeRequestSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    requestType: z.literal("router.subscribe"),
    sessionId: z.string().min(1),
    correlationId: z.string().min(1).optional()
  })
  .strict();
export type RouterSubscribeRequest = z.infer<
  typeof RouterSubscribeRequestSchema
>;

export const RouterSubscribeResponseSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    responseType: z.literal("router.subscribe"),
    subscriptionId: z.string().min(1)
  })
  .strict();
export type RouterSubscribeResponse = z.infer<
  typeof RouterSubscribeResponseSchema
>;

export const RouterAPI = {
  RouterPublishRequestSchema,
  RouterPublishResponseSchema,
  RouterSubscribeRequestSchema,
  RouterSubscribeResponseSchema
} as const;

export const RuntimeConfigGetRequestSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    requestType: z.literal("runtimeConfig.get")
  })
  .strict();
export type RuntimeConfigGetRequest = z.infer<
  typeof RuntimeConfigGetRequestSchema
>;

export const RuntimeConfigGetResponseSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    responseType: z.literal("runtimeConfig.get"),
    workspaceId: z.string().min(1),
    configPath: z.string().min(1),
    config: MetadataSchema
  })
  .strict();
export type RuntimeConfigGetResponse = z.infer<
  typeof RuntimeConfigGetResponseSchema
>;

export const RuntimeConfigValidateRequestSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    requestType: z.literal("runtimeConfig.validate"),
    config: MetadataSchema
  })
  .strict();
export type RuntimeConfigValidateRequest = z.infer<
  typeof RuntimeConfigValidateRequestSchema
>;

export const RuntimeConfigValidateResponseSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    responseType: z.literal("runtimeConfig.validate"),
    valid: z.boolean(),
    errors: z.array(z.string().min(1)).default([])
  })
  .strict();
export type RuntimeConfigValidateResponse = z.infer<
  typeof RuntimeConfigValidateResponseSchema
>;

export const RuntimeConfigAPI = {
  RuntimeConfigGetRequestSchema,
  RuntimeConfigGetResponseSchema,
  RuntimeConfigValidateRequestSchema,
  RuntimeConfigValidateResponseSchema
} as const;
