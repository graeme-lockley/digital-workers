# Architecture: Simple-Agent Monorepo

**Document status:** Draft / RFC v0.1  
**Date:** 2026-05-09  
**Vision:** A local-first system for running a company of collaborative digital workers (agents), with shared knowledge via a wiki, config-driven workspaces, and multiple user interfaces (TUI, mobile, API).

**Scope of this document:** This document describes the *target architecture*. It is intentionally silent on build sequencing, MVP slicing, and delivery phasing. Those concerns are owned by a separate document, `docs/specs/implementation-strategy.md`, which sequences the epics required to realise this architecture.

---

## 1. Executive Summary

Simple-agent evolves from a single AI assistant tool into a platform for orchestrating multiple collaborative agents.

**Key insights:**
1. The TUI and mobile interfaces are just clients; the real system is a headless core runtime.
2. Each digital worker needs isolation (its own root folder, permissions, execution state).
3. Workers share a common wiki for knowledge, but each has private workspace state.
4. Worker execution must run inside an explicit sandbox/workspace boundary with constrained shell access.
5. Configuration drives everything: workspace definition, worker permissions, communication channels.
6. All interfaces (TUI, mobile gateway, CLI, future web UI) call the same core API.

**The model:**
- One workspace config defines the composition of the entire system.
- One wiki root stores shared knowledge.
- Many worker roots store isolated execution state.
- Each worker executes inside a pluggable sandbox with an explicit persistence policy.
- A routing/message layer delivers communication; coordination and task routing are performed by workers.
- All interfaces are replaceable views of the core runtime.

---

## 2. System Architecture

### 2.1 High-Level Topology

