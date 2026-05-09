# digital-workers

Local-first agent runtime project in transition from a single-app prototype to the architecture defined in `docs/architecture.md`.

The current code still runs as a single Node app (`src/index.ts`), while kanban and agent workflow infrastructure has been aligned to the architecture.

## Where we are now

Implemented now:

- Interactive terminal assistant built on pi-mono (`src/index.ts`)
- Web browsing via `pi-web-fetch`
- Architecture-aligned kanban layout in `docs/kanban/`
- Agent workflow skills in `.github/skills/`
- Lightweight validation scripts and `pnpm` commands

Planned next (from architecture):

- Monorepo split into `apps/`, `packages/`, and `workspaces/`
- Headless core runtime APIs (Session, WorkerManager, Router, RuntimeConfig)
- Interface apps (TUI, gateway, wiki clients) over shared runtime

## Runtime features (current app)

- **Full interactive TUI** — powered by `@mariozechner/pi-coding-agent`'s `InteractiveMode`
- **Web browsing** — the LLM can fetch and read any web page via the `web_fetch` tool (headless Chrome + trafilatura extraction)
- **Session persistence** — conversations are saved and resumable
- **All standard pi commands** — `/model`, `/settings`, `/new`, `/resume`, `/tree`, `/fork`, etc.
- **Any supported provider/model** — Anthropic, OpenAI, Gemini, DeepSeek, and more

## Prerequisites

- **Node.js** ≥ 18
- **A Python runner** for web content extraction (pi-web-fetch uses [trafilatura](https://trafilatura.readthedocs.io/)):
  - [uv](https://docs.astral.sh/uv/) — recommended (`uvx trafilatura ...`, fastest)
  - [pipx](https://pipx.pypa.io/) — widely available alternative
- **An API key** for at least one LLM provider, e.g.:
  ```bash
  export ANTHROPIC_API_KEY=sk-ant-...
  # or
  export OPENAI_API_KEY=sk-...
  ```

> **Note:** On the first `web_fetch` call, `uvx` will download trafilatura (~10 MB). Subsequent runs use the cached environment and are instant.

## Installation

```bash
pnpm install
```

> `pnpm install` also downloads puppeteer's bundled Chromium (~300 MB). If you already have Chrome/Chromium installed you can skip that:
> ```bash
> export PUPPETEER_EXECUTABLE_PATH=/path/to/chrome
> pnpm install
> ```

## Usage

```bash
# Start a new session
pnpm start

# Continue the most recent session
pnpm start -- -c

# Browse and pick a past session
pnpm start -- -r

# Run without saving the session
pnpm start -- --no-session

# Verbose startup (shows loaded extensions, skills, etc.)
pnpm start -- --verbose
```

## Kanban and skills workflow

Canonical docs:

- `docs/architecture.md`
- `docs/kanban/README.md`
- `.github/skills/README.md`

Kanban directory shape:

```text
docs/kanban/
  epics/
    unplanned/
    planned/
    doing/
    done/
  stories/
    unplanned/
    planned/
    doing/
    done/
```

Installed skills:

- `create-epic`
- `create-story`
- `plan-story`
- `build-story`
- `verify-story`
- `finish-story`
- `finish-epic`

## Validation commands

```bash
# Lint all skills
pnpm lint:skills

# Validate one story
pnpm check:story -- S01-01

# Validate one epic
pnpm check:epic -- E01

# Validate the docs/specs/ set (index + ownership matrix coverage)
pnpm check:specs

# Validate all kanban artifacts (skills + specs + all stories + all epics)
pnpm validate:kanban:all
```

## Specs and implementation strategy

The architecture (`docs/architecture.md`) describes the destination. The route is owned by
[`docs/specs/implementation-strategy.md`](docs/specs/implementation-strategy.md), which sequences
the twelve releasable epics. The buildable design of each facet lives under
[`docs/specs/`](docs/specs/) and is indexed by [`docs/specs/README.md`](docs/specs/README.md).

Every story keeps its specs current; the discipline is enforced by the workflow skills and the
validators above.

## Commit message policy

This repository uses Conventional Commits 1.0.0:

- https://www.conventionalcommits.org/en/v1.0.0/

Required commit title format:

```text
<type>[optional scope][!]: <description>
```

Allowed types:

- `feat`
- `fix`
- `docs`
- `style`
- `refactor`
- `perf`
- `test`
- `build`
- `ci`
- `chore`
- `revert`

Examples:

- `feat(router): add correlation id propagation`
- `fix!: remove deprecated session api`
- `docs(kanban): align stories folder structure`

Enable local git hook enforcement:

```bash
pnpm setup:hooks
```

Manual one-off validation:

```bash
pnpm lint:commit-msg -- "feat(core): add session manager skeleton"
```

## How it works

```
src/index.ts
  └─ createAgentSessionRuntime()        # pi-mono runtime factory
       └─ createAgentSessionServices()  # loads settings, auth, models
            └─ resourceLoaderOptions
                 └─ extensionFactories: [webFetchExtension]   # injects web_fetch tool
       └─ createAgentSessionFromServices()   # creates the AgentSession
  └─ InteractiveMode(runtime)          # pi-mono full TUI
```

The `web_fetch` tool is registered as a pi extension so the LLM can call it automatically whenever it needs up-to-date information from the internet.

## Customising the assistant

Edit `src/index.ts` to:

- **Change the system prompt** — modify the `appendSystemPrompt` array in `createAgentSessionServices`
- **Add more tools** — pass additional `extensionFactories` or `additionalExtensionPaths`
- **Restrict tools** — pass `tools: ["read", "bash"]` to `createAgentSessionFromServices` to limit what the LLM can use
- **Disable built-in coding tools** — pass `noTools: "builtin"` and only keep `web_fetch`
- **Pin a model** — use `getModel("anthropic", "claude-opus-4-5")` and pass it to `createAgentSessionFromServices`

## Project structure

```
digital-workers/
├── .github/
│   └── skills/        # kanban workflow skills + templates
├── docs/
│   ├── architecture.md
│   └── kanban/
│       ├── README.md
│       ├── epics/
│       └── stories/
├── scripts/
│   ├── check-story.sh
│   ├── check-epic.sh
│   ├── lint-skills.sh
│   └── validate-kanban-all.sh
├── src/
│   └── index.ts       # current runnable app entry point
├── AGENT.md
├── package.json
├── tsconfig.json
└── README.md
```
