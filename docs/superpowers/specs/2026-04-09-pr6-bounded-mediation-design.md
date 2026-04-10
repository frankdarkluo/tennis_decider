# PR6 Bounded Mediation Design

## Summary

PR6 adds a small, typed mediation layer above the current diagnose intake path so TennisLevel can better understand vague, colloquial, and transcript-like complaints without turning `/diagnose` into a chatbot.

The key rule is deterministic-first. Clear inputs such as `反手总下网` or `发球没信心` should keep the current fast path and skip mediation entirely. Mediation only appears when the existing deterministic path is too weak or ambiguous to confidently route the user.

## Product Goal

Help users phrase weak tennis complaints into something the existing diagnose pipeline can use, while keeping the system:

- quiet
- typed
- reversible
- deterministic downstream

The intended user feeling is:

- clear input: immediate diagnosis
- vague input: one light assist, then diagnosis
- never: assistant chat session

## In Scope

- short typed complaint
- long free-text complaint
- pasted speech-transcript-like complaint
- one short `Did you mean...` paraphrase when helpful
- one best clarification question when the input is genuinely too vague
- quiet fallback to raw deterministic behavior when mediation is unavailable or not trustworthy

## Out of Scope

- live microphone capture
- browser speech APIs
- assistant-generated diagnosis
- assistant-generated training plan
- multi-turn assistant chat
- new model-provider configuration or productized AI settings

## Design Principles

### 1. Deterministic First

The existing deterministic intake and rule path should always get first chance to handle the complaint.

If deterministic confidence is already strong enough, PR6 should do nothing visible. The user should continue to get the current one-step diagnose experience.

### 2. Mediation Only On Weak Cases

Mediation should only run when the complaint is weak enough that the existing path cannot confidently map it into a usable diagnosis input or one safe follow-up.

Examples that should skip mediation:

- `反手总下网`
- `发球没信心`
- `比赛里截击老下网`
- `My overhead keeps going long`

Examples that may need mediation:

- `我打球感觉不太对`
- `总赢不了`
- `就是不顺`
- pasted transcript-like complaints with filler, repetition, and unclear stroke/problem focus

### 3. Quiet UX

The assistant should not present itself as a chatbot or a separate mode.

The only visible PR6 affordances should be:

- one short `Did you mean...` rewrite when it materially improves the complaint
- one short clarification question when the input is genuinely too vague

There should be no visible `Use my original words` label. The system may still keep a quiet fallback to the original complaint path internally.

### 4. Typed, Bounded Contract

The assistant output must be a small typed contract with a narrow purpose. It must not be allowed to invent diagnosis conclusions, training recommendations, or multi-step conversation state.

## Architecture

PR6 keeps the existing single consumer path:

complaint -> intake understanding -> targeted clarification if needed -> diagnosis -> plan

The new change is a mediation boundary inserted above the current intake orchestration, not inside diagnosis core and not inside plan generation.

### New Responsibility Split

- `prepareDiagnoseSubmission`
  - remains the orchestration boundary for `/diagnose`
  - becomes responsible for deciding whether the complaint is clear enough to skip mediation
  - decides whether to call the mediation module

- new mediation module
  - receives the raw complaint and locale
  - returns a small typed result
  - does not own diagnosis

- current intake/scenario/deterministic path
  - still owns scenario normalization, flow selection, and downstream routing
  - remains the source of truth after mediation has normalized or clarified the input

## Entry Policy

PR6 should replace the earlier `assistant always runs first` idea with a deterministic-first gate.

### Entry Gate

1. User submits complaint on `/diagnose`
2. The app runs the current deterministic quick-read path first
3. If confidence is already strong enough:
   - skip mediation
   - continue directly into the current intake/diagnosis path
4. If confidence is weak or ambiguous:
   - invoke mediation
   - use the typed mediation result to choose paraphrase, one clarification, or fallback

### Gate Outcome

This keeps most users unaware that mediation exists. Only weak-input cases should pay the extra interaction cost.

## Mediation Contract

PR6 should add a new typed result dedicated to mediation. Suggested shape:

```ts
type DiagnoseMediationMode = "skip" | "paraphrase" | "clarify" | "fallback";

type DiagnoseMediationReason =
  | "clear_enough"
  | "ambiguous"
  | "too_vague"
  | "transcript_noise"
  | "model_unavailable"
  | "low_confidence";

type DiagnoseMediationResult = {
  mode: DiagnoseMediationMode;
  reason: DiagnoseMediationReason;
  displayText: string | null;
  normalizedComplaint: string | null;
  clarificationQuestion: string | null;
};
```