```
┌─────────────────────────────────────────────────────────────────┐
│ INTERFACES (Replaceable, Stateless)                             │
├─────────────────────────────────────────────────────────────────┤
│  TUI          Mobile Gateway    CLI            Web UI (Astro)   │
│ (Node)        (Node SSE)         (Node)         (Node Astro)    │
└────────┬──────────────┬──────────────┬──────────────┬───────────┘
         │              │              │              │
         └──────────────┴──────────────┴──────────────┘
                        │
                        │ REST / gRPC / IPC
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ CORE RUNTIME LAYER (Headless, Stateful)                         │
├─────────────────────────────────────────────────────────────────┤
│  Session Manager  │  Worker Manager     │  Router / MessageBus  │
│  (lifecycle)      │  (isolation)        │  (delivery only)      │
└────────┬──────────────┬──────────────────┬──────────────────────┘
         │              │                  │
         └──────────────┴──────────────────┘
                        │
                        │ Read/Write/Append
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ STORAGE LAYER (Durable, Git-Friendly, Local-First)              │
├─────────────────────────────────────────────────────────────────┤
│  Wiki Root              Worker Roots            Config          │
│  (shared knowledge)     (isolated state)        (declarative)   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Core Design Principles

1. **Runtime is not a UI.**  
   The core runtime is headless and can be supervised as a service. Any interface (TUI, mobile, API) sends intents and consumes events.

2. **UI sends intents, not state.**  
   UI never owns execution state. It requests actions; the runtime delivers outcomes.

3. **Workers are isolated execution units.**  
   Each worker has its own root folder, permissions, transcript, and lifecycle. One worker cannot corrupt another's state.

4. **Wiki is shared knowledge.**  
  Workers can read and, subject to permissions, create/update/append/delete wiki content. The wiki is the canonical current knowledge base for organizational memory.

5. **Configuration is declarative.**  
   The workspace shape, worker definitions, permissions, and communication channels are all declared in configuration. No hardcoding.

6. **Storage is local-first and durable.**  
  Everything is stored on the filesystem. No mandatory database. Operational logs (transcripts, audit, message logs, task logs) are append-only JSON Lines. Wiki content is mutable by design. Git-friendly.

7. **Communication is structured.**  
  Worker-to-worker messaging and router delivery use schema-validated events. No terminal scraping or unstructured text passing.

---

## 3. Monorepo Structure

```
simple-agent/
│
├── apps/
│   ├── simple-agent-tui/
│   │   ├── src/
│   │   │   ├── index.ts              # TUI entrypoint (current starter code)
│   │   │   ├── tui.ts                # Terminal UI logic
│   │   │   └── client.ts             # calls core runtime API
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── pi-mobile-gateway/
│   │   ├── src/
│   │   │   ├── index.ts              # Gateway entrypoint
│   │   │   ├── api/
│   │   │   │   ├── routes.ts
│   │   │   │   ├── middleware/
│   │   │   │   │   ├── auth.ts       # Cloudflare Access validation
│   │   │   │   │   └── logging.ts
│   │   │   │   └── handlers/
│   │   │   │       ├── status.ts
│   │   │   │       ├── session.ts
│   │   │   │       └── chat.ts
│   │   │   ├── runtime-client.ts     # calls core runtime
│   │   │   └── persistence/
│   │   │       ├── transcript.ts
│   │   │       └── audit.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── agent-wiki-cli/
│   │   ├── src/
│   │   │   ├── main.ts               # CLI entrypoint (Node)
│   │   │   ├── core/
│   │   │   │   ├── wiki.ts
│   │   │   │   ├── repository.ts
│   │   │   │   ├── page_id.ts
│   │   │   │   └── ...
│   │   │   └── cli/
│   │   │       ├── commands/
│   │   │       │   ├── read.ts
│   │   │       │   ├── search.ts
│   │   │       │   └── ...
│   │   │       └── cli.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── agent-wiki-web/
│       ├── src/
│       │   ├── pages/                # Astro file-based routing
│       │   ├── components/
│       │   └── lib/
│       │       └── wiki-client.ts    # calls core wiki service
│       ├── astro.config.mjs
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── protocol/
│   │   ├── src/
│   │   │   ├── events.ts             # Event envelope schema (zod)
│   │   │   ├── worker-messages.ts    # Worker-to-worker message schema
│   │   │   ├── api-types.ts          # REST API request/response types
│   │   │   └── config-schema.ts      # Workspace config schema
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── core-runtime/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── session/
│   │   │   │   ├── manager.ts
│   │   │   │   └── state.ts
│   │   │   ├── worker/
│   │   │   │   ├── manager.ts
│   │   │   │   ├── executor.ts
│   │   │   │   └── isolation.ts
│   │   │   ├── router/
│   │   │   │   ├── router.ts
│   │   │   │   ├── messaging.ts
│   │   │   │   └── correlation.ts
│   │   │   ├── storage/
│   │   │   │   ├── filesystem.ts
│   │   │   │   ├── transcript.ts
│   │   │   │   └── audit-log.ts
│   │   │   ├── sandbox/
│   │   │   │   ├── provider.ts
│   │   │   │   ├── shell-policy.ts
│   │   │   │   ├── persistence.ts
│   │   │   │   └── adapters/
│   │   │   └── api/
│   │   │       ├── session-api.ts
│   │   │       ├── worker-manager-api.ts
│   │   │       └── router-api.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── security/
│   │   ├── src/
│   │   │   ├── auth.ts               # Cloudflare Access, gateway authz
│   │   │   ├── workspace-boundary.ts # Path traversal prevention
│   │   │   └── secrets.ts            # Redaction, secret detection
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── config/
│   │   ├── src/
│   │   │   ├── loader.ts
│   │   │   ├── validator.ts
│   │   │   ├── defaults.ts
│   │   │   └── types.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── observability/
│   │   ├── src/
│   │   │   ├── logging.ts
│   │   │   ├── tracing.ts
│   │   │   └── metrics.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── test-utils/
│   │   ├── src/
│   │   │   ├── fixtures/
│   │   │   ├── mocks/
│   │   │   └── contract-helpers.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── sandbox-adapters/
│       ├── src/
│       │   ├── local-fs.ts          # host-mounted workspace adapter
│       │   ├── virtual-fs.ts        # in-memory/virtual filesystem adapter
│       │   ├── constrained-bash.ts  # shell restriction adapter
│       │   └── remote-container.ts  # optional remote/container adapter
│       ├── package.json
│       └── tsconfig.json
│
├── infra/
│   ├── cloudflare/
│   │   ├── tunnel/
│   │   │   └── cloudflared.yaml
│   │   └── access/
│   │       └── access-policy.yaml
│   │
│   └── docker/
│       ├── compose/
│       │   ├── docker-compose.dev.yml
│       │   ├── docker-compose.prod.yml
│       │   └── .env.example
│       └── Dockerfile.node
│
├── workspaces/
│   ├── default/
│   │   ├── config.yaml               # workspace definition
│   │   ├── wiki/                     # shared knowledge
│   │   │   ├── index.md
│   │   │   ├── architecture/
│   │   │   ├── projects/
│   │   │   ├── concepts/
│   │   │   └── .agent-wiki/
│   │   │
│   │   └── workers/
│   │       ├── alice/
│   │       │   ├── transcript.jsonl
│   │       │   ├── audit.jsonl
│   │       │   ├── workspace/
│   │       │   └── scratch/
│   │       │
│   │       ├── ben/
│   │       │   ├── transcript.jsonl
│   │       │   ├── audit.jsonl
│   │       │   ├── workspace/
│   │       │   └── scratch/
│   │       │
│   │       └── maya/
│   │           ├── transcript.jsonl
│   │           ├── audit.jsonl
│   │           ├── workspace/
│   │           └── scratch/
│   │
│   └── mobile-gateway-sandbox/
│       ├── config.yaml
│       ├── wiki/
│       └── workers/
│
├── docs/
│   ├── specs/
│   │   ├── architecture.md              # (this file)
│   │   ├── implementation-strategy.md
│   │   ├── agent-wiki-prd.md
│   │   ├── pi-mono-iphone-gateway-prd.md
│   │   ├── adr/
│   │   │   ├── 0001-headless-runtime.md
│   │   │   └── 0002-config-driven-workers.md
│   │   └── runbooks/
│   │       ├── local-development.md
│   │       ├── deployment.md
│   │       └── troubleshooting.md
│   └── kanban/
│       ├── README.md                   # how epics/features are tracked
│       ├── epics/
│       │   ├── doing/
│       │   ├── done/
│       │   ├── planned/
│       │   └── unplanned/
│       └── stories/
│           ├── doing/
│           ├── done/
│           ├── planned/
│           └── unplanned/
│
├── .github/
│   ├── skills/
│   │   ├── README.md                   # agent development skill catalog
│   │   ├── build-story/
│   │   ├── plan-epic/
│   │   └── plan-story/
│   └── workflow/
│       ├── ci.yml                      # quality gates
│       ├── test.yml                    # unit/integration tests
│       └── release.yml                 # build and release pipeline
│
├── .vscode/
│   ├── settings.json
│   ├── tasks.json
│   ├── launch.json
│   └── extensions.json
│
├── package.json                    # Root orchestration
├── pnpm-workspace.yaml             # pnpm monorepo
├── turbo.json                      # Turbo build orchestration
├── tsconfig.json                   # Shared TypeScript config
├── .eslintrc.json
├── .prettierrc.json
└── README.md
```

---

## 4. Core Runtime Layer

The core runtime is the headless execution engine. It is **not** a UI; it does not depend on TUI libraries, web frameworks, or any interface-specific code.

### 4.1 Core Responsibilities

1. **Session Lifecycle Management**
   - Create, resume, fork, and terminate sessions.
   - Manage session state (idle, running, paused, completed, error).
   - Track session history and metadata.

2. **Worker Management**
   - Launch worker processes (each running pi-mono or another agent runtime).
   - Isolate each worker's execution context (root folder, permissions, tools).
   - Monitor worker health and uptime.
   - Handle worker restarts and graceful shutdowns.

3. **Sandbox and Shell Control**
  - Create one sandbox per worker according to configured policy.
  - Enforce filesystem boundaries and constrained shell semantics.
  - Support pluggable sandbox backends (virtual, local-mounted, remote container).
  - Make persistence behavior explicit and configurable.

4. **Routing & Messaging (Plumbing Only)**
   - Deliver messages between workers (and between external callers and workers).
   - Assign and propagate correlation IDs so senders can match responses to requests.
   - Persist all messages durably before delivery (append-only).
   - Enforce per-worker messaging permissions (allowlist).
  - **The router does not orchestrate, route by capability, schedule, or rank workers.** Coordination is the responsibility of a designated worker (for example, `maya`), not the runtime.

5. **Storage Access**
  - Read/write/delete wiki content (with optional ACLs).
   - Manage worker-specific state folders.
   - Persist transcripts and audit logs as append-only JSON Lines.
   - Handle locking and conflict detection.

6. **API Surface**
   - RESTful or gRPC API for all interface clients.
   - Event streaming (SSE or WebSocket).
   - Schema-validated requests and responses.

### 4.2 Core Runtime API (High Level)

All interfaces call these APIs. Implementation is independent of transport.

**API Boundary Model:**

1. **SessionAPI**: Channel-facing. Used by TUI, mobile gateway, CLI channels, web channels. Owns caller conversation lifecycle, not worker state.
2. **WorkerManagerAPI**: Operator-facing. Used by admin/ops tools, internal supervisors, and debugging interfaces. Owns worker lifecycle, status, and messaging.
3. **RouterAPI**: Internal plumbing. Delivers messages between workers and callers; enforces permissions and correlation tracking.
4. **RuntimeConfigAPI**: System-level. Lists workspaces and retrieves configuration; used by operators and channel initialization.

**Workspace vs. Session:**

- A workspace is a long-lived deployment boundary containing workers, configuration, and shared state.
- A session is a caller interaction context within a workspace (or specified at session creation time).
- Sessions reference a workspace ID at creation time; workspaces are queried via RuntimeConfigAPI.

Wiki access semantics (boundary):

1. Wiki capabilities are exposed through the wiki CLI and worker skills/tools.
2. The core runtime API surface does not expose wiki CRUD endpoints at this level.
3. Wiki revision/versioning behavior is defined in the wiki PRD.

```typescript
// Channel-facing interaction lifecycle
interface SessionAPI {
  // Channels first call RuntimeConfigAPI.listWorkspaces(), then create a session in the chosen workspace.
  createSession(workspaceId: WorkspaceId, config: SessionConfig): Promise<SessionId>;
  resumeSession(sessionId: SessionId): Promise<SessionHandle>;
  forkSession(sessionId: SessionId): Promise<SessionId>;
  getSessionStatus(sessionId: SessionId): Promise<SessionStatus>;
  terminateSession(sessionId: SessionId): Promise<void>;
  // Returns both a messageId and a correlationId. The correlationId is used to
  // subscribe to SSE events related to this specific exchange (see subscribeToEvents).
  sendMessage(sessionId: SessionId, text: string): Promise<{ messageId: MessageId; correlationId: string }>;
  abortRun(sessionId: SessionId, runId: RunId): Promise<void>;
  subscribeToEvents(sessionId: SessionId): AsyncIterable<Event>;
}

// Session configuration
interface SessionConfig {
  identity?: string;        // caller identity (for audit/logging)
  metadata?: Record<string, unknown>;
}

interface SessionStatus {
  sessionId: SessionId;
  workspaceId: WorkspaceId;
  state: "active" | "idle" | "completed" | "error";
  createdAt: ISO8601Timestamp;
  lastActivityAt: ISO8601Timestamp;
}

// Runtime configuration (system-level; used by operators and internal components)
interface RuntimeConfigAPI {
  // List all available workspaces in this runtime instance.
  listWorkspaces(): Promise<WorkspaceInfo[]>;
  // Get the configuration of a specific workspace.
  getWorkspaceConfig(workspaceId: WorkspaceId): Promise<WorkspaceConfig>;
}

