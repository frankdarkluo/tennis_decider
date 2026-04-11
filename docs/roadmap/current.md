---
aliases:
  - Current Roadmap
tags:
  - type/roadmap
  - area/planning
  - status/active
---

# Current Roadmap — TennisLevel

> Last updated: 2026-04-11

## Current goal

Stabilize TennisLevel as a study-ready training decision routing layer:
- narrow vague tennis complaints into one credible next step
- keep recommendation confidence honest and direct-source constrained
- turn assessment and diagnosis outputs into executable 7-day plans

## Related docs
- [[index]]
- [[product/requirements]]
- [[product/boundaries]]
- [[product/definition-of-done]]
- [[research/study-mode]]
- [[weekly/project-progress-summary]]
- [[progress/2026-04-10]]
- [[progress/2026-04-11]]

## Current branch reality

### Landed on `app-development`
- `PR7` plan blueprint engine is in place
- `PR8` assessment 10+2 redesign and `PlayerProfileVector` handoff are in place
- `PR9` long-tail diagnosis / recommendation / plan coverage is in place
- diagnose recommendation thumbnails now use a shared fallback path with local overrides where needed
- hidden `/video-diagnose` is now closed at both route and API level
- legacy live platform-search behavior has been removed from the active consumer path

### Explicit decisions now in effect
- diagnose recommendations remain limited to direct-source content from `src/data/contents.ts`
- `/video-diagnose` stays out of study scope and is not a hidden alternative path anymore
- taxonomy tightening was implemented as a lightweight typed `ProblemTag` contract, not a full registry rewrite
- recommendation contract tightening remains inside the current content-catalog + trusted-content path; no separate public recommendation payload layer was added

## Priority 1 — validate the wrapped-up core flow

### P1.1 Study walkthrough on the current branch
- Run end-to-end checks on:
  - assessment
  - diagnose `standard`
  - diagnose `deep`
  - plan generation from both diagnosis and assessment
- Confirm the result surface stays understandable on mobile and does not over-expand by default

### P1.2 Recommendation quality on the tightened surface
- Spot-check that:
  - long-tail problems no longer collapse back into generic baseline content
  - diagnose cards render stable thumbnails or clean placeholders
  - linked content reasons stay specific and honest

### P1.3 Research reliability
- Keep study event logging, actionability capture, and export flows stable
- Continue treating `/library` and `/rankings` ordering as frozen study constraints

## Priority 2 — next improvements if another implementation slice starts

### P2.1 Continue reducing monolith pressure
- Further shrink `src/lib/diagnosis.ts`
- Further shrink `src/lib/plans.ts`
- Prefer moving domain maps and normalization helpers into narrower support modules

### P2.2 Recommendation-contract decision, if product pressure increases
- Only introduce a separate recommendation payload layer if current content-catalog outputs become a real maintenance blocker
- Do not add another contract layer just because the earlier plan named one

### P2.3 Docs and research materials freshness
- Keep roadmap, progress notes, and README aligned with the actually landed branch state
- Avoid stale references to removed search behavior or hidden-but-reachable routes

## Explicitly out of scope unless a human re-opens them
- reopening `/video-diagnose`
- restoring generic live platform search to the core consumer flow
- changing frozen `/library` ordering
- changing frozen `/rankings` ordering
- auth or schema rework
- growth, subscription, or payments work
