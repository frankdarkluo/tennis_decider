# TennisLevel 视频诊断功能方案

更新时间：2026-03-25

## 1. 目标定义

视频诊断不是用来替代现有文字诊断，而是作为更高价值的增强层：

- 文字诊断解决“我大概知道问题，但描述得很模糊”
- 视频诊断解决“我想让系统更像教练一样看动作”

因此，这个功能最适合被定义为：

**付费增强功能，免费体验 3 次，用于提升诊断准确度、推荐可信度和训练计划针对性。**

## 2. 对原方案的核心优化

你原来的大方向是对的，但如果要让它更适合当前版本、论文和后续商业化，我建议加上这 6 个收口原则。

### 2.1 先做“视频增强诊断”，不要一开始就做“全自动视频教练”

第一版目标不是精确做姿态估计或逐帧动作评分，而是：

- 看懂视频里大概是什么击球
- 识别 1 到 3 个最关键的问题
- 把这些问题映射到现有的诊断规则、内容库、博主和训练计划

这会让系统更像“视频驱动的智能分流器”，而不是高风险的“动作打分器”。

### 2.2 第一版默认不存原视频，只传抽帧结果

这是我最建议你改的一点。

与其第一版就做“视频上传到对象存储 + 服务端 ffmpeg + 异步任务”，更适合当前版本的方案是：

- 浏览器本地抽 6 到 8 张关键帧
- 再把关键帧 + 用户文字描述发给后端
- 后端调用 VLM 分析

这样做的好处：

- 部署简单，不依赖服务端 ffmpeg
- 隐私风险更低
- 成本更可控
- 论文里更容易解释系统边界

如果以后确实要做更强的视频理解，再上“原视频暂存 + 异步任务队列”。

### 2.3 免费次数只对“成功分析”计费

不要在“点击上传”时扣次数，也不要在“分析失败”时扣次数。

更合理的规则是：

- 通过前端校验不扣
- 模型返回结构化结果且置信度达标，才算 1 次
- 如果结果低置信度或失败，提示重拍，不扣次数

这会显著减少用户对付费墙的反感。

### 2.4 低置信度时不要硬给计划，要降级输出

视频诊断最危险的不是“没有结果”，而是“看错了还说得很肯定”。

所以结果层必须有一个明确兜底：

- 如果模型置信度高：正常输出问题、内容、博主、训练计划
- 如果模型置信度中等：输出观察 + 建议重拍 + 仅给保守推荐
- 如果模型置信度低：不生成强结论，只建议重新录制或改走文字诊断

### 2.5 第一版让用户补一个结构化提示，会比纯自由输入更稳

建议在视频上传页增加 2 个轻量字段：

- `你主要想看哪一拍？`
  选项：`正手 / 反手 / 发球 / 网前 / 不确定`
- `这段视频更像什么场景？`
  选项：`喂球训练 / 对拉 / 发球练习 / 比赛片段`

这两个字段会显著降低模型理解成本，也方便后处理映射。

### 2.6 研究角度上，把它定义为“文本 + 视频的混合诊断”

论文里不要把这个功能说成“视频单独决策”，而要说成：

**系统综合用户文字描述、评估等级和视频关键帧，生成比文字诊断更细的建议。**

这样更符合你现有产品架构，也更容易做对照实验。

## 3. 产品方案

### 3.1 用户主流程

推荐的 V1 流程如下：

1. 用户进入 `/video-diagnose`
2. 上传一段 `<= 60 秒` 的视频
3. 可选填写一句文字描述
4. 额外选择：
   - 主要击球类型
   - 视频场景
5. 前端本地抽取关键帧并做基础校验
6. 后端调用 VLM 分析关键帧
7. 系统返回：
   - AI 观察
   - 主要问题
   - 次要问题
   - 推荐内容
   - 推荐博主
   - 7 天训练计划
   - 搜索建议
   - 置信度与重拍建议

### 3.2 结果页应该长什么样

推荐结果页按这个顺序组织：

1. `先说结论`
   例：你当前最值得先改的是“击球点偏晚”
2. `AI 观察到了什么`
   只放 3 到 4 条
3. `为什么会这样`
   把视频观察映射成可理解的因果解释
4. `下一步练什么`
   输出 7 天计划
5. `先看这两个内容`
6. `最适合你的博主`
7. `如果想重新拍，怎么拍更准`

这样结果更像教练反馈，而不是模型日志。

