# MEMORD.md - Memorable Moments & Context

*Selective memory — things worth remembering across sessions. Not a log, just the signal.*

---

## People

### Tinus Rautenbach
- Close technical colleague/friend — they WhatsApp regularly about AI tools and strategy
- Tinus runs **Hermes** at home for some workloads, has a project running with **Paperclip**
- Also running **Bifrost** (LLM gateway) at home
- They share a professional context around AI adoption — there's a recurring theme of "don't get lost implementing AI, stay focused on client value"
- Tinus is technically sharp, experimentally-minded — a peer, not a subordinate

---

## AI Tools Tinus Has Recommended (May 2026)

| Tool | URL | Context |
|------|-----|---------|
| **Bifrost** | https://github.com/maximhq/bifrost | LLM gateway with fallback keys — runs it at home |
| **Paperclip** | https://paperclip.ing/ | Agent platform — has a project running with it |
| **Graphify** | https://graphify.net/ | Code knowledge graph for AI-heavy coders — Graeme was specifically hunting for something like this |

Note: when Graeme asked about a "semantic store or knowledge graph" from Tinus — that was **Graphify**.

---

## Technical Work

### wacli FTS5 Fix (May 9, 2026)
- **Problem:** wacli v0.6.0 had FTS5 compiled in but `ftsEnabled` was only set `true` *during* migration 3 (first run). On all subsequent startups, migration was skipped as already applied, leaving `ftsEnabled = false` permanently. No fallback detection existed in v0.6.0.
- **Fix:** Built wacli HEAD from source (`-tags sqlite_fts5`). HEAD adds `detectMessagesFTS()` which re-validates FTS on every open. Migrations 4–13 also ran, adding columns (`revoked`, `deleted_for_me`, etc.) and updating FTS triggers.
- **How:** `git clone https://github.com/steipete/wacli`, built manually, symlinked to `/opt/homebrew/bin/wacli`. Brew HEAD install failed due to CLT version mismatch so built manually.
- **Result:** `wacli doctor` now shows `FTS5: true`. Message search is fast.

---

## Sport

### Stormers 38–38 Ulster (May 8, 2026 — URC Round 17)
- Played at Affidea Stadium, Belfast
- Stormers trailed 21–17 at half-time and scored a last-gasp try to snatch the draw
- **Werner Kok** (former Stormers and Blitzbokke legend) now plays for Ulster and was a key figure for the home side
- Stormers were lucky — Ulster had the win in the bag until the dying moments
