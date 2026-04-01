# Training Plan Prescription Blocks Design

**Date:** 2026-03-30

**Owner:** Codex brainstorming pass

## Summary

The current 7-day training plan is directionally useful, but it still reads more like a curated study checklist than a coach-written training prescription.

Users already receive:

- a relevant `problemTag`
- a day-by-day focus
- drills
- duration
- recommended videos

What is still missing is the layer that makes a plan feel truly executable:

- how hard to train today
- what rhythm to use
- how to structure the session
- how to tell whether today's work was successful

This design upgrades the plan system from a `topic + drills + video` format into a lightweight but coach-like prescription format while keeping the current 7-day structure and avoiding a large architecture rewrite.

## Problem Statement

The current plan quality gap is not mainly about missing topics. It is about missing training prescription details.

Today many plans say what to work on, but they do not yet say enough about:

- session intensity
- practice tempo
- progression within the session
- concrete success criteria

As a result, users can read the plan and still feel unsure how to actually run the practice.

This also weakens research outcomes:

- users may agree that the diagnosis is plausible
- but still score actionability lower because the plan does not feel operational enough

## Design Goal

Make every day of the 7-day plan feel closer to a real coach-prescribed session.

Success means a user can answer all of these from the plan alone:

- What am I trying to fix today?
- How should I start?
- What is the main drill block?
- When do I add pressure or variation?
- How hard should I practice?
- What counts as a good session?

## Non-Goals

- rewriting the diagnosis system in the same change
- building a full periodization engine
- generating dynamic plans with AI
- redesigning the full plan page information architecture
- changing study-mode task structure or survey logic

## Recommendation

Adopt a `prescription block` model for each plan day.

Keep the current 7-day plan shape, but upgrade each day from a simple focus card into a structured training prescription with:

- `goal`
- `warmupBlock`
- `mainBlock`
- `pressureBlock`
- `successCriteria`
- `intensity`
- `tempo`
- existing `duration`
- existing `contentIds`

This gives a large perceived quality improvement without requiring a new planner engine.

## Options Considered

### Option A: Add only intensity, tempo, and success criteria

Pros:

- smallest change
- easiest migration path
- keeps current template format almost intact

Cons:

- still reads like annotation layered on top of a checklist
- not enough structure to feel like a real training session

### Option B: Upgrade each day into a prescription block model

Pros:

- most directly solves the “feels like a coach plan” problem
- supports intensity, tempo, and success criteria cleanly
- keeps rollout incremental
- fits the current template-driven architecture

Cons:

- requires `DayPlan` shape expansion
- requires template rewrite for prioritized tags
- requires a modest plan UI update

### Option C: Build a weekly progression engine first

Pros:

- highest long-term sophistication
- supports richer progression logic across 7 days

Cons:

- too heavy for the current maturity stage
- increases implementation and validation scope
- risks delaying visible quality gains

## Chosen Direction

Adopt Option B now, while borrowing one idea from Option C:

- each day should be a structured prescription
- the week should still show light progression across days
- but the system should not yet become a full periodization engine

## Prescription Block Model

Each plan day should include the following fields.

### Goal

One sentence describing today's technical objective.

Examples:

- stabilize second-serve net clearance
- move the backhand contact point farther in front
- reduce panic and overhit on pressure forehands

### Warmup Block

Low-pressure feeling and setup work that helps the user enter the session correctly.

Examples:

- toss reps
- shadow swings
- split-step timing reps
- no-ball preparation reps

### Main Block

The core repetition block for the day.

This should be the main training workload and must specify:

- drill type
- repetition structure
- target area or execution focus

### Pressure Block

A lighter pressure or transfer block that increases realism without turning the plan into a match simulation.

Examples:

- restart after a miss
- alternating targets
- movement before contact
- score-based serve sequences
- timed consistency sets

### Success Criteria

One concrete condition that tells the user whether the session was successful.