// Worker management (operator/runtime facing; ID-based, stateless)
interface WorkerManagerAPI {
  // List all workers in a workspace.
  listWorkers(workspaceId: WorkspaceId): Promise<WorkerInfo[]>;
  // Get current status of a specific worker.
  getWorkerStatus(workerId: WorkerId): Promise<WorkerStatus>;
  // Send a message to a worker (used for commands like /status, /abandon).
  sendToWorker(
    workerId: WorkerId,
    message: WorkerMessage
  ): Promise<MessageId>;
  // Get the full transcript for a worker.
  getWorkerTranscript(workerId: WorkerId): Promise<Transcript>;
  // Subscribe to worker lifecycle events (started, running, idle, error, stopped).
  subscribeToWorkerEvents(workerId: WorkerId): AsyncIterable<WorkerEvent>;
}

// Type definitions for the above APIs

type WorkspaceId = string;  // e.g., "default", "mobile-gateway-sandbox"
type WorkerId = string;     // e.g., "alice", "ben", "maya"
type SessionId = string;
type MessageId = string;
type RunId = string;

interface WorkspaceInfo {
  id: WorkspaceId;
  name: string;
  description?: string;
  workerCount: number;
  createdAt: ISO8601Timestamp;
  lastModifiedAt: ISO8601Timestamp;
}

interface WorkspaceConfig {
  // Full workspace configuration (as defined in workspaces/<id>/config.yaml).
  // The shape is owned by packages/config/src/types.ts.
  // Includes worker definitions, permissions, sandbox policies, etc.
  [key: string]: unknown;
}

interface WorkerInfo {
  id: WorkerId;
  workspaceId: WorkspaceId;
  name: string;              // Digital worker has a name (models a human worker, not a role type)
  status: "created" | "starting" | "ready" | "running" | "paused" | "error" | "stopped";
  rootFolder: string;
  createdAt: ISO8601Timestamp;
  startedAt?: ISO8601Timestamp;
  lastHeartbeat?: ISO8601Timestamp;
}

interface WorkerStatus {
  workerId: WorkerId;
  state: "idle" | "running" | "paused" | "error" | "stopped";
  queueDepth: number;
  commandQueueDepth: number;
  currentObjectiveId?: string;
  currentObjectiveSummary?: string;
  innerLoopIterations?: number;
  outerContextSnapshot?: {
    activeThemes: string[];
    openTaskCount: number;
    lastObjectiveResult?: "success" | "partial" | "failed" | "abandoned";
    lastUpdatedAt: ISO8601Timestamp;
  };
  errorMessage?: string;
  uptime?: number;           // seconds
}

interface WorkerEvent {
  workerId: WorkerId;
  type: "started" | "running" | "idle" | "paused" | "error" | "stopped";
  timestamp: ISO8601Timestamp;
  data?: Record<string, unknown>;
}

type ISO8601Timestamp = string;
```

**Channel Initialization (Workspace Discovery):**

Channels initialize by calling `RuntimeConfigAPI.listWorkspaces()` to discover available workspaces, typically at startup or on user request. The channel then:
1. Lets the user (or config) choose a workspace.
2. Calls `SessionAPI.createSession(workspaceId, sessionConfig)` to create a session in that workspace.
3. Sends messages and subscribes to events through the session for the remainder of the interaction.

This ensures workspaces and workers are discovered dynamically, not hardcoded.

```typescript
// Routing & messaging (plumbing only)
interface RouterAPI {
  // Deliver a message to a worker. Returns immediately with a correlation handle.
  send(message: WorkerMessage): Promise<{ messageId: string; correlationId: string }>;

  // Subscribe to messages for a given correlation (e.g. responses to an earlier request).
  subscribeByCorrelation(correlationId: string): AsyncIterable<WorkerMessage>;

  // Subscribe to all messages addressed to a specific worker (used by the worker itself).
  subscribeForWorker(workerId: WorkerId): AsyncIterable<WorkerMessage>;

  // Inspect the current inbox of a worker without consuming messages.
  peekInbox(workerId: WorkerId): Promise<WorkerMessage[]>;
}
```

### 4.3 Sandbox Architecture

Each worker gets a local-mounted sandbox created at startup, configured as part of the worker's pi-mono process setup. The sandbox persists for the worker's lifetime and is where the worker executes all commands and stores state.

There is no separate runtime-level sandbox API surface in this architecture.

Sandbox root, workspace boundary rules, and shell allowlist policy are passed as part of each worker's pi-mono startup configuration. After startup, pi-mono owns file I/O and shell execution within those configured boundaries.

This keeps the architecture simple: one long-lived pi-mono process per digital worker, each with one long-lived local-mounted sandbox.

---

## 5. Interface Layer (Stateless Clients)

All interfaces are stateless views of the core runtime. They send intents; they do not own state.

### 5.1 TUI (Node.js)

**Runtime choice:** The entire monorepo standardises on Node.js. There are no Deno apps. This is a deliberate simplification choice: one toolchain, one type system flow, one CI matrix, one developer onboarding path.

**Responsibility:** Interactive terminal interface.

- Displays current session status and worker roster.
- Allows user to compose messages and send them.
- Streams responses from the runtime in real-time.
- Shows worker activity and recent events.
- Provides commands for session control and worker inspection.

**Implementation:** Calls core-runtime API over IPC or local socket.

### 5.2 Mobile Gateway (Node.js)

**Responsibility:** Secure remote ingress for external clients (including Management Web UI and iPhone app).

- Authenticates via Cloudflare Access.
- Exposes session and chat APIs.
- Streams events via Server-Sent Events.
- Enforces workspace boundaries.
- Persists audit logs.

**Implementation:** Calls core-runtime API, forwards Cloudflare identity to authorization layer.

### 5.3 Management Web UI (Node.js)

**Responsibility:** Browser-based operational console for managing digital workers.

- Displays workspace and worker status.
- Starts sessions and sends messages to workers.
- Shows transcripts, events, and audit-friendly activity views.
- Supports operator controls (pause/resume/stop flows as exposed by runtime APIs).

**Implementation:** Uses the Mobile Gateway APIs only. It does not call core runtime directly.

### 5.4 iPhone Mobile App

**Responsibility:** Mobile-first user interface for interacting with the same long-lived digital workers.

- Starts or resumes user sessions.
- Sends prompts/messages and receives streamed worker responses.
- Displays worker activity and recent context relevant to the session.

**Implementation:** Uses the Mobile Gateway APIs only. It does not call core runtime directly.

### 5.5 Agent Wiki CLI (Node.js)

**Responsibility:** Command-line interface for wiki operations.

- Search, read, create, append, delete wiki pages.
- Validate links and backlinks.
- Maintain the wiki index.

**Implementation:** Calls wiki core service (can be co-located or remote).

### 5.6 Agent Wiki Web UI (Node.js, Astro)

**Responsibility:** Browser-based wiki browsing and editing.

- Display wiki pages with links.
- Search across the wiki.
- Edit pages with preview.

**Implementation:** Astro is chosen as the closest Node-native equivalent to Deno Fresh: file-based routing, server-rendered pages, optional islands for interactivity, and minimal client-side JavaScript by default. It calls the same wiki core service as the CLI.

---

## 6. Digital Workers Model

A digital worker is an isolated agent execution unit. Each worker:

- Runs one instance of the agent runtime (pi-mono or compatible).
- Has its own root folder (protected by workspace boundary checks).
- Has explicit permissions (which tools it can use, which workers it can message).
- Maintains its own transcript and audit log.
- Can access the shared wiki (read-only or with controlled write access).

### 6.1 Worker Definition (in Configuration)

**Note on coordination.** The runtime does not contain an orchestrator. If task routing, decomposition, or coordination is required, it is performed by a worker (for example, `maya`), using exactly the same messaging primitives every other worker uses. The example below includes such a worker, but it has no special privileges from the runtime; only its configured identity and permissions.

Note on shell access: there is no per-worker `bash` boolean. Shell behaviour is controlled by sandbox settings provided at worker startup (see section 4.3) so policy cannot be contradicted by an individual worker entry.

```yaml
workers:
  - id: alice
    name: "Alice"
    description: "Designs system architecture"
    rootFolder: ./workers/alice
    tools:
      read: true
      write: true
      web_fetch: true
      wiki:
        read: true
        search: true
        append: true
    permissions:
      can_message: [ben, maya]
      can_receive_from: [ben, maya]
      max_concurrent_tasks: 1
      task_timeout_seconds: 600
      memory_limit_mb: 2048
    runtime:
      agentRuntime: pi-mono
      mode: rpc
      apiEnvName: ANTHROPIC_API_KEY        # env var holding the model API key
      model: claude-opus-4.7
    compaction:
      enabled: true
      strategy: plugin
      plugin: distill
      pluginCommand: distill --format json
      outputSchema: canonical-v1
      thresholds:
        transcriptBytes: 2000000           # ~2 MB
        innerLoopIterations: 50
        objectiveContextTokens: 30000
      trigger:
        - objective-completed
        - objective-abandoned
        - transcript-threshold
      fallback:
        # Used when the configured plugin fails, times out, or returns invalid output.
        strategy: crude
        description: |
          Truncate transcript to the last N entries, emit a minimal
          CompactionArtifactV1 with empty learnings/heuristics and the raw
          last-N inner-loop summary as the only memory entry. Never block
          the outer loop; always succeed.

  - id: ben
    name: "Ben"
    description: "Gathers and verifies information"
    rootFolder: ./workers/ben
    tools:
      read: true
      write: false
      web_fetch: true
      wiki:
        read: true
        search: true
        append: true
    permissions:
      can_message: [alice, maya]
      can_receive_from: [alice, maya]
      max_concurrent_tasks: 1
      task_timeout_seconds: 400
      memory_limit_mb: 1024
    runtime:
      agentRuntime: pi-mono
      mode: rpc
      apiEnvName: ANTHROPIC_API_KEY
      model: claude-sonnet-4.5

  - id: maya
    name: "Maya"
    description: "Routes work and manages collaboration between workers."
    rootFolder: ./workers/maya
    tools:
      read: false
      write: false
      wiki:
        read: true
        search: true
        append: true
    permissions:
      can_message: [alice, ben]
      can_receive_from: [alice, ben]
      max_concurrent_tasks: 3
      task_timeout_seconds: 300
      memory_limit_mb: 512
    runtime:
      agentRuntime: pi-mono
      mode: rpc
      apiEnvName: ANTHROPIC_API_KEY
      model: claude-sonnet-4.5
