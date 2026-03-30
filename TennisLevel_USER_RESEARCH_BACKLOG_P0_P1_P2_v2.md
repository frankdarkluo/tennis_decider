# TennisLevel 当前阶段优化 Backlog（P0 / P1 / P2）v2
## 面向用户研究的 Codex 可执行方案
## 已纳入 Supabase 研究库迁移、参与者编号绑定、停留时间噪声处理
## 配合 `AGENTS.md`、`Efficiency.md` 与 `superpowers` 使用

> 用途：直接提供给 Codex 执行  
> 目标：在不扩张产品范围的前提下，把 TennisLevel 打磨成一个更适合 SportsHCI 用户研究的系统  
> 工作重点：**用户研究质量、可复现性、可分析性、轻量双语支持、任务链路清晰度、研究数据后端可落库**
> 当前默认前提：
> - `TennisLevel_ACTIONABILITY_AND_SORT_FREEZE_PLAN.md` 已经完整实现
> - `/video-diagnose` 暂时隐藏，不纳入本轮研究
> - 研究模式优先于产品化扩展
> - Codex 可使用 `AGENTS.md`、`Efficiency.md` 与 `superpowers`
> - 当前 Supabase **网络可达，但 schema 尚未完整迁移到 study-mode 所需结构**

---

# 一、关键现实问题（新增）

这版 backlog 额外纳入两个非常关键的现实问题：

## 1）Supabase 当前“能连通，但不能完整承接 study-mode 写入”
实测现状说明：

- 本机环境配置存在
- 网络可以连上 Supabase
- 但远端 Supabase schema 还没有迁移到位
- 因此 study-mode 后台写入目前不能完整成功

当前已知缺口包括：

- `study_sessions` 不存在
- `study_artifacts` 不存在
- `study_task_ratings` 不存在
- 现有 `event_logs` 缺少 study-mode 扩展字段（如 `build_version` 等）

这意味着：

> 不是本机没配好，也不是网络不通，而是**研究后端数据库结构还没准备好**。

所以在正式用户研究前，**Supabase 研究 schema 的迁移与验证** 必须升为 P0。

---

## 2）参与者研究数据必须以 participantId 为主绑定，不依赖邮箱
你的研究需求非常明确：

- 参与者研究数据应以 **参与者编号（participantId）** 为主键语义
- 同一 participantId 的后续研究数据应能持续绑定
- 暂时不希望依赖邮箱做研究身份主键
- 研究阶段要尽量简化，不要引入不必要的复杂身份系统

这个要求是合理且推荐的。  
对当前阶段的研究系统来说，**participantId + sessionId** 才是最合适的模型：

- `participantId`：跨 session 的研究编号
- `sessionId`：单次研究会话编号
- `email`：不作为研究主键，也不作为 participant 绑定的默认方式
- 如果管理员邮箱只出现在 SQL 中，那应仅用于管理员权限、RLS policy、导出权限，不应影响 participant 绑定逻辑

---

## 3）页面停留时间存在噪声，不能直接等同于“用户在认真使用”
你已经准确指出了 dwell time 的问题：

用户可能：
- 在某页开着不动，去做饭
- 接电话
- 切去 Netflix 或其他网页
- 浏览器标签页在后台停留很久
- 设备锁屏或窗口失焦

所以：

> 原始页面停留时间不能直接当成“有效研究使用时间”。

因此本轮研究里，dwell time 必须从“粗暴 page leave 时间差”升级成**更稳健的 active dwell / focused dwell 近似值**。

---

# 二、本阶段总目标

本阶段不要再大扩功能，而是围绕用户研究，把系统做到：

1. **研究后端真的可写入**
2. **研究身份绑定清楚**
3. **研究数据足够干净**
4. **任务链路足够顺**
5. **核心页面足够可理解**
6. **中英文测试时变量可控**
7. **输出结果足够支撑短论文写作**

换句话说，这一阶段不是“做更多功能”，而是让现有系统更适合回答以下研究问题：

- 用户如何从模糊问题开始？
- 用户在哪些页面停留更久？但哪些停留是真实有效停留？
- 用户是否真的走到下一步训练行动？
- recommendation / creator / plan 哪一层最有帮助？
- 用户是否理解“为什么是这个建议”？
- 中英文用户在核心流程中的行为是否可比较？
- 同一 participant 在多次研究中的数据是否可关联？

