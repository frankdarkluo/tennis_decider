# TennisLevel Docs

This folder is the working documentation vault for TennisLevel. It is used for product constraints, roadmap state, study materials, engineering notes, and execution logs.

Start at [index.md](index.md).

## Current structure

| Folder | Purpose |
|--------|---------|
| `product/` | Stable product identity, boundaries, requirements, and definition of done |
| `roadmap/` | Current roadmap, active initiative docs, archive plans, and app-development execution notes |
| `engineering/` | Technical notes and platform-specific specs |
| `research/` | Study-mode docs, setup, facilitator guide, and snapshot materials |
| `progress/` | Daily logs (`YYYY-MM-DD.md`) of what actually happened |
| `weekly/` | Weekly synthesis based on daily logs |
| `templates/` | Reusable document starters |
| `prompts/` | AI prompt files used for progress / review workflows |
| `skills/` | Workflow guidance for local agents |
| `superpowers/` | Implementation plans and design specs generated during execution |

## How to place new docs

Put a document where its long-term purpose belongs, not where it was created:

- Product law, boundary, or acceptance rule: `product/`
- What is active now or next: `roadmap/`
- Feature or implementation design note: `engineering/`
- Research operations and study execution: `research/`
- What happened today: `progress/`
- Summaries distilled from logs: `weekly/`
- Agent workflow assets: `templates/`, `prompts/`, `skills/`, `superpowers/`

If a note is time-bound and implementation-specific, prefer a date-prefixed filename.

## Naming conventions

- Use lowercase plus hyphens: `study-setup.md`
- Use date-prefixed filenames for logs and execution artifacts: `2026-04-11.md`
- Prefer descriptive names over version suffixes
- Use folder-prefixed wikilinks when the target is ambiguous: `[[roadmap/current]]`

## Cross-linking rules

Every persistent document should link back to the vault and to its nearest upstream/downstream docs.

Minimum expectations:
- `product/` docs link to `[[index]]`
- `roadmap/` docs link to `[[product/requirements]]` and relevant engineering / progress docs
- `engineering/` docs link to `[[roadmap/current]]` and the owning product constraints
- `research/` docs link to `[[research/study-mode]]`
- `progress/` docs link to `[[roadmap/current]]` and a weekly summary when relevant

## Keep it clean

- Do not leave stale roadmap status in place after the branch reality changes
- Do not keep exact metrics in README/docs unless they are easy to verify and actively maintained
- Do not create parallel docs for the same active topic when one canonical file will do
- Archive completed plans instead of letting `current.md` become historical clutter
