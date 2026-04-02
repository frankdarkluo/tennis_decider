# Participant Identity Cleanup Design

**Date:** 2026-04-01

## Goal

Make the study and research data path strictly `participant_id`-centric so every SportsHCI-relevant row can be traced to the correct participant and session without relying on `user_id`.

Also define a minimal future-safe product identity direction:
- study / research identity: `participant_id`
- future product identity: `profile_id`
- login / contact attribute: `email`

This design does **not** implement a full product-profile system now. It only removes `user_id` from the research path and leaves a clean conceptual seam for future product persistence.

It also tightens the SportsHCI analysis contract so researchers can answer:
- what diagnosis problem the participant typed in their own words
- which page held attention the longest
- which page accumulated the most clicks
- whether the participant actually experienced every required study page
- how many times a participant retried or revisited a flow before producing the current effective submission

## Why this change

Current study data collection mixes two identity systems:
- `participant_id` and `session_id` in study-mode tables
- `user_id` in some shared research/event/survey paths

For SportsHCI analysis, this creates avoidable ambiguity:
- some rows are attributable by participant
- some rows are attributable by auth user
- some write paths permit both

Because participant study collection has not started yet, the cleanest move is to normalize now instead of carrying a mixed identity model into first data collection.

## Current-state findings

### Study identity already exists

The study path already has a participant/session model:
- `study_participants`
- `study_sessions`
- `study_artifacts`
- `study_task_ratings`
- study-mode rows in `event_logs`

### `user_id` still leaks into research paths

Observed mixed identity paths include:
- `event_logs`
  - base schema in `supabase/research_infra.sql` includes `user_id`
  - client logger carries both `userId` and `participantId`
- `survey_responses`
  - base schema includes `user_id`
  - `saveSurveyResponse` currently writes `user_id`
- export helpers in `src/lib/researchData.ts`
  - support reading mixed rows rather than enforcing participant/session completeness

### Admin auth is a separate concern

Researcher/admin export access is already handled by auth policies. That is a valid use of authenticated identity, but it should stay on the **access-control side**, not inside participant behavior rows.

## Proposed identity model

### Canonical study identity

Every study row must be attributable through:
- `study_id`
- `participant_id`
- `session_id` where session-scoped

Rules:
- `participant_id` is the canonical person-level identity for all study and research data.
- `session_id` is the canonical per-session identity.
- `study_id` remains the study protocol / run identifier.
- `user_id` is not part of the study data contract.

### Future product identity

Future non-study product persistence should use:
- `profile_id` as the product identity key
- `email` as an attribute, not a join key

This design only documents that direction. It does **not** require implementing product profiles now.

## Scope

### In scope

- study-mode API routes
  - session start / end
  - event intake
  - artifact intake
  - task ratings
- study-facing event logging and persistence helpers
- study export and remote validation logic
- research SQL files and study/research table contracts
- internal SUS questionnaire persistence and final open-feedback capture
- diagnosis raw-input capture for study analysis
- derived metrics for page dwell, page click concentration, and required-page coverage
- submission-bundle rules for repeated assessment / diagnosis / plan / survey attempts
- tests that prove participant/session lineage

### Out of scope

- auth flow redesign
- non-study product persistence redesign
- replacing product-mode persistence with `profile_id` now
- `/video-diagnose` scope decisions
- changing study-event semantics or export meaning beyond identity cleanup
- any migration strategy for already-collected participant data, because collection has not started yet

## Target data contract

### Required identifiers by table

`study_participants`
- required: `study_id`, `participant_id`
- no `user_id`

`study_sessions`
- required: `study_id`, `participant_id`, `session_id`
- no `user_id`

`study_artifacts`
- required: `study_id`, `participant_id`, `session_id`
- no `user_id`

`study_task_ratings`
- required: `study_id`, `participant_id`, `session_id`
- no `user_id`
- used for task-level `actionability` only, not SUS

`event_logs` when `study_mode = true`
- required: `study_id`, `participant_id`, `session_id`
- must not depend on `user_id`