---

# 三、执行总原则

## 1）研究优先，不做大扩张
当前阶段 **不要优先做**：
- 社交功能
- 增长组件
- 重账号体系
- 更复杂推荐算法
- 视频诊断回归
- 新的大功能页

## 2）一切围绕“从问题到行动”的主链路
重点优化链路：

`首页 -> assessment/result 或 diagnose -> library / rankings -> plan -> profile`

## 3）研究身份模型固定为 participantId + sessionId
当前研究模式下：

- `participantId` 是研究参与者主标识
- `sessionId` 是单次实验会话标识
- 两者一起构成研究数据关联主轴

研究阶段默认不要求：
- 邮箱注册
- 账户绑定
- 复杂认证身份流

## 4）停留时间只作为近似指标，不作为唯一证据
研究分析中：
- dwell time 只能和点击、展开层级、任务完成状态结合使用
- 不可单独解释为“更有兴趣”或“更有帮助”

## 5）使用文档先行 + 单 PR 执行
Codex 执行时应：
- 先读仓库中的 `AGENTS.md`
- 再读 `Efficiency.md`
- 再读与当前 PR 相关的研究文档
- 先 plan
- 一次只做一个 PR
- 做完必须验证

---

# 四、P0（必须优先完成）

P0 的目标是：**让正式用户研究可以稳定开始。**

---

## P0.0 Supabase 研究 schema 迁移与真实写入验证

### 为什么这是 P0 中的 P0
如果远端 Supabase 还不能承接研究数据，那前端再完整也没法正式研究。

### 当前已知状态
真实写入验证显示：
- `study_sessions` 表不存在
- `study_artifacts` 表不存在
- `study_task_ratings` 表不存在
- `event_logs` 缺少 study-mode 扩展字段

### Codex 需要做什么
1. 检查以下 SQL 文件与当前代码的真实需求是否一致：
   - `supabase/research_infra.sql`
   - `supabase/study_mode.sql`

2. 明确列出：
   - 需要新增的表
   - 需要新增的列
   - 需要新增的 index
   - 需要新增或调整的 RLS policy
   - 需要管理员邮箱占位符的地方

3. 输出并校验最小研究 schema：
   - `study_participants`
   - `study_sessions`
   - `study_events` 或升级后的 `event_logs`
   - `study_task_ratings`
   - `study_surveys`
   - `study_artifacts`

4. 如果现有库已有旧表：
   - 明确是迁移、兼容、还是废弃
   - 不要含糊地同时保留两套不一致 schema

5. 在 schema 准备完成后，再跑一次真实写入验证（使用合成测试数据）

### 验收标准
- 远端 Supabase 可成功写入：
  - participant
  - session
  - event
  - task rating
  - survey / artifact（如适用）
- 不再出现 schema cache 缺表错误
- 研究相关写入链路完整可测
- 管理员邮箱仅用于管理权限，不参与 participant 绑定逻辑

### 推荐 reasoning effort
- **high**

---

## P0.1 参与者编号绑定模型落地（participant-first）

### 为什么这是 P0
如果研究数据绑定不清楚，后面导出分析会很乱。  
你已经明确希望：

> 同一参与者编号一旦一致，后续采集信息都应和这个编号绑定。

这是正确的研究建模方式。

### 推荐数据模型

#### `participantId`
- 由研究者提供或预生成
- 例如：`P001`、`P002`、`P013`
- 作为研究参与者的稳定标识

#### `sessionId`
- 每次开始新研究会话时自动生成
- 例如 UUID

#### 绑定关系
- 一个 `participantId` 可以对应多个 `sessionId`
- 所有研究数据都至少带：
  - `participantId`
  - `sessionId`

### Codex 需要做什么
1. 确认 `/study/start` 使用 participantId 进入研究
2. 不要求邮箱注册
3. `study_participants` 表以 `participant_id` 为主标识
4. 所有研究事件、单题、SUS、开放反馈、artifact 都写入 `participantId`
5. 若代码中有基于邮箱的默认研究绑定逻辑，移除或降级为管理员用途

### 不要做的事情
- 不要把 participant 的主键语义放到邮箱上
- 不要因为管理员邮箱出现在 SQL 中就误把研究身份绑到邮箱
- 不要让 participantId 随机变化而无法跨 session 关联

