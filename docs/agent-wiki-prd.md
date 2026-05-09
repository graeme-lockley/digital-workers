# Product Requirements Document: Agent Wiki

**Document status:** Draft v1.0  
**Date:** 2026-05-09  
**Primary implementation preference:** Deno + TypeScript core, with a bash-facing CLI command surface  
**Primary user:** AI agents using a skill/tool interface  
**Secondary user:** Human operator using CLI and, later, a simple Fresh web UI

---

## 1. Executive Summary

Agent Wiki is a local-first markdown wiki designed primarily for AI agents. It provides agents with a durable, inspectable, filesystem-backed knowledge store that can be accessed safely through a command-line interface.

The initial implementation should be simple: markdown files stored on the local filesystem, addressed through logical page IDs, searched through lexical search, and modified through safe CLI commands. The CLI may be invoked from bash scripts and exposed to agents as a skill.

Although the command surface should feel like a bash tool, the heavy-lifting implementation should be written in **Deno TypeScript**. Bash should be used only as a thin wrapper if needed. This gives the system proper parsing, validation, JSON output, indexing, search, locking, and future extensibility.

The longer-term design allows a simple **Fresh UI** to be added without duplicating logic. Both the CLI and the UI should use the same TypeScript core services.

The core principle is:

```text
Markdown files are the source of truth.
The CLI is the official agent interface.
The generated index is disposable.
Search, backlinks, tags, and validation are derived from the markdown corpus.
```

---

## 2. Problem Statement

Agents need durable knowledge across sessions. Conversation context alone is not enough. Current memory strategies often become opaque, hard to inspect, hard to repair, or too tightly coupled to a specific runtime.

A wiki provides a useful middle ground:

- Knowledge remains human-readable.
- Links create structure.
- Pages can be versioned with Git.
- Agents can search, read, append, and update knowledge.
- Humans can inspect and correct the knowledge store.
- The system remains local-first and portable.

The first implementation should avoid unnecessary infrastructure. It should not require a database, remote server, vector store, or cloud service.

---

## 3. Goals

### 3.1 Product Goals

The product must provide:

1. A local filesystem-backed wiki for agents.
2. A stable CLI contract suitable for bash scripts and agent skills.
3. Markdown pages with wiki-style internal links, relative markdown links, and absolute external links.
4. Search over the wiki.
5. Backlink and link graph support.
6. Safe multi-writer behaviour for multiple agents and a human UI.
7. A generated index that can be rebuilt from source markdown files.
8. A future path to a simple Fresh web UI using the same core implementation.

### 3.2 Engineering Goals

The implementation should be:

- TypeScript-first.
- Deno-based.
- CLI-friendly.
- Testable.
- Deterministic.
- Local-first.
- Safe against path traversal.
- Tolerant of interrupted writes.
- Friendly to Git version control.

### 3.3 Agent Goals

Agents should be able to:

- Discover relevant pages.
- Read pages.
- Append observations.
- Create new pages.
- Store durable facts.
- Search prior knowledge.
- Follow links and backlinks.
- Validate the wiki after edits.
- Detect write conflicts.

---

## 4. Non-Goals for Initial Version

The initial version should not include:

- A remote multi-user SaaS product.
- A mandatory database.
- Mandatory vector search.
- Real-time collaborative editing.
- Rich WYSIWYG editing.
- Authentication and authorisation beyond local filesystem permissions.
- Cross-machine locking over Dropbox, iCloud, OneDrive, or similar synced folders.
- LLM-powered summarisation as a required feature.
- Complex plugin architecture.

These can be considered later once the local filesystem implementation is stable.

---

## 5. Primary Users and Use Cases

### 5.1 AI Agent

The agent uses a skill that wraps shell commands.

Example use cases:

- Search for prior context before starting work.
- Read relevant architecture pages.
- Append new observations to a project page.
- Record a durable memory about user preferences.
- Validate links after creating pages.
- Inspect backlinks to understand context.

### 5.2 Human Operator

The human uses the CLI directly and may later use a Fresh UI.

Example use cases:

- Browse pages.
- Edit or review wiki content.
- Search across project knowledge.
- Inspect recent changes.
- Resolve conflicts.
- Rebuild the index.
- Validate broken links.

