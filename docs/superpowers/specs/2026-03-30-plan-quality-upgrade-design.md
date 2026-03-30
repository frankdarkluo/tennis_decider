# Plan Quality Upgrade Design

**Date:** 2026-03-30

**Owner:** Codex planning pass

## Summary

The diagnosis system now recognizes a broader set of tennis problems, but the training-plan layer has not fully caught up. Many plans still feel more like generic 7-day templates than targeted, easy-to-follow next steps for the exact issue the user just described.

This design defines the first phase of a plan-quality upgrade that stays study-safe and deterministic:

1. improve plan quality primarily by `problemTag`
2. apply only light `level` tuning instead of multiplying plan variants
3. tighten daily content mapping so each day points to a more relevant teaching video
4. make `/plan` easier to scan by clarifying the `DayPlanCard` information hierarchy
5. keep GIF / animated helper visuals out of this phase and move them into a follow-up project

The goal is not to make plans shorter by default. The goal is to make them clearer, more targeted, and easier to act on at a glance.

## Current Context

Relevant current implementation:

- [src/data/planTemplates.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/data/planTemplates.ts) contains the hand-authored 7-day templates
- [src/lib/plans.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/lib/plans.ts) resolves plan templates, applies compatibility fallbacks, and chooses related content
- [src/components/plan/DayPlanCard.tsx](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/components/plan/DayPlanCard.tsx) renders each day card on `/plan`
- [src/app/plan/page.tsx](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/app/plan/page.tsx) assembles the page
- [src/data/contents.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/data/contents.ts) and [src/data/expandedContents.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/data/expandedContents.ts) define the video pool
- [src/data/diagnosisRules.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/data/diagnosisRules.ts) now exposes a richer problem-tag set that the plan layer should honor better

Current gaps:

- some newly strengthened diagnosis tags still rely on weak compatibility fallback behavior in the plan layer
- many daily `focus` lines are serviceable but not crisp enough as “today’s main job”
- daily drills are sometimes too generic relative to the diagnosed issue
- day-level recommended content is often only broadly related to the whole plan, not tightly matched to that day’s focus
- `/plan` cards are usable, but the hierarchy between “today’s focus”, “what to do”, “what to watch”, and “how long” can be clearer

## Problem Statement

### 1. Diagnosis coverage now exceeds plan specificity

The diagnosis layer can now distinguish cases such as:

- `first-serve-in`
- `overhead-timing`
- `volley-floating`
- `running-forehand`
- `mobility-limit`

But the plan layer still often routes these problems through broad fallback logic or templates that do not feel sharply matched to the exact complaint.

### 2. Some plans are understandable, but not immediately actionable

The issue is not raw length. A plan can be slightly longer and still be better if it is clear. The real problem is when users cannot instantly tell:

- what today’s main task is
- what specific drills they should do
- which video is worth opening

### 3. Content mapping is not always day-specific enough

The current system can recommend reasonable content overall, but day-level `contentIds` can still be too loosely connected to the day’s exact drill theme. This matters more now that the diagnosis problem tags are more precise.

### 4. Fallback plans need to feel deliberate, not generic filler

`general-improvement` or other fallback routes are still necessary, especially for assessment and support-signal-adjacent paths. But the fallback plan should still feel structured and useful rather than like an obvious generic placeholder.

## Design Goals

- Make plans more targeted by `problemTag`
- Keep `level` tuning light and deterministic
- Improve clarity of each day’s `focus`, `drills`, `duration`, and `watch` recommendation
- Cover diagnose-driven, assessment-driven, and fallback plan entry paths
- Allow small, high-confidence curated content additions from existing teaching creators when needed
- Preserve study safety and deterministic behavior

## Non-Goals

- adding GIF or motion assets in this phase
- adding a new “why this matters today” data field
- introducing AI-generated plan copy
- redesigning the 7-day plan into a different structure
- large-scale library expansion or content-pipeline overhaul
- changing study snapshot architecture

## Recommendation

Adopt a balanced first-phase upgrade:

- rewrite and expand the most important templates by `problemTag`
- use `level` only for light variation in difficulty, volume, duration, and content difficulty
- improve day-level content mapping
- slightly improve `/plan` card hierarchy without changing the plan data contract

This gives a meaningful user-facing improvement while keeping scope aligned with `Efficiency.md`.

## Scope

### Included in Phase 1

- `diagnose -> /plan`
- `assessment -> /plan`
- `fallback/general-improvement -> /plan`
- `planTemplates` quality upgrades
- light plan-selection tuning in `src/lib/plans.ts`
- small `/plan` information-hierarchy improvements
- small curated teaching-video additions from existing creators when real coverage is missing

### Explicitly deferred to Phase 2

- GIF / animated helper system
- motion asset taxonomy
- asset slots on each day card
- motion-specific design and implementation

## Plan Content Strategy

### Problem-tag first, level second

The primary driver of plan quality should be `problemTag`.

