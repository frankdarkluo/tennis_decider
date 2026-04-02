---
aliases:
  - Efficiency
  - Codex Efficiency Prompt
tags:
  - type/workflow
  - area/process
  - status/reference
---

# CODEX_HIGH_EFFICIENCY_TOKEN_MASTER_PROMPT.md

## Related docs
- [[index]]
- [[skills/WORKFLOW]]
- [[roadmap/current]]
- [[prompts/DAILY_PROGRESS_PROMPT]]
- [[prompts/WEEKLY_REVIEW_PROMPT]]

> 用途：作为 TennisLevel 仓库里给 Codex 的总提示模板  
> 目标：尽量减少重复上下文、降低无效 token 消耗、提高执行稳定性  
> 适用场景：基于仓库内 markdown 文档分阶段推进研究模式开发  
> 当前优先文档：
> - `TennisLevel_USER_RESEARCH_BACKLOG_P0_P1_P2_v2.md`
> - `TennisLevel_ACTIONABILITY_AND_SORT_FREEZE_PLAN.md`
> - 后续可能新增、覆盖或更新的相关 `.md` 文档

---

## 一、使用原则

这份总提示的核心思想：

1. **优先读取仓库文档，不要让我重复贴背景**
2. **先计划，再执行**
3. **一次只做一个 PR**
4. **默认短输出**
5. **通过技能和仓库文档复用上下文**
6. **每到一个存档点，进入下一步之前，提醒我推荐使用的 reasoning effort**

官方 Codex 文档建议把可复用指导沉淀到仓库文档、`AGENTS.md` 和 Skills 里，而不是每次在聊天里重复写长提示；同时也建议复杂任务先规划、再分步执行。官方还明确建议根据任务难度选择不同 reasoning effort：`medium` 是通用的平衡选项，`high` 和 `xhigh` 更适合更复杂、更长链路的任务。citeturn659904search2turn659904search7turn659904search6

---

## 二、给 Codex 的完整版总提示

下面这段可以直接复制给 Codex。

```text
We are implementing a study-ready version of TennisLevel.

Primary goal:
Use repository documents as the source of truth, minimize repeated context, and execute work in small verified PR-sized steps.

Repository guidance:
1. First read the key research docs in the repo root or docs/research/ if they exist.
2. The current highest-priority docs are:
   - TennisLevel_EVENT_TRACKING_PLAN_NO_VIDEO.md
   - TennisLevel_ACTIONABILITY_AND_SORT_FREEZE_PLAN.md
3. Also scan for any newer or overriding markdown docs related to:
   - study mode
   - research
   - event tracking
   - actionability
   - sorting
   - rankings
   - bilingual / i18n
   - Codex workflow
4. If multiple docs overlap, prefer the most recent and most specific doc, while preserving compatible requirements from older docs.
5. Do not ask me to restate requirements that are already documented in the repo unless there is a real conflict.

How to work:
1. Use writing-plans first.
2. Produce a phased execution plan with:
   - PR boundaries
   - dependencies
   - touched files
   - migrations
   - env changes
   - tests
   - acceptance criteria
   - open ambiguities
3. Do not implement yet when asked for the initial plan.

Implementation workflow:
1. After the plan is approved, use executing-plans.
2. Execute exactly one PR at a time.
3. Do not start later PRs early.
4. Prefer repository docs and code inspection over long conversational explanations.
5. Use test-driven-development for:
   - event logging
   - task actionability ratings
   - deterministic study-mode ordering
6. Use verification-before-completion before claiming any PR is done.
7. Use requesting-code-review after each major PR.
8. Use dispatching-parallel-agents only for isolated workstreams with low file overlap.
9. Prefer sequential execution when frontend/study-mode files overlap.

Current scope constraints:
- video diagnose is hidden and excluded from this study phase
- focus on:
  - study mode
  - event logging
  - post-task actionability rating
  - frozen library ordering
  - frozen rankings ordering
  - core bilingual support only when it affects the active PR
- do not implement unrelated growth or productization features unless a repo doc explicitly requires them

Token-efficiency rules:
1. Do not restate long markdown docs back to me.
2. Do not quote repo docs unless necessary.
3. Keep responses concise by default.
4. For implementation updates, return only:
   - what changed
   - files touched
   - tests added or updated
   - verification performed
   - remaining risks or ambiguities
5. Prefer bullets over long prose.
6. If more context is needed, read files from the repo before asking me questions.
7. Reuse the repo docs, AGENTS.md, and available skills instead of repeating instructions in chat.

Checkpoint + reasoning-effort reminder rule:
At every checkpoint, before proposing the next step, briefly recommend the reasoning effort for the next request using exactly one of:
- medium
- high
- xhigh

Use this format:
Recommended next effort: <medium|high|xhigh>
Why: <one short sentence>

Choose effort by default as follows:
- medium for scoped planning, isolated PR execution, and routine implementation steps
- high for complex debugging, refactors touching multiple connected files, or validation-heavy PRs
- xhigh for long agentic tasks, cross-cutting architecture work, or situations where multiple repo docs must be reconciled carefully

Do not over-explain the effort choice.
Do not recommend xhigh unless the next step is truly broad or reasoning-heavy.

Definition of done for each PR:
- code implemented within scope
- tests added or updated where appropriate
- verification performed
- no obvious scope creep
- docs/env updates included if needed

First task:
Read the repo docs, identify the active source-of-truth markdown files, and output a phased plan only.
Do not implement yet.
```