### 5.3 Coding Agent / Build Agent

A coding agent uses the PRD to implement the product.

Example use cases:

- Build the CLI.
- Add tests around page ID validation.
- Implement markdown link extraction.
- Implement safe write operations.
- Build the Fresh UI using the shared core library.

---

## 6. Design Principles

1. **Filesystem first**  
   The filesystem is the durable source of truth.

2. **Markdown as the canonical format**  
   Pages are ordinary markdown files with optional frontmatter.

3. **CLI as the agent contract**  
   Agents must not need to understand the filesystem layout directly.

4. **Deno TypeScript for heavy lifting**  
   Parsing, search, indexing, validation, locking, and JSON output should be implemented in TypeScript.

5. **Bash as a wrapper, not the core**  
   Bash may expose the command but should not implement complex logic.

6. **Generated metadata is disposable**  
   `.agent-wiki/` may be deleted and rebuilt from markdown files.

7. **Every write goes through one safe write path**  
   All create, write, append, patch, delete, move, tag, journal, and remember operations must use the same locking and atomic-write pipeline.

8. **Agents address pages by page ID**  
   The CLI resolves page IDs to files.

9. **Search is a convenience, links are structure**  
   The wiki is a knowledge graph, not merely a folder full of files.

10. **JSON output is mandatory for automation**  
   Human-readable text output is useful, but every important command should support `--json`.

---

## 7. Technology Choice

### 7.1 Selected Runtime

Use **Deno**.

Rationale:

- First-class TypeScript support.
- Good local filesystem APIs.
- Explicit permissions model.
- Clean CLI story.
- Good fit for local-first tools.
- Native compatibility with Fresh for a future UI.
- Can compile into a standalone executable.

### 7.2 CLI Surface

The user is comfortable with bash. The CLI should therefore feel like a normal Unix command:

```bash
agent-wiki search "cloudflare tunnel" --json
agent-wiki read architecture/cloudflare-tunnel
agent-wiki append memory/preferences --stdin
```

Internally, this command should call Deno TypeScript.

Possible bash wrapper:

```bash
#!/usr/bin/env bash
set -euo pipefail

exec deno run \
  --allow-read="$AGENT_WIKI_ROOT" \
  --allow-write="$AGENT_WIKI_ROOT" \
  --allow-env \
  /path/to/agent-wiki/src/cli/main.ts "$@"
```

Later, the project can compile to a single binary:

```bash
deno compile \
  --allow-read \
  --allow-write \
  --allow-env \
  --output agent-wiki \
  src/cli/main.ts
```

---

## 8. High-Level Architecture

```text
agent-wiki/
  deno.json

  src/
    core/
      wiki.ts
      repository.ts
      page_id.ts
      markdown.ts
      links.ts
      search.ts
      index.ts
      backlinks.ts
      lock.ts
      filesystem.ts
      output.ts
      revision.ts

    cli/
      main.ts
      commands/
        init.ts
        list.ts
        read.ts
        create.ts
        write.ts
        append.ts
        delete.ts
        move.ts
        search.ts
        grep.ts
        links.ts
        backlinks.ts
        related.ts
        recent.ts
        journal.ts
        remember.ts
        validate.ts
        index.ts
        locks.ts

    web/
      main.ts
      fresh.config.ts
      routes/
        index.tsx
        page/[...id].tsx
        search.tsx
        api/pages/[...id].ts
        api/search.ts
        api/backlinks/[...id].ts
      islands/
        PageEditor.tsx
        SearchBox.tsx

  wiki/
    index.md
    architecture/
    projects/
    concepts/
    decisions/
    memory/
    journal/
    inbox/
    .agent-wiki/
      config.json
      index.json
      backlinks.json
      index.dirty
      locks/
      revisions/
    .trash/
```

### 8.1 Shared Core

Both CLI and Fresh UI must call the same core service layer:

```text
CLI command  ---> src/core/wiki.ts ---> filesystem
Fresh UI     ---> src/core/wiki.ts ---> filesystem
```

There must not be separate implementations of read, write, search, link extraction, or validation for CLI and UI.

---

## 9. Filesystem Model

### 9.1 Canonical Wiki Directory

The wiki root should look like this:

