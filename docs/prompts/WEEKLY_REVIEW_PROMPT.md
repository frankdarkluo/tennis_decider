---
tags:
  - type/prompt
  - area/process
  - status/reference
---

# WEEKLY_REVIEW_PROMPT

## Related docs
- [[index]]
- [[templates/weekly-review-template]]
- [[weekly/project-progress-summary]]
- [[progress/2026-04-01]]

## Obsidian linking rules
- 周报使用 folder-prefixed wiki links，例如 `[[weekly/project-progress-summary]]`。
- 生成的 weekly review 顶部应包含 `## Related docs`。
- weekly review 至少链接：
  - [[index]]
  - [[roadmap/current]]
  - [[weekly/project-progress-summary]]
  - 本周汇总到的 `[[progress/...]]` 日报

你现在在 `TENNIS_LEVEL` 仓库中工作。请基于本周所有 daily progress，生成一份周总结。

## 目标

读取：

- `docs/progress/` 中本周的全部日记录

输出到：

- `docs/weekly/YYYY-Www.md`

其中 `YYYY-Www` 使用本周周数，例如 `2026-W14.md`。

自动化运行时，wrapper 会额外提供结构化上下文，通常包括：

- 本周 commit log
- 当前 working tree status
- 本周 daily progress 原文
- 轻量验证输出（如果本次运行捕获到了）

## 输出结构

```md
# YYYY-Www Weekly Review

## 本周最重要的进展
- 
- 
- 

## 功能推进
- 

## 关键决策
- 

## 暴露的问题 / 风险
- 

## 本周形成的结论
- 

## 下周建议重点
- 
- 
```

## 要求

1. 只基于已有 progress 内容总结，不要虚构。
2. 优先提炼“本周方向真的发生了什么变化”。
3. 如果只是重复性推进，要压缩表达，不要堆砌。
4. 如果本周出现值得长期保留的结论，建议同步更新 feature / decision / issue 文档。
5. 只有在明确检测到文档结构问题时，才允许调用 `[[prompts/ORGANIZE]]`。

---
