# Product Requirements Document: Private iPhone Client for pi-mono

**Document status:** Draft v1.0  
**Date:** 2026-05-08  
**Primary user:** Individual developer/operator running pi-mono locally  
**Working title:** Pi Mobile Gateway  

---

## 1. Executive Summary

This product provides a private mobile interface for interacting with a locally running `pi-mono` coding agent from an iPhone.

The current user experience is based on the pi-mono terminal UI (TUI). This solution intentionally replaces the TUI for the mobile use case. Instead of connecting the iPhone to an existing terminal session, the system runs pi-mono headlessly in RPC mode and exposes a secure, mobile-friendly API through a local Node.js gateway.

Remote access is provided through Cloudflare Tunnel. The local machine establishes an outbound-only tunnel to Cloudflare, and the iPhone connects to a Cloudflare-protected public hostname. No router port forwarding, inbound firewall opening, public IP exposure, or direct private-network exposure is required.

The system consists of three main components:

1. **iPhone client** — a native iPhone app or mobile-first PWA that provides the conversation and control interface.
2. **Local Node.js gateway** — owns the pi-mono runtime session, exposes data-plane and control-plane APIs, streams responses, persists transcripts, and supervises process lifecycle.
3. **Cloudflare Tunnel and Access** — provides secure remote ingress to the local gateway using an outbound connection from the local machine to Cloudflare.

The first implementation should favour a small, robust, single-user, single-session design. The architecture should be clean enough to evolve later into a native SwiftUI app, multi-session support, richer project/workspace switching, file upload, voice input, and deeper observability.

---

## 2. Problem Statement

The user currently uses pi-mono through the TUI on a local machine. This works well when physically present at the machine, but it does not provide a convenient way to:

- interact with pi-mono from an iPhone;
- continue or supervise work while away from the terminal;
- send prompts remotely;
- stream agent output to a mobile client;
- start, restart, stop, or inspect the agent remotely;
- securely expose the local agent without opening inbound access to the private network.

A terminal UI is not the correct abstraction for a mobile client. The iPhone should not remote-control a terminal. It should communicate with a structured API that is specifically designed for mobile interaction, secure remote access, lifecycle control, and event streaming.

---

## 3. Goals

### 3.1 Product Goals

The product must:

- provide a private iPhone-accessible interface to a local pi-mono instance;
- run pi-mono headlessly rather than through the TUI;
- allow the user to hold a conversation with pi-mono from the iPhone;
- stream assistant responses and tool/activity events back to the iPhone;
- expose a control plane for starting, restarting, shutting down, aborting, and checking the status of the pi-mono session;
- use Cloudflare Tunnel so the local machine initiates an outbound connection to Cloudflare;
- avoid opening inbound ports on the home/private network;
- protect access using Cloudflare Access plus gateway-side authorization checks;
- persist transcripts and operational logs locally;
- be sufficiently simple to build incrementally.

### 3.2 Engineering Goals

The implementation should:

- use TypeScript/Node.js for the gateway;
- prefer pi-mono RPC mode for the initial implementation boundary;
- use a stable gateway API so the front end can later change from PWA to native iPhone app;
- support a single active pi-mono session in v1;
- isolate the agent to an explicit workspace root;
- produce auditable logs for prompts, responses, control operations, and errors;
- be deployable locally as a supervised process or Docker Compose service;
- keep the gateway bound to localhost only.

---

## 4. Non-Goals for v1

The first version should not attempt to provide:

- remote control of the existing TUI;
- multiple simultaneous pi-mono sessions;
- multi-user collaboration;
- a full web IDE;
- full filesystem browsing outside approved workspaces;
- native push notifications;
- voice dictation;
- background iOS execution;
- complex project orchestration;
- arbitrary shell execution from the mobile UI;
- public unauthenticated access;
- LAN exposure of the gateway;
- full replication of all TUI features.

These capabilities may be considered later, but they should not complicate the initial build.

---

## 5. Core Design Principle

The system must not treat the iPhone as a terminal emulator.

Instead:

> The Node.js gateway owns a headless pi-mono session and exposes a stable, secure, mobile-friendly API. The iPhone is a first-class client of that API.

This principle avoids the fragility of pseudo-terminal automation and creates a clean separation between runtime, protocol, and user interface.

---