`survey_responses` when used for study collection
- required: `study_id`, `participant_id`, `session_id` when session-scoped
- no `user_id`
- used for the final in-product SUS questionnaire and end-of-study open feedback

`study_artifacts` when `artifact_type = diagnosis`
- required: `study_id`, `participant_id`, `session_id`
- must retain the participant's diagnosis input text for research export
- must also retain structured diagnosis output such as `problemTag`, `matchedRuleId`, and recommendation ids
- raw diagnosis input must not be duplicated into generic `event_logs` payloads

### Contract rule

If a study row cannot be unambiguously grouped under `participant_id` and, where relevant, `session_id`, that row shape is invalid.

### Submission bundle rule

For flows where the participant must complete multiple inputs before proceeding, the study model should distinguish:
- append-only interaction history
- latest effective submission state

Design rule:
- clicks, starts, retries, and intermediate steps stay append-only in `event_logs`
- the current effective answer set for a task is represented by the latest successful submission bundle for that task
- redoing a task must not reduce historical click or attempt counts
- redoing a task should replace the previous effective answer bundle for analysis that depends on the participant's latest state

This rule applies to:
- `study_background`
- `assessment`
- `diagnosis`
- `plan`
- `sus_survey`

## Simplification strategy

### 1. Separate study identity from product identity

Study data should not attempt to carry auth identity.

Admin/researcher auth remains valid for:
- gated export access
- remote admin pages
- RLS admin read policies

But participant behavior rows should not embed `user_id`.

### 2. Remove dead dual-identity fields

Remove `user_id` from the study-facing code path:
- request payloads
- insert helpers
- event logger state
- survey writes
- export shapes
- validation fixtures

At the same time, keep raw free-text collection narrowly scoped:
- preserve diagnosis input text only in the dedicated study diagnosis artifact
- keep generic event payload sanitization in place so free text does not leak into broad telemetry tables
- export raw diagnosis input only through the participant/session-scoped study bundle

For repeated submissions:
- do not delete or backfill old interaction events
- do not collapse click counts downward after a retry
- do expose one latest effective submission per task when analysis needs the participant's current state

### 3. Keep shared tables only if the study contract is explicit

If a table is shared across study and non-study paths, the study-side rules must still be explicit.

For example:
- shared `event_logs` is acceptable only if study rows are enforced to use participant/session linkage
- shared `survey_responses` is acceptable only if study responses no longer rely on `user_id`

If a shared table cannot express a clean participant contract, the follow-up recommendation is to split study rows into dedicated tables.

## Implementation slices

### Slice A: Study identity audit and enforcement

Goal:
- find every study/research write path that still depends on `user_id`

Outputs:
- inventory of affected files
- tests proving missing participant/session linkage is rejected

### Slice B: Study write-path cleanup

Goal:
- remove `user_id` from study event, survey, artifact, and rating writes

Outputs:
- study APIs accept only participant/session-based identity
- client helpers send only participant/session-based identity for study mode

### Slice C: Export and validation cleanup

Goal:
- make export and remote validation participant-first

Outputs:
- exports no longer expect `user_id` for study analysis
- validation fixtures assert participant/session completeness
- exports expose diagnosis input text, page-level dwell, page-level click concentration, and required-route coverage
- exports distinguish raw submission history from latest effective submission state
- exports treat task actionability and final SUS as separate instruments

### Slice D: SQL and schema simplification

Goal:
- align SQL schema and policies with the new contract

Outputs:
- research SQL files no longer define study-relevant `user_id` dependencies
- policies remain auth-based for admin access, but not participant-row identity

### Slice E: Future product identity note

Goal:
- record the future-safe product direction without implementing full product profiles

Outputs:
- local doc note or typed placeholder clarifying:
  - future product persistence uses `profile_id`
  - email is attribute-only

## SQL design direction

### Study-mode tables

Keep:
- `study_participants`
- `study_sessions`
- `study_artifacts`
- `study_task_ratings`

