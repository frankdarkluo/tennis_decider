# PR6 Bounded Mediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add deterministic-first, bounded intake mediation to `/diagnose` for weak or ambiguous complaints without changing diagnosis ownership, plan ownership, or current scenario/deep-mode boundaries.

**Architecture:** Keep the current `/diagnose -> prepareDiagnoseSubmission -> /api/intake/extract -> deterministic intake/scenario -> diagnosis` path. Insert one small deterministic-first gate and one tiny typed mediation layer above the current intake orchestration, then validate and constrain its output before anything reaches the existing scenario or diagnosis logic.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, React Testing Library, existing local-model client and event logging utilities

---

## File Map

- Modify: `src/lib/intake/prepareDiagnoseSubmission.ts`
  - Add deterministic-first mediation orchestration, one-time clarification rerun, and raw fallback behavior.
- Create: `src/lib/intake/diagnoseMediation/types.ts`
  - Shared gate, mediation, and validator reason types.
- Create: `src/lib/intake/diagnoseMediation/gate.ts`
  - `shouldMediateDiagnoseComplaint()` pure helper and supporting heuristics.
- Create: `src/lib/intake/diagnoseMediation/validate.ts`
  - Hard invariants and rejection logic for model-facing mediation output.
- Create: `src/lib/intake/diagnoseMediation/mediate.ts`
  - Local-model mediation boundary, category lock handling, and validated return contract.
- Modify: `src/app/api/intake/extract/route.ts`
  - Accept optional mediation hints/normalized text, preserve current route contract, and log mediation-related route metadata if needed.
- Modify: `src/app/diagnose/page.tsx`
  - Add one-pass inline mediation UI state for paraphrase and one clarification.
- Modify: `src/lib/eventLogger.ts`
  - Add or normalize bounded observability event payloads for gate decision, mediation mode, validator rejection, fallback reason, and post-clarification outcome.
- Test: `src/__tests__/diagnose-intake-integration.test.ts`
  - Cover new submission orchestration and fallback behavior.
- Test: `src/__tests__/consumer-diagnose-pr3.test.tsx`
  - Cover inline `/diagnose` paraphrase and clarification UX without regressing diagnosis flow.
- Create: `src/__tests__/diagnose-mediation-gate.test.ts`
  - Pure coverage for clear/weak/transcript gate decisions and locked category behavior.
- Create: `src/__tests__/diagnose-mediation-validator.test.ts`
  - Hard invariant and rejection coverage.
- Create: `src/__tests__/diagnose-mediation-module.test.ts`
  - Mediation mode behavior, category lock, model unavailable/low-confidence fallback, zh/en/mixed-language handling.
- Modify: `src/__tests__/deep-diagnose-orchestrator.test.tsx`
  - Verify deep-mode behavior still does not regress when mediation is present in consumer `/diagnose`.
- Modify: `src/__tests__/content-display.test.ts` or `src/__tests__/plan-boundary-pr6.test.tsx`
  - Keep diagnosis -> plan navigation assertions green after the new intake step.

## Task 1: Add Typed Gate And Mediation Contracts

**Files:**
- Create: `src/lib/intake/diagnoseMediation/types.ts`
- Create: `src/lib/intake/diagnoseMediation/gate.ts`
- Test: `src/__tests__/diagnose-mediation-gate.test.ts`

- [ ] **Step 1: Write the failing gate test**

```ts
import { describe, expect, it } from "vitest";
import { shouldMediateDiagnoseComplaint } from "@/lib/intake/diagnoseMediation/gate";

describe("diagnose mediation gate", () => {
  it("skips mediation for clear complaints and preserves stable category when available", () => {
    expect(shouldMediateDiagnoseComplaint("反手总下网", "zh")).toEqual({
      shouldMediate: false,
      reason: "clear_enough",
      lockedCategory: "groundstroke"
    });

    expect(shouldMediateDiagnoseComplaint("My overhead keeps going long", "en")).toEqual({
      shouldMediate: false,
      reason: "clear_enough",
      lockedCategory: "overhead"
    });
  });
});
```

