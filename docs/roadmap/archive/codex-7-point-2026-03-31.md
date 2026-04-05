---
aliases:
  - Codex 7 Point Execution
tags:
  - type/roadmap
  - area/diagnosis
  - status/reference
---

# Codex 可执行方案：7 点逐点执行（2026-03-31）

## Related docs
- [[index]]
- [[roadmap/current]]
- [[features/diagnosis-study-observability]]
- [[progress/2026-03-31]]

## 目标
把诊断体验从“信息多但分散”升级到“默认简洁、证据可控、过程可复盘、版本可回归”。

对应 7 点：
1. 决策过程可展开，不默认灌输
2. 明确拒判机制
3. 可回放诊断快照
4. 真实样本回归集
5. 文案预算机制
6. 结果一致性约束
7. 失败可观测性分桶

## 执行原则（Codex）
- 一次只做一个点，不并发跨点实现。
- 每点最多一个主子系统改动，避免同一切片同时改 diagnosis + plans + study flow。
- 不改 study event 语义和导出 shape。
- 每点完成后都执行最小验证，再执行 npm run build。
- 任何点都必须满足：默认信息密度更低、主动作更清楚、证据表达更诚实。

## 状态总览
- [x] 点 1
- [x] 点 2
- [x] 点 3
- [x] 点 4
- [x] 点 5
- [x] 点 6
- [x] 点 7

---

## 点 1：决策过程可展开，不默认灌输
目标：默认只展示结论和单步动作，详细解释改为点击展开。

范围文件：
- src/components/diagnose/DiagnoseResult.tsx
- src/lib/diagnosis.ts
- src/__tests__/bilingual-rendering.test.tsx
- src/__tests__/diagnosis-matching.test.ts

实现任务：
- 证据区默认仅显示短标签。
- 证据解释文案仅在展开后显示。
- summary 不再承担证据长文，保留动作导向表达。
- 展开行为保留事件打点（why_this_viewed）。

验收标准：
- 默认视图中不再出现长证据段落。
- 展开后可看到完整证据解释。
- 中英双语行为一致。

验证命令：
- npm run test -- src/__tests__/bilingual-rendering.test.tsx -t "renders diagnose recommendation cards with language cues and original-title label"
- npm run test -- src/__tests__/diagnosis-matching.test.ts -t "summary focused on action|high-confidence actionable tone"
- npm run build

---

## 点 2：明确拒判机制
目标：证据不足时给稳定、可预期的拒判模板，明确缺失信息。

范围文件：
- src/types/diagnosis.ts
- src/lib/diagnosis.ts
- src/components/diagnose/DiagnoseResult.tsx
- src/__tests__/diagnosis-matching.test.ts

实现任务：
- 在诊断结果中增加拒判原因代码和缺失槽位列表（如 stroke/outcome/context）。
- low evidence 时使用统一拒判模板。
- 模板显示“为什么不能高置信判断 + 需要补哪条信息”。

验收标准：
- low evidence 不再只给泛化提示，必须给结构化缺失信息。
- 语气保持低置信，不出现技术断言。

验证命令：
- npm run test -- src/__tests__/diagnosis-matching.test.ts -t "low evidence|narrowing|refuse"
- npm run build

---

## 点 3：可回放诊断快照
目标：一次诊断可被完整重演，便于研究复盘与回归对齐。

范围文件：
- src/types/diagnosis.ts
- src/app/diagnose/page.tsx
- src/lib/study/localData.ts
- src/__tests__/app-smoke.test.tsx

实现任务：
- 保存诊断快照（输入摘要、ruleId、problemTag、evidenceLevel、primaryNextStep、effortMode、timestamp）。
- 支持读取最近快照用于“重演本次判断”。
- 仅新增本地恢复能力，不改 event 语义。

验收标准：
- 刷新后可恢复最近诊断快照并展示核心判断信息。
- 快照不含隐私敏感原文（保留长度/摘要）。

验证命令：
- npm run test -- src/__tests__/app-smoke.test.tsx -t "diagnose|resume|snapshot"
- npm run build

---

## 点 4：真实样本回归集
目标：把线上高频输入沉淀为固定回归用例，防止版本漂移。

范围文件：
- src/__tests__/diagnosis-regression-realphrases.test.ts
- src/lib/diagnosis.ts
- 可选：src/data/diagnosisRegressionCases.ts

