# Video Diagnosis Tasks

更新时间：2026-03-25

## 已完成

### V1 已落地

- 已创建 `/video-diagnose` 页面
- 已支持前端视频校验和浏览器本地抽帧
- 已创建 `/api/video-diagnose` 接口
- 已接入 provider-agnostic 的 `vlm.ts`
- 已提供 mock VLM fallback
- 已将视频分析结果映射到现有诊断规则、内容、博主和训练计划
- 已加入免费视频次数限制
- 已支持登录后保存视频诊断历史
- 已在 Header、首页 Hero、文字诊断结果页加入视频诊断入口
- 已在个人中心加入视频诊断记录
- 已在管理员导出页加入视频诊断导出
- 已补 `supabase/video_diagnosis.sql`

## 下一步推荐顺序

### V2 真实模型接入

1. 配置真实 `VLM_API_KEY`
2. 将 `VLM_PROVIDER` 从 `mock` 切到真实 provider
3. 用 5 到 10 段真实视频验证 JSON 结构稳定性
4. 调整 prompt 和低置信度阈值

### V3 体验打磨

1. 增加上传进度与抽帧进度的更细粒度反馈
2. 让结果页支持“复制搜索词”
3. 增加“怎么重拍更准”的示意图或案例
4. 优化移动端视频预览和结果阅读节奏

### V4 研究增强

1. 在问卷中加入视频诊断专项题
2. 对比文字诊断和视频诊断的满意度
3. 导出后分析视频诊断的点击和保存路径
4. 统计视频诊断后的计划生成率和内容点击率

### V5 商业化

1. 增加 Pro 页面和权益说明
2. 接入支付
3. 把 `is_pro` 接到真实订阅状态
4. 增加额度说明、账单说明和失败不扣次说明

## 手动动作

当前要让远端持久化完整可用，你还需要在 Supabase 执行：

- `supabase/video_diagnosis.sql`

如果要切真实多模态模型，还需要在 `.env.local` 配置：

- `VLM_PROVIDER`
- `VLM_API_KEY`
- `VLM_MODEL`
- `VLM_BASE_URL`
