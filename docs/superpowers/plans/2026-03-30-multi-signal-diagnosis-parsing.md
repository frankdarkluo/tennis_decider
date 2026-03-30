# Multi-Signal Diagnosis Parsing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a deterministic multi-signal parsing layer to TennisLevel diagnosis so mixed user inputs can be segmented, typed into a 3-layer structure, and anchored to one stable primary diagnosis.

**Architecture:** Extend the existing `DiagnosisSignalBundle` pipeline instead of replacing it. First add explicit clause and layer types with regression tests, then implement lightweight clause segmentation and signal typing, and finally update primary selection so only eligible primary candidates compete while modifiers and triggers remain attached for downstream use.

**Tech Stack:** TypeScript, Next.js app code, Vitest/Jest test suite, existing diagnosis rule engine in `src/lib/diagnosis.ts`.

---

## File Structure

**Create:**
- `docs/superpowers/plans/2026-03-30-multi-signal-diagnosis-parsing.md`

**Modify:**
- `src/types/diagnosis.ts`
- `src/lib/diagnosis.ts`
- `src/__tests__/diagnosis-matching.test.ts`

**Keep unchanged on purpose:**
- `src/data/diagnosisRules.ts`
- `src/app/**`
- training plan files
- study event schema

---

### Task 1: Lock The 3-Layer Parsing Contract In Tests

**Files:**
- Modify: `src/__tests__/diagnosis-matching.test.ts`
- Modify: `src/types/diagnosis.ts`
- Test: `src/__tests__/diagnosis-matching.test.ts`

- [ ] **Step 1: Write failing parsing tests for clauses and layers**

```ts
it("segments a mixed input into clause-sized signal units", () => {
  const bundle = extractDiagnosisSignalBundle("正手在关键分的时候，如果对手在网前，我容易紧张，一发力就出界");

  expect(bundle.clauses.map((clause) => clause.text)).toEqual([
    "正手",
    "关键分的时候",
    "对手在网前",
    "我容易紧张",
    "一发力就出界"
  ]);
});

it("classifies mixed-input signals into primary, modifiers, and triggers", () => {
  const bundle = extractDiagnosisSignalBundle("正手在关键分的时候，如果对手在网前，我容易紧张，一发力就出界");

  expect(bundle.layeredSignals.primaryCandidates).toEqual(expect.arrayContaining(["forehand-out"]));
  expect(bundle.layeredSignals.modifiers).toEqual(expect.arrayContaining(["key_point", "tight"]));
  expect(bundle.layeredSignals.triggers).toEqual(expect.arrayContaining(["opponent_at_net", "overhit"]));
});

it("keeps support signals out of the layered diagnosis lanes", () => {
  const bundle = extractDiagnosisSignalBundle("练了很久没进步，不知道自己该练什么，但反手总下网");

  expect(bundle.supportSignals).toEqual(expect.arrayContaining(["plateau_no_progress", "cant_self_practice"]));
  expect(bundle.layeredSignals.primaryCandidates).toContain("backhand-into-net");
});
```

- [ ] **Step 2: Run the parsing tests to confirm the new contract does not exist yet**

Run: `npm test -- --run src/__tests__/diagnosis-matching.test.ts`  
Expected: FAIL because `clauses` and `layeredSignals` do not exist on `DiagnosisSignalBundle`.

- [ ] **Step 3: Add explicit clause and layered-signal types**

```ts
export type DiagnosisSignalLayer = "primary" | "modifier" | "trigger" | "support" | "unknown";

export type DiagnosisClause = {
  text: string;
  normalizedText: string;
};

export type DiagnosisLayeredSignals = {
  primaryCandidates: string[];
  modifiers: string[];
  triggers: string[];
};

export type DiagnosisSignalBundle = {
  rawInput: string;
  normalizedInput: string;
  matchableText: string;
  clauses: DiagnosisClause[];
  layeredSignals: DiagnosisLayeredSignals;
  segments: DiagnosisSignalSegment[];
  aliases: DiagnosisAlias[];
  modifiers: DiagnosisModifier[];
  supportSignals: DiagnosisSupportSignal[];
  slots: DiagnosisSlot[];
  internalSignals: DiagnosisInternalSignal[];
};
```

- [ ] **Step 4: Add temporary empty defaults so the new types compile before logic is implemented**

```ts
return {
  rawInput: input,
  normalizedInput,
  matchableText,
  clauses: [{ text: input.trim(), normalizedText: normalizedInput }],
  layeredSignals: {
    primaryCandidates: [],
    modifiers: [],
    triggers: []
  },
  segments,
  aliases,
  modifiers,
  supportSignals,
  slots,
  internalSignals
};
```