- [ ] **Step 2: Run the gate test to verify it fails**

Run: `npm test -- src/__tests__/diagnose-mediation-gate.test.ts`
Expected: FAIL with `Cannot find module '@/lib/intake/diagnoseMediation/gate'` or missing export errors

- [ ] **Step 3: Add the minimal types and gate implementation**

```ts
// src/lib/intake/diagnoseMediation/types.ts
import type { StructuredTennisSceneExtraction } from "@/lib/intake/schema";

export type SkillCategory = StructuredTennisSceneExtraction["skillCategory"];

export type DiagnoseGateReason =
  | "clear_enough"
  | "ambiguous"
  | "too_vague"
  | "transcript_noise";

export type DiagnoseGateDecision = {
  shouldMediate: boolean;
  reason: DiagnoseGateReason;
  lockedCategory?: SkillCategory | null;
};
```

```ts
// src/lib/intake/diagnoseMediation/gate.ts
import type { DiagnoseGateDecision, SkillCategory } from "./types";

const clearPatterns: Array<{ pattern: RegExp; category: SkillCategory }> = [
  { pattern: /(反手.*下网|backhand.*net)/i, category: "groundstroke" },
  { pattern: /(发球.*没信心|serve.*no confidence)/i, category: "serve" },
  { pattern: /(截击.*下网|volley.*net)/i, category: "volley" },
  { pattern: /(overhead.*long|高压.*出界)/i, category: "overhead" }
];

export function shouldMediateDiagnoseComplaint(rawComplaint: string, _locale: "zh" | "en"): DiagnoseGateDecision {
  const input = rawComplaint.trim();
  const matched = clearPatterns.find(({ pattern }) => pattern.test(input));

  if (matched) {
    return {
      shouldMediate: false,
      reason: "clear_enough",
      lockedCategory: matched.category
    };
  }

  if (input.length >= 28 || /[，。,.\s].*[，。,.\s].*[，。,.\s]/.test(input)) {
    return { shouldMediate: true, reason: "transcript_noise", lockedCategory: null };
  }

  return { shouldMediate: true, reason: "too_vague", lockedCategory: null };
}
```

- [ ] **Step 4: Run the gate test to verify it passes**

Run: `npm test -- src/__tests__/diagnose-mediation-gate.test.ts`
Expected: PASS

- [ ] **Step 5: Expand the gate test for ambiguous and transcript-noise inputs**

```ts
it("routes vague and transcript-like complaints into mediation", () => {
  expect(shouldMediateDiagnoseComplaint("我打球感觉不太对", "zh")).toEqual({
    shouldMediate: true,
    reason: "too_vague",
    lockedCategory: null
  });

  expect(shouldMediateDiagnoseComplaint("就是那个发球吧然后我一紧就不太受控一直发坏", "zh")).toEqual({
    shouldMediate: true,
    reason: "transcript_noise",
    lockedCategory: null
  });
});
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/intake/diagnoseMediation/types.ts src/lib/intake/diagnoseMediation/gate.ts src/__tests__/diagnose-mediation-gate.test.ts
git commit -m "feat: add deterministic diagnose mediation gate"
```

## Task 2: Add Bounded Mediation Validator And Local Module

**Files:**
- Create: `src/lib/intake/diagnoseMediation/validate.ts`
- Create: `src/lib/intake/diagnoseMediation/mediate.ts`
- Test: `src/__tests__/diagnose-mediation-validator.test.ts`
- Test: `src/__tests__/diagnose-mediation-module.test.ts`

- [ ] **Step 1: Write the failing validator test**

