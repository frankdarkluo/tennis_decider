# TennisLevel 研究优化实施方案：Actionability 单题 + 冻结 Library/Rankings 排序

> 用途：直接提供给 Codex 实施  
> 范围：仅覆盖两项研究优化  
> 1. 每个研究任务后增加一个 actionability 单题  
> 2. 在 study mode 下冻结 `/library` 和 `/rankings` 的排序与内容快照  
> 当前约束：`/video-diagnose` 暂不纳入本轮研究实现

---

## 一、为什么现在要做这两项

当前系统已经具备较强的 SportsHCI 论文基础：  
- 首页支持多个低摩擦起点  
- assessment 是短流程、低负担 profiling  
- assessment result 只突出当前位置和下一步  
- diagnose 是三层渐进展开的 problem-to-practice 流程  
- library 是跨平台、coach-grounded 的学习资源库  
- rankings 支持“向谁学”的创作者选择  
- plan 是 “today first” 的行动桥接页  
- profile 是 continuity of practice 的轻量历史页

但为了让用户研究更稳，还需要补两件事：

### 1）给每个任务加一个 actionability 单题
SUS 只能测整体可用性，不能直接回答系统是否真的帮助用户“知道下一步该练什么”。  
而你们当前系统最核心的研究价值，恰恰是：
- action-oriented feedback compression
- problem-to-practice translation
- bridging diagnosis to practice structure

所以每个任务结束后都应该补一个非常轻的 actionability 单题。

### 2）冻结 library / rankings 的排序
当前 library 的排序包含：
- partially randomized surfacing
- partially boosted by view count

当前 rankings 也采用混合分数：
- level match
- content quality signals
- curator / authority signals

这对产品合理，但对用户研究不够可复现。  
如果不冻结，参与者之间看到的内容顺序可能不同，后面很难解释点击差异究竟来自设计本身，还是来自排序变化。

---

## 二、总目标

Codex 需要实现：

1. **任务后 actionability 单题**
   - 每个核心任务完成后显示 1 个 7 点量表题
   - 记录答案、任务编号、关联 session
   - 导出时可直接用于分析

2. **study mode 下冻结 content / creator 排序**
   - `/library` 使用固定 snapshot + 固定排序
   - `/rankings` 使用固定 snapshot + 固定排序
   - 同一 `snapshotVersion` 下，所有参与者看到相同顺序
   - 禁用随机 surfacing
   - 取消实时 view count 对研究排序的影响
   - 记录 `snapshotVersion` 和 `sortingMode`

---

# 三、第一部分：任务后 Actionability 单题

## 3.1 研究意图

这道单题不是替代 SUS，而是补充一个更贴合系统贡献的指标。

建议题干固定为：

### 英文
`After completing this task, I know what I should practice next.`

### 中文
`完成这个任务后，我知道我下一步该练什么了。`

## 3.2 量表设计

采用 **7 点 Likert**：

- 1 = Strongly disagree / 非常不同意
- 2 = Disagree / 不同意
- 3 = Somewhat disagree / 有点不同意
- 4 = Neutral / 一般
- 5 = Somewhat agree / 有点同意
- 6 = Agree / 同意
- 7 = Strongly agree / 非常同意

为什么不用 5 点：
- SUS 已经是 5 点
- actionability 这里建议用 7 点，更容易拉开细微差别
- 这题是任务后单题，用户负担很低

---

## 3.3 放置位置

建议只在 **任务结束节点** 显示，不在每个页面都弹。

### 任务 1（问题进入）
推荐结束节点：
- 用户完成 `/diagnose`
- 且已经看过结果
- 且点过下一步，或主动结束任务

### 任务 2（assessment 进入）
推荐结束节点：
- 用户看过 `/assessment/result`
- 点击过一个 next action 或返回研究流程

### 任务 3（行动/回看）
推荐结束节点：
- 用户到达 `/plan`
- 或者从 `/profile` 回看过保存项后结束任务

---

## 3.4 任务编号建议

Codex 中统一使用：

- `task_1_problem_entry`
- `task_2_assessment_entry`
- `task_3_action_or_revisit`

---

## 3.5 前端实现形式

建议采用一个统一组件：