```

### 6.2 Worker Lifecycle

```
┌─────────────┐
│   Created   │  (defined in config, not yet running)
└──────┬──────┘
       │ start()
       ▼
┌─────────────┐
│  Starting   │  (process launching, waiting for readiness)
└──────┬──────┘
       │ ready
       ▼
┌─────────────┐
│    Idle     │  (ready, waiting for work)
└──────┬──────┘
       │ receive message
       ▼
┌─────────────┐
│   Running   │  (executing task)
└──────┬──────┘
       │ complete/error
       ▼
┌─────────────┐
│    Idle     │  (back to waiting for work)
└──────┬──────┘
       │ stop()
       ▼
┌─────────────┐
│  Stopping   │  (graceful shutdown)
└──────┬──────┘
       │ exited
       ▼
┌─────────────┐
│   Stopped   │  (can be restarted)
└─────────────┘
```

### 6.3 Worker Isolation

Each worker is isolated from every other:

| Aspect | Isolation |
|--------|-----------|
| Root folder | Separate, no cross-access |
| Sandbox filesystem | Explicit sandbox per worker |
| Filesystem permissions | Scoped to worker root + wiki root only |
| Shell access | Constrained by per-worker shell policy |
| Transcript | Private to that worker |
| Audit log | Private to that worker |
| Execution context | Separate OS process or container |
| Tools | Defined by worker config |
| Messaging | Explicit allowlist only |

### 6.4 Single-Execution-Loop Principle (Outer + Inner)

**Each worker runs exactly one serial execution loop, in its own OS process.**

Each worker is launched by the worker manager as a separate OS process running the agent runtime (currently `pi-mono`) in **RPC mode**. The worker manager and router communicate with the worker process over RPC; the worker never imports core-runtime code in-process. This gives clean isolation, independent crash domains, and simple resource accounting. With a small number of workers and pi-mono’s short startup, the overhead is negligible.

Inside that single loop there are two phases:

1. **Outer loop (decision loop):** waits for inbound messages, decides which message to attend to next based on priority and judgement, formulates the objective, evaluates completion, decides persistence/escalation.
2. **Inner loop (tool loop):** executes the current objective with tool usage and objective-scoped context.

This is a key architectural constraint.

**Outer loop behavior (authoritative):**

- The worker waits (does not pop) until at least one message is present in the inbox. Timeout is effectively infinite (idle forever is expected behaviour).
- The outer loop **inspects all queued messages** and selects the next one to attend to based on priority, correlation, and the worker’s own judgement. It is not a strict FIFO; the inbox is a *queue of pending work*, not a strict pipeline.
- The selected message is then consumed (removed from the inbox) and processed.
- The worker uses judgment to formulate/refine the objective and plan, even when the incoming message includes an explicit objective.
- On inner-loop completion, the outer loop decides whether the objective is achieved.
- If achieved, outer loop persists outcome, requests memory/wiki updates, then clears inner-loop context.
- If not achieved, outer loop marks task incomplete and determines next action (including asking another worker for support).

```
Worker Outer Loop (pseudocode):

while worker_is_running:
  0. If command queue is non-empty, execute commands immediately in order
  1. wait_blocking(inbox.non_empty OR command_queue.non_empty, timeout = INFINITE)
  2. if command_queue.non_empty: continue   # commands handled at step 0
  3. pending = inbox.peek_all()
  4. message = select_next(pending, priority, outer_context, judgement)
  5. inbox.consume(message.id)
  6. objective = derive_objective(message, worker_role, outer_context)
  7. plan = create_plan(objective, outer_context)
  8. outcome = run_inner_loop(objective, plan, objective_context)
  9. achieved = evaluate_objective(outcome, objective)
  10. if achieved:
        a. persist full inner-loop log to transcript/audit
        b. persist summary/insights to memory
        c. decide implicit wiki updates (outer-loop decision)
        d. clear objective_context
      else:
        a. mark task incomplete in task list
        b. determine follow-up action
        c. request support/delegation from other workers as needed
  11. update outer_context and task list
```

```
Worker Inner Loop (pseudocode):

while objective_not_complete and outer_loop_allows_continue:
  1. check cancellation token (set by /abandon or /shutdown); if cancelled, return abandoned outcome
  2. reason over objective_context
  3. choose next tool/action
  4. execute tool/action (LLM and tool calls must honour the cancellation token / AbortController)
  5. append full step/result to inner-loop log
  6. update objective_context
  7. if explicit wiki write is part of objective, execute it