```text
wiki/
  index.md

  projects/
    pi-mono-iphone-gateway.md
    agent-wiki.md

  architecture/
    cloudflare-tunnel.md
    pi-mono-rpc.md
    gateway-control-plane.md

  concepts/
    local-first.md
    agent-memory.md
    semantic-search.md

  decisions/
    2026-05-09-use-cloudflare-tunnel.md
    2026-05-09-filesystem-first-wiki.md

  memory/
    user-preferences.md
    durable-facts.md
    project-context.md

  journal/
    2026/
      05/
        2026-05-09.md

  inbox/
    scratch.md

  .agent-wiki/
    config.json
    index.json
    backlinks.json
    index.dirty
    locks/
    revisions/

  .trash/
```

### 9.2 Authored vs Generated Content

```text
Everything outside .agent-wiki/ is authored knowledge.
Everything inside .agent-wiki/ is generated metadata or operational state.
```

`.agent-wiki/` must be rebuildable from the markdown corpus.

### 9.3 Page ID to File Mapping

Agents use logical page IDs:

```text
architecture/cloudflare-tunnel
projects/pi-mono-iphone-gateway
memory/user-preferences
journal/2026/05/2026-05-09
```

The CLI maps these to files:

```text
architecture/cloudflare-tunnel       -> architecture/cloudflare-tunnel.md
projects/pi-mono-iphone-gateway     -> projects/pi-mono-iphone-gateway.md
memory/user-preferences             -> memory/user-preferences.md
journal/2026/05/2026-05-09          -> journal/2026/05/2026-05-09.md
```

Agents should not directly manipulate raw file paths.

---

## 10. Page ID Rules

Allowed examples:

```text
architecture/pi-mono-gateway
memory/preferences
journal/2026/05/2026-05-09
concepts/local-first
```

Disallowed examples:

```text
../secrets
/tmp/file
architecture/../../../etc/passwd
Architecture/Event Store
architecture/event store
~/.ssh/id_rsa
.hidden/page
```

Suggested validation rule:

```text
^[a-z0-9][a-z0-9._/-]*[a-z0-9]$
```

Additionally reject:

- `..`
- `~`
- absolute paths
- leading slash
- trailing slash
- duplicate slashes
- hidden path segments beginning with `.`
- uppercase letters
- spaces
- null bytes

---

## 11. Markdown Page Format

Pages should be ordinary markdown files with optional YAML frontmatter.

Example:

```markdown
---
id: projects/pi-mono-iphone-gateway
title: Pi-mono iPhone Gateway
tags:
  - pi-mono
  - iphone
  - cloudflare
  - gateway
status: active
created: 2026-05-09
updated: 2026-05-09
---

# Pi-mono iPhone Gateway

The goal is to replace the current TUI usage of pi-mono with an iPhone app.

The local gateway connects to [[architecture/pi-mono-rpc]] and exposes the application remotely through [[architecture/cloudflare-tunnel]].

## Main components

- iPhone app
- Node or Deno gateway
- pi-mono running in RPC mode
- Cloudflare Tunnel

## Related

- [[architecture/gateway-control-plane]]
- [[decisions/2026-05-09-use-cloudflare-tunnel]]
```

### 11.1 Frontmatter Fields

Recommended fields:

```yaml
id: projects/pi-mono-iphone-gateway
title: Pi-mono iPhone Gateway
aliases:
  - projects/pi-mono-gateway
tags:
  - pi-mono
  - gateway
status: active
created: 2026-05-09
updated: 2026-05-09
```

Fields:

| Field | Required | Description |
|---|---:|---|
| `id` | No, but recommended | Logical page ID. If absent, derive from path. |
| `title` | No | Human title. If absent, derive from first H1 or page ID. |
| `aliases` | No | Alternative IDs that resolve to this page. |
| `tags` | No | List of classification tags. |
| `status` | No | Draft, active, deprecated, archived, etc. |
| `created` | No | Creation date. |
| `updated` | No | Last update date. |
| `redirect` | No | Page ID to redirect to. |

---

## 12. Link Model

The wiki should support three link classes.

### 12.1 Wiki Links

Canonical internal links should use page IDs:

```markdown
[[architecture/cloudflare-tunnel]]
[[architecture/cloudflare-tunnel|Cloudflare Tunnel]]
```