### Mode Semantics

- `skip`
  - deterministic path is already good enough
  - show no assistant UI
  - continue with raw/current path

- `paraphrase`
  - show one short `Did you mean...`
  - continue with `normalizedComplaint`
  - do not pause the user for another turn

- `clarify`
  - show one best clarification question
  - wait for one answer
  - rerun intake using the clarified complaint

- `fallback`
  - mediation is unavailable, invalid, or not trustworthy
  - use raw complaint and current conservative path

## Confidence And Routing Policy

The exact threshold can be tuned in implementation, but the policy should be stable:

- strong deterministic confidence:
  - skip mediation

- weak deterministic confidence, but the complaint still looks compressible into a clearer tennis complaint:
  - mediation may return `paraphrase`

- weak deterministic confidence, and the complaint still lacks the minimum focus needed for safe routing:
  - mediation may return `clarify`

- mediation output invalid, empty, noisy, or low-confidence:
  - return `fallback`

The system must never allow repeated assistant clarification loops. One clarification is the upper bound for PR6.

## UI Behavior

PR6 should keep the current diagnose page structure and add only small bounded affordances.

### When Input Is Clear

- no assistant UI
- no extra step
- diagnosis behaves as it does today

### When Paraphrase Helps

- show one short `Did you mean...`
- show the rewritten phrasing that the system will use
- do not frame it as a chat reply
- do not force a second submit if the rewrite is good enough

### When Clarification Is Needed

- show one short clarification question
- keep the interaction inline
- after one answer, route back into the current deterministic intake/diagnosis path

### Internal Fallback To Original Words

The system should be able to quietly abandon the rewrite and use the user’s original words if:

- the mediation output is low-confidence
- the rewrite is empty or malformed
- the post-clarification result is still weak

This fallback should not appear as an explicit user-facing button label in PR6.

## Failure Handling

PR6 should fail quietly and conservatively.

### Model Unavailable

- do not surface a special assistant failure state
- fall back to the raw deterministic path

### Invalid Mediation Output

- discard invalid or unsupported output
- fall back to raw deterministic path

### Still Weak After One Clarification

- do not ask a second assistant question
- fall back into the existing conservative diagnose behavior

## Localization

PR6 must support:

- zh complaints
- en complaints
- mixed zh/en complaints

The typed mediation contract should be locale-aware, but the downstream deterministic path must remain stable regardless of whether the complaint came in raw or normalized.

## Expected Code Areas

- diagnose entry orchestration around `prepareDiagnoseSubmission`
- new mediation boundary module under the intake/diagnose area
- intake route or shared intake boundary code where the deterministic-first gate is applied
- small diagnose-page UI surface for paraphrase and one clarification
- zh/en regression tests for weak-input mediation behavior

## Testing Strategy

PR6 tests should prove that mediation helps weak inputs without slowing clear inputs.

### Core Regression Targets

- clear complaints skip mediation entirely
- weak complaints trigger a single mediation paraphrase when that is enough
- genuinely vague complaints trigger exactly one clarification
- no second clarification loop is possible
- mediation never outputs final diagnosis or plan
- invalid/low-confidence mediation output falls back cleanly
- zh, en, and mixed-language weak-input cases behave consistently

### Important Negative Tests

- `反手总下网` should not show assistant UI
- `发球没信心` should not show assistant UI
- `总赢不了` may trigger clarification
- transcript-like noisy input may trigger paraphrase or clarification, but never a chat sequence

## Acceptance Criteria

- better colloquial understanding for weak inputs
- clear inputs remain one-step and fast
- no chatbot drift
- deterministic diagnosis ownership remains intact
- mediation stays bounded, typed, and quiet

## Non-Goals For Implementation

PR6 should not try to solve:

- broad conversational intake
- final-answer generation by LLM
- AI-first diagnose UX
- reusable provider abstraction for external hosted models

## Recommended Implementation Shape

PR6 should be implemented as one focused feature slice with these boundaries:

1. deterministic-first mediation gate
2. typed mediation module
3. minimal diagnose-page UI surface
4. targeted regressions

That keeps the code easy to read and easy to remove later if the policy changes.