These already match the participant/session model and should become the canonical reference.

### Shared research tables

`event_logs`
- retain if needed for both study and non-study telemetry
- for study rows, enforce:
  - `study_mode = true`
  - `participant_id is not null`
  - `session_id is not null`

`survey_responses`
- if used for the in-product final SUS flow, add or enforce participant/session fields and remove study dependence on `user_id`
- if it cannot cleanly support both modes, split in a later follow-up

`study_artifacts`
- retain diagnosis artifacts as the canonical place for raw diagnosis input text
- do not copy diagnosis raw text into `event_logs`
- store repeated submissions as append-only artifact rows, while export logic resolves the latest effective bundle per artifact type when needed

### Policy direction

Policies should distinguish:
- who may write/read as a participant flow
- who may read as a researcher/admin

But not:
- participant identity = authenticated user identity

## Export design direction

The export bundle should be analyzable with:
- participant-level grouping by `participant_id`
- session-level grouping by `session_id`
- study-level grouping by `study_id`

No export consumer should need `user_id` to answer:
- what a participant did
- what session a row belongs to
- what artifacts/ratings/events belong together

The export bundle should also directly answer the core SportsHCI questions:
- what problem the participant typed into the diagnosis box
- which page had the longest dwell time
- which page had the highest click count
- whether all required study pages were experienced
- how many times the participant retried a flow before the current effective result

The measurement layers should stay distinct:
- `actionability`: immediate task-level helpfulness rating inside the product flow
- `SUS`: final system-level usability questionnaire after the participant has experienced the full study path

### Submission history vs latest effective state

The export bundle should expose both:
- raw submission history for replay and audit
- latest effective submission for analysis that needs the participant's current state

Recommended export semantics:
- interaction counts come from append-only `event_logs`
- submission attempt counts come from append-only artifact history or explicit submit events
- "current answer" analyses use the latest successful submission bundle by `artifact_type` within the participant/session scope

Examples:
- if a participant clicks into assessment three times, the assessment-entry click count remains `3`
- if the participant completes assessment twice, the latest assessment answers and level replace the earlier ones as the effective assessment state
- if the participant regenerates a plan multiple times, plan-generation count keeps increasing, but the latest generated plan becomes the effective plan state
- the same rule applies to diagnosis and final SUS re-submission

### Actionability vs SUS

These are separate instruments and should not be modeled as one questionnaire.

`actionability`
- collected inside the product immediately after key tasks
- stored in `study_task_ratings`
- remains task-scoped
- should measure relative clarity gain, not whether the system produced a perfect answer
- answers questions like: "after this task, is the participant clearer than before about what to practice next?"

`SUS`
- collected inside the product on `/survey`
- shown only after the participant has completed the intended study experience
- stored in `survey_responses` and mirrored into the participant/session-scoped study export bundle
- answers questions like: "after using the system as a whole, how usable did it feel?"

Design rule:
- do not merge actionability scores into SUS reporting
- do not show the SUS questionnaire in the middle of the core experience flow
- route participants to `/survey` only at the end of the study flow
- do not repeat baseline background questions in the final `/survey`

### Actionability wording direction

Because the product is still evolving, the actionability prompt should avoid implying that TennisLevel must always deliver a complete or perfect answer.

Recommended wording direction:
- prefer relative-progress framing such as:
  - "完成这一步后，我比之前更清楚下一步该练什么。"
  - "After this step, I am clearer than before about what I should practice next."
- acceptable alternate framing:
  - "这一步帮助我缩小了我接下来该练什么的范围。"
  - "This step helped narrow what I should work on next."

Avoid wording that implies absolute certainty, such as:
- "完成后我知道下一步该练什么"
- "After completing this task, I know exactly what I should practice next"

Rationale:
- this keeps the measure aligned with TennisLevel's actual value proposition: narrowing and routing
- it reduces the chance that early product rough edges artificially depress the actionability score
- it makes the measure more defensible in a paper, because it captures perceived progress rather than perfection