These are preferred for agent-created internal links.

### 12.2 Relative Markdown Links

Relative markdown links should be supported for human/editor compatibility:

```markdown
[Cloudflare Tunnel](../architecture/cloudflare-tunnel.md)
[Gateway Control Plane](../architecture/gateway-control-plane.md)
```

These are useful in GitHub, editors, Obsidian-like tools, and static site generators.

### 12.3 Absolute External Links

External links remain normal markdown links:

```markdown
[Cloudflare Tunnel documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
[pi-mono GitHub repository](https://github.com/badlogic/pi-mono)
```

### 12.4 Linking Policy

Agents should follow this policy:

```text
Use [[page-id]] links for internal wiki knowledge.
Use relative markdown links when human markdown compatibility is valuable.
Use absolute markdown links for external resources.
Do not invent external URLs.
Do not use raw filesystem paths unless explicitly asked.
```

---

## 13. Link Extraction Requirements

The system must parse wiki links, markdown links, and external links.

The parser should classify links as:

```json
{
  "internalWikiLinks": ["architecture/cloudflare-tunnel"],
  "internalMarkdownLinks": ["../architecture/cloudflare-tunnel.md"],
  "externalLinks": ["https://github.com/badlogic/pi-mono"]
}
```

---

## 14. CLI Command Surface

The CLI should be called:

```bash
agent-wiki
```

General form:

```bash
agent-wiki <command> [options]
```

### 14.1 Minimum Viable Commands

```bash
agent-wiki init
agent-wiki list [--json]
agent-wiki read <page-id> [--json]
agent-wiki exists <page-id>
agent-wiki create <page-id> --title <title> --stdin
agent-wiki write <page-id> --stdin [--create] [--expected-version <version>]
agent-wiki append <page-id> --stdin [--create] [--expected-version <version>]
agent-wiki delete <page-id> --yes [--expected-version <version>]
agent-wiki search <query> [--json] [--limit N]
agent-wiki grep <pattern> [--json]
agent-wiki recent [--json] [--limit N]
agent-wiki links <page-id> [--json]
agent-wiki backlinks <page-id> [--json]
agent-wiki related <page-id> [--json]
agent-wiki journal --stdin [--date YYYY-MM-DD]
agent-wiki remember --stdin [--tag tag]
agent-wiki validate [--json]
agent-wiki index rebuild
```

### 14.2 Future Commands

```bash
agent-wiki patch <page-id> --section <heading> --stdin
agent-wiki move <source-page-id> <target-page-id> [--create-redirect]
agent-wiki tags <page-id> list
agent-wiki tags <page-id> add <tag...>
agent-wiki tags <page-id> remove <tag...>
agent-wiki find-by-tag <tag...> [--json]
agent-wiki context <query> [--json] [--limit N]
agent-wiki locks list
agent-wiki locks clear-stale
agent-wiki stats [--json]
agent-wiki backup [--output file.tar.gz]
agent-wiki semantic-search <query> [--json]
```

---

## 15. CLI Behaviour Details

### 15.1 `read`

Reads a page.

```bash
agent-wiki read architecture/event-store
agent-wiki read architecture/event-store --json
```

JSON output must include a content version:

```json
{
  "id": "architecture/event-store",
  "title": "Event Store Architecture",
  "path": "architecture/event-store.md",
  "version": "sha256:abc123",
  "content": "# Event Store Architecture\n\n..."
}
```

### 15.2 `exists`

Checks if a page exists.

Exit codes:

```text
0 = page exists
1 = page does not exist
2 = command error
```

### 15.3 `create`

Creates a page from stdin. It must fail if the page already exists unless `--force` is supplied.

```bash
cat draft.md | agent-wiki create architecture/event-store --title "Event Store Architecture" --stdin
```

### 15.4 `write`

Replaces the full page content.

```bash
cat page.md | agent-wiki write architecture/event-store --stdin
```

Rules:

- Page must exist unless `--create` is supplied.
- Empty stdin must fail unless `--allow-empty` is supplied.
- If `--expected-version` is supplied, the write must fail if the page changed.
- `--force` may bypass expected version checks, but should be explicit.

### 15.5 `append`