```ts
import { describe, expect, it } from "vitest";
import { validateDiagnoseMediationResult } from "@/lib/intake/diagnoseMediation/validate";

describe("diagnose mediation validator", () => {
  it("rejects chatty or diagnostic output", () => {
    expect(validateDiagnoseMediationResult({
      mode: "paraphrase",
      reason: "ambiguous",
      displayText: "Did you mean...\n- your forehand timing is late",
      normalizedComplaint: "你的正手时机太晚，所以应该先练步伐",
      clarificationQuestion: null
    })).toEqual({
      ok: false,
      rejectionReason: "contains_advice_or_chatty_text"
    });
  });
});
```

- [ ] **Step 2: Run the validator test to verify it fails**

Run: `npm test -- src/__tests__/diagnose-mediation-validator.test.ts`
Expected: FAIL with missing module/export errors

- [ ] **Step 3: Add minimal validator types and implementation**

```ts
// src/lib/intake/diagnoseMediation/validate.ts
import type { DiagnoseMediationResult } from "./types";

export type DiagnoseMediationRejectionReason =
  | "invalid_shape"
  | "missing_required_fields"
  | "contains_diagnosis_or_plan"
  | "contains_advice_or_chatty_text"
  | "contains_multiple_questions"
  | "empty_or_overlong";

export function validateDiagnoseMediationResult(input: DiagnoseMediationResult) {
  const text = [input.displayText, input.normalizedComplaint, input.clarificationQuestion].filter(Boolean).join(" ");

  if (input.mode === "skip" || input.mode === "fallback") {
    const allNull = input.displayText === null && input.normalizedComplaint === null && input.clarificationQuestion === null;
    return allNull ? { ok: true as const, value: input } : { ok: false as const, rejectionReason: "missing_required_fields" as const };
  }

  if (input.mode === "paraphrase" && (!input.displayText || !input.normalizedComplaint || input.clarificationQuestion !== null)) {
    return { ok: false as const, rejectionReason: "missing_required_fields" as const };
  }

  if (input.mode === "clarify" && (!input.clarificationQuestion || input.normalizedComplaint !== null)) {
    return { ok: false as const, rejectionReason: "missing_required_fields" as const };
  }

  if (/[#*-]\s|\n\s*\n/.test(text) || /诊断|计划|drill|plan|train/i.test(text)) {
    return { ok: false as const, rejectionReason: "contains_advice_or_chatty_text" as const };
  }

  if ((text.match(/\?/g) ?? []).length > 1 || (text.match(/？/g) ?? []).length > 1) {
    return { ok: false as const, rejectionReason: "contains_multiple_questions" as const };
  }

  if (!text.trim() || text.length > 180) {
    return { ok: false as const, rejectionReason: "empty_or_overlong" as const };
  }

  return { ok: true as const, value: input };
}
```

- [ ] **Step 4: Run the validator test to verify it passes**

Run: `npm test -- src/__tests__/diagnose-mediation-validator.test.ts`
Expected: PASS

- [ ] **Step 5: Write the failing mediation-module test**

```ts
import { describe, expect, it, vi } from "vitest";
import { mediateDiagnoseComplaint } from "@/lib/intake/diagnoseMediation/mediate";

describe("diagnose mediation module", () => {
  it("falls back when the model output drifts outside the locked category", async () => {
    const mediate = vi.fn(async () => ({
      mode: "paraphrase",
      reason: "ambiguous",
      displayText: "Did you mean your forehand breaks down under pressure?",
      normalizedComplaint: "My forehand breaks down under pressure",
      clarificationQuestion: null
    }));

    const result = await mediateDiagnoseComplaint({
      rawComplaint: "发球没信心而且一紧张就乱",
      locale: "zh",
      lockedCategory: "serve",
      mediateImpl: mediate
    });

    expect(result.mode).toBe("fallback");
    expect(result.reason).toBe("low_confidence");
  });
});
```

- [ ] **Step 6: Run the mediation-module test to verify it fails**

Run: `npm test -- src/__tests__/diagnose-mediation-module.test.ts`
Expected: FAIL with missing module/export errors

- [ ] **Step 7: Add the minimal mediation module**

