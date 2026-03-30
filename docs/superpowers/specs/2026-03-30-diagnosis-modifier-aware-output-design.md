# Modifier-Aware Diagnosis Output Design

**Date:** 2026-03-30

**Owner:** Codex planning pass

## Summary

The diagnosis engine is starting to recognize richer tennis language, but the rendered output still compresses too much of the user’s sentence into one broad technical label.

For example:

- input: `正手在关键分的时候，如果对手在网前，我容易紧张，一发力就出界`
- current primary output: `正手控制不足`
- current first fix: `先增加上旋弧线`

That output is not wrong, but it feels incomplete because it drops the user’s most important context:

- `关键分`
- `对手在网前`
- `容易紧张`
- `一发力就出界`

This design proposes a study-safe middle layer:

1. keep deterministic primary diagnosis selection
2. extract and preserve modifier/context signals more reliably
3. generate diagnosis copy that reflects both the main technical issue and the situation where it shows up
4. defer AI-first diagnosis and use any future AI only as an optional explanation layer

The goal is to make users feel “the system understood my situation,” not just “the system found a roughly related stroke label.”

## Current Context

Relevant current implementation:

- [src/lib/diagnosis.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/lib/diagnosis.ts) already builds internal `aliases`, `modifiers`, `slots`, and `internalSignals`
- [src/types/diagnosis.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/types/diagnosis.ts) already defines `DiagnosisSignalBundle`
- [src/data/diagnosisRules.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/data/diagnosisRules.ts) contains the current rule inventory and user-facing copy foundations

The current architecture is already close to what we need:

- choose one deterministic `problemTag`
- collect extra signals internally
- render a title, summary, causes, fixes, and drills

The weak point is not signal extraction alone. The weak point is that the rendered output mostly speaks in problem-tag language and underuses the extracted context.

## Problem Statement

### 1. The system often recognizes more than it shows

For mixed inputs, the matcher may already have enough clues to identify:

- the stroke family
- the outcome
- the pressure state
- the match context

But the user-facing output usually collapses everything into a broad title and generic first fix.

### 2. Users care about the scene, not only the stroke

When a user writes something like:

- `关键分正手老飞`
- `对手一上网我就慌，正手想穿越结果出界`
- `比赛一紧张二发就不敢加速`

they are not only naming a technique problem. They are naming:

- when it happens
- what triggered it
- how they react under pressure

If the diagnosis ignores that layer, the result feels flat even when the primary tag is directionally correct.

### 3. Jumping straight to AI-first diagnosis is too early

An AI-first classifier could produce richer sounding output, but it would introduce study risk:

- less deterministic behavior
- harder-to-test diagnosis boundaries
- harder-to-debug mismatch between input and result

The current research phase benefits more from a stronger deterministic intermediate layer than from a full AI rewrite.

## Design Goals

- Preserve deterministic primary diagnosis
- Make output reflect the user’s context and pressure state more clearly
- Improve perceived relevance without expanding the public diagnosis schema too aggressively
- Keep the system testable and debuggable
- Leave room for a future AI explanation layer without depending on it now

## Non-Goals

- replacing the current rule-based primary classifier with AI
- exposing all internal signals directly in the public result contract in phase 1
- redesigning the training-plan system in the same change
- building a full tennis ontology for every possible match situation

## Recommendation

Adopt a modifier-aware output layer.

The system should continue to select one primary `problemTag`, but it should also use extracted context to shape:

- title emphasis
- summary framing
- first fix / “today remember this” phrasing
- optional short scene explanation

This is the highest-value next step because it improves perceived intelligence without sacrificing determinism.

## Core Idea

The diagnosis result should be understood internally as:

- `primary diagnosis`: what to train first
- `modifiers`: when the problem shows up
- `trigger/context signals`: what tends to provoke the error
- `copy strategy`: how to describe the problem in a user-facing way

Example interpretation:

- input: `正手在关键分的时候，如果对手在网前，我容易紧张，一发力就出界`
- primary: `forehand-out`
- modifiers/signals:
  - `key_point`
  - `tight`
  - `opponent_at_net` or `net_pressure`
  - `overhit`

Expected output shape:

- primary title stays technical enough to anchor practice
- summary explains that the issue gets worse in key-point / net-pressure situations
- first fix prioritizes a match-safe adjustment, not only a generic mechanics cue

## Modifier Model Expansion

The current modifier model is too narrow for this layer. It should grow carefully.

### Keep as true modifiers

- `key_point`
- `tight`
- `match`
- `doubles`
- `running`
- `moonball`
- `slice`
- `age`

### Add high-value scene triggers

These do not all need to become public schema fields. Internal signals are enough at first.