Appends content safely through the safe write pipeline.

```bash
cat notes.md | agent-wiki append memory/agent-observations --stdin --create
```

### 15.6 `delete`

Deletes a page. It should soft-delete by default.

```bash
agent-wiki delete architecture/event-store --yes
```

### 15.7 `search`

Searches the wiki using lexical/ranked search.

```bash
agent-wiki search "cloudflare tunnel"
agent-wiki search "cloudflare tunnel" --json --limit 10
```

JSON output:

```json
{
  "query": "cloudflare tunnel",
  "results": [
    {
      "id": "architecture/cloudflare-tunnel",
      "title": "Cloudflare Tunnel",
      "score": 192,
      "matches": [
        {
          "type": "title",
          "text": "Cloudflare Tunnel"
        },
        {
          "type": "body",
          "line": 8,
          "text": "Cloudflare Tunnel allows the gateway to create an outbound tunnel..."
        }
      ]
    }
  ]
}
```

### 15.8 `links` and `backlinks`

These expose the knowledge graph.

```bash
agent-wiki links projects/pi-mono-iphone-gateway --json
agent-wiki backlinks architecture/cloudflare-tunnel --json
```

### 15.9 `journal`

Appends to a date-based journal page.

```bash
agent-wiki journal --stdin
agent-wiki journal --date 2026-05-09 --stdin
```

Default path:

```text
journal/YYYY/MM/YYYY-MM-DD.md
```

### 15.10 `remember`

Stores durable facts or preferences.

```bash
echo "User prefers filesystem-first local agent infrastructure." \
  | agent-wiki remember --tag preference --stdin
```

### 15.11 `validate`

Checks invalid page IDs, duplicate IDs, broken links, invalid frontmatter, duplicate aliases, redirect loops, empty pages, and missing index page.

---

## 16. Search Design

Search should evolve in phases.

### 16.1 Search v1: Deterministic Full-Text Search

Initial search may be implemented directly in TypeScript by scanning markdown files, or by shelling out to `rg` where available. For portability, the core implementation should not require `rg` as the only option.

The search pipeline:

```text
1. Load config.
2. Walk markdown files.
3. Ignore .agent-wiki and .trash.
4. Parse frontmatter.
5. Derive page ID.
6. Extract title.
7. Extract headings.
8. Extract tags.
9. Extract links.
10. Match query.
11. Score results.
12. Return plain text or JSON.
```

### 16.2 Search v2: Generated Index

The generated index should live under:

```text
.agent-wiki/index.json
.agent-wiki/backlinks.json
```

Example index entry:

```json
{
  "id": "projects/pi-mono-iphone-gateway",
  "path": "projects/pi-mono-iphone-gateway.md",
  "title": "Pi-mono iPhone Gateway",
  "tags": ["pi-mono", "iphone", "cloudflare", "gateway"],
  "aliases": [],
  "links": [
    "architecture/pi-mono-rpc",
    "architecture/cloudflare-tunnel"
  ],
  "externalLinks": [
    "https://github.com/badlogic/pi-mono"
  ],
  "headings": [
    "Main components",
    "Related"
  ],
  "updated": "2026-05-09"
}
```

### 16.3 Search v3: Ranked Search

Ranking should consider:

```text
title match > tag match > heading match > body match > link text match
```

Suggested scoring:

```text
+100 exact page ID match
+80 title match
+60 tag match
+40 heading match
+20 body match
+15 outbound link match
+10 backlink match
```

### 16.4 Search v4: Semantic Search

Semantic search is a later enhancement. The semantic index must remain disposable. Markdown remains canonical.

---

## 17. Context Retrieval for Agents

A future `context` command should return relevant pages and snippets for a task.

```bash
agent-wiki context "pi-mono rpc cloudflare tunnel" --limit 5 --json
```

This command should avoid dumping excessive content into agent context. It should return ranked summaries and allow the agent to decide which pages to read in full.

---

## 18. Link Graph and Wiki Behaviour

A proper wiki is not just search. It is a graph.

The system must support:

- Outbound links.
- Backlinks.
- Tags.
- Aliases.
- Redirects.
- Orphan-page detection.
- Broken-link detection.
- Related-page discovery.

Backlinks are especially valuable for agents because they provide surrounding context.