For example:

- `overhead-timing` should feel materially different from `late-contact`
- `volley-floating` should feel materially different from `net-confidence`
- `mobility-limit` should feel materially different from `movement-slow`

`level` should only add light tuning, such as:

- slightly shorter or simpler drills for lower levels
- slightly tighter success criteria for higher levels
- slightly different preferred content difficulty

This phase should not explode into many large per-level template families.

### 7-day structure stays

The 7-day structure remains unchanged.

This phase improves:

- what each day focuses on
- how concrete the drills are
- which video is attached to that day
- how easy the card is to scan

### Fallback plans still need intention

Fallback plans should remain general, but they should still be purposeful.

The fallback `general-improvement` style plan should bias toward:

- stable rally foundations
- movement and arrival timing
- serve rhythm
- simple self-practice structure

It should read like a safe, coach-like entry plan rather than a leftover generic block.

## Priority Problem Tags

This phase should not try to perfect every tag equally. Prioritize the tags that are both newly valuable and easy for users to notice:

- `first-serve-in`
- `second-serve-reliability`
- `serve-toss-consistency`
- `movement-slow`
- `overhead-timing`
- `volley-floating`
- `volley-into-net`
- `running-forehand`
- `running-backhand`
- `mobility-limit`
- `pressure-tightness`
- `moonball-trouble`

Secondary improvements can still be made to nearby templates when they share content or copy patterns.

## Daily Content Principles

Each day should still carry the existing four data points:

- `focus`
- `drills`
- `contentIds`
- `duration`

But they should follow stricter authoring guidance:

### Focus

- should read like the day’s one main job
- should be short, concrete, and scannable
- should avoid vague labels like “稳定性训练” unless the plan is truly fallback-general

### Drills

- should be executable without extra interpretation
- should prefer one clean objective per bullet
- should avoid coach-sounding filler that does not change behavior

### Content mapping

- should match the day’s drill theme, not just the overall problem tag
- should prefer one strong day-level video instead of several loosely related options
- should favor legitimate teaching or explanation videos only

### Duration

- should remain lightweight and realistic for rec players
- can be lightly tuned by level
- should not imply a large hidden training load

## Curated Content Strategy

When content coverage is missing, the order of operations should be:

1. reuse existing `contents.ts`
2. reuse existing `expandedContents.ts`
3. retag or remap a small number of already-valid curated items if the fit is honest
4. only then add a small number of new curated items from existing creators

Guardrails:

- only use existing creators already in the repo
- only add genuine tennis teaching / explanation videos
- do not add vlog, lifestyle, match-highlights-only, or entertainment-first short clips
- do not trigger broad expanded-library churn unless clearly necessary

## `/plan` UI Strategy

### Day card goals

The `DayPlanCard` should help the user scan this order:

1. today’s main focus
2. what to do
3. how long it takes
4. what to watch

The card should feel easier to parse, not more feature-rich.

### Included UI changes

- clarify section ordering
- strengthen section labels where needed
- make the “today” card especially obvious
- keep the watch block visually distinct from the drills block

### Excluded UI changes

- no motion area
- no right-side GIF slot
- no extra AI explanation block
- no new multi-step interaction flow

## Data-Model Guidance

This phase should keep the current public plan structure intact.

Recommended approach:

- do not change `DayPlan`
- do not add a `why` field yet
- do not add motion-asset fields yet
- improve template content and rendering order inside the current contract

This keeps the first phase lower risk and avoids unnecessary downstream changes to saved plan artifacts and study logging.

## Testing Strategy

Recommended focus areas:

- plan lookup prefers more specific templates for newly strengthened problem tags
- compatibility fallback does not swallow tags that now deserve their own templates
- day-level content mapping stays deterministic
- fallback/general-improvement still resolves cleanly
- `/plan` card hierarchy changes remain readable in smoke coverage

Likely test surfaces:

- [src/__tests__/content-display.test.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/__tests__/content-display.test.ts)
- a plan-focused test file around [src/lib/plans.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/lib/plans.ts) if needed
- existing smoke coverage around [src/app/plan/page.tsx](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/app/plan/page.tsx)

## Risks And Guardrails

- Overwriting too many templates at once could reduce consistency across the plan set.
- Small curated additions can create review churn if they are not tightly scoped.
- Level tuning must stay light; otherwise the plan matrix becomes hard to maintain.
- Day-card hierarchy improvements should not become a disguised redesign.
- GIF requirements are real, but they must stay out of this phase to avoid mixing content work with asset-system work.

## Acceptance Criteria

This design is successful if a follow-on implementation can:

- make plan recommendations feel more specific to the diagnosed problem
- keep plan copy concise, clear, and actionable without chasing shortness for its own sake
- improve the readability of daily plan cards
- improve fallback-plan quality
- add only a small, justified set of curated teaching videos if necessary
- defer the GIF system cleanly into a second project without blocking this phase
