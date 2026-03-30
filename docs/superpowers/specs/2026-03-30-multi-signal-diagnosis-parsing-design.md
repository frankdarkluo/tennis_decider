# Multi-Signal Diagnosis Parsing Design

**Date:** 2026-03-30

**Owner:** Codex planning pass

## Summary

The diagnosis system now needs to handle a harder kind of input: one user sentence may contain several different diagnosis signals at once.

Example:

- `正手在关键分的时候，如果对手在网前，我容易紧张，一发力就出界`

This is not just one phrase. It contains:

- a stroke signal
- an outcome signal
- a match-context signal
- a pressure signal
- a trigger / behavior signal

The current rule system is strongest when the input is short and clean, but mixed inputs create a new problem: multiple matchable phrases can compete for one result.

This design proposes a study-safe parsing layer that sits before final output composition:

1. split longer mixed inputs into smaller signal-bearing clauses
2. classify extracted signals into a 3-layer structure
3. keep exactly one deterministic primary diagnosis
4. preserve the other signals as modifiers or triggers instead of letting all tags compete equally

The goal is not to restrict users to short inputs. The goal is to make longer, more realistic user language easier for the system to understand deterministically.

## Current Context

Relevant current implementation:

- [src/lib/diagnosis.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/lib/diagnosis.ts) already normalizes text, extracts aliases/modifiers/slots, and chooses a primary rule
- [src/types/diagnosis.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/types/diagnosis.ts) already defines internal signal structures
- [src/data/diagnosisRules.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/data/diagnosisRules.ts) contains the current rule bank

The current system already has useful ingredients:

- normalization
- alias extraction
- modifier extraction
- slot-like internal signals

What it does not yet do clearly enough is:

- separate multiple signal phrases within one input
- classify those signals into different semantic layers
- prevent all matched signals from competing at the same level

## Problem Statement

### 1. One input can contain several different kinds of signals

A user sentence can mix:

- technical issue
- error outcome
- scenario
- pressure state
- trigger behavior

If the system treats the whole input as one undifferentiated string, diagnosis quality drops.

### 2. Not every matched signal should compete for primary diagnosis

In mixed inputs, some signals should compete for the main diagnosis, while others should only refine it.

For example:

- `forehand-out` may be a valid primary candidate
- `key_point` should usually be a modifier
- `opponent_at_net` should usually be a trigger

Putting them all in one scoring pool creates unnecessary ambiguity.

### 3. Input length is not the real problem

Longer inputs are harder mostly because they contain more kinds of information, not because they have more characters.

A hard length cap would:

- hide real user expression patterns
- drop valuable context
- make the study less representative

So the better fix is structured parsing, not simple truncation.

## Design Goals

- Support mixed multi-signal user inputs without forcing short phrasing
- Preserve exactly one primary diagnosis
- Separate “main problem” from “when it happens” and “what triggers it”
- Keep the system deterministic and testable
- Improve downstream explanation quality without requiring AI

## Non-Goals

- hard-limiting user input length as the main solution
- replacing the rule-based classifier with AI
- exposing a complex graph model directly in the UI
- redesigning the training-plan system in the same change

## Recommendation

Adopt a 3-layer parsing model:

1. `primary`
2. `modifiers`
3. `triggers / patterns`

This is better than a flat pool of tags and better than a 2-layer model because it preserves meaningful differences between:

- stable context signals
- more situational trigger signals

The system should use 3 layers internally, even if the UI later chooses to show only 2 layers.

## 3-Layer Model

### Layer 1: Primary

This layer answers:

- what should the user train first

Rules:

- exactly one primary diagnosis
- should stay stroke/outcome-first when strong evidence exists
- should map to the existing `problemTag` concept

Examples:

- `forehand-out`
- `second-serve-reliability`
- `mobility-limit`

### Layer 2: Modifiers

This layer answers:

- when or under what stable condition the problem becomes more obvious

These are important, but they should not usually replace the primary diagnosis.

Examples:

- `key_point`
- `tight`
- `doubles`
- `running`
- `moonball`
- `slice`
- `age`

### Layer 3: Triggers / Patterns

This layer answers:

- what specific trigger or behavior pattern tends to make the problem happen

These are often more granular and more situational than modifiers.

Examples:

- `opponent_at_net`
- `net_pressure`
- `overhit`
- `rush_finish`
- `late_contact`
- `hesitation`

## Why 3 Layers Instead Of 2

With only 2 layers, too many different signals get collapsed into “modifier.”

That creates problems such as:

- `key_point` and `opponent_at_net` being treated as the same kind of thing
- `tight` and `overhit` being treated as the same kind of thing
- weaker downstream copy decisions because the system cannot tell scene from trigger

The 3-layer model is still small enough to stay manageable, but expressive enough to capture real user language.

## Parsing Flow