### 3.3 付费方案

推荐保持你原来的方向，但规则再收紧一点：

- 文字诊断：永久免费
- 视频诊断：免费 3 次
- 第 4 次开始弹出 Pro 提示
- 先不接支付，只实现权限与限制逻辑

建议新增两个显示状态：

- `剩余免费次数`
- `本次未计费，建议重新录制`

这样用户感知会更友好。

## 4. 技术路线建议

## 4.1 V1 推荐架构

第一版推荐用下面这条最轻、最稳的链路：

```text
前端页面 /video-diagnose
  -> 浏览器本地抽帧
  -> POST 关键帧 + 文本 + 用户等级 + 击球类型 + 场景
  -> Next.js API Route /api/video-diagnose
  -> VLM Provider Adapter
  -> 后处理映射到 diagnosisRules / contents / creators / planTemplates
  -> 返回结构化结果
  -> 保存 video_diagnosis_history + 事件日志 + 成功次数
```

### 4.2 先不要做的东西

第一版不要急着做这些：

- 支付接入
- 原视频长期存储
- 服务端 ffmpeg
- 异步任务队列
- 本地部署大模型
- 帧级动作打分
- 自动画骨架或关键点可视化

这些都可以做，但不应该进入 V1。

### 4.3 为什么前端抽帧优先于服务端 ffmpeg

对你当前项目来说，前端抽帧更合理：

- Vercel / Next.js 部署简单
- 不需要额外二进制依赖
- 不需要保存用户视频
- 上传体积更小
- 更适合“先跑通研究原型”

所以我建议：

- `V1`: 浏览器 Canvas 抽帧
- `V2`: 原视频暂存 + 异步分析

## 5. 模型选择建议

### 5.1 模型选择原则

这个功能是付费增强能力，所以首发时更应该优先考虑：

- 结果稳定
- JSON 结构遵守度
- 多模态理解可靠性

而不是先追求最低成本。

### 5.2 对 Qwen 方案的建议

你的方向没问题，但我建议这样用：

- `首发默认模型`
  用托管 API 形式的较强多模态模型
  例：`Qwen/Qwen2.5-VL-72B-Instruct` 这类更强模型
- `开发 / 低成本 fallback`
  才考虑 `Qwen/Qwen2.5-VL-1.5B-Instruct`

原因很简单：

- 1.5B 更适合“跑通接口”
- 72B 级别更适合“真正给用户看结果”

如果第一批研究用户看到的结果不稳，会直接影响论文里的满意度和可信度指标。

所以更好的策略是：

- 开发阶段：mock 或小模型
- 研究试跑：更强的托管模型
- 后续商业化：再比较成本和效果

### 5.3 Provider 抽象

代码里应该只暴露一层统一接口：

```ts
analyzeVideoFrames(payload): Promise<VLMObservation>
```

Provider 只是实现细节，避免业务层直接绑定某个厂商。

## 6. 推荐的数据结构

相比原方案，我建议 VLM 返回值再多两个字段：

- `confidence`
- `retakeAdvice`

推荐 schema：

```ts
export interface VLMObservation {
  strokeType: "forehand" | "backhand" | "serve" | "volley" | "other";
  sceneType: "drill" | "rally" | "serve_practice" | "match" | "unknown";
  bodyPosture: string;
  contactPoint: string;
  footwork: string;
  swingPath: string;
  overallAssessment: string;
  keyIssues: string[];
  estimatedLevel: string;
  confidence: number;
  retakeAdvice?: string;
}
```

这样后处理层更容易做这三个分支：

- `confidence >= 0.75`
- `0.45 <= confidence < 0.75`
- `confidence < 0.45`

## 7. 诊断后处理逻辑

视频诊断不应该直接绕开现有系统，而应该尽量复用现有逻辑。

推荐的后处理顺序：

1. 把 `keyIssues + overallAssessment + 用户文字描述` 拼成统一文本
2. 复用当前 `diagnosisRules` 的关键词 / 同义词匹配逻辑
3. 结合用户评估等级做加权
4. 产出 `primaryProblem` 和 `secondaryProblems`
5. 从现有 `contents` 里召回内容
6. 从现有 `creators` 里召回博主
7. 从现有 `planTemplates` 里生成训练计划

这一步非常重要，因为它保证了：

- 视频诊断不是另起一套系统
- 文字诊断和视频诊断共享同一个知识底座
- 论文里可以更清楚地比较“输入模态变化”而不是“整个系统变了”