This is the most important missing piece in the current plan.

Examples:

- at least 14 of 20 balls clear the net and land in the target zone
- complete 3 sets of 8 second serves with at least 70% in
- keep the contact point in front on at least 8 of 10 filmed reps

### Intensity

A simple training load label.

Recommended values:

- `low`
- `medium`
- `medium_high`

The aim is guidance, not sports-science precision.

### Tempo

A short phrase describing the training rhythm.

Examples:

- slow feed, stable rhythm
- half-speed movement
- match rhythm at 70%
- full reset between reps

### Duration

Keep the current duration field.

This remains user-facing and should stay simple.

### Content Reference

Keep `contentIds`, but demote videos from “the plan” to “support for the plan.”

The user should first understand what to do, then what to watch.

## Day Progression Across the Week

The system should not yet encode full weekly periodization, but it should give each day a clearer role.

Recommended lightweight rhythm:

- Day 1: establish feel
- Day 2: stabilize form
- Day 3: accumulate clean repetition
- Day 4: review / lighter consolidation
- Day 5: add variation or movement
- Day 6: add controlled pressure
- Day 7: check transfer or mini-test

This rhythm should be reflected in templates, not a separate engine.

## Data Model Guidance

The current `DayPlan` shape should be expanded rather than replaced.

Recommended additions:

- `goal`
- `warmupDrills`
- `mainDrills`
- `pressureDrills`
- `successCriteria`
- `intensity`
- `tempo`

Compatibility guidance:

- keep existing `focus`
- keep existing `drills`
- keep existing `duration`
- keep existing `contentIds`

In phase 1, existing fields can continue to support older templates while prioritized templates move to the richer structure.

## UI Guidance

The plan UI should make the training prescription visible without becoming crowded.

Recommended hierarchy per day:

1. top row: day label, duration, intensity, tempo
2. goal line
3. structured blocks:
   - warmup
   - main block
   - pressure block
   - success criteria
4. supporting video reference below the blocks

Important display rule:

- videos should visually support the session
- they should not dominate the card

This helps the plan read as a training prescription rather than a content playlist.

## Prioritized First-Round Tags

The first rollout should focus on tags where better structure will be most noticeable.

Recommended first set:

- `second-serve-reliability`
- `first-serve-in`
- `backhand-into-net`
- `forehand-out`
- `movement-slow`
- `net-confidence`
- `doubles-positioning`
- `mobility-limit`

These cover common user complaints and give strong room for visible plan-quality improvement.

## Testing Strategy

Recommended test coverage:

- template generation includes prescription fields for upgraded tags
- plan UI renders intensity, tempo, and success criteria
- old templates still render safely
- assessment-derived plans still map to valid templates
- recommended content remains attached but is visually secondary

Recommended focus files:

- `src/lib/plans.ts`
- `src/data/planTemplates.ts`
- `src/components/plan/DayPlanCard.tsx`
- existing plan-related smoke and content-display tests

## Rollout Plan

### Phase 1: Data model and card support

- extend `DayPlan`
- update `DayPlanCard` rendering
- preserve backward compatibility

### Phase 2: Rewrite first-round high-value templates

- upgrade the prioritized tags to prescription blocks
- ensure every upgraded template includes intensity, tempo, and success criteria

### Phase 3: Tune weekly progression language

- align day roles across templates
- improve the “coach-like” feel without adding a new planning engine

## Risks And Guardrails

- Too much structure could make cards visually heavy.
- Over-specific success criteria could become unrealistic for weaker players.
- If only one or two tags are upgraded, plan quality may feel inconsistent.
- Videos must remain support, not reclaim the center of the plan.

## Acceptance Criteria

This design is successful if:

- each day reads like a real session rather than a checklist
- users can see intensity, tempo, and success criteria every day
- the first set of upgraded templates feels noticeably more coach-like
- current plan generation remains deterministic and template-driven
- the UI stays readable on both desktop and mobile
