---
aliases:
  - Routing First 3 Step Execution
tags:
  - type/roadmap
  - area/product
  - status/reference
---

# Routing-First 三步执行方案（2026-03-31）

## Related docs
- [[index]]
- [[product-principles]]
- [[boundaries]]
- [[roadmap/current]]

## 目标
把 TennisLevel 稳定推进为“训练决策路由层”，而不是内容仓库。

三条主线对应关系：
- 路由层而非内容仓库：优先采纳 1、4、7
- 稀缺在收敛/判断/路由：优先采纳 2、4、8
- 从口语模糊到单一下一步：优先采纳 1、3、6

## 范围与边界
- 不修改 study event 语义和导出 shape
- 不改 frozen /library 和 /rankings 排序逻辑
- 不重开 /video-diagnose
- 不在同一切片同时改 diagnosis + plans + study flow

## Step 1（先做）
主题：收敛门控 + 可解释建议 + 保守推荐

采用条目：1、4、7

### Slice 1A：诊断先收敛再推荐
目标：把“先问清再推荐”做成硬门控，而不是文案提示。

改动文件：
- src/types/diagnosis.ts
- src/lib/diagnosis.ts
- src/components/diagnose/DiagnoseResult.tsx

实现点：
- 在 DiagnosisResult 增加收敛状态字段
  - needsNarrowing
  - evidenceLevel（low, medium, high）
  - narrowingPrompts（最多 2 条）
- 对低证据输入强制进入收敛阶段
  - 先给 narrowingPrompts
  - 不直接扩展到多方向内容
- 输出单一 primaryNextStep（只保留 1 条主动作）

验收标准：
- 对“我最近总打不好”这类宽泛输入，系统先给收敛问题，不给多条并列推荐
- 对明确输入，仍能进入正常诊断链路

### Slice 1B：推荐保守策略默认开启
目标：推荐只在证据充足时出现，且只走 direct source。

改动文件：
- src/lib/diagnosis.ts
- src/data/contents.ts（仅在必要时补齐 direct source 元数据）
- src/__tests__/diagnosis-matching.test.ts

实现点：
- 低证据时 recommendedContents 返回空数组
- 中高证据时才进入推荐排序
- 推荐继续严格限定为 curated direct source

验收标准：
- 低证据输入返回 0 推荐视频
- 所有推荐项都来自 direct source

### Slice 1C：诊断建议层（可解释收敛）
目标：把“为什么先收敛”清楚告诉用户，并给立即可做动作。

改动文件：
- src/components/diagnose/DiagnoseResult.tsx
- src/lib/diagnosis.ts

实现点：
- 显示收敛建议卡片（severity 排序）
- 每条建议包含：原因 + 下一步动作
- 保持单一 primaryNextStep 作为主 CTA

验收标准：
- 用户能看见“当前先做什么、为什么”
- 结果页不再出现多条同权重下一步

Step 1 验证：
- npm test -- src/__tests__/diagnosis-matching.test.ts src/__tests__/content-display.test.ts
- npm run build

---

## Step 2（第二步）
主题：判断深度分层 + 研究日志分页读取

采用条目：2、4、8

### Slice 2A：诊断深度分层（quick, standard, deep）
目标：同一 problemTag 下按证据深度控制解释层级，不制造假精确。

改动文件：
- src/lib/diagnosis.ts
- src/types/diagnosis.ts
- src/components/diagnose/DiagnoseInput.tsx
- src/components/diagnose/DiagnoseResult.tsx

实现点：
- 新增 effortMode（quick, standard, deep）
- quick：短结论 + 单步动作
- standard：结论 + 2 条原因 + 1 条动作
- deep：结论 + 分层原因 + 训练提示
- 低证据时 deep 也不得输出高置信诊断

验收标准：
- 同一输入在不同 effortMode 下 problemTag 一致
- 文本深度变化符合模式定义

### Slice 2B：建议层与置信表达联动
目标：建议层不只提示问题，还要约束语气和置信度。

改动文件：
- src/lib/diagnosis.ts
- src/components/diagnose/DiagnoseResult.tsx

实现点：
- low evidence：提示“先补证据”，避免技术断言
- medium evidence：给方向 + 单步动作
- high evidence：给更明确可执行动作

验收标准：
- 低证据输入不再出现高置信口吻
- 建议层和 confidence 一致

### Slice 2C：研究事件分页读取
目标：研究数据读取侧支持分页，避免一次性拉全量。

改动文件：
- src/app/api/study/events/route.ts
- src/lib/researchData.ts
- 可选：src/lib/study/events.ts（如需新增读取 helper）

实现点：
- 新增 GET 分页接口（limit, cursor）
- 保留现有 POST 写入行为和事件语义
- 导出读取改为分页聚合

验收标准：
- 大体量 event_logs 可稳定读完
- 不改变 eventName, payload, export shape

Step 2 验证：
- 新增分页读取相关单测
- npm run build

---

## Step 3（第三步）
主题：单一下一步闭环 + 会话可靠性 + 计划可恢复

采用条目：1、3、6

### Slice 3A：单一下一步闭环到计划入口
目标：诊断页的 primaryNextStep 直接驱动计划生成入口。

改动文件：
- src/components/diagnose/DiagnoseResult.tsx
- src/lib/plans.ts
- src/types/plan.ts

实现点：
- 从 diagnosis.primaryNextStep 注入计划候选上下文
- 计划 Day 1 明确 done criteria，与诊断下一步对齐
- 结果页与计划页都显示同一主目标

验收标准：
- 用户从诊断到计划始终看到同一主线目标
- Day 1 存在可判定完成条件

### Slice 3B：计划草稿可恢复
目标：刷新或中断后，用户能回到同一计划草稿。

改动文件：
- src/lib/plans.ts
- src/lib/study/localData.ts
- src/lib/study/eventPersistence.ts（仅当需要引用现有 artifact 机制）

实现点：
- 为当前 session 保存 plan draft 快照
- 页面重载可恢复最近 plan draft
- 仅新增恢复能力，不改 study 事件定义

验收标准：
- 中断后可恢复上次 plan draft
- 不产生重复或冲突草稿

### Slice 3C：会话可靠性补强
目标：关键节点先落盘再收口，降低中断丢失。

改动文件：
- src/lib/eventLogger.ts
- src/lib/study/events.ts
- src/lib/researchData.ts（如涉及读取校验）

实现点：
- 关键 study 结束节点执行强制 flush
- 保留现有事件含义，只提升可靠性
- 增加失败重试与回退日志

验收标准：
- 结束会话时事件丢失率下降
- 研究导出中关键结束节点完整

Step 3 验证：
- 针对 plan 恢复和 flush 的单测
- npm run build

---

## 执行节奏建议
- 每个 Slice 独立为一个小 PR
- 一个 PR 只改一个子系统
- 每个 PR 完成后先过最小验证，再推进下一个 Slice

建议顺序：
1. Step 1A
2. Step 1B
3. Step 1C
4. Step 2A
5. Step 2B
6. Step 2C
7. Step 3A
8. Step 3B
9. Step 3C

## 当前开始点
建议立即开工 Step 1A。
理由：它是后续“保守推荐、深度分层、单一下一步”三条链路的公共前置。
