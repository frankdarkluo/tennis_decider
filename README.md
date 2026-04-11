# TennisLevel

TennisLevel 是一个面向业余网球用户的训练决策原型。它不是内容平台，而是一个先收窄问题、再给出单一下一步动作与训练计划的 routing layer。

当前 `app-development` 分支已经收口到一条更清晰的主链：
- `assessment`：10 个打分题 + 2 个轻量 profile 题，输出 `PlayerProfileVector`
- `diagnose`：`standard` / `deep` 双深度诊断
- `plan`：基于 blueprint engine 的 7 天训练计划
- `recommendations`：direct-source 优先、理由显式、缩略图回退稳定

## 当前研究范围

- `assessment`
- `diagnose`
- `plan`
- study mode：事件日志、任务评分、导出与研究者支持
- `/library` 与 `/rankings`：研究阶段使用冻结排序
- 中英双语界面

`/video-diagnose` 当前不在本轮研究范围内，并且已在 route / API 层明确关闭。

## 当前实现重点

- 先判断，再推荐
- 一次只给一个主动作
- 输出必须可执行，而不是像“更会说话的内容列表”
- 训练计划围绕 goal、drill、load、execution focus、success criteria 组织
- 长尾技能域已补到更接近 first-class coverage：
  - net / volley
  - half-volley
  - overhead
  - slice
  - doubles
  - tactics / point construction
  - pressure / match handling
  - on-the-run / movement context

## 技术栈

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Vitest + Testing Library
- Supabase（认证与研究数据）

## 快速开始

```bash
npm install
cp .env.example .env.local
npm run dev
```

默认开发地址：`http://localhost:3000`

最低必需环境变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 常用命令

- `npm run dev`
- `npm run build`
- `npm run test`
- `npm run validate:data`
- `npm run validate:data:strict`
- `npm run validate:study-docs`
- `npm run validate:study-remote`
- `npm run normalize:tags`
- `npm run normalize:tags:apply`

## Verification note

- `npm test` 与 `npm run build` 是当前稳定的本地验证入口
- `npm run lint` 仍会被仓库里的 Next ESLint 初始化交互卡住；这是当前 repo-level tooling 限制，不是某一条功能线特有的问题

## 文档入口

- `docs/index.md` — 知识图谱总入口
- `docs/README.md` — 文档结构与放置规则
- `docs/product/requirements.md` — 产品目标与范围
- `docs/product/boundaries.md` — Agent 操作边界与禁区
- `docs/product/definition-of-done.md` — 完成标准
- `docs/roadmap/current.md` — 当前分支现实状态与下一步重点
- `docs/research/study-mode.md` — 研究模式说明
- `docs/progress/2026-04-10.md`
- `docs/progress/2026-04-11.md`

## 仓库结构

- `src/app`：页面与路由
- `src/components`：业务组件与 UI
- `src/data`：规则、内容、创作者与研究数据
- `src/lib`：评估、诊断、计划、缩略图、研究日志与导出逻辑
- `scripts`：数据校验、归一化与自动化脚本
- `supabase`：SQL 初始化脚本