---

## 19. Aliases, Redirects, and Page Moves

Pages may move. Relative markdown links may break if not updated. Wiki links using page IDs can be made resilient through aliases and redirects.

Example moved page:

```markdown
---
id: infrastructure/cloudflare-tunnel
title: Cloudflare Tunnel
aliases:
  - architecture/cloudflare-tunnel
tags:
  - infrastructure
  - cloudflare
---

# Cloudflare Tunnel
```

A redirect page may look like:

```markdown
---
id: architecture/cloudflare-tunnel
redirect: infrastructure/cloudflare-tunnel
---
```

The resolver should:

1. Match exact page ID.
2. Match alias.
3. Follow redirect.
4. Detect redirect loops.
5. Fail if ambiguous.

---

## 20. Concurrency and Multiple Writers

The system must support multiple writers into the filesystem, including CLI invocations, Fresh UI save operations, journal appends, and index rebuilds.

The risks are lost updates, partial writes, corrupt index files, UI overwrites, concurrent append collisions, and stale search indexes.

### 20.1 Required Concurrency Strategy

Use three layers:

```text
1. Per-page locks
2. Optimistic version checks
3. Atomic writes
```

### 20.2 Per-Page Locks

Before modifying a page, acquire a lock file:

```text
wiki/.agent-wiki/locks/projects__pi-mono-iphone-gateway.lock
```

Lock file content:

```json
{
  "pageId": "projects/pi-mono-iphone-gateway",
  "owner": "cli",
  "pid": 12345,
  "created": "2026-05-09T13:30:00+02:00"
}
```

Rules:

- A writer must acquire the page lock before modifying a page.
- Lock acquisition should support timeout.
- Stale locks should be detectable.
- Stale lock cleanup should be explicit.

### 20.3 Optimistic Version Checks

Every page read should return a content version. The simplest version is `sha256(page content)`.

Write command:

```bash
agent-wiki write projects/pi-mono-iphone-gateway \
  --stdin \
  --expected-version sha256:abc123
```

If the page changed, the write must fail with a write conflict.

### 20.4 Atomic Writes

Never write directly into the target markdown file.

Use:

```text
1. Write to temp file in same directory.
2. Flush if practical.
3. Rename temp file over target file.
```

Conceptual implementation:

```ts
const tempPath = `${targetPath}.tmp-${crypto.randomUUID()}`;
await Deno.writeTextFile(tempPath, content);
await Deno.rename(tempPath, targetPath);
```

A reader must see either the old complete file or the new complete file, never a partial file.

### 20.5 Safe Append

Append must not use raw append mode directly for canonical wiki pages.

Instead:

```text
1. Acquire page lock.
2. Read current content.
3. Check expected version if provided.
4. Combine current content and appended content.
5. Atomic write entire file.
6. Mark index dirty.
7. Release lock.
```

### 20.6 Safe Delete

Delete should soft-delete by default:

```text
wiki/.trash/<page-id>.<timestamp>.md
```

### 20.7 Safe Move

Move operations must lock both source and target, acquire locks in sorted order to avoid deadlocks, rename source to target, optionally create a redirect, and mark the index dirty.

### 20.8 Index Locking

The index needs its own lock:

```text
wiki/.agent-wiki/locks/__index.lock
```

Recommended v1 behaviour:

```text
After page writes, mark index dirty.
Before search or backlinks, rebuild lazily if dirty.
Rebuild under index lock.
```

---

## 21. Write Pipeline

Every modifying command must use a single shared pipeline.

Conceptual TypeScript:

```ts
async function modifyPage(
  id: PageId,
  expectedVersion: string | undefined,
  modify: (current: string | null) => string,
): Promise<WriteResult> {
  return await withPageLock(id, async () => {
    const current = await readPageIfExists(id);
    const currentVersion = current ? hash(current.content) : null;

    if (expectedVersion && expectedVersion !== currentVersion) {
      throw new WriteConflict(currentVersion);
    }

    const next = modify(current?.content ?? null);

    validatePageId(id);
    validateMarkdown(next);

    await atomicWrite(resolvePagePath(id), next);
    await writeRevision(id, current?.content ?? null, next);
    await markIndexDirty();

    return {
      id,
      previousVersion: currentVersion,
      version: hash(next),
    };
  });
}
```