---

## 三、为什么要加“checkpoint + reasoning effort reminder”

这样做的作用不是让 Codex 长篇解释模型设置，而是让它在每个“存档点”给你一个**极短的下一步建议**，方便你自己控制 token 和延迟。

OpenAI 的 Codex 与 GPT-5.3-Codex 文档都明确说明，`medium`、`high`、`xhigh` 属于可选 reasoning effort；其中官方对 Codex 的建议是：  
- `medium` 适合作为通用的交互式编码默认值  
- `high` 适合更复杂的改动或调试  
- `xhigh` 适合最长、最 agentic、最重推理的任务 citeturn659904search2turn659904search7turn659904search6

所以这里让 Codex 在每个 checkpoint 只输出：

- `Recommended next effort: medium|high|xhigh`
- `Why: ...`

这就够了，不要让它再展开。

---

## 四、你可以自己参考的 effort 速查表

### 推荐用 `medium`
适合：
- 读仓库 md 并写 phased plan
- 做单个边界清晰的 PR
- 改一个相对独立的组件
- 补事件类型、日志 helper、简单 API route
- 补测试但逻辑不复杂

官方 Codex 提示指南把 `medium` 当作一个很好的通用平衡档。citeturn659904search2

### 推荐用 `high`
适合：
- 事件日志接线跨多个页面
- study mode 配置与前端状态联动
- 排序冻结但涉及多个数据源和过滤器
- 一轮需要“实现 + 测试 + 验证 + review”的 PR
- 比较复杂的 bug 排查

官方 Codex 最佳实践也把 `medium` 或 `high` 作为复杂改动与调试的推荐区间。citeturn659904search7turn659904search8

### 推荐用 `xhigh`
适合：
- 对多个 markdown 规范做统一协调
- 长链路、跨模块、架构级改造
- 大规模 refactor
- 多 agent 协作并最后统一收敛
- 特别复杂的 deterministic ordering / data pipeline / migration 组合任务

官方 Codex 文档把 `xhigh` 明确定位为最难、最长、最 agentic 的任务档位。citeturn659904search2turn659904search7turn659904search6

---

## 五、建议的 PR 与 effort 对应关系

结合你现在的 TennisLevel 研究实现，我建议默认这样选：

### PR1：研究模式骨架
内容：
- study mode
- participant/session
- `/study/start`
- `/study/end`