### 验收标准
- 同一个 `participantId` 多次开始研究，数据可在导出时汇总
- 不需要邮箱也能完成研究
- 管理员邮箱只用于后台权限，不影响 participant 数据模型

### 推荐 reasoning effort
- **high**

---

## P0.2 事件日志与研究导出做扎实

### 为什么这是 P0
你这轮研究最核心的数据不是“印象”，而是：
- 用户从哪个入口开始
- 哪些页面停留更久
- 哪些层级被展开
- 用户有没有真的点到内容 / 博主 / plan
- 用户是否完成任务

如果日志不稳，后面论文结果会很弱。

### 具体要做什么
1. 检查并补全当前核心链路的事件：
   - `page.view`
   - `page.leave`
   - `page.visibility_changed`
   - `home.entry_selected`
   - `assessment.started`
   - `assessment.completed`
   - `assessment_result.viewed`
   - `assessment_result.next_action_clicked`
   - `diagnose.submitted`
   - `diagnose.layer_opened`
   - `diagnose.recommended_content_clicked`
   - `library.viewed`
   - `content.outbound_clicked`
   - `rankings.viewed`
   - `creator.modal_viewed`
   - `plan.viewed`
   - `plan.generated`
   - `plan.saved`
   - `profile.viewed`
   - `task.actionability_submitted`
   - `sus.completed`
   - `study.open_feedback_submitted`
   - `session.completed`
   - `session.abandoned`

2. 确保每个事件都带上：
   - `participantId`
   - `sessionId`
   - `language`
   - `snapshotVersion`
   - `route`
   - `tsClient`

3. 导出脚本中补齐派生指标：
   - `first_entry_mode`
   - `longest_dwell_route`
   - `total_session_ms`
   - `active_dwell_ms_by_route`
   - `focused_dwell_ms_by_route`
   - `diagnose_max_layer_opened`
   - `content_click_count`
   - `creator_click_count`
   - `plan_generated`
   - `plan_saved`
   - `actionability_mean_by_task`
   - `sus_score`

### 验收标准
- 任意一名测试者从首页走到 plan 后，能导出完整行为链
- `page.view + page.leave` 可算 raw dwell
- 可额外导出 active/focused dwell 近似值
- actionability / SUS / open feedback 可和 session 对齐
- 导出文件可以直接用于论文分析

### 推荐 reasoning effort
- **high**

---

## P0.3 页面停留时间噪声处理（active / focused dwell）

### 为什么这是 P0
原始 dwell time 有明显噪声。  
如果不处理，你很难解释“停留时间长”到底代表：
- 用户认真看
- 用户卡住
- 用户去做别的事
- 用户切去其他网页

### 推荐策略
不要只保留一个 dwell time，而是区分三种：

#### 1. raw dwell
- `page.view` 到 `page.leave` 的总时间差

#### 2. focused dwell
仅当页面可见且窗口在前台时累计  
可通过：
- `document.visibilityState`
- `window.focus / blur`
- `visibilitychange`

#### 3. active dwell（可选）
在 focused 的基础上，只有在用户有行为时才累计，例如：
- 点击
- 输入
- 滚动
- 展开
- 键盘事件

### Codex 需要做什么
1. 为研究模式增加：
   - `page.visibility_changed`
   - `page.focus_changed`（可选）
   - `session.heartbeat`（可选，低频）

2. 在前端实现最小 focused time 统计：
   - 页面可见才累计
   - 页面隐藏或失焦时暂停累计

3. active dwell 可先做简化版本：
   - 最近 N 秒内有交互则记为 active
   - 超时后停止 active 计时

4. 导出时同时给出：
   - `raw_dwell_ms`
   - `focused_dwell_ms`
   - `active_dwell_ms`（如果已实现）

### 研究解释建议
论文里优先使用：
- focused dwell
- active dwell（若稳定）

raw dwell 作为补充，不要单独解释。

### 验收标准
- 用户切标签页后，不会把全部后台时间都计为 focused dwell
- 导出中能明显区分 raw 和 focused
- 研究分析不会被“做饭/接电话/看 Netflix”严重污染

### 推荐 reasoning effort
- **high**

---

## P0.4 主任务链路收紧一轮

### 为什么这是 P0
你现在不缺页面，缺的是“研究任务走起来够不够顺”。

