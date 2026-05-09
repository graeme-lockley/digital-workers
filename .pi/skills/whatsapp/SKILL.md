---
name: whatsapp
description: Send and read WhatsApp messages, list chats, search message history, and look up contacts using wacli. Use for any question about WhatsApp messages, sending a WhatsApp, reading a chat, or searching WhatsApp history.
metadata:
  spec: https://agentskills.io/home
---

# WhatsApp via wacli

Uses `wacli` — a local WhatsApp CLI backed by a persistent SQLite store with full-text search. The binary is at `/opt/homebrew/bin/wacli` and is already authenticated. A `wacli sync --follow` daemon runs in the background keeping the store current.

---

## Usage

All commands output human-readable text by default. Add `--json` for machine-readable output.

### Check status

```bash
wacli auth status        # confirms authenticated
wacli doctor             # store path, lock info, FTS5 support
```

### List recent chats

```bash
wacli chats list --json --limit 25
```

Output: `{ "success": true, "data": [{ "JID": "...", "Name": "...", "Kind": "...", "LastMessageTS": "..." }] }`

`JID` is needed for all chat-specific commands. Format: `27821234567@s.whatsapp.net` (individuals) or `xxx@g.us` (groups).

### Read messages from a chat

```bash
wacli messages list --chat <JID> --json --limit 20
```

Output: `{ "success": true, "data": { "fts": true, "messages": [{ "ChatJID": "...", "ChatName": "...", "MsgID": "...", "SenderJID": "...", "Timestamp": "...", "FromMe": false, "Text": "...", "DisplayText": "...", "MediaType": "" }] } }`

Use `DisplayText` for the readable message content (handles quoted replies, reactions, etc.). Use `Text` as fallback.

### Search message history (full-text)

```bash
wacli messages search "query" --json --limit 20
wacli messages search "query" --chat <JID> --json --limit 20   # restrict to one chat
```

Same output shape as `messages list`.

### Send a message

```bash
wacli --lock-wait 15s send text --to <JID> --message "text"
wacli --lock-wait 15s send text --to 27821234567 --message "text"  # phone number also works
```

`--lock-wait 15s` is needed because `wacli sync --follow` holds the store write lock. Wacli waits up to 15 s for it to be released.

### Look up a contact

```bash
wacli contacts search "name or number" --json
```

Output: `{ "success": true, "data": [{ "JID": "...", "Phone": "...", "Name": "...", "Alias": "", "Tags": null }] }`

Returns contacts from the local synced store. If not found, the person may still be on WhatsApp but not yet synced — try sending to `<digits>@s.whatsapp.net` directly.

### Filter and manage chats

```bash
wacli chats list --pinned --json
wacli chats list --unread --json
wacli chats mark-read --chat <JID>
```

---

## Presentation Notes

- Always show the human-readable **Name** alongside the JID when listing chats — JIDs alone are opaque.
- For messages, show `[timestamp] Sender: DisplayText` format.
- When sending, confirm with: `✓ Sent to <Name> (<JID>)`.
- If `fts: false` appears in search results, note that full-text search is unavailable and results may be incomplete.
- Respect privacy: do not display message content unless the user explicitly asked for it.

---

## Error Handling

| Symptom | Cause | Fix |
|---------|-------|-----|
| `store is locked` on send | `sync --follow` holds write lock | Use `--lock-wait 15s` global flag |
| `not authenticated` | wacli not linked | Run `wacli auth` in a terminal to scan QR |
| Empty `data: []` on list | Store not yet synced | Run `wacli sync --once` then retry |
| `fts: false` in search | FTS5 index unavailable | Results still return via LIKE fallback |
