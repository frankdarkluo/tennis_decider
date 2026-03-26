# Claude Review Progress

更新时间：2026-03-25

适用范围：**仅主产品与研究原型进展，不包含 `SportsHCI_2026/` 相关 LaTeX/论文模板整理工作。**

## 1. 当前项目处于什么阶段

TennisLevel 目前已经不是只有首页和静态 demo 的状态，而是一个可运行的研究型原型。当前主闭环已经具备：

1. `/assessment` 做 1 分钟水平评估
2. `/diagnose` 做一句话问题诊断
3. `/library` 和 `/rankings` 承接内容与创作者推荐
4. `/plan` 生成 7 天训练计划
5. `/profile` 聚合用户历史记录
6. `/study` + `/survey` + `/admin/export` 承接研究流程、问卷和导出

在这个基础上，本轮最主要的新进展是：**AI 视频诊断第一版已经落地到代码，并接入现有用户数据与研究数据体系。**

## 2. 本轮已落地的核心进展

### 2.1 视频诊断第一版已实现

已新增：

- `/video-diagnose` 页面
- `/api/video-diagnose` API route
- 浏览器本地视频校验与抽帧
- provider-agnostic 的 `vlm.ts`
- mock VLM fallback
- 视频结果到既有诊断规则、内容、博主、训练计划的映射

当前视频诊断主链路：

1. 用户上传 `<= 60s` 视频
2. 前端校验格式、大小、时长
3. 浏览器本地抽取关键帧
4. POST 帧 + 用户描述 + 用户等级 + 击球类型 + 场景 到 `/api/video-diagnose`
5. 后端调用 `analyzeVideoFrames`
6. 将 VLM observation 映射为：
   - primary problem
   - secondary problems
   - recommended contents
   - recommended creators
   - training plan
   - search suggestions
   - confidence / fallback reason

### 2.2 免费次数与降级策略已接入

视频诊断已实现：

- 免费 3 次
- 仅对 `chargeable = true` 的成功分析计次
- 低置信度结果不扣次
- 登录用户走远端 `video_usage`
- 未登录用户走本地 `localStorage`

### 2.3 视频诊断记录已接入用户体系

已新增：

- `video_diagnosis_history` 持久化
- 个人中心展示最近视频诊断记录
- 管理员导出页支持导出视频诊断数据
- 研究事件日志新增视频相关事件类型

### 2.4 产品入口已补齐

视频诊断入口已经接入：

- Header
- 首页 Hero
- 文字诊断结果页
- 个人中心记录页

## 3. 相关数据与后端准备情况

已新增 SQL：

- `supabase/video_diagnosis.sql`

这份 SQL 会创建：

- `video_usage`
- `video_diagnosis_history`

并补齐：

- user-level RLS
- admin select policy
- 视频次数与历史的索引

环境变量示例也已补到：

- `.env.example`

当前支持：

- `VLM_PROVIDER`
- `VLM_API_KEY`
- `VLM_MODEL`
- `VLM_BASE_URL`

默认仍是 `mock` provider，用来先跑通流程。

## 4. 当前工程验证状态

我刚刚重新在本地执行过以下校验，结果如下：

- `npm run validate:data`：通过
- `npm test`：11 / 11 通过
- `npm run build`：通过

最新校验数据：

- 诊断规则：19 条
- 内容条目：36 条
- 创作者：17 位
- 训练计划模板：9 套

最新构建结果：

- 成功生成 17 个 app routes
- 已包含 `/video-diagnose`
- 已包含 `/api/video-diagnose`

## 5. 现在还没做完的部分

这轮并不是“视频诊断全部完成”，而是 **V1 已完成，真实上线前还有几个明确待办**：

- 还没有接支付
- 还没有接服务端 ffmpeg
- 还没有做原视频存储
- 还没有做异步任务队列
- 还没有做更严格的 provider 级容错与质量评估
- 还没有用 5 到 10 段真实视频系统验证 prompt 稳定性

如果要让远端持久化真正可用，还需要手动在 Supabase 执行：

- `supabase/video_diagnosis.sql`

如果要切到真实多模态模型，还需要在 `.env.local` 配置：

- `VLM_PROVIDER`
- `VLM_API_KEY`
- `VLM_MODEL`
- `VLM_BASE_URL`

## 6. 建议 Claude 重点审核的地方

请优先从“代码是否已经足够稳，能不能支持真实试跑”这个角度审核，而不是只看功能表面是否存在。

建议重点看：

1. `src/app/api/video-diagnose/route.ts`
   - 请求校验是否足够
   - 是否需要更严格的 payload / auth / abuse protection

2. `src/lib/vlm.ts`
   - remote provider 适配是否稳
   - JSON 解析与 fallback 策略是否合理
   - 当前错误时直接回退 mock 是否会掩盖真实问题

3. `src/lib/videoDiagnosis.ts`
   - VLM 结果映射到现有 diagnosis/content/creator/plan 的逻辑是否合理
   - 低置信度输出是否够保守

4. `src/app/video-diagnose/page.tsx`
   - 上传、抽帧、状态切换、扣次逻辑是否有边界问题
   - 登录态与游客态次数逻辑是否一致

5. `src/lib/userData.ts`
   - `video_usage` 的更新方式是否可能有并发竞争
   - `video_diagnosis_history` 的结构是否适合后续研究导出与分析

6. `supabase/video_diagnosis.sql`
   - 表设计与 RLS 是否合理
   - 管理员导出权限是否完整

## 7. Claude 审核时可直接参考的关键文件

- `src/app/video-diagnose/page.tsx`
- `src/app/api/video-diagnose/route.ts`
- `src/components/video/VideoUploader.tsx`
- `src/components/video/VideoProcessingStatus.tsx`
- `src/components/video/VideoAnalysisResult.tsx`
- `src/components/video/UsageMeter.tsx`
- `src/lib/videoFrames.ts`
- `src/lib/videoUsage.ts`
- `src/lib/videoDiagnosis.ts`
- `src/lib/vlm.ts`
- `src/lib/userData.ts`
- `src/types/videoDiagnosis.ts`
- `src/types/userData.ts`
- `src/types/research.ts`
- `src/app/profile/page.tsx`
- `src/app/admin/export/page.tsx`
- `supabase/video_diagnosis.sql`
- `VIDEO_DIAGNOSIS_PLAN.md`
- `VIDEO_DIAGNOSIS_TASKS.md`

## 8. 一句话总结

当前主产品在原有“评估 -> 诊断 -> 内容 -> 训练计划 -> 研究导出”的闭环上，已经把 **视频诊断 V1** 真实接进去了，而且本地校验、测试和构建都通过。现在最值得 Claude 帮忙看的，不是“这个功能有没有”，而是“这版实现是否足够稳，能不能安全地进入真实用户试跑”。