return structured_outcome
```

**Cancellation semantics.** `/abandon` and `/shutdown` set a cancellation token observed by the inner loop between tool calls and propagated to the underlying LLM/tool call (e.g. `AbortController`). The inner loop is not interrupted mid-tool-call by force; it is interrupted at the next checkpoint. `/status` is answered from a side-channel snapshot of the worker state and never blocks behind the inner loop.

**Why this model is preferred:**

1. **Simplicity:** One worker loop is easy to reason about and debug.
2. **Determinism:** Message and command handling order is explicit and auditable.
3. **Cognitive separation:** Outer loop handles judgment and completion; inner loop handles execution.
4. **Durable memory:** Full execution history is retained while summaries are distilled.
5. **Collaboration:** Incomplete objectives naturally trigger inter-worker support.

**Concurrency model:**

- **Within a worker:** Sequential, serial processing through one loop.
- **Between workers:** Fully concurrent; each worker has its own loop.
- **Commands:** Preempt normal inbox processing and execute immediately in order.

**State model with dual contexts:**

```typescript
interface WorkerState {
  id: WorkerId;
  status: "idle" | "running" | "paused" | "error" | "stopped";
  currentMessageId?: string;
  currentObjectiveId?: string;
  lastProcessedMessageId: string;
  inbox: WorkerMessage[];
  commandQueue: WorkerCommand[];        // immediate commands
  outbox: WorkerMessage[];
  outerContext: Record<string, unknown>; // survives across objectives
  objectiveContext?: Record<string, unknown>; // cleared on objective completion
  taskList: WorkerTask[];
  transcript: Transcript;               // full inner-loop logs retained
  memorySummary: MemoryEntry[];         // distilled insights
  auditLog: AuditEntry[];
}
```

### 6.5 Immediate Command Channel

Workers support command messages that execute immediately and in-order.

Required commands:

- `/status`: return queue depth, current objective, iterations, context metadata, worker state.
- `/abandon`: abort the current objective, mark incomplete, return control to outer loop.
- `/shutdown`: terminate outer loop immediately and transition worker to `stopped`.

`/status` must expose a lightweight outer-context snapshot, not raw full context.

Recommended `/status` payload:

```typescript
interface WorkerStatusSnapshot {
  workerId: WorkerId;
  state: "idle" | "running" | "paused" | "error" | "stopped";
  queueDepth: number;
  commandQueueDepth: number;
  currentObjectiveId?: string;
  currentObjectiveSummary?: string;
  innerLoopIterations?: number;
  outerContextSnapshot: {
    activeThemes: string[];
    openTaskCount: number;
    lastObjectiveResult: "success" | "partial" | "failed" | "abandoned";
    lastUpdatedAt: ISO8601Timestamp;
  };
}
```

`/abandon` behavior is learning-oriented:

1. Abort current objective execution.
2. Mark task as incomplete/abandoned.
3. Persist full inner-loop log to transcript/audit.
4. Persist distilled experience and learnings to memory.
5. Record a wiki experience entry (explicit page or configured experience journal).
6. Clear objective context and return control to outer loop.

Command execution guarantees:

1. Commands are processed FIFO in a dedicated command queue.
2. Commands preempt normal message processing.
3. Command handling is auditable and persisted.
4. `/shutdown` is terminal and takes precedence over non-terminal commands.

---

## 7. Configuration Model

Configuration is **declarative and versioned with code**.

### 7.1 Workspace Configuration

File: `workspaces/default/config.yaml`

```yaml
workspace:
  id: default
  name: "Default Workspace"
  description: "Single-user local workspace with multiple agents"

  # Shared knowledge store
  wiki:
    root: ./wiki
    indexPath: ./wiki/.agent-wiki

  # Worker definitions
  workers:
    # (see section 6.1 above)

  # Communication policy
  communication:
    # Allow async messaging between workers
    asynchronous: true
    # Per-worker permissions (can_message / can_receive_from) are the
    # authoritative gate. The runtime does not interpose its own approval.
    # Queue undeliverable messages for later retry
    deadLetterQueue: ./state/dlq.jsonl
    # Maximum inbox depth before the router rejects further sends to a worker
    inboxMaxDepth: 1000

  # Environment
  environment:
    WORKSPACE_ROOT: ./workspaces/default
    AGENT_TIMEOUT_SECONDS: 600
    LOG_LEVEL: info
```

### 7.2 Loading and Validation

The config loader:
1. Loads workspace definition from `config.yaml`.
2. Validates schema against zod types.
3. Resolves relative paths (relative to workspace root).
4. Checks that worker roots exist and are readable.
5. Ensures wiki root is writable.
6. Returns a strongly-typed `WorkspaceConfiguration` object.

```typescript
// packages/config/src/loader.ts
export async function loadWorkspaceConfig(
  configPath: string
): Promise<WorkspaceConfiguration> {
  const raw = await readYaml(configPath);
  const validated = WorkspaceConfigSchema.parse(raw);
  
  // Validate paths
  for (const worker of validated.workers) {
    const workerRoot = resolve(dirname(configPath), worker.rootFolder);
    if (!existsSync(workerRoot)) {
      throw new Error(`Worker root does not exist: ${workerRoot}`);
    }
  }
  
  return validated;
}
```

---

## 8. Workspace Management

A workspace is a complete, self-contained deployment unit.

### 8.1 What Defines a Workspace

1. **Configuration file** (`config.yaml`) — declarative definition.
2. **Wiki root** — shared organizational knowledge.
3. **Worker roots** — isolated execution folders for each agent.
4. **State** — transcripts, audit logs, task graphs, message queues.

### 8.2 Multiple Workspaces

You can have multiple workspaces side-by-side:

```
workspaces/
  default/
    config.yaml          # primary workspace
    wiki/
    workers/
  mobile-gateway-sandbox/
    config.yaml          # separate workspace for mobile testing
    wiki/
    workers/
  enterprise/
    config.yaml          # future: enterprise deployment
    wiki/
    workers/
```

Each workspace is fully isolated. Runtime loads one workspace at startup.

### 8.3 Sandbox Persistence Within a Workspace

Each worker workspace may include both persistent and transient filesystem areas.

Recommended layout:

```text
workers/
  alice/
    workspace/        # persistent worker filesystem
    scratch/          # objective-scoped scratch area
    transcript.jsonl
    audit.jsonl
```

Default behavior:

1. `workspace/` persists between executions for that worker.
2. `scratch/` can be cleared after objective completion or abandonment.
3. Learnings from either area are preserved via transcript, memory, and wiki updates.
4. A remote/container sandbox may map these directories to snapshots or volumes instead of host folders.

### 8.4 Workspace Boundaries

Filesystem access is strictly enforced:

- Workers can read/write only within their own `rootFolder`.
- Workers can read the wiki root.
- Workers can write to the wiki root only if configured.
- Any attempt to escape (e.g., `../../../etc/passwd`) is rejected.

Implementation: See [packages/security/src/workspace-boundary.ts](../packages/security/src/workspace-boundary.ts).

---

## 9. Communication and Routing

Workers collaborate through structured, durable messaging. The runtime provides a **router (message bus)** for delivery only. It does not select workers, schedule work, or rank candidates. Coordination is a worker-level responsibility.

### 9.1 Worker-to-Worker Messaging

Workers do not call each other directly. All messages flow through the router. The router:

1. Validates the message schema.
2. Enforces sender/recipient permissions (per-worker `can_message` / `can_receive_from`).
3. Assigns or propagates a **correlation ID** (a new one for a fresh request; the original one for a reply).
4. Persists the message to the durable message log before delivery (append-only).
5. Delivers the message into the recipient worker\u2019s inbox.
6. Allows the sender to subscribe by correlation ID to receive any subsequent responses.

**Send a message via the router:**

```typescript
const { messageId, correlationId } = await router.send({
  id: generateId(),
  from: "alice",
  to: "ben",
  type: "request",
  payload: {
    action: "investigate",
    query: "What is the current state of Cloudflare Tunnel API?",
  },
  createdAt: new Date().toISOString(),
});

// Later, observe responses tagged with this correlation:
for await (const reply of router.subscribeByCorrelation(correlationId)) {
  handle(reply);
}
```

**Receive messages (worker side):**

```typescript
for await (const msg of router.subscribeForWorker("ben")) {
  // The worker's outer loop deposits this into its inbox; selection of
  // which queued message to attend to next is the outer loop's job.
  inbox.deposit(msg);
}
```

Replies set `inReplyTo` to the original message id and reuse the original `correlationId` so multi-turn conversations can be tracked end-to-end.

### 9.2 Message Schema

All worker messages use a unified schema (defined in `packages/protocol`):

```typescript
interface WorkerMessage {
  id: string;                      // unique message ID
  correlationId: string;           // identifies the conversation/exchange
  from: WorkerId | ExternalCallerId;
  to: WorkerId;
  type: "request" | "response" | "event" | "ack" | "command";
  payload: unknown;                // validated by zod
  inReplyTo?: string;              // for responses
  createdAt: ISO8601Timestamp;
  expiresAt?: ISO8601Timestamp;    // optional TTL
  metadata?: {
    priority?: "low" | "normal" | "high";
    requiresAck?: boolean;
    maxRetries?: number;
  };
}
```

### 9.3 Worker Command Schema

Command messages are first-class protocol messages.

```typescript
type WorkerCommandName = "/status" | "/abandon" | "/shutdown";