### Final SUS questionnaire

The in-product final questionnaire should explicitly include:
- SUS responses
- `susScore`
- final open feedback responses

If additional non-SUS study questions remain in the end questionnaire, they should be treated as end-of-study survey metadata rather than task actionability.

It should not repeat baseline participant background questions that were already collected at study start.

Recommended final survey structure:
- start directly from SUS
- then a short product-specific likert block
- then end-of-study open feedback

Recommended product-specific likert block:
- keep only four core items:
  - assessment-result fit with self-judgment
  - diagnosis-understanding
  - recommendation relevance
  - recommendation-trust support
- remove lower-signal or redundant items from the core block, especially:
  - detailed plan feasibility as a standalone survey item
  - broad "feels like a coach" positioning language

Recommended trust-focused wording:
- Chinese: "推荐理由让我更相信这些推荐是适合我的"
- English: "The coach's reasoning made me more confident these recommendations were suitable for me"

Rationale:
- this keeps the product-specific scale tight enough for a short study
- it preserves the most defensible constructs for a 6-page paper
- it shifts the fourth product item from click attraction to trust in recommendations

### Study-start background questions

The study-start flow is the canonical place for participant background capture.

It should include the baseline questions that are currently valuable for analysis, including:
- tennis experience duration
- play frequency
- whether the participant has taken lessons with a coach
- self-reported level
- whether the participant learns from videos

Design rule:
- the "Have you taken lessons with a coach?" question should move into the study-start background bundle
- it should use the same structured input style as the other start-of-study background questions
- the final `/survey` should no longer repeat these baseline items

### End-of-study open feedback

The final in-product questionnaire should keep 2-3 short open questions that can be answered in roughly two minutes total.

Recommended question set:
- `most_helpful_part`
  - Chinese: "哪个环节对你最有帮助？为什么？"
  - English: "Which part of the experience felt most helpful to you? Why?"
- `inaccurate_or_untrustworthy_part`
  - Chinese: "有没有哪个地方让你觉得不准、困惑或不可信？请具体说说。"
  - English: "Was there any part that felt inaccurate, confusing, or untrustworthy? Please be specific."
- `trust_signal`
  - Chinese: "什么信息最影响你对推荐结果的相信程度？"
  - English: "What most influenced whether you trusted the recommendations?"

Question-design note:
- replace a generic "one improvement suggestion" prompt with the trust-focused question above
- this yields more analyzable evidence for explainability and trust claims than a broad product-feedback prompt

Overall recommendation / NPS note:
- do not keep a "would recommend to friends" item inside the core product-specific likert block
- if that signal is still desired, collect it only as a final standalone overall item or as a moderated follow-up prompt
- it should not dilute the main trust- and relevance-focused product block

Rationale:
- the first question captures the strongest positive signal
- the second question captures failure, confusion, and trust breakdown in one analyzable theme
- the third question directly supports an explainability / trust narrative in the paper

These questions are preferable to a generic "any improvement suggestion?" prompt when the research goal is a compact but defensible 6-page paper with both quantitative and qualitative findings.

## Implementation status

Implemented first slice:
- study-start background capture now includes coach-history
- final `/survey` now starts at SUS and uses the shortened SUS + product + open structure
- actionability wording now measures relative clarity gain

Remaining later-slice cleanup:
- broader participant-only export cleanup across the research path

Optional facilitation note:
- if the study is moderated, the facilitator may collect richer oral follow-up using the same three prompts
- however, the canonical in-system record should remain the written `/survey` response so participant/session linkage stays clean

### Diagnosis input analysis

For study diagnosis artifacts, export should retain:
- `inputText`: the participant's original diagnosis text
- `inputLength`
- `inputMethod`: typed vs example-tag click
- `effortMode`
- structured diagnosis outputs such as `problemTag`, `matchedRuleId`, and `confidence`

