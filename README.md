# TennisLevel

一个基于 Next.js 的网球训练决策 MVP，提供评估、诊断、内容推荐、训练计划和登录后保存能力。

## 功能
- 水平评估：问卷评分并输出等级与短板
- 问题诊断：输入描述后匹配训练问题标签
- 内容推荐：按等级与问题标签筛选学习内容
- 训练计划：按标签与等级生成 7 天训练安排
- 登录保存：评估结果、诊断历史、收藏内容、训练计划可写入 Supabase

## 技术栈
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase
- Vitest + Testing Library

## 当前数据规模
- 评估题：8 道
- 诊断规则：12 条
- 内容条目：36 条
- 创作者：17 位
- 训练计划模板：5 套

## 本地运行
```bash
npm install
npm run dev
```
打开 http://localhost:3000

## 工程校验
```bash
npm run validate:data
npm test
npm run build
```

- `validate:data`：检查诊断规则、内容、博主和训练计划引用是否一致
- `test`：运行首页、评估页、诊断页、内容库、博主榜和训练计划页的 smoke test
- `build`：确认 Next.js 构建、类型检查和静态页面生成正常

## 邮箱登录配置
项目已经接入邮箱 magic link 的前端流程，默认使用 Supabase。

1. 复制 `.env.example` 为 `.env.local`
2. 填入 `NEXT_PUBLIC_SUPABASE_URL`
3. 填入 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 在 Supabase Auth 里把回调地址加入允许列表：
   - `http://localhost:3000/auth/callback`

配置完成后，顶部“登录”按钮就可以直接发送邮箱登录链接。

## P2 数据表
任务 2 里的评估结果、诊断历史、收藏和训练计划保存，已经整理成 SQL 文件：

`supabase/p2_user_data.sql`

在 Supabase 后台打开 `SQL Editor`，执行这份文件即可创建表、索引和基础 RLS policy。

## 主要页面
- /
- /assessment
- /assessment/result
- /diagnose
- /library
- /rankings
- /plan

## 目录说明
- src/app: 页面路由
- src/components: 业务组件
- src/data: 评估、诊断、内容、创作者、计划模板等结构化数据
- src/lib: 评分、诊断、计划、Supabase 用户数据逻辑
- scripts: 数据校验脚本
- supabase: Supabase 初始化 SQL

## 说明
当前版本为前端 MVP，内容推荐使用本地维护的真实内容与规则数据；邮箱登录使用 Supabase magic link。
