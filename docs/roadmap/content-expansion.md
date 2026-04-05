---
aliases:
  - Content Expansion 1000
tags:
  - type/roadmap
  - area/content
  - status/active
---

# 内容库扩充至1000条方案

> **文档状态**：草稿 v2
> **最后更新**：2026-04-01
> **所属里程碑**：P2.3 研究执行闭环
> **关联文档**：[[roadmap/current]] · [[roadmap/requirements]] · [[index]] · [[features/youtube-platform-spec]]

---

## 关联文档
- [[index]]
- [[roadmap/current]]
- [[roadmap/requirements]]
- [[research/study-mode]]
- [[features/youtube-platform-spec]]
- [[definition-of-done]]

## 一、现状与目标

### 1.1 现有库规模

| 维度 | 数量 |
|------|------|
| 视频条数 | ~35 条 |
| 博主/频道数 | 14 个（全部B站） |
| YouTube 频道 | 0 个（3条内容无专属频道） |
| 战术类视频 | <5 条（最大盲区） |
| 心理/体能类 | 0 条 |

### 1.2 目标

**总量：1000 条视频**，双语平台并重：

| 平台 | 目标条数 | 占比 |
|------|---------|------|
| B站（中文） | ~600 条 | 60% |
| YouTube（英文） | ~400 条 | 40% |

> **平台策略说明**：YouTube 不是补充，而是系统的第二主干。英文区在战术深度、体能科学、专项技术上具有中文区无法替代的内容优势，且对 3.5+ 进阶用户覆盖更完整。

---

## 二、⚠️ 博主真实性验证规则（强制）

**上一版方案中列出的以下中文博主经用户实测 B站搜索后确认不存在，已全部移除**：
- ~~上旋-知轩~~、~~威威网球~~、~~殷教练网球~~、~~易老师体育~~、~~不古网球~~

**唯一例外**：`public/avatars/bilibili/` 目录中存在头像文件并不能证明账号有效——头像可能来自早期调研草稿。**头像文件存在 ≠ B站账号真实存在**。

### 博主入库前的三步验证

```
步骤1：打开 B站/YouTube，搜索账号名，确认页面存在且有视频
步骤2：查看最近更新时间（超过2年未更新的标注为 inactive）
步骤3：找到至少1条具体视频的真实ID（BV号或YouTube video ID）再写入代码
```

> **绝对禁止**：将 `bilibiliSearchUrl()` 用于新增博主。新博主必须有真实 BV 号才能入库。

---

## 三、已确认存在的博主（可立即入库）

以下博主均通过人工核查或已有真实 BV 号记录：

### 3.1 B站现有14个（基准）

盖奥网球、莫拉托格鲁、付饶、RacketBrothers、是沛恩呀、LeonTV、青蛙王子James、六六网球、打网球的皮卡邱、松尾友贵、奥斯汀冬令营、叶修鸽哥、Sara爱热汗、布雷登网球学院

### 3.2 B站新增候选（需你逐一核查后确认）

下表为候选，**你核查通过后才能进入下一章的分批计划**：

| 候选名称 | B站搜索关键词 | 预期内容方向 | 核查状态 |
|---------|------------|------------|--------|
| 王东网球 | `王东网球` | 战术分析、比赛拆解 | ⬜ 待核查 |
| MT网球课堂 | `MT网球课堂` | 业余赛前战术策略 | ⬜ 待核查 |
| 情影网球 | `情影网球` | 体能、核心力量 | ⬜ 待核查 |
| 杨小涵 | `杨小涵 网球` | 运动心理、赛前准备 | ⬜ 待核查 |

> avatars 目录中确实有这几个头像文件，但仍需确认账号当前状态。

---

## 四、YouTube 频道计划（与B站并列优先）

### 4.1 核心频道（优先级 P0）

这三个频道已被业界广泛认可，内容质量有保证：

| 频道名 | YouTube 搜索 | 内容方向 | 适合人群 |
|--------|------------|---------|--------|
| Top Tennis Training | `Top Tennis Training` | 技术拆解、慢动作分析 | 2.0–4.0 全段位 |
| Tactical Tennis | `Tactical Tennis` | 战术思维、比赛策略 | 3.0–4.5 |
| Essential Tennis | `Essential Tennis` | 基础技术系统化 | 1.5–3.5 |

### 4.2 进阶频道（优先级 P1）

