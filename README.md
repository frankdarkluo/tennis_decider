# TennisLevel

一个基于 Next.js 的网球训练决策 MVP，提供评估、诊断、内容推荐和训练计划。

## 功能
- 水平评估：问卷评分并输出等级与短板
- 问题诊断：输入描述后匹配训练问题标签
- 内容推荐：按等级与问题标签筛选学习内容
- 训练计划：按标签与等级生成 7 天训练安排

## 技术栈
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

## 本地运行
```bash
npm install
npm run dev
```
打开 http://localhost:3000

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
- src/data: mock 数据
- src/lib: 评分、诊断、计划逻辑

## 说明
当前版本为前端 MVP，使用本地 mock 数据，不依赖后端服务。
