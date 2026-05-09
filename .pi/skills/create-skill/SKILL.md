---
name: create-skill
description: Create, scaffold, update, or maintain pi agent skills. Use when asked to build a new skill, add a skill, update an existing skill's instructions, or register/deregister a skill from the registry.
metadata:
  spec: https://agentskills.io/home
---

# Create Skill

Use this skill whenever you need to **create a new skill**, **update an existing skill**, or **maintain the skills registry**.

---

## Paths

| Item | Path |
|------|------|
| Skills root | `.pi/skills/` |
| Skill template | `.pi/skills/create-skill/assets/SKILL.template.md` |
| Skills registry | *(the table at the bottom of this file)* |

---

## 1. CREATE A NEW SKILL

### Step 1 — Scaffold the directory

```bash
mkdir -p .pi/skills/<skill-name>/assets
mkdir -p .pi/skills/<skill-name>/scripts
mkdir -p .pi/skills/<skill-name>/references
```

Only create `scripts/` and `references/` if they will be used. `assets/` is optional too.

### Step 2 — Copy and fill in the template

Read the template first:

```
read: .pi/skills/create-skill/assets/SKILL.template.md
```

Copy it to `.pi/skills/<skill-name>/SKILL.md` and replace every `{{PLACEHOLDER}}` with real content:

| Placeholder | What to write |
|-------------|---------------|
| `{{SKILL_NAME}}` | Lowercase, hyphens only, matches folder name exactly |
| `{{DESCRIPTION}}` | ≤1024 chars. Specific trigger conditions. See description guidelines below. |
| `{{TITLE}}` | Human-readable title for the `# Heading` |
| `{{SETUP_INSTRUCTIONS}}` | One-time setup steps (env vars, installs). Remove section if not needed. |
| `{{USAGE_INSTRUCTIONS}}` | The actionable how-to — commands, API calls, workflows. Be specific. |
| `{{PRESENTATION_NOTES}}` | How to format/present results to the user. Remove section if not needed. |
| `{{ERROR_TABLE}}` | Common errors and fixes. Remove section if not needed. |

### Step 3 — Validate the skill

```bash
# Name matches folder
ls .pi/skills/<skill-name>/

# SKILL.md has valid frontmatter
head -6 .pi/skills/<skill-name>/SKILL.md

# No placeholder tokens remain
grep -n "{{" .pi/skills/<skill-name>/SKILL.md && echo "PLACEHOLDERS REMAIN" || echo "OK"

# File is under 500 lines
wc -l .pi/skills/<skill-name>/SKILL.md
```

### Step 4 — Register the skill

Add a row to the **Skills Registry** table at the bottom of this file.

---

## 2. UPDATE AN EXISTING SKILL

1. `read` the existing `SKILL.md` to understand current content
2. Make targeted edits using `edit` — don't rewrite the whole file unless necessary
3. If adding large reference material, put it in `references/` and link to it from `SKILL.md`
4. Update the registry table description if it has changed

---

## 3. DEREGISTER / DELETE A SKILL

```bash
rm -rf .pi/skills/<skill-name>/
```

Remove its row from the **Skills Registry** table below.

---

## Description Guidelines

The description is how pi decides to load the skill — make it trigger correctly.

**Good:**
```yaml
description: Search the web using Brave Search API and extract page content. Use for any question requiring current information, documentation lookups, or web research.
```

**Poor:**
```yaml
description: Helps with web stuff.
```

Rules:
- Be specific about *what* the skill does
- List the key trigger phrases (e.g. "Use for any question about…")
- Keep it ≤1024 characters
- No leading/trailing hyphens in the `name`; no uppercase; no spaces

---

## 4. SKILL STRUCTURE REFERENCE

```
skill-name/
├── SKILL.md              # Required: frontmatter + instructions (≤500 lines)
├── assets/               # Templates, data files, config
├── scripts/              # Executable helper scripts
└── references/           # Large reference docs loaded on-demand
```

Keep `SKILL.md` focused and concise. If a section would exceed ~100 lines, move it to `references/` and instruct the agent to load it on demand.

---

## Skills Registry

| Skill | Description |
|-------|-------------|
| `create-skill` | Create, scaffold, update, or maintain pi agent skills |
| `movie-info` | Look up movies, TV shows, cast, crew, and filmographies via TMDB |
| `sa-news` | Latest South African and world news via TimesLive and Daily Maverick |
| `sports-news` | Sports news, scores and fixtures for Graeme's teams |
| `whatsapp` | Send and read WhatsApp messages, list chats, search history, and look up contacts using wacli |
