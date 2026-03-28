<p align="center">
  <img src="public/brand/tennislevel-logo-vertical-white.jpg" width="175" alt="TennisLevel logo on white background" />
</p>

<p align="center">
  为业余网球用户提供更清晰的下一步训练决策。
</p>

<p align="center">
  水平评估 · 问题诊断 · 内容推荐 · 视频诊断 · 训练计划
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Supabase-Auth%20%26%20Data-10B981?style=flat-square" alt="Supabase" />
  <img src="https://img.shields.io/badge/Content-475%20videos-0F766E?style=flat-square" alt="475 videos" />
  <img src="https://img.shields.io/badge/Creators-27-CA8A04?style=flat-square" alt="27 creators" />
</p>

---

一个面向业余网球用户的训练决策型产品。当前版本已经具备：

- 1 分钟水平评估
- 一句话问题诊断
- 真实内容推荐
- AI 视频诊断
- 7 天训练计划
- 中英双语界面与全站 `zh | en` 切换
- Supabase 邮箱登录与保存能力
- 研究基础设施：study mode、事件日志、研究问卷、导出页、测试引导、知情同意

## 当前数据规模

- 评估题：14 道
- 诊断规则：19 条
- 内容条目：673 条
- 创作者：52 位
- 训练计划模板：9 套
- 视频诊断：前端抽帧 + VLM 接口适配 + 次数限制

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`

推荐在提交前额外运行：

```bash
npm test
npm run validate:data
npm run build
```

## Supabase 配置

项目默认使用 Supabase 作为登录和研究数据存储。

1. 复制 `.env.example` 为 `.env.local`
2. 填入：

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

如果你要切换到真实多模态模型接口，可以再补：

```bash
VLM_PROVIDER=mock
VLM_API_KEY=
VLM_MODEL=Qwen/Qwen2.5-VL-72B-Instruct
VLM_BASE_URL=https://api.siliconflow.cn/v1
```

3. 在 Supabase Auth 里把回调地址加入允许列表：

- `http://localhost:3000/auth/callback`

如果你要启用研究导出页和 study 联系邮箱，建议再加：

```bash
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com
NEXT_PUBLIC_RESEARCH_CONTACT_EMAIL=your-email@example.com
```

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

执行前如果涉及管理员邮箱占位符，请先改成你自己的邮箱。

## 目录说明

- `src/app`：页面路由
- `src/components`：业务组件与 UI 组件
- `src/data`：评估题、诊断规则、内容、创作者、问卷等结构化数据
- `src/lib`：评估、诊断、计划、用户数据、研究日志与导出逻辑
- `scripts`：数据校验脚本
- `supabase`：Supabase 初始化 SQL

## 说明

当前版本仍然是前端驱动的产品原型：

- 内容推荐基于本地维护的真实内容和规则数据
- 双语文案、内容标题和创作者信息支持中英切换；研究模式下语言会锁定
- 登录使用 Supabase magic link
- 研究数据采用“localStorage + Supabase API”双写策略
- 视频诊断当前默认使用 mock VLM 结果跑通流程；配置真实 API key 后可切换到托管多模态模型
