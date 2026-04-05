---
tags:
  - type/prompt
  - area/process
  - status/reference
---

# DAILY_PROGRESS_PROMPT

## Related docs
- [[index]]
- [[templates/daily-progress-template]]
- [[weekly/project-progress-summary]]
- [[progress/2026-04-01]]

## Obsidian linking rules
- 内部文档默认使用 folder-prefixed wiki links，例如 `[[roadmap/current]]`。
- 生成的 daily note 顶部应包含 `## Related docs`。
- daily note 至少链接：
  - [[index]]
  - [[roadmap/current]]
  - [[weekly/project-progress-summary]]
  - 一个最相关的 [[engineering/...]]、[[research/...]] 或 [[roadmap/...]] 文档

你现在在 `TENNIS_LEVEL` 仓库中工作。请自动整理“今天”的项目进展，并生成或更新当天的 daily progress 文档。

## 目标

请基于今天实际发生的代码、文档、配置、脚本、数据库、研究记录等变更，整理出一份高质量的当天进展记录，保存到：

`docs/progress/YYYY-MM-DD.md`

其中日期使用今天的本地日期。

## 核心要求

1. 只根据“今天真实发生的变更”来写，不要凭空脑补。
2. 如果今天没有任何有意义的实际进展，不要创建空文档，直接跳过。
3. 不要把机械性噪音写进进展，例如：
   - 纯格式化
   - 无意义重排
   - lockfile 轻微变动
   - 自动生成但没有业务价值的改动
4. 重点提炼“相对于之前，今天真实推进了什么”。
5. 输出要面向项目演进，而不是代码 diff 罗列。

## 请检查的范围

优先检查以下内容：

- `src/`
- `public/`
- `scripts/`
- `supabase/`
- `docs/`
- 根目录中的重要 Markdown 文档
- 与产品方向、研究、实验、数据结构、部署、诊断能力有关的文件

## 建议参考信息

请综合以下信号判断今天是否有有效进展：

- 今日 git diff
- 今日新增或修改文件
- 今日提交记录（如果可用）
- 今日文档更新
- 今日 SQL / schema 变化
- 今日功能实现或逻辑调整

自动化运行时，wrapper 会额外提供结构化上下文，通常包括：

- 当日 commit log
- 当前 working tree status
- 当天已有的 progress note（如果存在）
- 轻量验证输出（如果本次运行捕获到了）

## 跳过规则

如果今天满足以下任一情况，则不要生成 `docs/progress/YYYY-MM-DD.md`：

1. 没有任何文件变更
2. 只有格式化、注释微调、无意义重命名
3. 只有依赖安装或构建产物变化，没有项目层面的真实推进
4. 无法提炼出对产品、功能、研究、架构、流程有意义的变化

## 输出格式

请严格使用下面结构：

```md
# YYYY-MM-DD Progress

## 今日核心进展
- 
- 
- 

## 具体变化
### 产品/功能
- 

### 技术实现
- 

### 文档/研究
- 

## 与昨天相比的真实变化
- 

## 当前问题或风险
- 

## 下一步建议
- 
- 
```

## 写作要求

1. 语言简洁、具体、可追踪。
2. 优先写“结果”和“影响”，少写空泛过程描述。
3. 如果某部分没有内容，可以省略该小节，但不要编造。
4. 如果某项变化明显属于某个 feature / decision / issue，请在文中提到对应主题。
5. 如果今天的变化值得沉淀为长期文档，请顺手建议：
   - 更新哪个 `docs/features/*.md`
   - 新建哪个 `docs/decisions/*.md`
   - 更新哪个 `docs/issues/*.md`

## 额外动作

生成 daily progress 后，请再执行以下检查：

1. 如果今天出现新的关键产品决策，建议新建一条 decision 文档。
2. 如果今天明显推进了某个已有功能，建议更新对应 feature 文档。
3. 如果今天暴露了持续性问题，建议更新 issue 文档。
4. 只有在明确检测到文档结构问题时，才允许调用 `[[prompts/ORGANIZE]]`。
5. 可触发 `[[prompts/ORGANIZE]]` 的情况包括：
   - broken internal wiki links
   - stale references to deleted notes
   - dangling skill / prompt / template references
   - orphaned operational notes with no backlinks
6. 不要自动大范围改写无关文件，也不要因为“也许可以更整齐”而推测性整理文档。

最终目标：
这份 daily progress 必须能让人一眼看出“今天这个项目到底真实往前走了什么”。

---