如果用户：
- assessment 做完不知道下一步去哪
- diagnose 看完没有明显行动入口
- library / rankings 看完没有自然走向 plan
- profile 像历史列表而不是“继续练习”

那研究结果会偏弱。

### 具体要做什么
围绕这 3 个研究任务优化：

#### 任务 1：从模糊问题进入
首页 -> diagnose -> library / rankings -> plan

需要检查：
- 首页 CTA 是否足够明确
- diagnose 结果后是否有明显下一步
- library / rankings 到 plan 是否自然

#### 任务 2：从 assessment 进入
assessment -> assessment result -> diagnose 或 library -> plan

需要检查：
- result 页的 next action 是否足够明显
- assessment 结束后是否不容易迷路

#### 任务 3：回看 / 继续练习
plan -> save -> profile -> continue

需要检查：
- profile 是否能支持“继续上次练习”
- saved plan 是否可回看

### 优化重点
- 文案更直接
- CTA 更聚焦
- 中间少岔路
- 页面之间跳转更自然

### 验收标准
- 研究者不用额外口头解释，参与者也能完成 3 个任务
- 每个任务结束都能自然进入 actionability 单题
- 从首页到 plan 的路径明显且连续

### 推荐 reasoning effort
- **medium** 到 **high**
- 默认先用 **medium**

---

## P0.5 “为什么推荐这个”的轻解释层

### 为什么这是 P0
用户研究里，光看用户点没点是不够的。  
你还需要知道他们**是否理解系统推荐的依据**。

这件事对：
- 用户信任
- qualitative insight
- 论文结果解释

都很关键。

### 具体要做什么
在以下位置增加轻解释：

#### Diagnose
对：
- immediate fix
- 推荐内容
- 推荐博主

加一行短解释，例如：
- 因为你的问题更像“反手下网”
- 因为这条内容更适合基础动作修正
- 因为这个博主更偏基础拆解

#### Library
内容卡片或详情中可显示：
- Why this content
- 与当前 problemTag 的关系

#### Rankings
creator modal 中可显示：
- 适合人群
- 讲解风格
- 为什么可能适合当前阶段

### 事件日志
新增：
- `diagnose.why_this_viewed`
- `library.why_this_viewed`（可选）
- `creator.why_this_viewed`（可选）

### 验收标准
- 推荐逻辑不再像“黑盒”
- 用户可以更容易解释自己为什么点了某个内容或博主
- 开放式反馈里更容易出现 trust-related insight

### 推荐 reasoning effort
- **medium**

---

# 五、P1（强烈建议完成）

P1 的目标是：**提升研究质量与中英双语测试的一致性。**

---

## P1.1 核心研究流程双语一致性

### 为什么是 P1
如果你要招中英两组用户，语言会直接影响：
- 首页理解
- assessment 答题
- diagnose 解释
- CTA 点击
- library 内容扫描

所以核心研究流程必须保证中英文尽量对齐。

### 范围
先只覆盖研究会用到的页面：
- `/`
- `/study/start`
- `/assessment`
- `/assessment/result`
- `/diagnose`
- `/library`
- `/rankings`
- `/plan`
- `/profile`
- `/study/end`

### 具体要做什么
1. 统一 i18n key
2. study mode 下锁定语言
3. 避免 session 中途切换语言
4. CTA 和 actionability 单题中英语义对齐

### 验收标准
- 中英用户完成相同任务时，流程结构一致
- actionability 单题和 SUS 可以按 language 分析
- 不出现一边有解释、一边没有解释的情况

### 推荐 reasoning effort
- **medium**

---

## P1.2 Library / Rankings 的语言标签与可理解性补齐

### 为什么是 P1
你现在是跨平台内容系统。  
如果英文参与者会看到 Bilibili 内容，那么：
- 不能只给中文标题
- 也不能粗暴隐藏全部 Bilibili 内容

### 具体要做什么
内容卡片补齐以下字段与显示逻辑：

- `originalTitle`
- `displayTitleZh`
- `displayTitleEn`
- `contentLanguage`
- `subtitleAvailability`

### 英文模式下建议显示
- 主标题：英文 gloss
- 副标题：原标题
- 标签：平台 + 语言 + 字幕状态

例如：
- `Bilibili · ZH · EN subtitles`
- `YouTube · EN`

