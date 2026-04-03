# Plan Chain Search-Entry Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove search-entry content IDs from the training-plan chain so plan cards only ever render direct video links.

**Architecture:** Keep the existing runtime guard in `src/lib/plans.ts`, then clean the upstream plan-template references so the plan system seeds and renders direct library videos instead of search-result placeholders. Prefer substituting existing direct library items over adding new external content entries in this slice.

**Tech Stack:** Next.js App Router, TypeScript, Vitest

---

## File Map

- Modify: `src/data/planTemplates.ts`
  - Replace or remove search-entry `contentIds` used by plan templates.
- Modify: `src/__tests__/content-display.test.ts`
  - Add and update tests that fail when plan templates still reference search-entry items.
- Verify only: `src/lib/plans.ts`
  - Runtime guard already blocks non-direct plan videos; no behavior expansion unless verification shows a gap.

## Scope Rules

- Only touch search-entry items that are actually referenced by the training plan chain.
- Prefer replacing template references with existing direct items already present in `src/data/contents.ts`.
- If no credible direct item exists for a given day, remove that `contentId` from the affected plan day rather than keeping a search-entry placeholder.
- Do not perform full-library cleanup in `src/data/contents.ts`.

### Task 1: Lock the template-level regression

**Files:**
- Modify: `src/__tests__/content-display.test.ts`

- [ ] **Step 1: Write the failing test**

Add a regression that scans `getPlanTemplate()` output for a representative set of high-risk problem tags and fails if any day resolves to a search-result URL.

```ts
it("keeps high-risk plan templates on direct video URLs only", () => {
  const riskyTags = [
    "pressure-tightness",
    "match-anxiety",
    "movement-slow",
    "mobility-limit",
    "incoming-slice-trouble",
    "doubles-positioning",
    "first-serve-in"
  ] as const;
  const contentById = new Map([...contents, ...expandedContents].map((entry) => [entry.id, entry]));

  for (const tag of riskyTags) {
    const plan = getPlanTemplate(tag, "3.0", "zh");
    expect(
      plan.days.every((day) =>
        day.contentIds.every((id) => {
          const item = contentById.get(id);
          return Boolean(item && !item.url.includes("search.bilibili.com/all?keyword="));
        })
      )
    ).toBe(true);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/content-display.test.ts`
Expected: FAIL because at least one current plan template still resolves to a search-entry URL.

- [ ] **Step 3: Commit the red test**

```bash
git add src/__tests__/content-display.test.ts
git commit -m "test: lock direct-video rule for plan templates"
```

### Task 2: Replace the first-batch high-frequency search-entry references

**Files:**
- Modify: `src/data/planTemplates.ts`
- Test: `src/__tests__/content-display.test.ts`

- [ ] **Step 1: Replace pressure and match-routine search entries with existing direct content**

Use direct match-execution content already in the library:

- Replace `content_cn_f_01` with `content_rb_03`
- Replace `content_cn_e_02` with `content_rb_02` or `content_rb_03` depending on whether the day is routine-oriented or broader execution-oriented

```ts
// Example replacements inside affected template days
contentIds: ["content_rb_03"]
contentIds: ["content_rb_02"]
```

- [ ] **Step 2: Replace movement and late-preparation search entries with direct movement items**

Use existing direct movement items:

- Replace `content_cn_c_02` with `content_fr_02` or `content_gaiao_05`
- Replace `content_cn_a_03` with `content_gaiao_05` or `content_fr_02`
- Replace `content_cn_a_02` with `content_fr_02` or `content_fr_01` depending on whether the day is preparation-oriented or backhand-contact-oriented

```ts
contentIds: ["content_fr_02"]
contentIds: ["content_gaiao_05"]
contentIds: ["content_fr_01"]
```

- [ ] **Step 3: Replace doubles, volley, and transition search entries with direct net-play items**

Use existing direct net and doubles items:

- Replace `content_cn_b_03` with `content_rb_01`
- Replace `content_cn_b_02` with `content_rb_01`
- Replace `content_zlx_03` with `content_rb_01` or `content_fr_01` depending on the day focus

```ts
contentIds: ["content_rb_01"]
contentIds: ["content_fr_01"]
```

- [ ] **Step 4: Replace serve-family search entries with direct serve items**

Use existing direct serve items:

- Replace `content_ttt_01` with `content_gaiao_02` or `content_zlx_01`
- Keep the replacement aligned to the plan focus:
  - toss/rhythm days -> `content_zlx_01`
  - first-serve foundation / getting the ball in -> `content_gaiao_02`

```ts
contentIds: ["content_zlx_01"]
contentIds: ["content_gaiao_02"]
```

- [ ] **Step 5: Remove any remaining plan-day `contentIds` that cannot be mapped credibly in this slice**

If a day has no good direct substitute, use an empty list.

```ts
contentIds: []
```

- [ ] **Step 6: Run the targeted test suite**

Run: `npm test -- src/__tests__/content-display.test.ts`
Expected: PASS

- [ ] **Step 7: Commit the template cleanup**

```bash
git add src/data/planTemplates.ts src/__tests__/content-display.test.ts
git commit -m "fix: remove plan-template search-entry references"
```

### Task 3: Verify end-to-end plan safety

**Files:**
- Verify: `src/data/planTemplates.ts`
- Verify: `src/lib/plans.ts`
- Verify: `src/__tests__/content-display.test.ts`

- [ ] **Step 1: Spot-check the highest-risk tags in generated plans**

Run a quick script to verify representative plan outputs:

```bash
node - <<'NODE'
const { getPlanTemplate } = require('./src/lib/plans.ts');
const tags = ['pressure-tightness','match-anxiety','movement-slow','mobility-limit','incoming-slice-trouble','doubles-positioning','first-serve-in'];
for (const tag of tags) {
  const plan = getPlanTemplate(tag, '3.0', 'zh');
  console.log(tag, plan.days.map((day) => day.contentIds[0] ?? null));
}
NODE
```

Expected: IDs are direct-library items or `null`, never search-entry-only plan placeholders.

- [ ] **Step 2: Run production verification**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Optional lint check**

Run: `npm run lint`
Expected: If the repo still lacks non-interactive ESLint config, record that limitation instead of forcing initialization.

- [ ] **Step 4: Commit the verification pass**

```bash
git add src/data/planTemplates.ts src/__tests__/content-display.test.ts
git commit -m "test: verify direct-video safety for plan chain"
```

## First-Batch Priority List

1. `content_cn_f_01`
2. `content_cn_e_02`
3. `content_cn_c_02`
4. `content_cn_a_03`
5. `content_cn_a_02`
6. `content_cn_b_03`
7. `content_ttt_01`
8. `content_cn_b_02`

## Out of Scope

- Cleaning unused search-entry items in `src/data/contents.ts`
- Re-curating diagnosis recommendations
- Adding brand-new external BV or YouTube entries unless existing direct library items prove insufficient