- [ ] **Step 5: Run the focused test again and confirm it still fails on behavior, not missing types**

Run: `npm test -- --run src/__tests__/diagnosis-matching.test.ts`  
Expected: FAIL on clause/layer expectations, but compile successfully.

- [ ] **Step 6: Commit Task 1**

```bash
git add src/types/diagnosis.ts src/__tests__/diagnosis-matching.test.ts src/lib/diagnosis.ts
git commit -m "test: lock multi-signal parsing contract"
```

---

### Task 2: Implement Clause Segmentation And Layered Signal Typing

**Files:**
- Modify: `src/lib/diagnosis.ts`
- Modify: `src/__tests__/diagnosis-matching.test.ts`
- Test: `src/__tests__/diagnosis-matching.test.ts`

- [ ] **Step 1: Add failing behavior tests for lightweight clause segmentation**

```ts
it("does not oversplit short clean inputs", () => {
  const bundle = extractDiagnosisSignalBundle("反手总下网");

  expect(bundle.clauses.map((clause) => clause.text)).toEqual(["反手总下网"]);
});

it("splits on punctuation and scene connectors without NLP dependencies", () => {
  const bundle = extractDiagnosisSignalBundle("关键分时，正手一发力就飞；对手一上网我就慌");

  expect(bundle.clauses.map((clause) => clause.text)).toEqual([
    "关键分时",
    "正手一发力就飞",
    "对手一上网我就慌"
  ]);
});
```

- [ ] **Step 2: Implement deterministic clause segmentation**

```ts
const DIAGNOSIS_CLAUSE_SPLITTER = /[，。！？、；;]+|\b但是\b|\b但\b|如果|一到|(?<=.)一(?=发力就|紧张就|上网就)/g;

function splitDiagnosisClauses(input: string): DiagnosisClause[] {
  return input
    .split(DIAGNOSIS_CLAUSE_SPLITTER)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({
      text,
      normalizedText: normalizeDiagnosisInput(text)
    }));
}
```

- [ ] **Step 3: Add deterministic trigger-pattern extraction**

```ts
const DIAGNOSIS_TRIGGER_PATTERNS = [
  { signal: "opponent_at_net", patterns: [/对手在网前/, /对手一上网/, /opponent at net/] },
  { signal: "net_pressure", patterns: [/压网/, /上网压迫/, /net pressure/] },
  { signal: "overhit", patterns: [/一发力就/, /发力就飞/, /hit harder.*out/, /swing harder.*long/] },
  { signal: "hesitation", patterns: [/犹豫/, /不敢打/, /hesitat/] }
] as const;

function extractTriggerSignals(normalizedText: string): string[] {
  return buildUniqueSignalList(
    DIAGNOSIS_TRIGGER_PATTERNS
      .filter(({ patterns }) => matchesAny(normalizedText, patterns))
      .map(({ signal }) => signal)
  );
}
```

- [ ] **Step 4: Map slots, modifiers, and triggers into the 3-layer structure**

```ts
function buildLayeredSignals(
  clauses: DiagnosisClause[],
  modifiers: DiagnosisModifier[],
  supportSignals: DiagnosisSupportSignal[],
  slots: DiagnosisSlot[]
): DiagnosisLayeredSignals {
  const slotSignals = new Set(slots.map((slot) => slot.signal));
  const primaryCandidates: string[] = [];

  if (slotSignals.has("slot_stroke_forehand") && slotSignals.has("slot_outcome_out")) {
    primaryCandidates.push("forehand-out");
  }
  if (slotSignals.has("slot_stroke_backhand") && slotSignals.has("slot_outcome_net")) {
    primaryCandidates.push("backhand-into-net");
  }

  const triggers = buildUniqueSignalList(clauses.flatMap((clause) => extractTriggerSignals(clause.normalizedText)));

  return {
    primaryCandidates,
    modifiers: modifiers.filter((modifier) => !supportSignals.includes(modifier as DiagnosisSupportSignal)),
    triggers
  };
}
```

- [ ] **Step 5: Thread clauses and layered signals through `extractDiagnosisSignalBundle`**

```ts
export function extractDiagnosisSignalBundle(input: string): DiagnosisSignalBundle {
  const normalizedInput = normalizeDiagnosisInput(input);
  const clauses = splitDiagnosisClauses(input);
  // existing alias/modifier/support/slot extraction remains
  const layeredSignals = buildLayeredSignals(clauses, modifiers, supportSignals, slots);

  return {
    rawInput: input,
    normalizedInput,
    matchableText,
    clauses,
    layeredSignals,
    segments,
    aliases,
    modifiers,
    supportSignals,
    slots,
    internalSignals
  };
}
```