### 同时保留 filter
- `content_language`
- `subtitle_availability`

### 验收标准
- 英文用户可以快速判断内容是否值得点开
- source fidelity 仍保留
- 中英用户都能理解平台与语言属性

### 推荐 reasoning effort
- **medium**

---

## P1.3 Profile 做成“继续练习”入口

### 为什么是 P1
Profile 现在最值得强化的不是“历史列表”，而是：
- 继续上次练习
- 回到 saved plan
- 查看上次 diagnosis

这会让研究任务 3 更自然，也更有产品潜力。

### 具体要做什么
在 profile 顶部增加明显入口：
- Continue last practice
- Resume saved plan
- Revisit last diagnosis

### 验收标准
- 任务 3 可以自然从 profile 完成
- profile 的研究意义更清楚
- 用户更容易理解 continuity of practice

### 推荐 reasoning effort
- **medium**

---

# 六、P2（有余力再做）

P2 的目标是：**锦上添花，提高论文质感，但不是本轮研究开跑的前提。**

---

## P2.1 研究结果页的小型 researcher overlay（仅开发/研究模式可见）

### 用途
给研究者快速查看：
- 当前 participantId
- 当前 taskId
- 当前 language
- 当前 snapshotVersion
- 是否已经提交 actionability
- 是否完成 SUS

### 验收标准
- 不暴露给普通用户
- 能帮助研究现场快速确认状态

### 推荐 reasoning effort
- **medium**

---

## P2.2 开放式反馈结构化导出优化

### 具体要做什么
把 open feedback 导出时补充：
- `question_id`
- `answer_length`
- `task_context`
- `language`

这样你后面做 thematic coding 会更方便。

### 推荐 reasoning effort
- **low** 到 **medium**

---

## P2.3 研究文档自动同步检查

### 用途
防止：
- `AGENTS.md`
- `Efficiency.md`
- 当前研究 md
之间出现不一致

### 具体要做什么
加一个脚本或 checklist：
- 检查高优先级 docs 是否存在
- 检查 env.example 是否更新
- 检查 snapshotVersion 是否一致

### 推荐 reasoning effort
- **low**

---

# 七、Codex 的执行顺序建议（结合 superpowers）

建议按以下 PR 顺序推进。

---

## PR0（P0.0 + P0.1）
### 主题：Supabase 研究 schema + participantId 绑定模型

使用：
- `writing-plans`
- `executing-plans`
- `verification-before-completion`
- `systematic-debugging`
- `requesting-code-review`

范围：
- 对齐 SQL 与代码需求
- 迁移远端研究 schema
- participant-first 数据模型
- 合成数据真实写入验证

完成标准：
- Supabase 可完整承接 study-mode 数据
- participantId 成为研究主绑定标识
- 管理员邮箱仅用于管理权限

推荐 effort：
- **high**

---

## PR1（P0.2 + P0.3）
### 主题：研究日志、导出与 dwell 噪声控制

使用：
- `writing-plans`
- `executing-plans`
- `test-driven-development`
- `verification-before-completion`

范围：
- 核心事件补齐
- active/focused dwell
- 导出派生指标补齐
- session / task / actionability / SUS 对齐

完成标准：
- 行为链可完整导出
- dwell 数据更稳健
- 可直接用于研究分析

推荐 effort：
- **high**

---

## PR2（P0.4）
### 主题：主任务链路收紧

使用：
- `writing-plans`
- `executing-plans`
- `verification-before-completion`

范围：
- 首页 CTA 与任务入口
- assessment result 的 next action
- diagnose 到 library/rankings/plan 的衔接
- profile 到 continue flow 的初步打通

完成标准：
- 3 个研究任务都能自然完成

推荐 effort：
- **medium**

---

## PR3（P0.5）
### 主题：为什么推荐这个

使用：
- `executing-plans`
- `requesting-code-review`
- `verification-before-completion`

范围：
- diagnose 推荐解释
- library 内容解释
- rankings / creator 解释（轻量）
- 对应事件

完成标准：
- 推荐依据可被用户理解
- qualitative insight 更容易出现

推荐 effort：
- **medium**

---

## PR4（P1.1）
### 主题：核心研究流程双语一致性

使用：
- `executing-plans`
- `test-driven-development`
- `verification-before-completion`