Design rule:
- raw diagnosis input text is kept only because it is a first-class research variable for this study
- it must stay inside the participant/session-scoped study artifact and export bundle
- it must not be copied into broad telemetry payloads or generic event logs

### Page attention analysis

Derived metrics should continue to compute route-level dwell, but the research-facing contract should prefer:
- `focusedDwellMsByRoute`
- `activeDwellMsByRoute`
- `longestFocusedDwellRoute`
- `longestActiveDwellRoute`

These are more defensible than passive tab-open time when reporting where participants actually spent time.

### Page click concentration analysis

Derived metrics should add:
- `clickCountByRoute`
- `mostClickedRoute`
- `mostClickedRouteCount`

The click definition should be explicit and stable:
- include intentional action events such as CTA clicks, example-tag clicks, content opens, creator opens, outbound clicks, and plan expansion/regeneration actions
- exclude passive view events like `page.view`

### Required-page coverage

Because the study needs every page to be experienced, the export and validation layer should add:
- `requiredRoutes`
- `visitedRequiredRoutes`
- `missingRequiredRoutes`
- `requiredRouteCoverageComplete`

Initial required routes should cover the study task path:
- `/`
- `/assessment`
- `/diagnose`
- `/plan`

If the final protocol requires additional pages, the route list should come from one explicit configuration source rather than ad hoc checks in multiple files.

## Validation and tests

### Required verification

- targeted tests for every touched API route and helper
- remote validation fixtures updated to participant-only identity
- build passes

### Required assertions

- every study event insert includes `participant_id` and `session_id`
- every study artifact insert includes `participant_id` and `session_id`
- every study task rating insert includes `participant_id` and `session_id`
- every final SUS survey write includes `participant_id` and `session_id`
- no study write helper accepts `user_id`
- exports can be reconstructed by participant/session only
- diagnosis study artifacts retain the participant's raw diagnosis input text
- derived metrics expose route-level longest-dwell and most-clicked-page outputs
- validation flags sessions that did not reach every required route
- repeated submissions keep cumulative event and attempt counts
- latest effective assessment / diagnosis / plan / final SUS bundles overwrite earlier answers for current-state analysis
- task actionability ratings remain separate from final SUS results in export and analysis

## Risks

### Free-text privacy risk

Keeping diagnosis raw input text is a deliberate exception to the broader telemetry sanitization rule.

That is acceptable here because:
- the study has not started yet
- the text is a direct research variable
- it can stay constrained to participant/session-scoped diagnosis artifacts and exports

But this also means:
- raw diagnosis input must not leak into generic event payloads
- downstream export handling should treat diagnosis input as research text, not product telemetry

### Shared-table risk

Because `event_logs` and `survey_responses` originated as broader research tables, removing `user_id` from the study contract may expose places where the schema is still optimized for product/auth behavior instead of participant analysis.

### Hidden coupling risk

Client code may still set or cache current auth user in shared logging helpers even when study mode is active. Those branches must be audited carefully to avoid partial cleanup.

### Overreach risk

It would be easy to let this become an app-wide identity rewrite. This design explicitly avoids that. The cleanup is limited to the study/research path plus a minimal future product identity note.

## Acceptance criteria

This design is complete when implementation can make all of the following true:

- study data collection uses `participant_id` as the only person-level identity
- `session_id` remains the canonical session linkage key
- no study export depends on `user_id`
- no study write path depends on `user_id`
- diagnosis raw input text is available in the study export bundle for participant/session analysis
- study export can identify the longest-dwell page and most-clicked page per session
- study export can identify whether each required page was experienced
- study export preserves retry / click history while also exposing the latest effective submission state for assessment, diagnosis, plan, and final SUS
- actionability and SUS are stored and exported as separate measures
- researcher/admin auth still works for access control
- future non-study identity direction is documented as `profile_id`, not `email`

## Explicit non-goals

- do not use `email` as a relational key
- do not redesign auth right now
- do not implement a full `profile_id` system right now
- do not change non-study product persistence in this slice unless directly required to isolate study data