| 频道名 | YouTube 搜索 | 内容方向 | 适合人群 |
|--------|------------|---------|--------|
| FYB Tennis | `FYB Tennis` | 发球专项、旋转控制 | 3.0–5.0 |
| Tennis Fitness | `Tennis Fitness` | 体能训练、移动步法 | 全段位 |
| Intuitive Tennis | `Intuitive Tennis` | 技术细节、对比分析 | 2.5–4.0 |
| Jeff Salzenstein Tennis | `Jeff Salzenstein Tennis` | 技术深度、职业技巧 | 3.5–5.0 |

### 4.3 专项频道（优先级 P2）

| 频道名 | 方向 | 说明 |
|--------|------|------|
| The Art of Doubles | 双打体系 | 英文区双打内容最完整 |
| High Performance Tennis | 竞技备战 | 4.0+ 进阶用户差异化 |
| Tennis Abstract | 数据分析 | 极小众但高价值 |

### 4.4 YouTube 视频的技术处理规范

```typescript
// 正确方式
{
  platform: 'youtube',
  videoId: 'dQw4w9WgXcQ',          // YouTube video ID（11位）
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
}

// 禁止方式
{
  url: 'https://www.youtube.com/results?search_query=...'  // 搜索链接，不是视频链接
}
```

**YouTube 缩略图规则**：统一使用 `maxresdefault.jpg`，fallback 到 `hqdefault.jpg`，不依赖外部服务。

**YouTube 专属验收项**（在B站三项验收基础上新增）：
- [ ] video ID 为11位字母数字组合，非播放列表链接
- [ ] 缩略图 URL 可访问（`maxresdefault` 或 `hqdefault`）
- [ ] `platform` 字段明确标注为 `'youtube'`
- [ ] creator 记录中 `platform` 字段同步为 `'youtube'`

---

## 五、内容分类体系

当前诊断系统覆盖的技能点与内容库的映射关系，决定了扩充优先级：

| 内容类别 | 当前库条数 | 目标条数 | 优先级 | 主要补充来源 |
|---------|----------|---------|--------|------------|
| 技术动作（正反手/发球/截击） | ~30 | 200 | P1 | B站现有博主深挖 |
| **战术体系** | <5 | **200** | **P0** | Tactical Tennis + 王东网球 |
| 脚步/移动 | ~3 | 80 | P1 | Tennis Fitness + B站 |
| **心理/比赛执行** | 0 | **100** | **P0** | 杨小涵 + Essential Tennis |
| **体能/热身** | 0 | **80** | **P0** | Tennis Fitness + 情影网球 |
| 双打体系 | 0 | 100 | P1 | The Art of Doubles + B站 |
| 线路/落点控制 | <3 | 80 | P1 | FYB Tennis + Tactical Tennis |
| 进阶4.0+ | <5 | 100 | P1 | Jeff Salzenstein + Top Tennis |
| 青少年/初学者 | ~5 | 60 | P2 | Essential Tennis |

---

## 六、分批执行计划

### 第一批：约100条（前提：博主核查完成）

**B站部分（~50条）**：
- 王东网球：战术分析系列 20 条（核查通过后）
- MT网球课堂：策略系列 15 条
- 情影网球：体能系列 15 条

**YouTube 部分（~50条）**：
- Top Tennis Training：技术系列 20 条
- Tactical Tennis：战术系列 20 条
- Essential Tennis：基础系列 10 条

**验收标准（每条视频）**：
1. 内容真实性：链接可访问，视频确实存在
2. 技术正确性：内容方向与 `category`/`tags` 字段匹配
3. 代码简洁性：BV号或YouTube ID格式统一，无冗余字段

### 第二批：约200条（第一批完成后）

- B站候选博主杨小涵等完成核查入库
- YouTube P1 频道（FYB Tennis、Intuitive Tennis、Tennis Fitness）
- 开始覆盖心理和体能两个 P0 空白类别

### 第三批：约300条

- YouTube P2 专项频道（双打、竞技）
- B站进一步挖掘长尾内容
- 线路落点、进阶4.0+ 专项补充

### 第四批：约365条（冲刺1000）

- 小众专项：轮椅网球、沙地网球（英文为主）
- 青少年发展体系（中英文均有优质内容）
- 历史经典比赛解析（YouTube 存量丰富）

---

## 七、docs/ 知识图谱

> 本章的目的是建立 docs/ 内各文档的强引用关系，避免知识孤岛。