## 6. Users and Personas

### 6.1 Primary User: Local Agent Operator

The primary user is a technically sophisticated individual who:

- runs pi-mono locally;
- understands local development environments;
- wants mobile access to a private coding agent;
- is comfortable configuring Cloudflare Tunnel;
- expects strong control over security and local filesystem access;
- wants a practical mobile experience rather than a toy chat interface.

### 6.2 Secondary Future User: Trusted Personal Operator

A possible future user is another trusted operator who may be granted limited access to the same gateway. This is out of scope for v1 but should influence the authorization model so that multi-user support is not impossible later.

---

## 7. High-Level Architecture

```text
┌────────────────────────┐
│       iPhone Client     │
│  Native app or PWA      │
│  Chat + controls        │
└───────────┬────────────┘
            │ HTTPS + SSE / WebSocket
            │ Cloudflare Access protected
            ▼
┌────────────────────────┐
│    Cloudflare Edge      │
│  Tunnel + Access        │
└───────────┬────────────┘
            │ outbound tunnel already established
            ▼
┌──────────────────────────────┐
│      Local Node.js Gateway    │
│ listens on 127.0.0.1 only     │
│                              │
│ Data plane:                  │
│ - send messages              │
│ - stream responses           │
│ - abort active run           │
│ - read transcript            │
│                              │
│ Control plane:               │
│ - start session              │
│ - restart session            │
│ - shutdown session           │
│ - health/status/logs         │
└───────────┬──────────────────┘
            │ pi-mono RPC mode
            │ JSON lines over stdin/stdout
            ▼
┌──────────────────────────────┐
│          pi-mono              │
│    headless RPC process       │
│    explicit workspace root    │
└──────────────────────────────┘
```

---

## 8. Component Responsibilities

## 8.1 iPhone Client

The iPhone client provides the user-facing experience.

In v1, this may be a mobile-first PWA served by the gateway. A native SwiftUI app can follow once the gateway API stabilizes.

Responsibilities:

- authenticate via Cloudflare Access;
- display current session status;
- allow the user to send prompts/messages;
- render streamed assistant responses;
- show basic tool/activity events;
- show errors in a human-readable form;
- allow aborting the active run;
- allow starting, restarting, and shutting down the pi-mono session;
- display recent conversation history;
- provide a clean mobile-first UI suitable for iPhone Safari or native iOS.

## 8.2 Node.js Gateway

The gateway is the central runtime component.

Responsibilities:

- bind only to `127.0.0.1`;
- expose data-plane and control-plane HTTP APIs;
- supervise the pi-mono process;
- start pi-mono in RPC mode;
- send JSON RPC commands to pi-mono;
- parse JSON line responses/events from pi-mono;
- normalize pi-mono events into a gateway event model;
- stream events to the client using Server-Sent Events in v1;
- persist transcript and audit logs;
- validate Cloudflare Access identity headers;
- enforce gateway-side authorization;
- enforce configured workspace boundaries;
- implement rate limiting and request size limits;
- expose health and diagnostics endpoints;
- provide graceful shutdown behaviour.

## 8.3 pi-mono Runtime

pi-mono is the local coding agent runtime.

Responsibilities:

- run in headless RPC mode;
- receive prompts/commands from the gateway;
- execute agent reasoning and tool usage;
- emit responses and events back to the gateway;
- honour abort/shutdown commands where supported;
- operate within the configured workspace and permissions.

## 8.4 Cloudflare Tunnel and Access

Cloudflare provides secure remote ingress.

Responsibilities:

- allow the local machine to establish an outbound-only tunnel;
- expose a public HTTPS hostname for the iPhone client;
- forward requests over the tunnel to the local gateway;
- require Cloudflare Access authentication before reaching the gateway;
- restrict access to approved user identity or identities;
- avoid any requirement for inbound router port forwarding or public exposure of the local machine.

---

## 9. Deployment Topology

### 9.1 Local Services

The local machine should run:

```text
cloudflared
node-gateway
pi-mono process launched by node-gateway
```

The gateway should listen only on localhost:

```text
127.0.0.1:8787
```

Cloudflare Tunnel should forward from the public hostname to this local address.

Example conceptual tunnel mapping:

```yaml
tunnel: pi-mobile
credentials-file: /path/to/credentials.json

ingress:
  - hostname: pi.example.com
    service: http://127.0.0.1:8787
  - service: http_status:404
```