- [ ] **Step 6: Run the focused parsing tests and verify clause/layer extraction passes**

Run: `npm test -- --run src/__tests__/diagnosis-matching.test.ts`  
Expected: PASS for clause and layered signal tests; some diagnosis winner tests may still fail until Task 3.

- [ ] **Step 7: Commit Task 2**

```bash
git add src/lib/diagnosis.ts src/__tests__/diagnosis-matching.test.ts
git commit -m "feat: add clause-based diagnosis signal parsing"
```

---

### Task 3: Anchor Primary Selection To The Layered Model

**Files:**
- Modify: `src/lib/diagnosis.ts`
- Modify: `src/__tests__/diagnosis-matching.test.ts`
- Test: `src/__tests__/diagnosis-matching.test.ts`

- [ ] **Step 1: Add failing winner-selection regressions for mixed inputs**

```ts
it("keeps a stroke-outcome diagnosis primary when pressure and trigger signals coexist", () => {
  const result = findBestDiagnosisRule("正手在关键分的时候，如果对手在网前，我容易紧张，一发力就出界");

  expect(result.rule?.problemTag).toBe("forehand-out");
});

it("keeps pressure fallback out of the winner slot when a stronger layered primary exists", () => {
  const result = findBestDiagnosisRule("关键分正手老飞，对手一上网我就慌");

  expect(result.rule?.problemTag).toBe("forehand-out");
  expect(result.rule?.problemTag).not.toBe("pressure-tightness");
});

it("still lets the mental fallback win when no technical primary candidate exists", () => {
  const result = findBestDiagnosisRule("比赛一紧张就手紧");

  expect(result.rule?.problemTag).toBe("pressure-tightness");
});
```

- [ ] **Step 2: Add a primary-candidate bonus that only applies to eligible layered winners**

```ts
function getLayeredPrimaryBonus(rule: DiagnosisRule, signalBundle: DiagnosisSignalBundle): number {
  if (signalBundle.layeredSignals.primaryCandidates.includes(rule.problemTag)) {
    return 12;
  }

  if (signalBundle.layeredSignals.modifiers.includes("tight") && rule.problemTag === "pressure-tightness") {
    return signalBundle.layeredSignals.primaryCandidates.length === 0 ? 6 : 0;
  }

  return 0;
}
```

- [ ] **Step 3: Use layered-primary bonus inside candidate scoring without deleting the current slot model**

```ts
function buildDiagnosisRuleCandidate(input: string, rule: DiagnosisRule): DiagnosisRuleCandidate | null {
  const signalBundle = extractDiagnosisSignalBundle(input);
  const matchedKeywords = getMatchedKeywordsFromBundle(signalBundle, rule);
  const matchedSynonyms = getMatchedSynonymsFromBundle(signalBundle, rule);
  const lexicalScore = getLexicalDiagnosisScore(rule, matchedKeywords, matchedSynonyms);
  const { slotScore, priorityWeight } = scoreDiagnosisRuleSlots(rule, signalBundle.slots);
  const layeredPrimaryBonus = getLayeredPrimaryBonus(rule, signalBundle);

  if (lexicalScore <= 0 && slotScore <= 0 && layeredPrimaryBonus <= 0) {
    return null;
  }

  return {
    rule,
    matchedKeywords,
    matchedSynonyms,
    lexicalScore,
    slotScore,
    priorityWeight,
    score: lexicalScore + slotScore + priorityWeight + layeredPrimaryBonus
  };
}
```

- [ ] **Step 4: Add deterministic tie-break preference for layered primaries**

```ts
if (
  candidate.score === bestCandidate.score &&
  getLayeredPrimaryBonus(candidate.rule, signalBundle) > getLayeredPrimaryBonus(bestCandidate.rule, signalBundle)
) {
  bestCandidate = candidate;
}
```

- [ ] **Step 5: Run the focused regression suite**

Run: `npm test -- --run src/__tests__/diagnosis-matching.test.ts`  
Expected: PASS, including new mixed-input winner tests and existing regression coverage.

- [ ] **Step 6: Run one adjacent smoke check for study-safe behavior**

Run: `npm test -- --run src/__tests__/content-display.test.ts`  
Expected: PASS, confirming no downstream display regression from the parsing changes.

- [ ] **Step 7: Commit Task 3**

```bash
git add src/lib/diagnosis.ts src/__tests__/diagnosis-matching.test.ts
git commit -m "feat: anchor multi-signal diagnosis to layered primary selection"
```