All modifying commands must use this path.

---

## 22. Fresh UI

A simple Fresh UI can be added after the CLI and core are stable.

The UI should allow a human to browse pages, search pages, read pages, edit pages, view backlinks, view outbound links, create pages, resolve write conflicts, and validate the wiki.

Fresh routes should call the same core services as the CLI:

```text
Fresh route ---> WikiService ---> filesystem
```

The UI must not bypass the write pipeline.

### 22.1 UI Save Behaviour

When loading a page, the UI receives:

```json
{
  "id": "projects/foo",
  "content": "...",
  "version": "sha256:abc123"
}
```

When saving, the UI submits:

```json
{
  "content": "...updated...",
  "expectedVersion": "sha256:abc123"
}
```

If a conflict occurs, the UI should show the attempted content, current page content, conflicting version IDs, and options to copy, overwrite, or manually merge.

### 22.2 Deployment Model

For local use:

```bash
deno task web
```

or:

```bash
agent-wiki serve --host 127.0.0.1 --port 8787
```

The UI should bind to localhost by default.

---

## 23. Git Integration

Git should be optional but strongly compatible.

Git is useful for history, diffs, rollback, audit, sync, and human review.

Git should not be treated as the primary concurrency mechanism.

Possible future command:

```bash
agent-wiki write projects/foo --stdin --message "Update gateway notes"
```

Internally:

```text
1. Safe write.
2. Mark index dirty.
3. git add changed files.
4. git commit -m "Update gateway notes".
```

Initial version should not require Git.

---

## 24. Configuration

Configuration should live at:

```text
.agent-wiki/config.json
```

Example:

```json
{
  "version": 1,
  "defaultMemoryPage": "memory/durable-facts",
  "journalPathPattern": "journal/{yyyy}/{mm}/{yyyy}-{mm}-{dd}",
  "lockTimeoutMs": 10000,
  "staleLockMs": 300000,
  "trashEnabled": true,
  "index": {
    "lazyRebuild": true
  },
  "search": {
    "defaultLimit": 10
  }
}
```

Environment variable:

```bash
AGENT_WIKI_ROOT=/path/to/wiki
```

The CLI should also support:

```bash
agent-wiki --root /path/to/wiki search "query"
```

Command-line `--root` should override `AGENT_WIKI_ROOT`.

---

## 25. Exit Codes

Use predictable exit codes:

| Code | Meaning |
|---:|---|
| 0 | Success |
| 1 | Not found / false result |
| 2 | Invalid arguments |
| 3 | Validation failed |
| 4 | Write conflict |
| 5 | Filesystem error |
| 6 | Lock timeout |
| 7 | Index error |

---

## 26. JSON Output Standards

Every command that returns structured data should support `--json`.

Errors in JSON mode should follow this shape:

```json
{
  "ok": false,
  "error": {
    "code": "write_conflict",
    "message": "The page changed since it was read.",
    "details": {
      "currentVersion": "sha256:def456"
    }
  }
}
```

For agent use, prefer the explicit envelope:

```json
{
  "ok": true,
  "result": {}
}
```

---

## 27. Security and Safety Requirements

The system must protect the filesystem.

Requirements:

- Reject invalid page IDs.
- Prevent path traversal.
- Never follow symlinks outside the wiki root without explicit configuration.
- Ignore `.agent-wiki/` and `.trash/` during normal page scans.
- Avoid exposing arbitrary file read/write through CLI arguments.
- Require explicit flags for destructive operations.
- Bind Fresh UI to `127.0.0.1` by default.
- Use Deno permissions to restrict read/write to the wiki root.

---

## 28. Testing Requirements

Implement tests for:

- Page ID validation.
- Markdown parsing.
- Frontmatter extraction.
- Wiki link extraction.
- Markdown link extraction.
- External link extraction.
- Page ID to path mapping.
- Atomic writes.
- Soft delete.
- Concurrent writes.
- Stale UI save conflicts.
- Safe append.
- Index rebuild locking.
- Search ranking.
- Broken link validation.
- Backlink generation.
- CLI exit codes.
- JSON output validity.

---

## 29. Phased Delivery Plan