interface WorkerCommand {
  id: string;
  workerId: WorkerId;
  command: WorkerCommandName;
  args?: Record<string, unknown>;
  createdAt: ISO8601Timestamp;
  issuedBy: string; // worker id or external caller identity
}
```
 

### 9.4 Coordination Is a Worker Responsibility

There is no runtime-level orchestrator that decides which worker should handle a task. If task decomposition, routing, or scheduling is required, it is performed by a worker (for example, `maya`) that:

1. Receives requests via the router like any other worker.
2. Inspects the workspace\u2019s declared worker roster and capabilities (read from configuration).
3. Sends delegated requests to chosen workers via the router with a fresh correlation id.
4. Subscribes to responses by correlation id and consolidates them.

This keeps the runtime's plumbing trivial and pushes all coordination policy into agent reasoning, where it is observable, auditable, and replaceable without code changes.

### 9.5 Task Graph and Outcome Tracking

Where a coordinating worker (or any worker) wants to track multi-step work, it records tasks and outcomes to a durable task log (append-only JSON Lines). The runtime does not maintain this log itself; it provides the storage primitive and the worker writes to it.

```json
{"taskId":"task_001","workerId":"alice","type":"design","status":"submitted","timestamp":"2026-05-09T10:00:00Z"}
{"taskId":"task_001","workerId":"alice","type":"design","status":"accepted","timestamp":"2026-05-09T10:00:01Z"}
{"taskId":"task_001","workerId":"alice","type":"design","status":"running","timestamp":"2026-05-09T10:00:02Z"}
{"taskId":"task_001","workerId":"alice","type":"design","status":"completed","outcome":{"success":true,"result":"..."},"timestamp":"2026-05-09T10:05:00Z"}
```

### 9.6 Structured Inner-Loop Outcome

Inner-loop completion returns a structured outcome to the outer loop.

```typescript
interface InnerLoopOutcome {
  objectiveId: string;
  objectiveText: string;
  achieved: boolean;
  completionReason: "success" | "partial" | "blocked" | "abandoned" | "timeout";
  summary: string;                     // concise handoff for outer loop
  insights: string[];                  // candidate memory entries
  fullLogRef: string;                  // transcript pointer/id
  toolsUsed: string[];
  explicitWikiWrites: string[];        // page ids changed by inner loop
  suggestedImplicitWikiUpdates: string[];
  supportRequests: Array<{ targetWorker: WorkerId; reason: string }>;
  nextActions: string[];
}
```

Rationale: structured outcomes are easier to audit, persist, route, and test than free-form text while still allowing narrative fields (`summary`).

### 9.7 Canonical Compaction Schema

Compaction output is plugin-generated but must conform to one canonical JSON schema.

```typescript
interface CompactionArtifactV1 {
  schemaVersion: "canonical-v1";
  workerId: WorkerId;
  objectiveId?: string;
  source: {
    transcriptRefs: string[];
    generatedAt: ISO8601Timestamp;
    plugin: string;
  };
  summary: {
    objective: string;
    outcome: "success" | "partial" | "failed" | "abandoned";
    keyLearnings: string[];
    pitfalls: string[];
    reusableHeuristics: string[];
    recommendedNextSteps: string[];
  };
  wikiRecommendations: Array<{
    pageId: string;
    section?: string;
    content: string;
    rationale: string;
  }>;
  memoryEntries: Array<{
    key: string;
    value: string;
    confidence: number; // 0..1
    tags: string[];
  }>;
}
```

Constraint: any compaction plugin output must be transformed/validated to `CompactionArtifactV1` before persistence.

---

## 10. Execution Model: How It All Works Together

### 10.1 Startup Sequence

```
1. Configuration loaded (workspaces/default/config.yaml)
2. Workspace paths validated
3. Core runtime initialized
   a. Session manager ready
  b. Worker manager ready
  c. Router ready
4. Workers started in order
   a. alice worker: pi-mono launched in RPC mode
   b. ben worker: pi-mono launched in RPC mode
   c. maya worker: pi-mono launched in RPC mode
5. Wiki index loaded or rebuilt
6. All interfaces can now connect
```

### 10.2 TUI User Sends a Message

```
User types: "Alice, please design a new caching strategy"

1. TUI sends HTTP POST to core runtime:
   POST /api/v1/session/send-message
   { text: "Alice, please design..." }

   Response: { messageId: "msg_123", correlationId: "corr_abc" }
   The TUI uses correlationId to filter the SSE stream to events for this exchange.

2. Core runtime receives message
   a. Logs user message to transcript
   b. Router wraps the user message as a WorkerMessage with correlationId: "corr_abc"
   c. Router delivers message to "alice" worker (the named recipient)
   d. Message deposited into alice's inbox

3. Alice worker polls for messages
   a. Receives the task (WorkerMessage with correlationId: "corr_abc")
   b. pi-mono agent reasons about the task
   c. May call web_fetch, read, write, etc.
   d. Generates response incrementally; reply carries the same correlationId

4. Core runtime streams responses back to TUI, filtered by correlationId:
   SSE event: assistant.delta { correlationId: "corr_abc", text: "I will..." }
   SSE event: assistant.delta { correlationId: "corr_abc", text: " design..." }
   SSE event: assistant.completed { correlationId: "corr_abc", ... }

   A TUI managing multiple concurrent exchanges uses correlationId to route
   each event to the correct conversation view.

5. Transcript updated:
   {"role":"user","text":"Alice, please...","timestamp":"..."}
   {"role":"assistant","text":"I will design...","timestamp":"..."}

6. Optionally, alice appends findings to wiki:
   POST /api/v1/wiki/pages/decisions/caching-strategy/append
   { content: "## 2026-05-09\n\nProposed caching strategy:..." }

7. TUI UI updated with full response
```

### 10.3 Mobile Client (Remote)

```
iPhone user opens https://pi.example.com/chat

1. Cloudflare Access intercepts request
   a. Authenticates user (e.g., user@example.com)
   b. Sets X-Forwarded-Email header
   c. Forwards to local gateway

2. Mobile gateway receives request
   a. Validates Cloudflare identity header
   b. Checks allowlist (user@example.com is allowed)
   c. Creates or resumes session for this user
   d. Returns current session status

3. User sends prompt from iPhone

4. Mobile gateway:
   a. Receives prompt via POST /api/v1/chat/messages
  b. Forwards to core runtime (IPC or socket)
  c. Receives { messageId, correlationId } from runtime
  d. Returns correlationId to the iPhone client for this exchange
  e. Core runtime processes as above

5. Mobile gateway receives events from core runtime
  a. Receives all events on the session stream
  b. Filters events by correlationId for the active mobile exchange
  c. Streams matching events to iPhone via SSE
  d. iPhone renders in real-time

6. All messages audited:
   { timestamp, user_email, action, outcome, ... }
```

---

## 11. Development Workflow

### 11.1 Local Development

All developers work in the monorepo root. One environment.

```bash
# Install dependencies
pnpm install

# Start all services in development mode (in one terminal)
pnpm dev:all

# Or start individually in separate terminals
pnpm dev:runtime                # headless core
pnpm dev:tui                    # TUI client
pnpm dev:gateway                # mobile gateway
pnpm dev:wiki-cli               # CLI (watch mode)
pnpm dev:wiki-web               # Web UI (Astro)

# Tests
pnpm test                       # all tests
pnpm test:contract             # verify API contracts
pnpm test:integration          # end-to-end workflows