### 9.2 Network Flow

```text
iPhone
  ↓ HTTPS
Cloudflare Access
  ↓ authorised request
Cloudflare Tunnel
  ↓ outbound tunnel connection
Local cloudflared process
  ↓ localhost
Node gateway
  ↓ RPC
pi-mono
```

### 9.3 Exposure Model

The system exposes a public Cloudflare-protected hostname, but it does not expose the local machine directly.

```text
Public DNS hostname:              yes
Router port forwarding:           no
Inbound firewall opening:         no
Gateway bound to 0.0.0.0:8787:    no
Gateway bound to 127.0.0.1:8787:  yes
Local origin hidden behind tunnel: yes
```

---

## 10. Functional Requirements

## 10.1 Session Lifecycle

### FR-001: View Session Status

The user must be able to view whether pi-mono is:

- not started;
- starting;
- idle;
- running;
- aborting;
- stopping;
- stopped;
- errored.

### FR-002: Start Session

The user must be able to start a pi-mono session from the iPhone client.

Acceptance criteria:

- gateway launches pi-mono in RPC mode;
- session state transitions from `stopped` to `starting` to `idle`;
- startup errors are captured and displayed;
- startup is idempotent if a session is already running.

### FR-003: Restart Session

The user must be able to restart the pi-mono session.

Acceptance criteria:

- active run is terminated or gracefully aborted;
- current process is stopped;
- a new process is launched;
- transcript records the restart operation;
- status is updated correctly.

### FR-004: Shutdown Session

The user must be able to shut down the pi-mono session.

Acceptance criteria:

- gateway attempts graceful shutdown first;
- gateway escalates to process termination after timeout;
- final status is `stopped` or `errored`;
- shutdown operation is audit logged.

### FR-005: Abort Active Run

The user must be able to abort the current pi-mono run.

Acceptance criteria:

- abort is available only when a run is active;
- gateway sends the relevant abort command to pi-mono where supported;
- UI receives an `assistant.aborted` or `run.aborted` event;
- partial transcript is preserved.

---

## 10.2 Conversation

### FR-006: Send User Message

The user must be able to send a prompt/message from the iPhone client.

Acceptance criteria:

- message is accepted only when the session is idle or in a valid input state;
- gateway persists the user message;
- gateway forwards the message to pi-mono;
- UI shows the message immediately.

### FR-007: Stream Assistant Response

The assistant response must stream incrementally to the iPhone client.

Acceptance criteria:

- client opens an event stream;
- gateway emits assistant deltas as they arrive;
- gateway emits a completion event when the response is complete;
- network interruptions do not corrupt the transcript.

### FR-008: Display Tool Activity

The client should display basic pi-mono activity where available.

Examples:

- tool started;
- tool output;
- file edited;
- command executed;
- error encountered;
- run completed.

### FR-009: Read Conversation History

The user must be able to view recent transcript history.

Acceptance criteria:

- gateway persists messages and events locally;
- client can retrieve recent history;
- transcript format is stable and machine-readable.

---

## 10.3 Control Plane

### FR-010: Health Endpoint

The gateway must expose a health endpoint for local and remote diagnostics.

Health should include:

- gateway status;
- pi-mono process status;
- current session id;
- current run id, if any;
- uptime;
- version/build information;
- cloudflared-independent local reachability.

### FR-011: Logs Endpoint

The gateway should expose recent operational logs to the authenticated user.

Acceptance criteria:

- logs are redacted where needed;
- logs do not expose secrets;
- logs are paginated or bounded;
- control-plane access is required.

### FR-012: Configuration Inspection

The user should be able to inspect safe runtime configuration:

- active workspace root;
- pi-mono command path;
- session status;
- enabled features;
- tunnel hostname;
- gateway version.

Secrets must never be returned.

---

## 10.4 Security

### FR-013: Cloudflare Access Required

All remote access must require Cloudflare Access authentication.

### FR-014: Gateway-Side Authorization

The gateway must validate Cloudflare identity headers and enforce an allowlist of approved email addresses or identities.

### FR-015: Localhost Binding

The gateway must bind only to localhost by default.

### FR-016: Control Plane Protection

Control-plane endpoints must require stronger authorization checks than basic data-plane endpoints.

