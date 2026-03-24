# TennisLevel MVP

TennisLevel 是一个网球学习推荐网站 MVP，面向初中级球员与初学教练。

## 技术栈

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- 本地 mock 数据（不接后端、不接数据库、不接真实认证）

## 快速启动

1. 安装依赖

```bash
npm install
```

2. 启动开发环境

```bash
npm run dev
```

3. 打开浏览器

- http://localhost:3000

## 页面路由

- `/` 首页
- `/assessment` 水平评估
- `/assessment/result` 评估结果
- `/diagnose` 问题诊断
- `/library` 内容库
- `/rankings` 博主榜
- `/plan` 训练计划

## 数据位置

所有内容都在 `src/data/`：

- `assessmentQuestions.ts` 问卷题库
- `contents.ts` 内容库
- `creators.ts` 博主数据
- `diagnosisRules.ts` 诊断规则
- `planTemplates.ts` 7 天训练计划模板

## 业务逻辑位置

- `src/lib/assessment.ts` 评估评分、分项统计、等级输出、短板总结
- `src/lib/diagnosis.ts` 文本标准化、关键词匹配、兜底诊断
- `src/lib/plans.ts` 按 problemTag + level 获取计划模板与兜底计划

## 页面间传值

- 评估结果：使用 `localStorage`（键名：`tennislevel-assessment-result`）
- 诊断与筛选参数：使用 URL query（如 `/diagnose?q=反手下网`、`/library?level=3.5`）
- 计划页：使用 URL query（如 `/plan?problemTag=second-serve-confidence&level=3.5`）

## 后续可扩展建议

- 将 `src/data` 抽象为可替换 JSON 源
- 增加收藏本地持久化
- 增加筛选项中英文映射展示
- 接入真实后端 API 与用户系统（后续阶段）