# Type checking and linting
pnpm typecheck
pnpm lint
pnpm format
```

### 11.2 Workspace Layout in VS Code

Open the monorepo root as a single workspace folder. Structure:

```
Explorer
├── apps/
├── packages/
├── infra/
├── workspaces/
├── docs/
└── .vscode/
    ├── tasks.json      # pnpm dev:tui, etc.
    └── launch.json     # debug profiles
```

### 11.3 Running Specific Scenarios

```bash
# Scenario: TUI + core runtime only (no mobile gateway)
pnpm dev:runtime &
pnpm dev:tui

# Scenario: Mobile gateway + maya + ben workers
pnpm dev:runtime &
pnpm dev:gateway

# Scenario: Test agent-wiki CLI
cd apps/agent-wiki-cli
pnpm test

# Scenario: Full end-to-end (TUI + Gateway + All workers)
pnpm dev:all
```

---

## 12. Implementation Strategy (Out of Scope)

Build sequencing, MVP slicing, and the order in which the components described above are delivered are **not** part of this architecture document. They are owned by [docs/specs/implementation-strategy.md](specs/implementation-strategy.md), which sequences the epics required to realise this architecture.

This separation is intentional: the architecture is the destination; the implementation strategy is the route. Changing the route should not change the destination.

---

## 13. Design Rules (Non-Negotiable)

1. **One Core Runtime, Many Interfaces**  
   Never duplicate runtime logic in UI code.

2. **UI Never Owns State**  
   State lives in core runtime and storage. UI sends intents and displays results.

3. **Workers Are Isolated**  
   No worker can corrupt another worker's state.

4. **Each Worker Is a Single, Serial Event Loop**  
  Workers process messages sequentially through one outer loop that invokes one objective-scoped inner tool loop. No unbounded concurrency within a worker.

5. **Configuration Drives All Worker Definitions**  
   No hardcoding worker capabilities or permissions.

6. **All Durable State Is Append-Only**  
   Transcripts, audit logs, task graphs: JSON Lines, immutable, recoverable.

7. **Workspace Boundaries Are Enforced**  
   Every filesystem operation checks workspace boundaries before executing.

8. **All Inter-Worker Communication Is Durable**  
   Messages are logged before delivery. Undelivered messages are retried or moved to DLQ.

9. **The Runtime Routes; Workers Coordinate**  
   The runtime provides a message router only. Coordination, decomposition, and task routing are worker responsibilities, not runtime features.

10. **Each Worker Is Its Own OS Process**  
   Workers run as separate processes driven over RPC (currently `pi-mono` in RPC mode). The runtime never imports an agent in-process.

11. **Commands Preempt Work**  
  `/status`, `/abandon`, and `/shutdown` are immediate, ordered, and auditable via a dedicated command queue. `/abandon` and `/shutdown` set a cancellation token observed by the inner loop and propagated to the underlying LLM/tool calls.

12. **Compaction Is Pluggable, With a Mandatory Fallback**  
  Context compaction runs via per-worker plugin strategy (for example, `distill`). If the plugin fails or times out, a crude built-in fallback must succeed and never block the outer loop.

13. **Sandboxing Is Pluggable**  
  Worker isolation depends on a sandbox provider contract, not on any single framework or package.

14. **Sandbox Persistence Is Explicit**  
  Whether a worker filesystem endures between executions must be declared by policy (`ephemeral`, `objective`, `worker`, `workspace`).

15. **Compaction Schema Is Canonical**  
  Plugin diversity is allowed, but persisted compaction output must validate against one canonical JSON schema.

16. **Shell Access Is Allowlist-Only**  
  No system shell is invoked. Each allowed command pins an absolute executable path and an argv regex. Shell metacharacters in argv are rejected. Symlinks are resolved before boundary checks.

17. **Single Runtime: Node.js**  
  The entire monorepo is Node.js. There are no Deno apps. One toolchain, one CI matrix.

18. **API Is Versioned and Stable**  
   Always increment API version when breaking changes are needed. Maintain backward compatibility where possible.

---

## 14. Threat Model

The system is local-first but exposes remote interfaces (mobile gateway via Cloudflare Access) and runs LLM-driven agents that consume untrusted content (web pages, wiki entries written by other agents, user prompts). The threat model below states adversaries, threats, and the controls that address them.

### 14.1 Adversaries

| # | Adversary | Capability |
|---|-----------|------------|
| A1 | Remote network attacker | Can reach the public Cloudflare hostname; cannot bypass Cloudflare Access. |
| A2 | Authenticated remote user | Has valid Cloudflare Access identity; can submit arbitrary prompts. |
| A3 | Malicious LLM output | The model returns text/tool-calls intended to escape the sandbox or exfiltrate data. |
| A4 | Hostile content (web, wiki) | A page or wiki entry contains prompt-injection instructions targeting a worker that reads it. |
| A5 | Compromised dependency | An npm dependency ships malicious code. |
| A6 | Local user with shell access | Out of scope; treated as fully trusted. |

### 14.2 Threats and Controls

| # | Threat | Primary Control |
|---|--------|-----------------|
| T1 | Unauthenticated remote access | Cloudflare Access in front of the gateway; gateway rejects requests without a validated `X-Forwarded-Email` matching the allowlist. |
| T2 | Worker writes outside its `rootFolder` | `packages/security/workspace-boundary` resolves `realpath` and rejects any path not under the allowed root, applied to every fs operation including symlink targets. |
| T3 | Worker executes arbitrary shell command | Allowlist-only `ShellPolicy` (no blocklist), absolute-path pinning, argv regex, no system shell invocation, shell-metacharacter rejection. |
| T4 | Prompt injection from wiki/web content | (a) All ingested external content is wrapped with explicit provenance markers in the worker context. (b) Wiki append from a worker is permission-gated. (c) Workers may not execute tool calls that originated from injected text without an outer-loop confirmation step (planned: see Risk R3). |
| T5 | Cross-worker context leak | Workers run in separate OS processes; transcripts/audit logs are per-worker; the wiki is the only shared write surface and is permission-gated. |
| T6 | Secret exfiltration via LLM output or logs | `packages/security/secrets` redacts known patterns before write to transcript/audit/log; `apiEnvName` is referenced indirectly so the actual value never appears in config. |
| T7 | TOCTOU on filesystem boundary | Symlinks are resolved (`realpath`) and re-checked immediately before the privileged operation; same handle is used for the actual call where the OS supports it. |
| T8 | Runaway token spend | Per-worker `task_timeout_seconds`, `max_concurrent_tasks`, and per-worker compaction thresholds limit growth. (A future `tokenBudget` field is anticipated.) |
| T9 | Compromised dependency | Lockfile pinning, `pnpm audit` in CI, no `postinstall` scripts, dependency review for new packages, allowlist for sandbox adapters. |
| T10 | Denial of service via prompt flood | Gateway rate-limits per-identity; router rejects messages exceeding per-worker inbox depth. |

### 14.3 Out of Scope

- Defending against a compromised local user account (A6).
- Cryptographic guarantees of transcript/audit integrity (current model is append-only files; tamper-evident log is a future extension).
- Multi-tenant isolation between organisations (single-tenant architecture).

---

## 15. State Stores

Every durable surface in the system has a defined schema, writer, reader, growth bound, and compaction/rotation policy. No stateful surface may exist outside this table.

| Store | Path / Location | Schema (package) | Writer | Reader(s) | Growth Bound | Compaction / Rotation |
|-------|-----------------|------------------|--------|-----------|--------------|-----------------------|
| Workspace config | `workspaces/<id>/config.yaml` | `WorkspaceConfigSchema` (config) | Human (git) | Runtime at startup | Bounded by workers count | N/A (versioned in git) |
| Wiki pages | `workspaces/<id>/wiki/**.md` | Markdown + frontmatter | Workers (gated) and humans | All workers, web UI, CLI | Unbounded (human-curated) | Manual / wiki tooling |
| Wiki index | `workspaces/<id>/wiki/.agent-wiki/` | Index format (agent-wiki) | Wiki service | Wiki service | O(pages) | Rebuilt on demand |
| Worker transcript | `workers/<id>/transcript.jsonl` | `TranscriptEntry` (protocol) | Worker (outer+inner) | Worker, transcript viewer | `policy.maxTranscriptSizeMB` | Rotation at threshold; archived per worker |
| Worker audit log | `workers/<id>/audit.jsonl` | `AuditEntry` (protocol) | Worker, runtime | Audit viewer, compliance | `policy.auditLogRetentionDays` | Time-based archival |
| Worker memory summary | `workers/<id>/memory.jsonl` | `MemoryEntry` (protocol) | Compaction output | Worker outer loop | Bounded; compaction merges/evicts | Compaction plugin |
| Worker workspace fs | `workers/<id>/workspace/` | Free-form files | Worker (sandboxed) | Worker | Sandbox quota | Per-worker policy |
| Worker scratch fs | `workers/<id>/scratch/` | Free-form files | Worker (sandboxed) | Worker | Cleared on objective end (config) | Objective-end clear |
| Worker outer context | In-memory, snapshotted to `workers/<id>/outer-context.json` | `OuterContext` (protocol) | Worker outer loop | Worker outer loop, `/status` | Bounded by schema fields (no free bag) | Snapshotted on every objective end |
| Worker inbox | `state/inbox/<workerId>.jsonl` | `WorkerMessage` (protocol) | Router | Worker outer loop | Bounded by `inboxMaxDepth` (config) | Consumed messages truncated periodically |
| Worker command queue | `state/command-queue/<workerId>.jsonl` | `WorkerCommand` (protocol) | Router, gateway, TUI | Worker outer loop | Bounded; commands consumed immediately | Consumed entries truncated |
| Message log | `state/message-log.jsonl` | `WorkerMessage` (protocol) | Router | Audit, replay | Append-only; rotated by size | Size-based rotation |
| Dead-letter queue | `state/dlq.jsonl` | `WorkerMessage` (protocol) | Router | Operator | Append-only | Manual review |
| Sessions | `state/sessions.jsonl` | `Session` (protocol) | Session manager | Session manager, gateway, TUI | Bounded by active sessions | Append-only; old sessions archived |
| Task graph (optional, per-worker) | `workers/<id>/tasks.jsonl` | `TaskRecord` (protocol) | Owner worker | Owner worker | Append-only | Worker-driven |

**`transcript.jsonl`** is the full inner-loop execution log — what the worker thought and did:
- Messages received and sent (full content)
- Every tool call and its result (web_fetch, read, write, shell, etc.)
- The worker's reasoning steps as surfaced by pi-mono
- Compaction artifacts and memory summaries
- Objective start, completion, and abandonment records

This is the raw material for compaction. It may be large and is subject to rotation and archival.

**`audit.jsonl`** is the security and operational audit trail — what the system recorded at the boundary:
- Worker started, stopped, crashed
- Message envelope metadata (sender, recipient, type, correlation ID - not full content)
- Permission checks and rejections (e.g. shell command blocked by allowlist)
- Wiki writes and deletes
- Session creation and termination
- Any action crossing a worker or workspace boundary

Audit entries must be retained and are never compacted away. They are what a compliance or security review reads, not the worker's internal reasoning.

**Rule:** the worker `outerContext` is **not** a free-form bag. It has a typed schema (active themes, open task count, last objective result, last-updated timestamp, plus other strictly-typed fields). Anything not in the schema does not belong in `outerContext`.

---

## 16. Technical Risks and Mitigation

The architecture is sound but rests on assumptions and external components. Risks worth carrying explicitly into the implementation strategy:

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|------------|--------|------------|
| R1 | `pi-mono` RPC mode evolves incompatibly | Medium | High | Pin version; abstract behind a `WorkerRuntime` interface in `core-runtime`; keep one alternative adapter scaffolded. |
| R2 | Compaction plugin (`distill`) is unmaintained or low quality | Medium | Medium | Per-worker fallback is mandatory (Design Rule 12); validate output against `CompactionArtifactV1` before persisting. |
| R3 | Prompt injection from wiki/web bypasses worker judgement | High | High | Spike: design a provenance-tagging protocol for ingested content and an outer-loop confirmation step for tool calls originating from external text. |
| R4 | Cancellation does not propagate cleanly into LLM SDK calls | Medium | Medium | Spike: validate `AbortController` propagation through `pi-mono` to the model SDK; document any residual latency. |
| R5 | Sandbox boundary holes on macOS (case-insensitive FS, symlinks, `/private` aliases) | Medium | High | Spike: write a focused boundary test suite covering symlink traversal, case-folded paths, and `realpath` aliases before relying on `workspace-boundary`. |
| R6 | Astro is overkill or under-powered for the wiki UI | Low | Low | Decision is reversible; the wiki UI calls a stable wiki service boundary (owned by the wiki PRD and consumed by CLI/skills), so the UI framework can be replaced without core-runtime changes. |
| R7 | Cloudflare Access misconfiguration exposes the gateway | Low | High | Infra-as-code in `infra/cloudflare/`; gateway also independently validates `X-Forwarded-Email` and refuses unauthenticated requests. |
| R8 | Per-process worker overhead dominates on small machines | Low | Medium | Worker count is small and pi-mono startup is short in practice; if it ever bites, the WorkerManager interface can host an in-process adapter. |
| R9 | Append-only JSON Lines hits scale limits | Low | Medium | Section 15 defines rotation/archival; storage backend is replaceable via the storage interface. |
| R10 | Schema drift in `WorkerMessage` / `CompactionArtifactV1` breaks replay | Medium | High | Schemas are versioned (`canonical-v1`, etc.); persisted records include `schemaVersion`; migrations live in `packages/protocol`. |

**Spikes called out above (R3, R4, R5)** are implementation-strategy concerns — they belong in `docs/specs/implementation-strategy.md`, not here. They are listed only so the architecture explicitly acknowledges where its assumptions need empirical confirmation.

---

## 17. Future Extensibility

This architecture supports:

- **Multi-user**: Add per-user session namespacing.
- **Distributed workers**: Add gRPC for cross-machine worker communication.
- **Advanced coordinating workers**: Add specialised coordinating workers (e.g. cost-aware routing, ML-driven worker selection) without changing the runtime.
- **Rich UIs**: Add Electron desktop app, native SwiftUI app, without touching runtime.
- **Persistent storage upgrade**: Swap JSON Lines for PostgreSQL without changing interfaces.
- **Performance tuning**: Add caching, indexing, and streaming optimizations.

The key is: **if the change doesn't touch the core API surface, other components don't care**.

---

## 18. References

- [docs/specs/agent-wiki-prd.md](specs/agent-wiki-prd.md) — Agent Wiki product requirements
- [docs/specs/pi-mono-iphone-gateway-prd.md](specs/pi-mono-iphone-gateway-prd.md) — Mobile gateway product requirements
- [packages/protocol/src/config-schema.ts](../packages/protocol/src/config-schema.ts) — Workspace configuration schema
- [packages/core-runtime/README.md](../packages/core-runtime/README.md) — Core runtime implementation guide

---

## Appendix A: Example Workspace Configuration

See [workspaces/default/config.yaml](../workspaces/default/config.yaml) for a complete example with 3 workers.

---

## Appendix B: Security Checklist

See [docs/specs/runbooks/security.md](specs/runbooks/security.md) for worker isolation, audit logging, and secret redaction procedures.

---

## Appendix C: Development Checklist

- [ ] Monorepo scaffolded with pnpm workspaces.
- [ ] Core runtime API defined (packages/protocol).
- [ ] TUI migrated to apps/simple-agent-tui.
- [ ] Configuration loader working.
- [ ] Worker manager launching workers.
- [ ] Basic router delivery and worker-to-worker coordination routing.
- [ ] Mobile gateway skeleton.
- [ ] End-to-end tests passing.
- [ ] Documentation up-to-date.