### Step 1: Clause segmentation

Before final rule scoring, split the input into smaller meaningful clauses using:

- punctuation such as `，`, `。`, `、`, `;`
- conjunction-like structures such as `如果`, `一`, `就`, `但是`, `一到`
- repeated scene markers such as `关键分的时候`, `跑动中`, `比赛里`

This does not need full NLP parsing. Lightweight deterministic segmentation is enough.

Example:

- input: `正手在关键分的时候，如果对手在网前，我容易紧张，一发力就出界`
- segmented clauses:
  - `正手`
  - `关键分的时候`
  - `对手在网前`
  - `我容易紧张`
  - `一发力就出界`

### Step 2: Signal typing

Each clause should be typed into one of these buckets:

- primary candidate
- modifier
- trigger / pattern
- support signal
- unknown / low-confidence

This step is more important than trying to map every clause directly to a public tag.

### Step 3: Primary anchoring

Choose one primary diagnosis using deterministic ranking rules.

Recommended preference order:

- stroke + outcome
- stroke + movement or incoming-ball context
- physical limitation primary
- tactical primary
- mental fallback primary

Everything else gets attached around the chosen primary instead of competing equally with it.

## Signal Boundary Guidance

### Primary candidates

These are usually eligible to compete for the main diagnosis:

- stroke + error outcome pairs
- movement-limitation signals
- clearly distinct tactical problem families already represented as `problemTag`

Examples:

- `forehand-out`
- `backhand-into-net`
- `volley-floating`
- `mobility-limit`

### Modifiers

These should usually refine, not replace:

- `key_point`
- `match`
- `doubles`
- `running`
- `tight`
- `moonball`
- `slice`

### Triggers / patterns

These should usually explain why the primary gets worse:

- `opponent_at_net`
- `net_pressure`
- `overhit`
- `rush_finish`
- `hesitation`
- `late_contact`

## Example Interpretation

Input:

- `正手在关键分的时候，如果对手在网前，我容易紧张，一发力就出界`

Parsed result:

- `primary`: `forehand-out`
- `modifiers`:
  - `key_point`
  - `tight`
- `triggers / patterns`:
  - `opponent_at_net`
  - `overhit`

This is the intended behavior:

- the main training priority remains technical and focused
- the user’s real scene is preserved
- downstream copy can say something more relevant

## Input-Length Guidance

The system should not hard-reject users simply for writing a long sentence.

Recommended behavior:

- allow realistic freeform input
- parse it into clauses internally
- optionally give light UI guidance for better phrasing

Acceptable UI hint examples:

- `尽量带上动作 + 错误 + 场景，比如：关键分时正手一发力就出界`

Avoid:

- strict short-character limits as the main diagnosis strategy
- truncating away context without user visibility

## Data-Model Guidance

This phase should keep the public result contract stable where possible.

Recommended internal model:

- `primaryProblemTag`
- `modifiers[]`
- `triggerSignals[]`

These can initially stay internal to parsing and output composition.

Only expose more structure publicly if the UI or analytics truly need it.

## Rollout Plan

### PR1: Clause segmentation and signal typing

- add deterministic clause splitting
- type signals into primary/modifier/trigger buckets
- keep current final output behavior mostly stable

### PR2: Primary anchoring

- update candidate resolution so only eligible signals compete for primary
- preserve non-primary signals for downstream use

### PR3: Downstream integration

- feed 3-layer parsed signals into modifier-aware diagnosis copy
- optionally feed the same structure into later plan-selection refinement

## Testing Strategy

Recommended test themes:

- mixed inputs are segmented into meaningful clauses
- multiple matched phrases do not all compete as primary tags
- the intended primary remains stable for mixed-input cases
- modifiers and triggers are preserved deterministically
- short clean inputs still behave exactly as before

Suggested focus files:

- [src/lib/diagnosis.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/lib/diagnosis.ts)
- [src/types/diagnosis.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/types/diagnosis.ts)
- a diagnosis parsing unit test file near [src/lib/diagnosis.ts](/Users/gluo/Desktop/tennis_level/.worktrees/diagnosis-usability-upgrade/src/lib/diagnosis.ts)

## Risks And Guardrails

- Clause splitting that is too aggressive may fragment clean inputs unnecessarily.
- Too many trigger types could become harder to maintain than the primary taxonomy.
- Trigger extraction must not overpower obvious stroke/outcome evidence.
- The system should not infer very specific tactical stories that the user never actually stated.

## Acceptance Criteria

This design is successful if a follow-on implementation can:

- keep exactly one primary diagnosis for mixed inputs
- preserve context and trigger information without letting all signals compete equally
- parse a sentence like `正手在关键分的时候，如果对手在网前，我容易紧张，一发力就出界` into a stable 3-layer structure
- improve downstream explanation quality while staying deterministic and testable