```ts
<ActionabilityPrompt
  taskId="task_1_problem_entry"
  language={language}
  onSubmit={(value) => ...}
/>
```

### 组件行为
- 显示 1 个题干
- 显示 1–7 选项
- 用户选中后可提交
- 提交成功后关闭，进入下一任务
- 不做强制长文本解释
- 如果你愿意，可以加一个可选备注输入框，但默认先不加

---

## 3.6 事件日志

新增两个事件：

### `task.actionability_prompt_viewed`

```ts
{
  eventName: 'task.actionability_prompt_viewed',
  route,
  taskId,
  language
}
```

### `task.actionability_submitted`

```ts
{
  eventName: 'task.actionability_submitted',
  route,
  taskId,
  score: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  language
}
```

---

## 3.7 数据库存储建议

新增表：

```sql
create table study_task_ratings (
  id bigint generated always as identity primary key,
  study_id text not null,
  participant_id text not null,
  session_id uuid not null,
  task_id text not null,
  metric_name text not null, -- 'actionability'
  score integer not null check (score between 1 and 7),
  language text not null,
  submitted_at timestamptz not null default now()
);
```

如果你不想新建表，也可以写入 `study_surveys`，但我更建议单独表，因为后面分析任务维度更方便。

---

## 3.8 导出时需要的字段

导出 CSV/JSON 时至少包含：

- `participant_id`
- `session_id`
- `task_id`
- `metric_name`
- `score`
- `language`
- `submitted_at`

同时生成派生指标：

- `actionability_mean_overall`
- `actionability_mean_by_task`
- `actionability_mean_by_language`
- `actionability_distribution_by_task`

---

# 四、第二部分：冻结 Library / Rankings 排序

## 4.1 为什么要冻结

当前系统里：

### `/library`
- 合并 static curated items、expanded generated items、creator featured videos
- duplicate URL merge
- thumbnail-first
- mixed ordering
- partially randomized surfacing
- partially boosted by view count

### `/rankings`
- 使用混合 score
- level match
- content quality signals
- curator / authority signals

这些都适合产品，但不适合研究阶段的可复现性。  
研究里应该保证：

> 同一 study 里的所有参与者，在相同语言与相同过滤条件下，看到相同内容顺序。

---

## 4.2 研究模式的目标状态

在 `study mode` 中：

### `/library`
- 使用固定 content snapshot
- 使用固定排序权重
- 关闭随机 surfacing
- 关闭实时 view count 影响
- 同一过滤条件下输出稳定顺序

### `/rankings`
- 使用固定 creator snapshot
- 使用固定排序权重
- 同一语言与同一 filter 下输出稳定顺序

---

## 4.3 必须新增的配置

建议新增以下环境变量：

```env
NEXT_PUBLIC_APP_MODE=study
NEXT_PUBLIC_STUDY_SNAPSHOT_VERSION=2026-03-29-v1
NEXT_PUBLIC_STUDY_FIXED_SEED=20260329
NEXT_PUBLIC_STUDY_FREEZE_LIBRARY=true
NEXT_PUBLIC_STUDY_FREEZE_RANKINGS=true
NEXT_PUBLIC_STUDY_DISABLE_RANDOM_SURFACING=true
NEXT_PUBLIC_STUDY_DISABLE_VIEWCOUNT_BOOST=true
```

---

## 4.4 Snapshot 文件结构

建议新增：

```text
src/data/studySnapshot/
  contents.2026-03-29-v1.json
  creators.2026-03-29-v1.json
  metadata.2026-03-29-v1.json
```

### `metadata` 至少包含：

```json
{
  "snapshotVersion": "2026-03-29-v1",
  "createdAt": "2026-03-29T00:00:00Z",
  "fixedSeed": 20260329,
  "contentCount": 673,
  "creatorCount": 52,
  "sortingMode": "deterministic_study",
  "buildSha": "optional"
}
```

---

## 4.5 Library 排序方案（study mode）

### 产品模式下已有特征
- thumbnail 优先
- mixed ordering
- 部分随机
- 部分受 view count 影响

### 研究模式下改为
固定分数 + 稳定 tie-breaker

建议：

```ts
finalScore =
  0.45 * relevanceToProblem
+ 0.25 * levelMatch
+ 0.20 * curatorAuthority
+ 0.10 * sourceQuality
```

