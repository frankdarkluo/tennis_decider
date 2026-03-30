<p align="center">
  <img src="public/brand/tennislevel-logo-vertical-white.jpg" width="175" alt="TennisLevel logo on white background" />
</p>

<p align="center">
  为业余网球用户提供更清晰的下一步训练决策。
</p>

<p align="center">
  水平评估 · 问题诊断 · 内容推荐 · 训练计划 · 研究模式
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Supabase-Auth%20%26%20Research%20Data-10B981?style=flat-square" alt="Supabase auth and research data" />
  <img src="https://img.shields.io/badge/Curated%20Content-39-0F766E?style=flat-square" alt="39 curated content items" />
  <img src="https://img.shields.io/badge/Expanded%20Index-634-115E59?style=flat-square" alt="634 expanded content items" />
  <img src="https://img.shields.io/badge/Creators-52-CA8A04?style=flat-square" alt="52 creators" />
</p>

---

TennisLevel 是一个面向业余网球用户的训练决策型原型，核心目标是把“我现在到底该练什么”变得更具体、更可执行。

当前版本重点包括：

- 1 分钟水平评估
- 一句话问题诊断
- 场景化诊断解释与内容推荐
- 7 天训练计划
- 中英双语界面
- Study mode、事件日志、研究问卷与导出支持

## 当前数据规模

- 评估题：14 道
- 诊断规则：27 条
- 精选内容：39 条
- 扩展内容索引：634 条
- 创作者：52 位
- 训练计划模板：24 套

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`

推荐在提交前运行：

```bash
npm test
npm run validate:data
npm run validate:study-remote
npm run build
```

## 环境变量

1. 复制 `.env.example` 为 `.env.local`
2. 至少补上：

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

如果要接入真实多模态接口，再补：

```bash
VLM_PROVIDER=mock
VLM_API_KEY=
VLM_MODEL=Qwen/Qwen2.5-VL-72B-Instruct
VLM_BASE_URL=https://api.siliconflow.cn/v1
```

研究模式常用变量：

```bash
NEXT_PUBLIC_ADMIN_EMAILS=researcher@example.com
NEXT_PUBLIC_RESEARCH_CONTACT_EMAIL=researcher@example.com
NEXT_PUBLIC_STUDY_SNAPSHOT_VERSION=2026-03-29-v1
NEXT_PUBLIC_STUDY_FIXED_SEED=20260329
NEXT_PUBLIC_STUDY_FREEZE_LIBRARY=true
NEXT_PUBLIC_STUDY_FREEZE_RANKINGS=true
NEXT_PUBLIC_STUDY_DISABLE_RANDOM_SURFACING=true
NEXT_PUBLIC_STUDY_DISABLE_VIEWCOUNT_BOOST=true
NEXT_PUBLIC_ENABLE_RESEARCHER_OVERLAY=false
```

Supabase Auth 需要允许本地回调：

- `http://localhost:3000/auth/callback`

## Supabase SQL

按需执行以下 SQL：

- `supabase/p2_user_data.sql`
  创建：`assessment_results`、`diagnosis_history`、`bookmarks`、`saved_plans`
- `supabase/research_infra.sql`
  创建：`event_logs`、`survey_responses`
- `supabase/study_mode.sql`
  创建：study mode 会话、artifact 与研究流程相关表
- `supabase/video_diagnosis.sql`
  创建：`video_usage`、`video_diagnosis_history`

常用校验命令：

```bash
npm run validate:study-remote
npm run validate:study-docs
```

## Study Notes

- `/library` 与 `/rankings` 在 study mode 下由冻结 snapshot 驱动
- post-task actionability 使用 7 点量表
- 导出 bundle 包含 `taskRatings` 与 `actionabilitySummary`
- 详细说明见 [docs_local/STUDY_MODE.md](docs_local/STUDY_MODE.md)
- 远端迁移清单见 [docs_local/STUDY_REMOTE_MIGRATION_CHECKLIST.md](docs_local/STUDY_REMOTE_MIGRATION_CHECKLIST.md)
- snapshot 说明见 [docs_local/STUDY_SNAPSHOT_NOTE.md](docs_local/STUDY_SNAPSHOT_NOTE.md)

## 目录说明

- `src/app`：页面路由
- `src/components`：业务组件与 UI 组件
- `src/data`：评估题、诊断规则、内容、创作者、问卷等结构化数据
- `src/lib`：评估、诊断、计划、研究日志与导出逻辑
- `scripts`：校验与数据脚本
- `supabase`：Supabase 初始化 SQL

## 说明

- 内容推荐基于本地维护的真实内容和规则数据
- 研究模式下语言、snapshot 与排序策略会锁定
- 登录使用 Supabase magic link
- 研究数据采用 `localStorage + Supabase API` 双写策略
- 视频诊断链路仍保留，但当前研究主路径以文字诊断与训练计划为主