At minimum:

- validated Cloudflare identity;
- allowlisted admin user;
- audit logging;
- CSRF protection if browser cookies are used.

### FR-017: Workspace Boundary

The gateway configuration must define an explicit workspace root.

The system should not expose arbitrary filesystem roots through the mobile UI.

### FR-018: Audit Logging

The system must audit:

- login identity observed by gateway;
- prompts submitted;
- control operations;
- process starts/stops/restarts;
- aborts;
- errors;
- configuration changes.

### FR-019: Request Limits

The gateway must enforce:

- maximum prompt size;
- maximum request body size;
- rate limits;
- timeout limits;
- maximum concurrent event streams per user/session.

---

## 11. API Requirements

The API should be versioned under `/api/v1`.

## 11.1 Status

```http
GET /api/v1/status
```

Example response:

```json
{
  "gateway": {
    "status": "ok",
    "version": "0.1.0",
    "uptimeSeconds": 931
  },
  "session": {
    "id": "sess_20260508_001",
    "state": "idle",
    "startedAt": "2026-05-08T10:15:00Z"
  },
  "pi": {
    "processId": 12345,
    "state": "running"
  }
}
```

## 11.2 Start Session

```http
POST /api/v1/session/start
```

Request:

```json
{
  "workspace": "default"
}
```

Response:

```json
{
  "sessionId": "sess_20260508_001",
  "state": "starting"
}
```

## 11.3 Restart Session

```http
POST /api/v1/session/restart
```

Response:

```json
{
  "sessionId": "sess_20260508_002",
  "state": "starting"
}
```

## 11.4 Shutdown Session

```http
POST /api/v1/session/shutdown
```

Response:

```json
{
  "state": "stopping"
}
```

## 11.5 Send Message

```http
POST /api/v1/chat/messages
```

Request:

```json
{
  "text": "Please inspect the current repo and summarise the architecture.",
  "metadata": {
    "source": "iphone"
  }
}
```

Response:

```json
{
  "messageId": "msg_123",
  "runId": "run_456",
  "state": "accepted"
}
```

## 11.6 Stream Events

```http
GET /api/v1/chat/events
```

Use Server-Sent Events for v1.

Example events:

```text
event: session.status
data: {"state":"running"}

event: assistant.delta
data: {"messageId":"msg_124","text":"I have inspected"}

event: assistant.delta
data: {"messageId":"msg_124","text":" the repository."}

event: assistant.completed
data: {"messageId":"msg_124","runId":"run_456"}
```

## 11.7 Abort Active Run

```http
POST /api/v1/chat/abort
```

Response:

```json
{
  "runId": "run_456",
  "state": "aborting"
}
```

## 11.8 Get History

```http
GET /api/v1/chat/history?limit=50
```

Response:

```json
{
  "messages": [
    {
      "id": "msg_123",
      "role": "user",
      "text": "Please inspect the current repo.",
      "createdAt": "2026-05-08T10:20:00Z"
    },
    {
      "id": "msg_124",
      "role": "assistant",
      "text": "I have inspected the repository...",
      "createdAt": "2026-05-08T10:20:05Z"
    }
  ]
}
```

---

## 12. Event Model

The gateway should normalize raw pi-mono RPC events into a stable internal event schema.

### 12.1 Event Envelope

```json
{
  "id": "evt_001",
  "type": "assistant.delta",
  "sessionId": "sess_001",
  "runId": "run_001",
  "timestamp": "2026-05-08T10:20:01Z",
  "payload": {}
}
```

### 12.2 Required Event Types

```text
session.starting
session.ready
session.running
session.idle
session.stopping
session.stopped
session.error

user.message
assistant.delta
assistant.completed
assistant.aborted

run.started
run.completed
run.failed
run.aborted

tool.started
tool.output
tool.completed
tool.failed

control.start_requested
control.restart_requested
control.shutdown_requested
control.abort_requested

error
```

---

## 13. Persistence Requirements

The gateway should persist local state using simple file-backed storage in v1.

Recommended directory structure:

```text
~/.pi-mobile-gateway/
  config.json
  sessions/
    sess_20260508_001/
      transcript.jsonl
      events.jsonl
      audit.jsonl
      metadata.json
  logs/
    gateway-2026-05-08.log
  workspaces/
    default/
```