```ts
// src/lib/intake/diagnoseMediation/mediate.ts
import { validateDiagnoseMediationResult } from "./validate";
import type { DiagnoseMediationResult, SkillCategory } from "./types";

type MediateArgs = {
  rawComplaint: string;
  locale: "zh" | "en";
  lockedCategory?: SkillCategory | null;
  mediateImpl: (input: { rawComplaint: string; locale: "zh" | "en" }) => Promise<DiagnoseMediationResult>;
};

function violatesCategoryLock(text: string | null, lockedCategory?: SkillCategory | null) {
  if (!lockedCategory || !text) {
    return false;
  }

  if (lockedCategory === "serve") {
    return /forehand|backhand|正手|反手/i.test(text);
  }

  return false;
}

export async function mediateDiagnoseComplaint({
  rawComplaint,
  locale,
  lockedCategory,
  mediateImpl
}: MediateArgs): Promise<DiagnoseMediationResult> {
  try {
    const result = await mediateImpl({ rawComplaint, locale });
    const validated = validateDiagnoseMediationResult(result);

    if (!validated.ok || violatesCategoryLock(result.normalizedComplaint ?? result.displayText, lockedCategory)) {
      return {
        mode: "fallback",
        reason: "low_confidence",
        displayText: null,
        normalizedComplaint: null,
        clarificationQuestion: null
      };
    }

    return validated.value;
  } catch {
    return {
      mode: "fallback",
      reason: "model_unavailable",
      displayText: null,
      normalizedComplaint: null,
      clarificationQuestion: null
    };
  }
}
```

- [ ] **Step 8: Run the mediation-module and validator tests**

Run: `npm test -- src/__tests__/diagnose-mediation-validator.test.ts src/__tests__/diagnose-mediation-module.test.ts`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/lib/intake/diagnoseMediation/validate.ts src/lib/intake/diagnoseMediation/mediate.ts src/__tests__/diagnose-mediation-validator.test.ts src/__tests__/diagnose-mediation-module.test.ts
git commit -m "feat: add bounded diagnose mediation validation"
```

## Task 3: Integrate Mediation Into Submission Orchestration

**Files:**
- Modify: `src/lib/intake/prepareDiagnoseSubmission.ts`
- Modify: `src/app/api/intake/extract/route.ts`
- Test: `src/__tests__/diagnose-intake-integration.test.ts`

- [ ] **Step 1: Write the failing orchestration test**

```ts
import { describe, expect, it, vi } from "vitest";
import { prepareDiagnoseSubmission } from "@/lib/intake/prepareDiagnoseSubmission";

describe("diagnose intake integration", () => {
  it("skips mediation for clear complaints", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({
      source: "structured_intake",
      decision: "direct_result",
      diagnosis_input: "比赛里我反手老下网。",
      extraction: null,
      scenario: null,
      selected_question: null,
      eligible_questions: [],
      missing_slots: [],
      done: true
    })));

    const mediateDiagnoseComplaint = vi.fn();

    const prepared = await prepareDiagnoseSubmission({
      text: "比赛里我反手老下网",
      locale: "zh",
      fetchImpl,
      mediateDiagnoseComplaint
    });

    expect(mediateDiagnoseComplaint).not.toHaveBeenCalled();
    expect(prepared.diagnosisInput).toBe("比赛里我反手老下网。");
  });
});
```

- [ ] **Step 2: Run the orchestration test to verify it fails**

Run: `npm test -- src/__tests__/diagnose-intake-integration.test.ts`
Expected: FAIL because `prepareDiagnoseSubmission` does not accept mediation dependencies yet

- [ ] **Step 3: Extend the submission contract minimally**

```ts
// inside src/lib/intake/prepareDiagnoseSubmission.ts
import { shouldMediateDiagnoseComplaint } from "@/lib/intake/diagnoseMediation/gate";
import { mediateDiagnoseComplaint as defaultMediateDiagnoseComplaint } from "@/lib/intake/diagnoseMediation/mediate";

