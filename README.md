# TennisLevel

一个面向业余网球用户的训练决策型 MVP。当前版本已经具备：

- 1 分钟水平评估
- 一句话问题诊断
- 真实内容推荐
- 7 天训练计划
- Supabase 邮箱登录与保存能力
- 研究基础设施：事件日志、研究问卷、导出页、测试引导、知情同意

## 技术栈

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase
- Vitest + Testing Library

## 当前数据规模

- 评估题：8 道
- 诊断规则：19 条
- 内容条目：36 条
- 创作者：17 位
- 训练计划模板：9 套

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`

## 工程校验

```bash
npm run validate:data
npm test
npm run build
```

- `validate:data`：检查规则、内容、博主和训练计划的引用一致性
- `test`：运行核心页面和研究页面的 smoke test
- `build`：确认 Next.js 构建、类型检查和静态页面生成正常

## Supabase 配置

项目默认使用 Supabase 作为登录和研究数据存储。

1. 复制 `.env.example` 为 `.env.local`
2. 填入：

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3. 在 Supabase Auth 里把回调地址加入允许列表：

- `http://localhost:3000/auth/callback`

如果你要启用研究导出页和 study 联系邮箱，建议再加：

```bash
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com
NEXT_PUBLIC_RESEARCH_CONTACT_EMAIL=your-email@example.com
```

## Supabase SQL

### 用户数据表

执行：

`supabase/p2_user_data.sql`

这会创建：

- `assessment_results`
- `diagnosis_history`
- `bookmarks`
- `saved_plans`

### 研究数据表

执行：

`supabase/research_infra.sql`

执行前请先把 SQL 里的管理员邮箱占位符 `your-email@example.com` 改成你自己的邮箱。  
这会创建：

- `event_logs`
- `survey_responses`

同时会给已有的 `assessment_results` 和 `diagnosis_history` 补管理员导出策略。

## 主要页面

- `/`
- `/assessment`
- `/assessment/result`
- `/diagnose`
- `/library`
- `/rankings`
- `/plan`
- `/profile`
- `/study`
- `/survey`
- `/admin/export`

## 目录说明

- `src/app`：页面路由
- `src/components`：业务组件与 UI 组件
- `src/data`：评估题、诊断规则、内容、创作者、问卷等结构化数据
- `src/lib`：评估、诊断、计划、用户数据、研究日志与导出逻辑
- `scripts`：数据校验脚本
- `supabase`：Supabase 初始化 SQL

## 说明

当前版本仍然是前端驱动的 MVP：

- 内容推荐基于本地维护的真实内容和规则数据
- 登录使用 Supabase magic link
- 研究数据采用“localStorage + 登录后写入 Supabase”的双写策略