### 7.1 节点清单（当前已知文档）

**核心导航节点**

- [[index]] <- 全库入口，所有文档应能从这里找到
- [[product-principles]] <- 产品身份与反漂移约束
- [[boundaries]] <- 明确 out-of-scope 边界
- [[definition-of-done]] <- 验收标准定义

**路线图节点**

- [[roadmap/requirements]] <- P1-P4 功能需求全集（最重要的单文件）
- [[roadmap/current]] <- 当前冲刺状态（应每日维护）
- [[roadmap/content-expansion-1000]] <- 本文档
- [[roadmap/codex-7-point-execution-2026-03-31]]
- [[roadmap/routing-first-3-step-execution-2026-03-31]]

**研究节点**

- [[research/study-mode]]
- [[research/study-remote-migration-checklist]]
- [[research/study-snapshot-note]]
- [[research/study-facilitator-checklist]]

**进度节点**

- [[progress/2026-03-30]]
- [[progress/2026-03-31]]
- [[weekly/project-progress-summary]]
- [[weekly/2026-W14]]

**功能节点**

- [[features/diagnosis-study-observability]]
- [[features/youtube-platform-spec]] <- 已建

**提示词节点**

- [[prompts/ORGANIZE]]
- [[prompts/DAILY_PROGRESS_PROMPT]]
- [[prompts/WEEKLY_REVIEW_PROMPT]]

### 7.2 引用关系图

```
index.md
+-- product-principles.md       [身份约束]
+-- boundaries.md               [边界约束]
+-- definition-of-done.md       [验收标准]
+-- roadmap/requirements.md     [需求全集]
|   +-- roadmap/current.md      [当前冲刺]
|       +-- roadmap/content-expansion-1000.md   [本文档]
|       +-- roadmap/codex-7-point-execution      [执行计划]
|       +-- roadmap/routing-first-3-step         [执行计划]
+-- research/study-mode.md      [研究主文档]
|   +-- research/study-remote-migration-checklist.md
|   +-- research/study-snapshot-note.md
|   +-- research/study-facilitator-checklist.md
+-- features/diagnosis-study-observability.md
+-- features/youtube-platform-spec.md   [已建]
+-- progress/ & weekly/         [进度日志，只写不引用]
```

### 7.3 当前知识图谱的缺口（进度同步）

| 缺口描述 | 建议补充文档 | 优先级 |
|---------|------------|--------|
| 内容库扩充计划在 [[index]] 中无入口 | 在 [[index]] 的 `Roadmap Entrypoints` 下追加本文档链接（已完成） | 高 |
| [[boundaries]] 未被 roadmap 文档引用 | 在 [[roadmap/requirements]] 顶部加引用（已完成） | 高 |
| YouTube 平台处理规范无文档 | 新建 [[features/youtube-platform-spec]]（已完成） | 中 |
| [[definition-of-done]] 验收标准与本方案未同步 | 将第六章三项验收标准同步写入 DoD（已完成） | 中 |
| skills/ 和 templates/ 目录为空 | 待 P2.3 后补充 | 低 |

### 7.4 index.md 需要追加的引用（可直接提交）

在 [[index]] 的 `## Roadmap Entrypoints` 章节追加：

- [[roadmap/content-expansion-1000]] — 内容库扩充至1000条执行方案

在 `## Feature Entrypoints` 章节确保包含：

- [[features/youtube-platform-spec]] — YouTube平台技术处理规范（已建）

---

## 八、验收 Checklist（整体）

### 博主核查完成标志
- [ ] 第三章候选表中所有 ⬜ 已变为 ✅（已核查存在）或 ❌（确认不存在）
- [ ] 所有 ✅ 博主有至少1个真实BV号记录在案

### YouTube 频道入库完成标志
- [ ] Top Tennis Training、Tactical Tennis、Essential Tennis 各有 ≥10 条视频入库
- [ ] 所有 YouTube 视频通过第四章专属验收项
- [ ] `thumbnail.ts` 中 YouTube 缩略图逻辑已覆盖 fallback

### docs 知识图谱完成标志
- [x] `index.md` 已包含本文档链接
- [x] `boundaries.md` 已被至少一个 roadmap 文档引用
- [x] 第七章缺口表中高优先级项全部处理完毕

---

*本文档落地路径：[[roadmap/content-expansion-1000]]*
*下一个关联里程碑：P2.3 研究执行闭环*
