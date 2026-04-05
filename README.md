# TennisLevel

TennisLevel 是一个面向业余网球用户的训练决策原型。它不是内容平台，而是一个先收窄问题、再给出单一下一步动作与训练计划的 routing layer。

当前仓库以 study-ready 研究执行为中心，重点是：
- 先判断，再推荐
- 一次只给一个主动作
- 输出必须可执行，而不是像“更会说话的内容列表”

## 当前研究范围

- `assessment`：快速水平评估
- `diagnose`：一句话问题诊断
- `plan`：7 天训练计划
- study mode：事件日志、任务评分、导出与研究者支持
- `/library` 与 `/rankings`：研究阶段使用冻结排序
- 中英双语界面

`/video-diagnose` 当前不在本轮研究范围内。

## 当前数据规模（2026-04-01）

- 诊断规则：29 条
- 静态内容：39 条
- 扩展内容：1036 条
- 总内容：1075 条
- 博主 / 频道：58 位
- 训练计划模板：25 套

以上数据可通过 `npm run validate:data` 复核。

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

## Study Mode 要点

- study mode 由 active session 驱动，不因部署自动开启
- post-task actionability 使用 7 点量表
- 研究阶段保留冻结排序与确定性 surfacing 约束
- 远端研究环境、snapshot 与 facilitator 流程详见 `docs/research/`

## 文档入口

- `docs/index.md` — 知识图谱总入口
- `docs/product/principles.md` — 产品定位与核心原则
- `docs/product/boundaries.md` — Agent 操作边界与禁区
- `docs/roadmap/current.md` — 当前冲刺状态
- `docs/research/study-mode.md` — 研究模式说明

文档结构说明见 `docs/README.md`。

## 仓库结构

- `src/app`：页面与路由
- `src/components`：业务组件与 UI
- `src/data`：规则、内容、创作者与研究数据
- `src/lib`：评估、诊断、计划、研究日志与导出逻辑
- `scripts`：数据校验、归一化与自动化脚本
- `supabase`：SQL 初始化脚本