建议 effort：
- **medium**

原因：
- 范围清晰，依赖有限

### PR2：事件日志
内容：
- `EventName`
- `StudyEvent`
- `trackEvent`
- `/api/study/events`
- `page.view / page.leave`
- 核心页面接线

建议 effort：
- **high**

原因：
- 涉及多个页面与埋点一致性，容易漏项

### PR3：任务后 actionability 单题
内容：
- `ActionabilityPrompt`
- task ratings table
- 任务结束节点接线

建议 effort：
- **medium**

原因：
- 逻辑聚焦，但要和研究流程结合好

### PR4：冻结 `/library` 排序
内容：
- snapshot
- seeded sort
- 关闭随机 surfacing
- 关闭 view count boost

建议 effort：
- **high**

原因：
- 涉及排序稳定性与研究可复现性

### PR5：冻结 `/rankings` 排序
内容：
- creator snapshot
- deterministic ranking

建议 effort：
- **medium** 或 **high**
- 默认从 **medium** 开始
- 如果现有实现耦合很深，再升到 **high**

### PR6：双语核心流程
内容：
- i18n infra
- 核心研究流程 zh/en
- language lock

建议 effort：
- **medium**

### PR7：导出、验证、收尾
内容：
- export
- docs
- env.example
- tests
- cleanup

建议 effort：
- **medium**
- 若出现跨模块验证问题，再升到 **high**

---

## 六、单个 PR 的低 token 执行模板

后续每轮你可以只发这个短模板。

```text
Execute PR{N} only.

Use:
- executing-plans
- test-driven-development where appropriate
- verification-before-completion
- requesting-code-review before final completion

Scope:
- stay strictly within PR{N}
- do not begin later PRs
- do not restate repo docs
- prefer short progress updates

Before you start, read the active repo markdown docs if needed.
At the end of this checkpoint, recommend the next reasoning effort using:
Recommended next effort: <medium|high|xhigh>
Why: <one short sentence>

Return only:
1. changed files
2. key implementation details
3. tests added or updated
4. verification performed
5. remaining risks / ambiguities
```

---

## 七、建议配套的 `AGENTS.md`

如果仓库里还没有 `AGENTS.md`，建议加一个极短版。官方 Codex 最佳实践明确建议把仓库级约束放进 `AGENTS.md`。citeturn659904search7

```text
# AGENTS.md

## Source of truth
Always check repository markdown docs before asking for repeated context.
Prefer the newest and most specific implementation doc when multiple docs overlap.

## Current high-priority docs
- TennisLevel_EVENT_TRACKING_PLAN_NO_VIDEO.md
- TennisLevel_ACTIONABILITY_AND_SORT_FREEZE_PLAN.md

## Execution rules
- Plan first for complex tasks
- Implement one PR at a time
- Verify before completion
- Keep outputs concise
- Do not restate long docs

## Checkpoint rule
At every checkpoint, before proposing the next step, recommend exactly one reasoning effort:
- medium
- high
- xhigh

Use format:
Recommended next effort: <medium|high|xhigh>
Why: <one short sentence>
```

---

## 八、结论

这份模板的目标不是“让 Codex 说得更少”这么简单，而是让它：

- 优先读仓库 md
- 自动发现后续新增或覆盖的文档
- 默认短输出
- 一次只推进一个 PR
- 在每个 checkpoint 给你一个极简的 effort 建议

这样你就能更主动地控制：

- 下一轮该不该用 `medium`
- 什么时候值得升到 `high`
- 什么时候才真的需要 `xhigh`

从 token 使用效率和执行稳定性来看，这套方式通常会比每次在聊天里重贴一大段背景高效得多。官方 Codex 与 GPT-5.3-Codex 文档也明确支持这种“文档先行 + 分阶段执行 + 按任务选择 effort”的工作流。citeturn659904search2turn659904search6turn659904search7
