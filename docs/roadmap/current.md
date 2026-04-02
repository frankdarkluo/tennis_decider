---
aliases:
  - Current Roadmap
tags:
  - type/roadmap
  - area/planning
  - status/active
---

# Current Roadmap — TennisLevel

> Last updated: 2026-03-31

## Current goal

Improve TennisLevel's core study-ready experience so users can finish a session, understand the diagnosis, and follow a credible next-step training plan.

## Related docs
- [[index]]
- [[roadmap/requirements]]
- [[roadmap/content-expansion-1000]]
- [[research/study-mode]]
- [[features/diagnosis-study-observability]]
- [[progress/2026-04-01]]
- [[weekly/project-progress-summary]]

## Priority 1 — active

### P1.1 Training plan quality
- Make plans feel more like coach prescriptions, not generic content suggestions
- Emphasize:
  - clear daily goal
  - intensity
  - tempo
  - success criteria
- Keep the 7-day plan structure simple and executable

### P1.2 Diagnosis quality
- Improve text diagnosis parsing and ranking
- Better handle mixed complaints, modifiers, and natural tennis phrasing
- Keep the system deterministic and study-safe

### P1.3 Study flow usability
- Reduce confusion in the study flow
- Improve clarity around what the user should do next
- Preserve current event logging and actionability measurement

### P1.4 Mobile polish on core pages
- Focus on:
  - diagnose
  - plan
  - study mode
  - results
- Improve readability and interaction on small screens without redesigning the product

### P1.5 Diagnosis reliability closure (completed on 2026-03-31)
- 7-point codex execution is fully completed.
- Completed items include:
  - expandable decision evidence
  - explicit low-evidence refusal metadata
  - replayable diagnosis snapshot
  - real-phrase regression baseline
  - summary copy budget with detail overflow
  - cross-effort consistency constraints
  - study flush failure reason buckets and export aggregation
- See: [[roadmap/codex-7-point-execution-2026-03-31]]

## Priority 2 — next

### P2.1 Data quality and validation
- Keep content, creator, and study data consistent
- Prefer scripts and deterministic validation over manual cleanup

### P2.2 Bilingual consistency
- Improve zh/en coverage where it affects active study flows
- Do not expand localization scope beyond what current features need

### P2.3 Research execution loop (next immediate step)
- Run a bilingual study walkthrough and verify the new default-density diagnosis behavior.
- Export local study logs and inspect flush fallback buckets (`network_error`, `http_non_2xx`, `beacon_rejected`).
- Adjust summary budget wording only if study feedback indicates readability or actionability issues.

## Explicitly out of scope for autonomous agents
- reopening `/video-diagnose`
- changing frozen `/library` ordering
- changing frozen `/rankings` ordering
- new payments, subscriptions, or growth features
- schema changes or auth rework