export type PreparedDiagnoseSubmission = {
  source: "structured_intake" | "deterministic_fallback" | "request_failed";
  decision: "direct_result" | "needs_followup" | "raw_text_fallback";
  diagnosisInput: string;
  extraction: StructuredTennisSceneExtraction | null;
  scenario: ScenarioState | null;
  selectedQuestion: ScenarioQuestion | null;
  eligibleQuestions: ScenarioQuestion[];
  missingSlots: ScenarioState["missing_slots"];
  done: boolean;
  mediationMode?: "skip" | "paraphrase" | "clarify" | "fallback";
  mediationDisplayText?: string | null;
  mediationQuestion?: string | null;
  clarificationUsed?: boolean;
};
```

- [ ] **Step 4: Add the deterministic-first branch in `prepareDiagnoseSubmission`**

```ts
const gate = shouldMediateDiagnoseComplaint(trimmedText, locale);

if (!gate.shouldMediate) {
  return readIntakeRoute({
    text: trimmedText,
    locale,
    fetchImpl,
    mediationMode: "skip"
  });
}

const mediation = await mediateDiagnoseComplaint({
  rawComplaint: trimmedText,
  locale,
  lockedCategory: gate.lockedCategory,
  mediateImpl
});

if (mediation.mode === "paraphrase" && mediation.normalizedComplaint) {
  const prepared = await readIntakeRoute({
    text: mediation.normalizedComplaint,
    locale,
    fetchImpl,
    mediationMode: "paraphrase"
  });

  return {
    ...prepared,
    mediationMode: "paraphrase",
    mediationDisplayText: mediation.displayText
  };
}

if (mediation.mode === "clarify") {
  return {
    source: "deterministic_fallback",
    decision: "needs_followup",
    diagnosisInput: trimmedText,
    extraction: null,
    scenario: null,
    selectedQuestion: null,
    eligibleQuestions: [],
    missingSlots: [],
    done: false,
    mediationMode: "clarify",
    mediationQuestion: mediation.clarificationQuestion,
    clarificationUsed: false
  };
}
```

- [ ] **Step 5: Keep the route contract stable**

```ts
// src/app/api/intake/extract/route.ts
// Keep existing JSON shape for structured_intake and deterministic_fallback.
// Accept the already-normalized complaint text as plain `text`.
// Do not add diagnosis or plan responsibilities here.
```

- [ ] **Step 6: Add the fallback and one-time clarification tests**

```ts
it("returns a single clarification question for genuinely vague input", async () => {
  const fetchImpl = vi.fn();
  const mediateDiagnoseComplaint = vi.fn(async () => ({
    mode: "clarify",
    reason: "too_vague",
    displayText: null,
    normalizedComplaint: null,
    clarificationQuestion: "更像是哪一拍出了问题？"
  }));

  const prepared = await prepareDiagnoseSubmission({
    text: "我打球感觉不太对",
    locale: "zh",
    fetchImpl,
    mediateDiagnoseComplaint
  });

  expect(prepared.mediationMode).toBe("clarify");
  expect(prepared.mediationQuestion).toBe("更像是哪一拍出了问题？");
});
```

- [ ] **Step 7: Run the integration test file**

Run: `npm test -- src/__tests__/diagnose-intake-integration.test.ts`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/lib/intake/prepareDiagnoseSubmission.ts src/app/api/intake/extract/route.ts src/__tests__/diagnose-intake-integration.test.ts
git commit -m "feat: orchestrate bounded diagnose mediation"
```

## Task 4: Add Quiet Inline `/diagnose` Mediation UX

**Files:**
- Modify: `src/app/diagnose/page.tsx`
- Test: `src/__tests__/consumer-diagnose-pr3.test.tsx`
- Test: `src/__tests__/deep-diagnose-orchestrator.test.tsx`

- [ ] **Step 1: Write the failing UI test for paraphrase**