## 8. 数据库与权限设计

### 8.1 新增表

建议新增两张表：

```sql
create table video_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  success_count integer default 0,
  failed_count integer default 0,
  is_pro boolean default false,
  updated_at timestamptz default now(),
  unique(user_id)
);

create table video_diagnosis_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  user_description text,
  selected_stroke text,
  selected_scene text,
  observation jsonb not null,
  result jsonb not null,
  confidence numeric,
  created_at timestamptz default now()
);
```

这里我建议把 `success_count` 和 `failed_count` 分开，而不是只存一个 `count`。

### 8.2 计次规则

- 成功分析且置信度达标：`success_count + 1`
- 模型异常或结果无效：`failed_count + 1`
- 免费限制只看 `success_count`

## 9. 页面与组件建议

### 9.1 建议新增页面

- `/video-diagnose`

### 9.2 建议新增组件

- `VideoUploader`
- `VideoProcessingStatus`
- `VideoAnalysisResult`
- `VideoRetakeGuide`
- `UsageMeter`

### 9.3 建议新增入口

- Header：`视频诊断`
- 首页 Hero 下方：`有练球视频？试试 AI 视频诊断`
- 文字诊断结果页底部：`想更精准？上传视频看看`
- 个人中心：新增 `视频诊断记录`

## 10. 事件日志与研究设计

这个功能对论文最有价值的地方，不只是“接了视频模型”，而是你终于能做文本诊断和视频诊断的对照。

### 10.1 建议新增埋点

- `video_upload_start`
- `video_upload_success`
- `video_validation_fail`
- `video_analysis_start`
- `video_analysis_success`
- `video_analysis_fail`
- `video_limit_reached`
- `video_retry_recommended`
- `video_result_save`
- `video_plan_generate`

### 10.2 建议新增研究问题

你后续可以围绕这几个问题做用户研究：

1. 视频诊断是否提升了用户对结果的可信度
2. 视频诊断是否提升了用户对“下一步练什么”的清晰度
3. 视频诊断是否提高了用户点击推荐内容和保存训练计划的概率
4. 视频诊断是否比纯文字诊断带来更高的满意度

### 10.3 建议新增问卷题

在现有问卷后面加 3 到 5 个专项问题即可：

- 我觉得系统真的看懂了我的动作问题
- 这个结果比只输入文字更有帮助
- 我愿意为这种视频诊断功能付费
- 我觉得系统给出的训练计划更贴合我的情况

## 11. 实现优先级

### Phase 1：先跑通第一版流程

1. 创建类型定义
2. 创建前端抽帧工具
3. 创建 mock VLM adapter
4. 创建 `/video-diagnose`
5. 创建结果页组件
6. 接入现有规则、内容、博主和训练计划

### Phase 2：接真实 API

7. 创建 provider adapter
8. 接入真实多模态 API
9. 增加置信度和重拍建议
10. 接入 usage limit

### Phase 3：接研究与留存

11. 保存 `video_diagnosis_history`
12. 加事件日志
13. 在个人中心展示视频诊断记录
14. 在导出页加入视频诊断数据

### Phase 4：再考虑商业化

15. 完整 Pro UI
16. 支付接入
17. 更细的结果解释
18. 原视频异步分析

## 12. 这版方案为什么更适合你现在的阶段

它的优点是：

- 不会一上来把系统做得过重
- 能最大程度复用你已经做好的规则、内容和计划系统
- 可以很快形成一个可试用、可研究、可收费的增强功能
- 对论文来说也更容易论证，因为你比较的是输入模态增强，而不是完全换了一套产品

## 13. 论文中可以怎么写

你可以把这个模块定义为：

**A multimodal diagnostic extension that combines user-uploaded practice video, self-reported text description, and existing rule-based coaching knowledge to produce more actionable tennis training recommendations than text-only diagnosis.**

如果写中文版本，可以这样概括：

**我们在原有文字诊断系统上扩展了一个视频诊断模块，通过视觉语言模型对用户上传的练习视频关键帧进行分析，再结合文字描述和既有规则库，生成更细致的技术问题判断、内容推荐和训练计划。**

## 14. 最终建议

如果只保留一句最关键的话，我会建议你这样推进：

**先做“前端抽帧 + 托管 VLM API + 复用现有规则系统”的视频增强诊断第一版，不要一开始就做完整的视频基础设施。**
