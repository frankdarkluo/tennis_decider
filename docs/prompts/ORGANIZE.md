# ORGANIZE

你现在在 `TENNIS_LEVEL` 仓库中工作。请把当前仓库中的项目文档整理成一个适合 Obsidian + VS Code + AI 协同的结构，但不要误伤代码文件。

## 目标

建立稳定的知识文档结构，使项目进展、功能专题、决策、问题、路线图能够持续沉淀。

## 你要做的事情

### 1. 创建以下目录（如果不存在）

```text
docs/progress/
docs/weekly/
docs/decisions/
docs/features/
docs/issues/
docs/roadmap/
docs/research/
docs/templates/
docs/prompts/
```

### 2. 创建以下基础文件（如果不存在）

- `docs/index.md`
- `docs/templates/daily-progress-template.md`
- `docs/templates/weekly-review-template.md`
- `docs/templates/decision-template.md`
- `docs/prompts/DAILY_PROGRESS_PROMPT.md`
- `docs/prompts/ORGANIZE.md`
- `docs/prompts/WEEKLY_REVIEW_PROMPT.md`

### 3. 迁移现有文档

按内容语义做迁移，不要机械移动：

- `docs_local/` 中的研究/快照/迁移类文档 → `docs/research/`
- 功能说明类文档 → `docs/features/`
- 项目阶段总结类文档 → `docs/weekly/` 或合并进 `docs/index.md`
- 根目录中散落的说明文档 → 根据内容归档到合适目录

### 4. 文件命名规范化

统一使用：

- 小写
- 单词之间用连字符 `-`
- 日期文件使用 `YYYY-MM-DD.md`
- decision 文件使用 `DEC-xxx-name.md`

### 5. 生成 `docs/index.md`

`docs/index.md` 应该包含：

- 项目简介
- 当前重点
- 最近 progress 列表
- features 入口
- decisions 入口
- issues 入口
- roadmap 入口

### 6. 不要碰这些内容

以下目录和文件不要因为“整理文档”被大范围改写：

- `src/`
- `public/`
- `scripts/`
- `supabase/`
- 配置文件
- 依赖文件
- 构建产物

除非只是为了在文档中引用它们。

## 产出要求

1. 优先保证结构清晰，而不是一步到位完美。
2. 保留原始信息，不要因为重组而丢内容。
3. 如果某个文件难以判断归属，优先放到 `docs/research/`。
4. 所有新建文档都用 Markdown。
5. 尽量减少无意义改名，避免破坏已有引用。

最终目标：
让 `docs/` 成为这个项目真正的知识入口和项目记忆系统。

---