实现任务：
- 建立样本集（按问题类别分组）。
- 每条样本锁定期望 problemTag、evidenceLevel 范围、primaryNextStep 非空。
- 标记高风险样本（关键分、月亮球、双打网前、年龄移动）。

验收标准：
- 新增回归测试可在升级前后稳定对比。
- 同类输入不出现大幅漂移。

验证命令：
- npm run test -- src/__tests__/diagnosis-regression-realphrases.test.ts
- npm run build

---

## 点 5：文案预算机制
目标：默认层文案长度受控，超预算自动折叠或截断。

范围文件：
- src/lib/diagnosis.ts
- src/components/diagnose/DiagnoseResult.tsx
- 可选：src/lib/i18n/dictionaries/zh.ts, src/lib/i18n/dictionaries/en.ts
- src/__tests__/diagnosis-matching.test.ts

实现任务：
- 定义默认层字符预算（按语言区分）。
- summary 超预算时使用短版模板，详细版放到展开层。
- 保持主动作永远完整可见。

验收标准：
- 默认页信息密度显著降低。
- 不影响关键动作可执行性。

验证命令：
- npm run test -- src/__tests__/diagnosis-matching.test.ts -t "summary|budget"
- npm run build

---

## 点 6：结果一致性约束
目标：quick/standard/deep 只改变深度，不改变主线判断。

范围文件：
- src/lib/diagnosis.ts
- src/__tests__/diagnosis-matching.test.ts

实现任务：
- 增加一致性断言：problemTag 一致、primaryNextStep 关键词一致。
- 深度差异仅体现在 causes/fixes/drills 数量和展示层级。
- 对 low evidence 模式增加防漂移保护。

验收标准：
- 同输入跨模式不出现方向跳变。
- 深入模式不因信息多而抬高置信口吻。

验证命令：
- npm run test -- src/__tests__/diagnosis-matching.test.ts -t "effort modes|stable|consistency"
- npm run build

---

## 点 7：失败可观测性分桶
目标：把失败从“知道失败了”升级为“知道为什么失败”。

范围文件：
- src/lib/eventLogger.ts
- src/lib/researchData.ts
- src/__tests__/study-events-client.test.ts
- 可选：src/__tests__/research-data.test.ts

实现任务：
- 对 flush 失败记录原因分桶（网络失败、服务端非 2xx、beacon 拒收）。
- 聚合输出失败分桶统计（不改变 event schema）。
- 保留本地诊断日志上限和滚动策略。

验收标准：
- 能快速定位主要失败类型。
- 不影响现有事件导出结构。

验证命令：
- npm run test -- src/__tests__/study-events-client.test.ts src/__tests__/research-data.test.ts -t "flush|fallback|bucket"
- npm run build

---

## 执行顺序
1. 点 1
2. 点 2
3. 点 3
4. 点 4
5. 点 5
6. 点 6
7. 点 7

每点完成后输出固定汇报：
1. 改了什么
2. 触及文件
3. 测试结果
4. 仍存风险
5. 下一点建议 effort

---

## 实施归档（2026-03-31）

### 已完成结果
- 点 1-7 全部完成并已进入 `main`。
- 完成后验证包含：
	- 目标诊断测试
	- flush 分桶相关测试
	- `npm run build`

### 关键落地参数
- 诊断默认 summary 预算：
	- `zh`: 86 字符
	- `en`: 180 字符
- quick 模式 summary 预算：
	- `zh`: 64 字符
	- `en`: 132 字符
- 主动作短模板预算：
	- `zh`: 28 字符
	- `en`: 60 字符
- flush 分桶原因：
	- `network_error`
	- `http_non_2xx`
	- `beacon_rejected`

### 导出与观测变化
- 本地导出新增：
	- `studyFlushFallbackLogs`
	- `studyFlushFallbackSummary`
- 保持约束：未修改 study event schema 与远端导出 shape。

### 主要文件（归档索引）
- 诊断预算与一致性：
	- `src/lib/diagnosis.ts`
	- `src/components/diagnose/DiagnoseResult.tsx`
	- `src/__tests__/diagnosis-matching.test.ts`
- 快照扩展：
	- `src/types/diagnosis.ts`
	- `src/app/diagnose/page.tsx`
- flush 分桶与聚合：
	- `src/lib/study/events.ts`
	- `src/lib/eventLogger.ts`
	- `src/lib/researchData.ts`
	- `src/app/admin/export/page.tsx`