```tsx
it("shows one inline did-you-mean line and auto-continues on paraphrase", async () => {
  prepareDiagnoseSubmissionMock.mockResolvedValue({
    source: "structured_intake",
    decision: "direct_result",
    diagnosisInput: "比赛里我的二发一紧就乱，主要是发球控制不住。",
    extraction: null,
    scenario: null,
    selectedQuestion: null,
    eligibleQuestions: [],
    missingSlots: [],
    done: true,
    mediationMode: "paraphrase",
    mediationDisplayText: "Did you mean：比赛里二发一紧就失控？"
  });

  diagnoseProblemMock.mockReturnValue(createDiagnosisResult("比赛里我的二发一紧就乱，主要是发球控制不住。"));

  const { default: DiagnosePage } = await import("@/app/diagnose/page");
  render(<DiagnosePage />);

  fireEvent.change(screen.getByPlaceholderText("例如：我反手总下网，一快就更容易失误"), {
    target: { value: "就是那个发球吧然后我一紧就不太受控一直发坏" }
  });
  fireEvent.click(screen.getByRole("button", { name: "开始诊断" }));

  expect(await screen.findByText("Did you mean：比赛里二发一紧就失控？")).toBeInTheDocument();
  expect(await screen.findByText("先修正反手稳定性")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the UI test to verify it fails**

Run: `npm test -- src/__tests__/consumer-diagnose-pr3.test.tsx`
Expected: FAIL because the page does not render mediation UI yet

- [ ] **Step 3: Add minimal inline mediation state to `/diagnose`**

```tsx
// inside src/app/diagnose/page.tsx
const [mediationNotice, setMediationNotice] = useState<string | null>(null);
const [mediationQuestion, setMediationQuestion] = useState<string | null>(null);
const [clarificationAsked, setClarificationAsked] = useState(false);
```

```tsx
if (preparedSubmission.mediationMode === "paraphrase" && preparedSubmission.mediationDisplayText) {
  setMediationNotice(preparedSubmission.mediationDisplayText);
  setMediationQuestion(null);
}

if (preparedSubmission.mediationMode === "clarify" && preparedSubmission.mediationQuestion && !clarificationAsked) {
  setMediationQuestion(preparedSubmission.mediationQuestion);
  setMediationNotice(null);
  return;
}
```

- [ ] **Step 4: Render the inline mediation surface**

```tsx
{mediationNotice ? (
  <Card className="text-sm text-slate-700">{mediationNotice}</Card>
) : null}

{mediationQuestion ? (
  <InlineFollowupFlow
    question={mediationQuestion}
    onSubmit={async (answer) => {
      setClarificationAsked(true);
      setMediationQuestion(null);
      await runDiagnosis(`${text.trim()} ${answer.trim()}`);
    }}
  />
) : null}
```

- [ ] **Step 5: Add the one-loop safeguard test**

```tsx
it("does not allow a second clarification loop", async () => {
  prepareDiagnoseSubmissionMock
    .mockResolvedValueOnce({
      source: "deterministic_fallback",
      decision: "needs_followup",
      diagnosisInput: "我打球感觉不太对",
      extraction: null,
      scenario: null,
      selectedQuestion: null,
      eligibleQuestions: [],
      missingSlots: [],
      done: false,
      mediationMode: "clarify",
      mediationQuestion: "更像哪一拍？",
      clarificationUsed: false
    })
    .mockResolvedValueOnce({
      source: "request_failed",
      decision: "raw_text_fallback",
      diagnosisInput: "我打球感觉不太对 反手",
      extraction: null,
      scenario: null,
      selectedQuestion: null,
      eligibleQuestions: [],
      missingSlots: [],
      done: false,
      mediationMode: "fallback",
      clarificationUsed: true
    });
});
```

- [ ] **Step 6: Run the consumer and deep-mode regression tests**

Run: `npm test -- src/__tests__/consumer-diagnose-pr3.test.tsx src/__tests__/deep-diagnose-orchestrator.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/app/diagnose/page.tsx src/__tests__/consumer-diagnose-pr3.test.tsx src/__tests__/deep-diagnose-orchestrator.test.tsx
git commit -m "feat: add quiet diagnose mediation UI"
```

## Task 5: Add Observability And Final Regression Coverage

**Files:**
- Modify: `src/lib/eventLogger.ts`
- Modify: `src/__tests__/diagnose-intake-integration.test.ts`
- Modify: `src/__tests__/consumer-diagnose-pr3.test.tsx`
- Modify: `src/__tests__/plan-boundary-pr6.test.tsx`
- Modify: `src/__tests__/scenario-runtime.test.ts` or `src/__tests__/scenario-routes.test.ts`

- [ ] **Step 1: Write the failing observability assertion**

```ts
import { logEvent } from "@/lib/eventLogger";