### 13.1 Transcript Format

Use JSON Lines so transcripts are append-only and recoverable.

Example:

```json
{"type":"user.message","messageId":"msg_001","text":"Hello","timestamp":"2026-05-08T10:00:00Z"}
{"type":"assistant.completed","messageId":"msg_002","text":"Hello. How can I help?","timestamp":"2026-05-08T10:00:03Z"}
```

### 13.2 Audit Format

Audit entries should include:

- timestamp;
- authenticated identity;
- action;
- endpoint;
- session id;
- outcome;
- error details where applicable;
- request id.

Do not store secrets.

---

## 14. Security Requirements

## 14.1 Threat Model

This system exposes a local coding agent through a remote mobile interface. Depending on pi-mono configuration, the agent may read files, edit files, run commands, and interact with developer workspaces.

The primary risks are:

- unauthorized remote access;
- accidental public exposure;
- control-plane abuse;
- malicious prompt injection causing unintended local actions;
- filesystem overreach;
- secret leakage through logs or transcripts;
- tunnel misconfiguration;
- loss of mobile device;
- session hijacking;
- denial of service through repeated prompts or event streams.

## 14.2 Required Controls

Minimum v1 controls:

```text
Cloudflare Access enabled
Gateway validates Cloudflare identity headers
Gateway allowlists approved identity
Gateway binds to 127.0.0.1 only
Control plane is separately authorized
Prompt and request size limits
Audit logging
Workspace root configured explicitly
Secrets redacted from logs
No unauthenticated endpoints except local health if explicitly configured
```

## 14.3 Gateway Authorization

The gateway should have configuration like:

```json
{
  "auth": {
    "enabled": true,
    "allowedEmails": ["user@example.com"],
    "adminEmails": ["user@example.com"],
    "trustCloudflareAccess": true
  }
}
```

The gateway should reject requests where:

- Cloudflare Access identity headers are absent;
- the identity is not on the allowlist;
- admin operation is attempted by a non-admin identity;
- request origin/session validation fails.

## 14.4 Emergency Local Kill

The system should document an emergency local kill command.

Examples:

```bash
pkill -f pi-mobile-gateway
pkill -f pi-mono
cloudflared tunnel cleanup pi-mobile
```

The exact command names should be adjusted for the final process names.

---

## 15. iPhone Client Requirements

## 15.1 v1 PWA Requirements

A mobile-first PWA is recommended for v1.

Required screens:

1. **Connection / Status Screen**
   - authenticated identity;
   - gateway status;
   - pi session status;
   - start/restart/shutdown controls.

2. **Conversation Screen**
   - message list;
   - streaming assistant output;
   - input composer;
   - send button;
   - abort button;
   - activity indicator.

3. **Activity / Logs Screen**
   - recent tool events;
   - recent errors;
   - recent control actions.

4. **Settings Screen**
   - active hostname;
   - workspace selection, if enabled;
   - app version;
   - privacy/security information.

## 15.2 UI Principles

The UI should be:

- fast;
- minimal;
- readable on iPhone;
- resilient to reconnects;
- explicit about agent state;
- cautious around destructive controls;
- clear when the agent is running, idle, aborted, or errored.

## 15.3 Native iPhone App Future Requirements

A native SwiftUI app may later add:

- Face ID local unlock;
- local encrypted cache;
- native share sheet support;
- file/photo upload;
- voice dictation;
- background notifications;
- better offline handling;
- Apple Shortcuts integration.

---

## 16. Gateway Implementation Requirements

## 16.1 Suggested Technology Stack

```text
Runtime: Node.js LTS
Language: TypeScript
HTTP server: Fastify or Hono
Streaming: Server-Sent Events
Process supervision: child_process.spawn initially
Persistence: local JSONL files initially
Validation: Zod or TypeBox
Logging: pino
Configuration: JSON or YAML
Deployment: local service, launchd, systemd, or Docker Compose
```

## 16.2 pi-mono Integration

Initial approach:

```text
Node gateway launches pi-mono in RPC mode as a subprocess.
Commands are sent to stdin as JSON lines.
Responses/events are read from stdout as JSON lines.
```

Possible future approach:

```text
Node gateway imports AgentSession directly from the pi-mono package.
```

The gateway should hide this implementation detail behind an internal interface:

```ts
interface PiSessionDriver {
  start(options: StartOptions): Promise<void>;
  stop(): Promise<void>;
  restart(options: StartOptions): Promise<void>;
  sendMessage(text: string): Promise<RunRef>;
  abort(runId?: string): Promise<void>;
  onEvent(handler: (event: PiRawEvent) => void): void;
  getStatus(): PiSessionStatus;
}
```

This allows changing from subprocess RPC to direct `AgentSession` later without rewriting the API or mobile client.

---

## 17. Configuration Requirements

Example gateway configuration:

```json
{
  "server": {
    "host": "127.0.0.1",
    "port": 8787,
    "publicBaseUrl": "https://pi.example.com"
  },
  "pi": {
    "command": "pi",
    "args": ["--rpc"],
    "startupTimeoutMs": 30000,
    "shutdownTimeoutMs": 10000
  },
  "workspace": {
    "defaultRoot": "/Users/example/.pi-mobile-gateway/workspaces/default",
    "allowProjectSwitching": false
  },
  "auth": {
    "trustCloudflareAccess": true,
    "allowedEmails": ["user@example.com"],
    "adminEmails": ["user@example.com"]
  },
  "limits": {
    "maxPromptBytes": 20000,
    "maxBodyBytes": 100000,
    "maxEventStreamsPerIdentity": 2,
    "requestTimeoutMs": 60000
  },
  "storage": {
    "root": "/Users/example/.pi-mobile-gateway"
  }
}
```

---

## 18. Operational Requirements

## 18.1 Startup

On startup, the gateway should:

1. load configuration;
2. validate required paths and settings;
3. create storage directories if missing;
4. start HTTP server on localhost;
5. optionally start pi-mono automatically if configured;
6. write startup audit entry.

## 18.2 Shutdown

On shutdown, the gateway should:

1. stop accepting new requests;
2. close event streams;
3. attempt graceful pi-mono shutdown;
4. flush transcript and audit logs;
5. exit cleanly.

## 18.3 Observability

The gateway should expose:

- `/api/v1/status` for application status;
- structured logs;
- audit logs;
- session metadata;
- clear error codes.

## 18.4 Recovery

If pi-mono exits unexpectedly:

- gateway must detect the exit;
- session state becomes `errored` or `stopped`;
- event stream emits `session.error`;
- audit log records exit code and stderr summary;
- user may restart from the client.

---

## 19. Cloudflare Requirements

## 19.1 Tunnel

Cloudflare Tunnel should be configured so that `cloudflared` runs on the local machine and initiates an outbound connection to Cloudflare.

The tunnel maps a public hostname to the local gateway:

```text
https://pi.example.com -> http://127.0.0.1:8787
```

## 19.2 Access

Cloudflare Access must protect the hostname.

Recommended policy:

```text
Application: pi-mobile-gateway
Type: Self-hosted application
Hostname: pi.example.com
Allowed identity: single approved email address
Session duration: conservative default
MFA: enabled where possible
```

## 19.3 Gateway Validation

Cloudflare Access is necessary but not sufficient. The gateway must still validate identity and authorization using the headers provided by Cloudflare Access.

---

## 20. Build Phasing

## Phase 0: Technical Spike

Objective: prove that the gateway can start pi-mono in RPC mode and exchange messages.

Deliverables:

- minimal TypeScript script;
- spawn pi-mono RPC process;
- send one prompt;
- receive response/events;
- test abort if available;
- record raw RPC messages.

Exit criteria:

- a local script can successfully drive a headless pi-mono session.

## Phase 1: Local Gateway MVP

Objective: create a local-only API around the pi-mono session.

Deliverables:

- TypeScript gateway project;
- `/status` endpoint;
- start/restart/shutdown endpoints;
- send message endpoint;
- SSE event stream;
- local JSONL transcript;
- basic logging;
- manual tests.

Exit criteria:

- browser or curl can send a message and stream response locally.

## Phase 2: Mobile PWA

Objective: provide a usable iPhone interface.

Deliverables:

- mobile-first web UI;
- conversation screen;
- streaming rendering;
- status controls;
- abort button;
- history view;
- installable PWA metadata.

Exit criteria:

- user can use the app from iPhone on local network or local machine tunnel during testing.

