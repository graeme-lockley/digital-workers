# Simple-Agent Skills

This folder defines kanban workflow skills for epics and stories.

## Skills

| Skill | Purpose |
|---|---|
| [create-epic](create-epic/SKILL.md) | Create a new epic in `docs/kanban/epics/unplanned/`. |
| [create-story](create-story/SKILL.md) | Create a new story using standard template and attach it to an epic. |
| [plan-story](plan-story/SKILL.md) | Move one story from `stories/unplanned/` to `stories/planned/` and add planning sections. |
| [build-story](build-story/SKILL.md) | Implement one story and move it through `stories/doing/` toward `stories/done/`. |
| [verify-story](verify-story/SKILL.md) | Read-only acceptance audit for a completed story. |
| [finish-story](finish-story/SKILL.md) | Finalize one story in `stories/done/` and update epic links/checks. |
| [finish-epic](finish-epic/SKILL.md) | Close epic when all linked stories are complete. |

## Canonical Rules

- Kanban policy: [docs/kanban/README.md](../../docs/kanban/README.md)
- Shared conventions: [_shared/conventions.md](_shared/conventions.md)
- Failure protocol: [_shared/failure-protocol.md](_shared/failure-protocol.md)
- Templates: [_templates/README.md](_templates/README.md)