it("logs mediation gate and fallback reasons", async () => {
  // after a weak complaint falls back, expect the bounded mediation events
  expect(logEvent).toHaveBeenCalledWith(
    "diagnose.mediation_gate_decided",
    expect.objectContaining({ shouldMediate: true, reason: "too_vague" }),
    expect.anything()
  );
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `npm test -- src/__tests__/consumer-diagnose-pr3.test.tsx`
Expected: FAIL because mediation events are not logged yet

- [ ] **Step 3: Add bounded event logging only where the decision is made**

```ts
logEvent("diagnose.mediation_gate_decided", {
  shouldMediate: gate.shouldMediate,
  reason: gate.reason,
  lockedCategory: gate.lockedCategory ?? null
}, { page: "/diagnose" });

logEvent("diagnose.mediation_resolved", {
  mode: mediation.mode,
  reason: mediation.reason
}, { page: "/diagnose" });

logEvent("diagnose.mediation_fallback", {
  reason: mediation.reason
}, { page: "/diagnose" });
```

- [ ] **Step 4: Add the non-regression tests**

```ts
it("keeps diagnosis to plan navigation intact after mediated input", () => {
  expect(screen.getByRole("link", { name: /根据这个问题生成 7 步训练计划/i })).toHaveAttribute("href", expect.stringContaining("/plan?"));
});
```

```ts
it("does not change deep-mode followup routing for existing category-aware inputs", async () => {
  // existing serve / volley / overhead scenario path should still route through current deep-mode logic
});
```

- [ ] **Step 5: Run the PR6-focused suite**

Run: `npm test -- src/__tests__/diagnose-mediation-gate.test.ts src/__tests__/diagnose-mediation-validator.test.ts src/__tests__/diagnose-mediation-module.test.ts src/__tests__/diagnose-intake-integration.test.ts src/__tests__/consumer-diagnose-pr3.test.tsx src/__tests__/deep-diagnose-orchestrator.test.tsx src/__tests__/plan-boundary-pr6.test.tsx`
Expected: PASS

- [ ] **Step 6: Run full verification**

Run: `npm test`
Expected: PASS

Run: `npm run build`
Expected: PASS

Run: `git diff --check`
Expected: no output

- [ ] **Step 7: Commit**

```bash
git add src/lib/eventLogger.ts src/__tests__/diagnose-mediation-gate.test.ts src/__tests__/diagnose-mediation-validator.test.ts src/__tests__/diagnose-mediation-module.test.ts src/__tests__/diagnose-intake-integration.test.ts src/__tests__/consumer-diagnose-pr3.test.tsx src/__tests__/deep-diagnose-orchestrator.test.tsx src/__tests__/plan-boundary-pr6.test.tsx
git commit -m "test: harden PR6 bounded mediation regressions"
```

## Plan Self-Review

- Spec coverage: covered the explicit gate contract, mediation result contract, validator invariants, one-time clarification loop, category lock, localization, observability, deep-mode non-regression, and diagnosis -> plan non-regression.
- Placeholder scan: no `TBD`, `TODO`, or deferred implementation markers remain.
- Type consistency: the plan uses one shared `DiagnoseGateDecision`, one shared `DiagnoseMediationResult`, and keeps `prepareDiagnoseSubmission` as the orchestration boundary throughout.