## Phase 3: Cloudflare Tunnel and Access

Objective: securely expose the gateway without opening local inbound access.

Deliverables:

- Cloudflare Tunnel configuration;
- Access application and policy;
- gateway validation of Cloudflare identity headers;
- public hostname routing;
- documented setup.

Exit criteria:

- iPhone can connect remotely through Cloudflare Access and use the app.

## Phase 4: Hardening

Objective: make the system safe and reliable for everyday use.

Deliverables:

- rate limiting;
- request size limits;
- admin authorization checks;
- audit log viewer;
- error handling;
- process restart handling;
- emergency kill documentation;
- workspace boundary enforcement;
- launchd/systemd or Docker Compose deployment.

Exit criteria:

- system can be left running with acceptable security and operational controls.

## Phase 5: Native iPhone App

Objective: replace or complement the PWA with a native app.

Deliverables:

- SwiftUI app;
- same gateway API integration;
- secure local storage;
- Face ID unlock;
- improved mobile UX;
- optional file/share-sheet support.

Exit criteria:

- native app reaches feature parity with PWA and improves usability.

---

## 21. Acceptance Criteria for v1

The v1 product is complete when:

- pi-mono is run headlessly, not through the TUI;
- Node gateway can start, restart, shut down, and inspect pi-mono;
- iPhone client can send prompts and receive streamed responses;
- active runs can be aborted;
- session history is persisted locally;
- Cloudflare Tunnel exposes the local gateway without router port forwarding;
- Cloudflare Access protects the public hostname;
- gateway validates authorized identity;
- gateway binds to localhost only;
- logs and audit records are written;
- workspace root is explicit;
- setup is documented well enough to reproduce on a new machine.

---

## 22. Open Questions

1. What is the exact pi-mono RPC command to start headless mode in the installed version?
2. Which pi-mono events are emitted in RPC mode today?
3. Does RPC mode expose enough tool/activity detail for the desired mobile UI?
4. Is abort fully supported for active runs in the current pi-mono version?
5. Should the gateway auto-start pi-mono on gateway startup, or require manual start from the app?
6. Should the first UI be a PWA, or should native SwiftUI be built immediately?
7. Should workspace switching be allowed in v1?
8. How strict should filesystem boundaries be in the first version?
9. Should transcripts be plain JSONL or encrypted at rest?
10. Should control-plane operations require a second local PIN or signed command token?

---

## 23. Recommended v1 Decision Set

For a practical first build, make these decisions:

```text
Client: mobile-first PWA
Gateway language: TypeScript on Node.js
Gateway framework: Fastify or Hono
pi integration: subprocess RPC mode
Streaming: Server-Sent Events
Session model: one active session
Persistence: JSONL files
Remote access: Cloudflare Tunnel
Authentication: Cloudflare Access + gateway allowlist
Gateway binding: 127.0.0.1 only
Workspace model: one explicit workspace root
Deployment: local service first; Docker Compose optional
```

This combination provides the fastest route to a working, safe, extensible system.

---

## 24. References

- Cloudflare Tunnel documentation: Cloudflare Tunnel uses an outbound-only connection model where `cloudflared` initiates the connection from the origin to Cloudflare.
- Cloudflare Access documentation: Cloudflare Access can protect self-hosted applications behind Cloudflare-managed authentication and policy.
- pi-mono RPC documentation: pi-mono RPC mode enables headless operation through a JSON protocol over stdin/stdout and is intended for embedding pi in other applications, IDEs, or custom UIs.
- pi-mono RPC type notes: RPC commands are sent as JSON lines on stdin, while responses and events are emitted as JSON lines on stdout.

---

## 25. Summary

The proposed solution is a private mobile control surface for a local pi-mono coding agent.

The key architectural decision is to stop treating the TUI as the runtime interface. Instead, the Node.js gateway owns the pi-mono headless RPC session and exposes a secure, structured API to the iPhone client.

Cloudflare Tunnel is a strong fit because it allows the local environment to initiate an outbound connection to Cloudflare while avoiding direct exposure of the private network. Cloudflare Access provides the outer authentication layer, while the gateway enforces its own identity and authorization checks.

The recommended first version is deliberately small: one user, one session, one workspace, one mobile PWA, one local gateway, and one Cloudflare-protected hostname. This is coherent, buildable, and extensible.