### Phase 1: Core Filesystem Wiki

Deliver:

- Deno project setup.
- Page ID validation.
- Page ID to path resolution.
- Markdown read/write.
- Atomic write helper.
- Basic CLI: `init`, `list`, `read`, `exists`, `create`, `write`, `append`, `delete`.

Acceptance:

- Agent can create, read, update, append, and delete markdown pages safely.

### Phase 2: Markdown Intelligence

Deliver:

- Frontmatter parser.
- Title extraction.
- Tag extraction.
- Wiki link extraction.
- Markdown link extraction.
- External link extraction.
- `links` command.
- `validate` command.

Acceptance:

- Agent can inspect link structure and detect broken links.

### Phase 3: Search and Index

Deliver:

- Index builder.
- `.agent-wiki/index.json`.
- `.agent-wiki/backlinks.json`.
- `index rebuild`.
- `search`.
- `grep`.
- `backlinks`.
- `related` basic implementation.
- Lazy index rebuild when dirty.

Acceptance:

- Agent can search and discover relevant context.

### Phase 4: Concurrency Hardening

Deliver:

- Per-page lock files.
- Index lock.
- Stale lock detection.
- Content hash versions.
- Expected-version checks.
- Write conflict errors.
- Safe append through write pipeline.

Acceptance:

- Multiple CLI invocations cannot corrupt or overwrite pages silently.

### Phase 5: Agent Memory Commands

Deliver:

- `journal`.
- `remember`.
- `recent`.
- Configurable memory page.
- Configurable journal pattern.

Acceptance:

- Agent can record session notes and durable facts.

### Phase 6: Fresh UI

Deliver:

- Local Fresh UI.
- Page browser.
- Page reader.
- Page editor.
- Search UI.
- Backlinks panel.
- Conflict-aware save.

Acceptance:

- Human can browse and edit the same wiki safely through the UI.

### Phase 7: Optional Enhancements

Deliver as needed:

- Git integration.
- Backup command.
- Semantic search.
- Context command.
- Static site export.
- Page templates.
- Restore from trash.
- More advanced conflict merge support.

---

## 30. Acceptance Criteria Summary

The product is acceptable when:

1. A user can initialise a wiki.
2. Pages are stored as ordinary markdown files.
3. Agents can use CLI commands to read, create, write, append, search, and validate.
4. Internal wiki links use `[[page-id]]` and are parsed.
5. Relative markdown links and absolute external links are preserved and classified.
6. Search returns useful ranked results.
7. Backlinks can be generated.
8. The generated index can be deleted and rebuilt.
9. Multiple writers are protected by locks, optimistic versions, and atomic writes.
10. CLI commands expose machine-readable JSON.
11. Destructive operations require explicit flags.
12. The implementation can later support a Fresh UI using the same core code.

---

## 31. Example Agent Workflow

An agent preparing to work on a pi-mono gateway task might run:

```bash
agent-wiki search "pi-mono cloudflare gateway" --json
agent-wiki read projects/pi-mono-iphone-gateway --json
agent-wiki backlinks architecture/cloudflare-tunnel --json
```

After completing work, it may append an observation:

```bash
cat notes.md | agent-wiki append projects/pi-mono-iphone-gateway --stdin
```

Then it records durable memory:

```bash
echo "The user prefers local-first agent infrastructure and prefers Cloudflare Tunnel to be initiated outbound from the local gateway." \
  | agent-wiki remember --tag architecture --tag preference --stdin
```

Finally:

```bash
agent-wiki validate
```

---

## 32. Final Product Definition

Agent Wiki is a **markdown knowledge graph stored on the filesystem** and accessed through a **safe, scriptable CLI**.

It should feel simple from the outside:

```bash
agent-wiki search "agent memory" --json
agent-wiki read memory/user-preferences
agent-wiki append journal/2026/05/2026-05-09 --stdin
```

But internally it must provide:

- TypeScript-based parsing and validation.
- Safe path resolution.
- Atomic writes.
- Per-page locks.
- Optimistic version checks.
- Search indexing.
- Backlink generation.
- JSON automation output.
- Future UI reuse through Fresh.

The design gives agents a durable, inspectable memory substrate without giving up the simplicity and portability of markdown files.