范围：
- 核心研究页 zh/en 对齐
- study mode language lock
- actionability / SUS 语言一致性

完成标准：
- 中英参与者任务流程一致

推荐 effort：
- **medium**

---

## PR5（P1.2）
### 主题：内容卡片语言标签与双语显示

使用：
- `executing-plans`
- `verification-before-completion`

范围：
- displayTitleEn / originalTitle
- language + subtitle badge
- content filters

完成标准：
- 英文用户能更容易判断内容

推荐 effort：
- **medium**

---

## PR6（P1.3）
### 主题：Profile 继续练习入口

使用：
- `executing-plans`
- `verification-before-completion`

范围：
- continue last practice
- saved plan 回看
- last diagnosis revisit

完成标准：
- 任务 3 更顺畅
- profile 更有研究价值

推荐 effort：
- **medium**

---

## PR7（P2 全部）
### 主题：研究辅助与 polish

使用：
- `executing-plans`
- `finishing-a-development-branch`
- `verification-before-completion`

范围：
- researcher overlay
- open feedback 导出增强
- 文档/环境一致性检查

完成标准：
- 研究执行更稳，论文写作更轻松

推荐 effort：
- **low** 到 **medium**

---

# 八、可直接发给 Codex 的执行说明

```text
We are entering the current optimization phase for TennisLevel, focused on user research quality rather than product expansion.

Use the repository docs and AGENTS.md as source of truth.
Also follow Efficiency.md and available superpowers.

Current focus:
- Supabase study schema readiness
- participantId-first research data binding
- event logging completeness
- dwell-time noise reduction
- stronger task flow
- light explanation of recommendations
- bilingual consistency for core study flow
- profile as a continue-practice surface

Do not prioritize:
- product growth features
- social features
- complex auth expansion
- video diagnose
- major new feature pages

Implement the backlog in priority order:

P0:
0. Supabase schema migration + real write validation
1. participantId-first research binding model
2. event logging + export hardening
3. focused/active dwell-time handling
4. task flow tightening
5. lightweight "why this recommendation" layer

P1:
6. bilingual consistency in core study flow
7. language / subtitle clarity in library and rankings
8. profile as a continue-practice entry point

P2:
9. researcher overlay
10. better open feedback export
11. doc/env consistency checks

Workflow:
1. use writing-plans first
2. break work into PR-sized units
3. execute one PR at a time
4. use test-driven-development where appropriate
5. use verification-before-completion before marking a PR done
6. request code review after major PRs
7. keep outputs concise

Important data-model rule:
- participantId is the primary research identity
- sessionId is the per-study-session identity
- do not bind research data primarily to email
- admin email may exist only for permissions / RLS / export control

Important dwell-time rule:
- raw dwell is not enough
- prefer focused dwell and active dwell for research export
- visibility and focus changes must be accounted for

First task:
Read AGENTS.md and the active research markdown docs, then produce a phased execution plan for this backlog only.
Do not implement yet.
```

---

# 九、研究前最终检查清单

在正式招募用户前，至少确认：

- [ ] study mode 可稳定进入
- [ ] participantId-first 模型生效
- [ ] 不需要邮箱也能完成研究
- [ ] Supabase schema 已迁移到位
- [ ] 合成数据真实写入验证通过
- [ ] language lock 生效
- [ ] event logging 可完整导出
- [ ] actionability 单题已接好
- [ ] SUS 可提交并导出
- [ ] open feedback 可记录
- [ ] library / rankings 排序已冻结
- [ ] raw / focused dwell 可区分
- [ ] 主任务链路能走通
- [ ] profile 至少能回看与继续
- [ ] 推荐理由可以被看见
- [ ] 不记录原始敏感数据
- [ ] `/video-diagnose` 已隐藏

---

# 十、结论

这份 backlog v2 的核心逻辑是：

**先把研究后端、研究身份、研究数据质量做扎实，再考虑更远的产品扩展。**

如果只看当前阶段，最该做的不是更多功能，而是：
1. Supabase 真正能承接研究数据
2. participantId 绑定模型明确
3. dwell time 噪声得到控制
4. 行为数据更完整
5. 任务路径更顺
6. 推荐依据更可理解
7. 中英用户测试更可控

这样你后面不管是：
- 跑用户研究
- 写 SportsHCI 短论文
- 继续往产品化推进

都会更稳。