然后：

```ts
stableTieBreaker = hash(contentId + fixedSeed)
```

### 研究模式下明确禁用
- `Math.random()` 直接参与排序
- 实时 view count 动态提升
- 用户交互后即时重排

---

## 4.6 Rankings 排序方案（study mode）

### 产品模式下已有特征
- level match
- content quality
- curator / authority
- personalized rather than pure popularity

### 研究模式下改为
固定 creator score：

```ts
finalCreatorScore =
  0.50 * levelMatch
+ 0.30 * contentQuality
+ 0.20 * curatorAuthority
```

然后：

```ts
stableTieBreaker = hash(creatorId + fixedSeed)
```

### 研究模式下明确禁用
- 热度驱动的临时上浮
- 受近期互动影响的动态排序
- 不可追踪的手动实时插队

---

## 4.7 过滤器与稳定性要求

研究模式下允许保留这些过滤器：
- platform
- content_language
- subtitle_availability
- bookmarks
- domestic / overseas

但要求：

> 在同一 snapshotVersion + 同一 filter 组合下，排序输出必须稳定。

例如：

```ts
getStudyLibraryItems({
  snapshotVersion,
  platform: 'bilibili',
  contentLanguage: 'zh'
})
```

连续两次调用必须返回相同顺序。

---

## 4.8 事件日志补充

为了后面写论文时能证明“研究使用的是冻结排序”，建议加 4 个事件。

### `library.snapshot_loaded`

```ts
{
  eventName: 'library.snapshot_loaded',
  route: '/library',
  snapshotVersion,
  sortingMode: 'deterministic_study',
  randomSurfacingDisabled: true,
  viewCountBoostDisabled: true
}
```

### `rankings.snapshot_loaded`

```ts
{
  eventName: 'rankings.snapshot_loaded',
  route: '/rankings',
  snapshotVersion,
  sortingMode: 'deterministic_study'
}
```

### `library.sort_context_logged`

```ts
{
  eventName: 'library.sort_context_logged',
  route: '/library',
  snapshotVersion,
  platformFilter,
  languageFilter,
  subtitleFilter
}
```

### `rankings.sort_context_logged`

```ts
{
  eventName: 'rankings.sort_context_logged',
  route: '/rankings',
  snapshotVersion,
  regionFilter,
  searchUsed: boolean
}
```

---

## 4.9 导出时必须带上的字段

导出研究数据时，所有 `/library` 和 `/rankings` 相关记录都应至少带上：

- `snapshot_version`
- `sorting_mode`
- `fixed_seed`
- `platform_filter`
- `content_language_filter`
- `subtitle_filter`
- `region_filter`

这样你后面写论文时就可以明确说明：

> All participants interacted with a frozen content/creator snapshot under deterministic ordering during the study.

---

# 五、Codex 需要改哪些文件

## 5.1 Actionability 单题

建议新增：

```text
src/components/study/ActionabilityPrompt.tsx
src/lib/study/taskRatings.ts
src/app/api/study/task-ratings/route.ts
```

## 5.2 Snapshot / 排序冻结

建议新增：

```text
src/lib/study/snapshot.ts
src/lib/study/seededSort.ts
scripts/create-study-snapshot.ts
scripts/verify-study-snapshot.ts
src/data/studySnapshot/...
```

## 5.3 需要接线的现有页面

```text
src/app/assessment/result/page.tsx
src/app/diagnose/page.tsx
src/app/library/page.tsx
src/app/rankings/page.tsx
src/app/plan/page.tsx
src/app/profile/page.tsx
```

---

# 六、Codex 的实施顺序

## PR1：Actionability 单题基础设施
实现：
- `ActionabilityPrompt` 组件
- `task.actionability_prompt_viewed`
- `task.actionability_submitted`
- `study_task_ratings` 表
- `/api/study/task-ratings`

验收：
- 任务结束时能弹出 1–7 单题
- 提交后成功落库

---

## PR2：任务流程接线
实现：
- 任务 1 结束节点接线
- 任务 2 结束节点接线
- 任务 3 结束节点接线

验收：
- 3 个任务都能记录 actionability
- 导出时能按 taskId 区分

---

