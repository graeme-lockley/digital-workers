import { z } from "zod";

import { CANONICAL_PROTOCOL_VERSION } from "./version.js";

const VersionTagSchema = z.literal(CANONICAL_PROTOCOL_VERSION);

const WorkerTransportSchema = z.enum(["stdio", "http", "inproc"]);

export const WorkerConfigSchema = z
  .object({
    workerId: z.string().min(1),
    description: z.string().min(1).optional(),
    model: z.string().min(1),
    systemPrompt: z.string().min(1),
    transport: WorkerTransportSchema,
    apiEnvName: z.string().min(1).optional(),
    sandbox: z
      .object({
        type: z.enum(["local-fs", "constrained-bash", "virtual-fs"]),
        root: z.string().min(1).optional()
      })
      .strict()
  })
  .strict();

export type WorkerConfig = z.infer<typeof WorkerConfigSchema>;

export const WorkspaceConfigSchema = z
  .object({
    schemaVersion: VersionTagSchema,
    workspaceId: z.string().min(1),
    workspaceRoot: z.string().min(1),
    workers: z.array(WorkerConfigSchema).min(1),
    defaults: z
      .object({
        activeWorkerId: z.string().min(1).optional(),
        maxConcurrentWorkers: z.number().int().positive().default(1)
      })
      .strict()
      .default({ maxConcurrentWorkers: 1 })
  })
  .strict();

export type WorkspaceConfig = z.infer<typeof WorkspaceConfigSchema>;
