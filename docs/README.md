# TennisLevel Docs

This folder is the Obsidian vault for the TennisLevel project. It is the single source of truth for product direction, research, engineering decisions, and working process.

Start at [index.md](index.md) — it is the graph hub that links everything.

---

## Folder structure

| Folder | Purpose |
|--------|---------|
| `product/` | Product identity, constraints, and quality standards. These are stable, high-authority documents. Change them deliberately. |
| `roadmap/` | Active priorities and planning. `current.md` is the live sprint state. `archive/` holds completed execution plans. |
| `engineering/` | Feature specs and technical design notes. One file per major feature or platform concern. |
| `research/` | Study mode documentation: setup, facilitator guide, snapshot config, and session lifecycle. |
| `progress/` | Daily logs, one file per day (`YYYY-MM-DD.md`). Append-only records of real work done. |
| `weekly/` | Weekly summaries distilled from daily logs. |
| `templates/` | Reusable starters for progress notes, decisions, and weekly reviews. |
| `prompts/` | AI prompts for daily progress generation, weekly review, and doc organization. |
| `skills/` | Workflow guides for AI agents (Codex efficiency, general workflow). |
| `superpowers/` | Claude Code planning artifacts: `plans/` for implementation plans, `specs/` for design specs. |

---

## Naming rules

- **Lowercase with hyphens** for all file and folder names: `study-setup.md`, not `STUDY_SETUP.md`.
- **Date-prefixed** files for time-bound entries: `2026-04-01.md`, `2026-04-04-deep-diagnose-plan.md`.
- **Descriptive, not generic**: `content-expansion.md` not `roadmap-v2.md`.
- **Obsidian links** use explicit folder paths: `[[roadmap/current]]`, not just `[[current]]`.

---

## Where each type of document belongs

**A product decision or quality standard** → `product/`  
Core identity, boundaries, definition of done, original requirements. Not updated frequently.

**An active plan or sprint state** → `roadmap/`  
What we are building now and what comes next. `current.md` is kept up to date.

**A completed execution plan** → `roadmap/archive/`  
Date-named plans that have fully shipped. Read-only reference.

**A feature or platform technical spec** → `engineering/`  
How a specific capability works, what its constraints are, what its acceptance criteria look like.

**Study mode, research protocol, or session logistics** → `research/`  
Everything needed to set up and run a SportsHCI-style user study.

**Daily work log** → `progress/`  
What actually happened today. Generated or written after real work is done.

**Weekly synthesis** → `weekly/`  
Distilled from daily logs; captures conclusions and direction changes.

**Reusable document starter** → `templates/`

**AI prompt** → `prompts/`

**AI planning artifact from this session** → `superpowers/plans/` or `superpowers/specs/`

---

## Cross-linking conventions

Every persistent document should include a `## Related docs` section near the top with `[[wikilinks]]` to its upstream constraints and downstream consumers. This is what makes the Obsidian knowledge graph useful.

Minimum expected links per document type:

- `product/` docs link to each other and to `[[index]]`
- `roadmap/` docs link to `[[product/requirements]]`, `[[roadmap/current]]`, and relevant `[[engineering/...]]` docs
- `engineering/` docs link to `[[roadmap/current]]`, `[[product/definition-of-done]]`, and the relevant `[[research/...]]` or `[[progress/...]]` docs
- `research/` docs link to `[[research/study-mode]]` and `[[weekly/project-progress-summary]]`
- `progress/` docs link to `[[index]]`, `[[roadmap/current]]`, and `[[weekly/project-progress-summary]]`

---

## Bilingual note

Chinese and English materials coexist throughout. There is no dedicated `zh/` or `en/` split — most documents address both. When a concept has a Chinese-only name (e.g. `study_facilitator` script), keep the file name in English for Obsidian compatibility but write the content in whichever language is most natural.

---

## What not to put here

- Source code, configs, or build artifacts (those live in `src/`, `supabase/`, etc.)
- Secrets or environment variables
- Large binary files
- Ephemeral scratch notes with no lasting value — if it is not worth linking from somewhere, it probably does not belong in the vault