- `opponent_at_net`
- `net_pressure`
- `overhit`
- `rush_finish` or `trying_to_do_too_much`
- `hesitation`

### Boundary rule

- technical issue remains the primary diagnosis
- context and pressure cues shape the explanation
- mental cues should not usually replace a strong stroke/outcome diagnosis

Example:

- `关键分正手老飞` -> primary `forehand-out`, modifier `key_point`
- `对手上网我就想一拍打死，结果正手老飞` -> primary `forehand-out`, modifiers `net_pressure`, `overhit`
- `比赛一紧张二发就乱` -> primary `second-serve-reliability`, modifier `tight`

## Output Model

This phase should not force a broad schema rewrite. The system can improve output in stages.

### Stage 1: Copy assembled from existing internal signals

Keep the public `DiagnosisResult` shape stable, but build smarter values for:

- `title`
- `summary`
- `fixes[0]`

That alone would make the rendered diagnosis feel much more situation-aware.

### Stage 2: Optional internal presentation fields

If the UI needs clearer structure later, add internal or lightly-exposed fields such as:

- `sceneLabel`
- `pressureLabel`
- `todayCue`
- `avoidFirst`

These should be added only if the rendering layer truly benefits.

### Output principle

The first line should answer:

- what breaks first

The second line should answer:

- when or why it tends to break

The first fix should answer:

- what to simplify immediately in that specific scene

## Copy Strategy

### Current weak pattern

- title: broad technique label
- summary: generic cause stack
- first fix: generic mechanic correction

This is useful for clean inputs, but weak for mixed inputs.

### Recommended pattern

- title: still anchored to the main technical issue
- summary: explicitly mention the strongest modifier or trigger
- first fix: prioritize a match-safe simplification that fits the scene

Example transformation:

- current:
  - title: `正手控制不足`
  - fix: `先增加上旋弧线`

- recommended:
  - title: `关键分下的正手出界更明显`
  - summary: `你的主要问题还是正手发力后容易出界，但它在关键分、对手压网时会更容易发生，因为人一紧就容易想一拍发力解决。`
  - first fix: `关键分看到对手在网前时，先把正手打高一点、深一点，不要先追求一拍穿越。`

The system does not need perfect prose every time. It only needs to stop ignoring the most important situation signals.

## Deterministic Before AI

### Recommended near-term architecture

1. deterministic rule selection picks `problemTag`
2. deterministic alias/modifier/trigger extraction gathers context
3. deterministic copy templates compose a richer explanation

This should remain the default study path.

### Optional future AI layer

If AI is introduced later, it should not replace primary diagnosis selection in this phase.

The safer role for AI is:

- rewrite structured diagnosis into more natural language
- personalize tone
- compress or expand explanation for readability

The AI input should be structured, for example:

- `problemTag=forehand-out`
- `modifiers=[key_point, tight, net_pressure, overhit]`
- `base_fix=add_arc_before_power`

The AI output should be only the explanation layer, not the source of truth for diagnosis classification.

## Rollout Plan

### PR1: Modifier coverage gaps

- add a small number of high-value modifiers / internal triggers
- prioritize `key_point`, `tight`, `net_pressure`, `opponent_at_net`, `overhit`
- keep tie-breaking deterministic

### PR2: Modifier-aware copy composition

- update title/summary/first-fix generation
- add tests for mixed-input scenario outputs
- keep public diagnosis result contract stable if possible

### PR3: Optional presentation refinement

- expose one or two structured copy fields only if the UI truly needs them
- avoid broad schema growth unless rendering demands it

### Deferred

- AI-generated explanation layer
- AI-generated diagnosis classification

## Testing Strategy

Recommended new test themes:

- mixed inputs keep the correct technical primary diagnosis
- modifiers change summary phrasing without hijacking the main tag
- pressure/context scenes produce more specific first-fix language
- existing clean inputs still render the same or nearly the same output

Suggested focus files:

- [src/lib/diagnosis.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/lib/diagnosis.ts)
- [src/types/diagnosis.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/types/diagnosis.ts)
- a new diagnosis output test file near [src/lib/diagnosis.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/lib/diagnosis.ts)

## Risks And Guardrails

- Too much copy branching could become harder to maintain than the rule matcher itself.
- Modifier phrasing must not overwrite an obvious technical diagnosis.
- Over-normalizing match-context language could create false positives.
- The output should sound more specific, but it should not hallucinate exact tactical intent the user did not express.

## Acceptance Criteria

This design is successful if a follow-on implementation can:

- keep `forehand-out` as the primary diagnosis for mixed “关键分 + 紧张 + 对手网前 + 一发力就出界” inputs
- produce a summary that explicitly mentions the strongest scene modifier
- produce a first fix that feels scene-aware rather than purely generic
- remain deterministic and testable without requiring AI