## PR3：Study snapshot
实现：
- `create-study-snapshot.ts`
- `metadata`
- 固定 `snapshotVersion`

验收：
- 能生成 contents / creators / metadata 三个 snapshot 文件

---

## PR4：冻结 Library 排序
实现：
- study mode 下改用 snapshot data
- seeded deterministic sort
- 关闭随机 surfacing
- 关闭 view count boost

验收：
- 同样过滤条件下，多次打开 `/library` 顺序一致

---

## PR5：冻结 Rankings 排序
实现：
- study mode 下改用 snapshot creators
- seeded deterministic creator ranking

验收：
- 同样过滤条件下，多次打开 `/rankings` 顺序一致

---

## PR6：日志与导出补充
实现：
- `library.snapshot_loaded`
- `rankings.snapshot_loaded`
- `library.sort_context_logged`
- `rankings.sort_context_logged`
- 导出脚本补 snapshot 字段

验收：
- 研究导出包含 snapshotVersion 和 sortingMode

---

# 七、Codex 可直接复制执行的任务说明

```text
Implement two research-focused improvements for TennisLevel study mode.

Scope:
1. Add a single post-task actionability rating after each study task
2. Freeze /library and /rankings ordering in study mode

Important constraints:
- Do NOT include /video-diagnose in this phase
- Keep existing core UX intact
- Use one shared codebase
- Study mode must remain reproducible across participants

Part A: Post-task actionability rating
- Add a reusable ActionabilityPrompt component
- Show exactly one 7-point Likert item after each study task
- Question text:
  EN: "After completing this task, I know what I should practice next."
  ZH: "完成这个任务后，我知道我下一步该练什么了。"
- Record task IDs:
  - task_1_problem_entry
  - task_2_assessment_entry
  - task_3_action_or_revisit
- Add events:
  - task.actionability_prompt_viewed
  - task.actionability_submitted
- Store results in a dedicated study_task_ratings table
- Export actionability scores by task and language

Part B: Freeze /library and /rankings ordering in study mode
- Add study snapshot files for contents and creators
- Add metadata with snapshotVersion and fixedSeed
- Disable randomized surfacing in study mode
- Disable dynamic view-count boosting in study mode
- Use deterministic seeded sorting for both library and rankings
- Ensure same snapshotVersion + same filters => same ordering
- Log:
  - library.snapshot_loaded
  - rankings.snapshot_loaded
  - library.sort_context_logged
  - rankings.sort_context_logged

Environment variables:
- NEXT_PUBLIC_STUDY_SNAPSHOT_VERSION
- NEXT_PUBLIC_STUDY_FIXED_SEED
- NEXT_PUBLIC_STUDY_FREEZE_LIBRARY=true
- NEXT_PUBLIC_STUDY_FREEZE_RANKINGS=true
- NEXT_PUBLIC_STUDY_DISABLE_RANDOM_SURFACING=true
- NEXT_PUBLIC_STUDY_DISABLE_VIEWCOUNT_BOOST=true

Suggested implementation order:
PR1 actionability prompt infra
PR2 task flow integration
PR3 snapshot generation
PR4 freeze library ordering
PR5 freeze rankings ordering
PR6 export/logging polish

Return:
- code changes
- migration files
- env.example updates
- a short STUDY_ACTIONABILITY_AND_SORT_FREEZE.md
```

---

# 八、验收标准

完成后，至少满足以下条件：

1. 每个研究任务结束后都会出现 1 个 actionability 单题  
2. 单题结果可按 task 和 language 导出  
3. study mode 下 `/library` 排序稳定  
4. study mode 下 `/rankings` 排序稳定  
5. 关闭随机 surfacing  
6. 关闭 view count 动态影响  
7. 所有参与者在相同 snapshotVersion 下看到相同顺序  
8. 研究日志可证明 study mode 使用的是冻结排序

---

# 九、结论

这两项优化非常划算，因为它们分别解决了这轮研究里最容易被质疑的两个点：

- **Actionability 单题**：补上“系统是否真的让用户知道下一步该练什么”的核心证据  
- **冻结排序**：补上“参与者看到的是同一研究系统，而不是动态变化版本”的可复现性证据

这两项一补，你们这轮短论文的研究设计会明显更稳，也更像一篇 HCI / SportsHCI 论文。
