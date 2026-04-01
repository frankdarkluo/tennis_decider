请帮我开发一个网球学习推荐网站 MVP，名称暂定为 TennisLevel。

一、项目目标

这是一个面向网球初中级球员和初学教练的网站，核心目标是：
1. 帮助用户通过结构化问卷快速评估自己的参考能力区间（参考 NTRP 思路，但不要写成官方评级）
2. 帮助用户通过一句自然语言描述问题，得到结构化诊断、内容推荐和训练建议
3. 帮助用户按等级、技术项、平台、语言筛选适合自己的教学内容
4. 帮助用户发现适合自己的教学博主
5. 帮助用户基于诊断结果生成 7 天训练计划

这是一个 MVP，不接真实数据库，不接真实 AI 服务，不接真实登录系统，先用本地 mock 数据完成整体框架和初步交互。

二、技术要求

请使用以下技术栈：
- Next.js（App Router）
- TypeScript
- Tailwind CSS
- shadcn/ui 或简洁可复用的自定义 UI 组件
- 本地 mock JSON / TS 数据
- 不接后端 API
- 不接数据库
- 不接真实认证
- 所有内容先用中文 placeholder

要求：
- 页面风格简洁、现代、偏体育教育产品
- 响应式设计，桌面优先，同时兼容移动端
- 组件复用，目录清晰
- 便于我后续手工替换博主名、视频链接、推荐文案等内容
- 代码尽量干净，避免过度复杂封装

三、站点结构

请实现以下 7 个页面：

1. 首页 `/`
2. 水平评估页 `/assessment`
3. 评估结果页 `/assessment/result`
4. 问题诊断页 `/diagnose`
5. 内容库页 `/library`
6. 博主榜页 `/rankings`
7. 训练计划页 `/plan`

四、全局布局要求

请实现统一的：
- Header 顶部导航
- Footer 页脚
- 主内容区域容器
- 按钮、标签、卡片、输入框、筛选器等基础组件

Header 导航项：
- 首页
- 水平评估
- 问题诊断
- 内容库
- 博主榜
- 训练计划

右上角按钮：
- 登录（先做假按钮）
- 免费开始（跳到 /assessment）

Footer 可先放简单占位：
- 关于我们
- 使用说明
- 联系方式
- 隐私政策

五、页面详细要求

【页面 1：首页 `/`】

目标：
- 让用户快速理解产品价值
- 让用户进入两条主路径：水平评估 / 问题诊断

模块：
1. Hero 首屏
   - 主标题：把“我哪里有问题”变成“我下一步该练什么”
   - 副标题：根据你的水平、技术短板和具体困惑，推荐适合你的网球教学内容与训练策略。
   - 两个按钮：
     - 先测我的水平
     - 直接描述问题

2. 三个快捷入口卡片
   - 水平评估
   - 问题诊断
   - 精选内容推荐

3. 高频问题标签
   - 正手总出界
   - 反手总下网
   - 二发没信心
   - 网前容易失误
   - 比赛容易紧张
   - 不知道该练什么

4. 3.0–3.5 提升路径说明
   - 第一步：测水平
   - 第二步：找问题
   - 第三步：看内容并练动作

5. 热门内容与热门博主
   - 左侧显示 3 条内容卡
   - 右侧显示 3 张博主卡

6. 底部 CTA
   - 文案：还不知道该从哪里开始？先做一次水平评估。
   - 按钮：免费开始

交互：
- 点击“先测我的水平”跳转 `/assessment`
- 点击“直接描述问题”跳转 `/diagnose`
- 点击高频问题标签跳转 `/diagnose?q=xxx`
- 点击热门内容卡跳转 `/library`
- 点击热门博主卡跳转 `/rankings`

【页面 2：水平评估页 `/assessment`】

目标：
- 让用户完成一个多题单选问卷
- 根据结果生成参考能力区间和分项标签

要求：
- 使用本地题库数据
- 每题单选
- 支持上一题、下一题
- 显示进度条
- 最后一题提交后跳转结果页

维度建议：
- 正手
- 反手
- 发球
- 网前
- 移动
- 比赛意识

每个维度 3 题左右，总题数控制在 12–18 题

页面模块：
1. 标题区
   - 标题：5 分钟了解你的网球能力区间
   - 副标题：通过六个维度进行参考评估

2. 问题展示区
   - 当前问题标题
   - 选项列表（单选）

3. 进度条区
   - 当前第几题 / 共几题
   - 百分比

4. 底部操作区
   - 上一题
   - 下一题
   - 提交评估

逻辑：
- 未答题不能进入下一题
- 提交时根据选项分数计算：
  - 总分
  - 各维度分数
  - 参考等级（3.0 / 3.5 / 4.0）
- 将结果临时保存在 localStorage 或 URL state 中
- 跳转 `/assessment/result`

【页面 3：评估结果页 `/assessment/result`】

目标：
- 展示用户参考能力区间
- 展示分项能力
- 引导到诊断页或内容库

模块：
1. 总评卡
   - 标题示例：你的能力区间接近 3.5
   - 结果说明文字
   - 信心提示（可写成“参考结果”）

2. 分项能力展示
   - 正手
   - 反手
   - 发球
   - 网前
   - 移动
   - 比赛意识
   建议用条形图、进度条或简洁评分卡展示

3. 主要短板总结
   - 输出 2–3 条短板描述

4. 下一步 CTA
   - 去做问题诊断
   - 去看推荐内容
   - 重新测试

逻辑：
- 如果没有结果数据，自动跳回 `/assessment`
- 点击“去做问题诊断”跳转 `/diagnose`
- 点击“去看推荐内容”跳转 `/library?level=3.5`
- 点击“重新测试”跳转 `/assessment`

【页面 4：问题诊断页 `/diagnose`】

目标：
- 允许用户用自然语言描述问题
- 用本地规则匹配诊断结果
- 返回问题类别、可能原因、优先修正点、推荐内容、训练建议

模块：
1. 页面标题区
   - 标题：直接描述你的问题
   - 副标题：用一句话说出你的困惑，我们帮你定位原因

2. 输入区
   - 大输入框
   - 占位示例：
     - 我反手总是下网
     - 我的二发没有信心
     - 正手一发力就容易出界
     - 比赛里总觉得来不及准备

3. 快捷问题标签
   - 正手出界
   - 反手下网
   - 二发没信心
   - 网前失误
   - 移动慢
   - 比赛紧张

4. 诊断结果区
   输出：
   - 问题分类
   - 可能原因（2–3 条）
   - 优先修正点（1–2 条）
   - 推荐内容（3 条）

5. 训练建议区
   - 2–3 条具体练习建议

6. 底部操作按钮
   - 开始诊断
   - 清空
   - 生成训练计划

逻辑：
- 基于本地规则 JSON 做关键词匹配
- 支持从 URL query 自动填充输入框
- 若无匹配结果，显示兜底文案和热门推荐内容
- 点击“生成训练计划”跳转 `/plan`，并把当前问题标签传过去

【页面 5：内容库页 `/library`】

目标：
- 让用户按等级、技术项、平台、语言搜索和筛选内容

模块：
1. 页面标题区
   - 标题：内容库
   - 副标题：按等级、技术项和问题类型筛选适合你的网球学习内容

2. 搜索框
   - 支持关键词搜索

3. 筛选区
   - 等级：3.0 / 3.5 / 4.0
   - 技术：正手 / 反手 / 发球 / 网前 / 步伐 / 战术
   - 平台：YouTube / 小红书 / 知乎 / Instagram
   - 语言：中文 / 英文
   - 类型：视频 / 图文 / 文章

4. 内容卡片列表
   每张卡片显示：
   - 标题
   - 平台
   - 博主名
   - 适合等级
   - 技术标签
   - 推荐理由
   - 查看按钮
   - 收藏按钮（假交互即可）

逻辑：
- 支持 query 参数初始化筛选
- 支持关键词 + 多筛选组合
- 点击查看可先打开外链占位，或弹出一个简单详情层
- 无结果时显示空状态和“清空筛选”

【页面 6：博主榜页 `/rankings`】

目标：
- 让用户按等级、技术方向、语言找到合适的教学博主

模块：
1. 页面标题区
   - 标题：教学博主榜
   - 副标题：按等级、技术方向和语言寻找更适合你的博主

2. 榜单切换
   - 国内博主
   - 国外博主

3. 筛选区
   - 适合等级：3.0 / 3.5 / 4.0
   - 擅长方向：发球 / 正手 / 反手 / 双打 / 战术
   - 语言：中文 / 英文
   - 风格：新手友好 / 讲解清晰 / 实战导向

4. 博主卡片列表
   每张卡片显示：
   - 头像占位
   - 名字
   - 平台
   - 擅长方向
   - 适合等级
   - 简介
   - 推荐视频数量
   - 按钮：查看详情 / 查看推荐内容

5. 详情弹层或抽屉
   点击“查看详情”后展示：
   - 博主简介
   - 适合谁
   - 推荐先看哪几条
   - 外链主页按钮

逻辑：
- 默认显示全部或编辑推荐
- 支持筛选
- 点击“查看推荐内容”跳转 `/library?creator=xxx`
- 点击“前往主页”可用 placeholder 链接

【页面 7：训练计划页 `/plan`】

目标：
- 基于评估结果或诊断结果生成 7 天训练计划

模块：
1. 标题区
   - 标题：你的 7 天提升计划
   - 副标题：根据你的问题自动生成练习路径

2. 问题摘要区
   - 当前等级
   - 当前核心问题
   - 当前训练目标

3. 7 天计划列表
   每天一张卡片：
   - Day 1–Day 7
   - 当天重点
   - 推荐内容
   - 练习动作
   - 建议时长

4. 操作区
   - 保存计划（假交互）
   - 重新生成
   - 返回诊断

逻辑：
- 从诊断页或评估页带参数进入
- 若无来源数据，显示空状态并引导去 `/assessment` 或 `/diagnose`
- 先用模板化规则生成 7 天计划

六、数据层要求

请创建本地 mock 数据文件，建议使用 `/src/data/` 目录，至少包括：

1. `assessmentQuestions.ts`
   - 问卷题目
   - 选项
   - 分数
   - 维度

2. `contents.ts`
   字段建议：
   - id
   - title
   - platform
   - creatorId
   - levels
   - skills
   - tags
   - language
   - type
   - summary
   - reason
   - url

3. `creators.ts`
   字段建议：
   - id
   - name
   - region
   - platforms
   - levels
   - specialties
   - styleTags
   - bio
   - featuredContentIds
   - profileUrl

4. `diagnosisRules.ts`
   字段建议：
   - id
   - keywords
   - category
   - causes
   - fixes
   - recommendedContentIds
   - drills
   - problemTag

5. `planTemplates.ts`
   字段建议：
   - problemTag
   - level
   - days: [{ day, focus, contentIds, drills, duration }]

七、推荐目录结构

请按类似方式组织：

/src
  /app
    /page.tsx
    /assessment/page.tsx
    /assessment/result/page.tsx
    /diagnose/page.tsx
    /library/page.tsx
    /rankings/page.tsx
    /plan/page.tsx
  /components
    /layout
      Header.tsx
      Footer.tsx
      PageContainer.tsx
    /ui
      Button.tsx
      Card.tsx
      Badge.tsx
      Input.tsx
      Textarea.tsx
      Progress.tsx
      Tabs.tsx
      Modal.tsx
    /home
      HeroSection.tsx
      QuickEntrySection.tsx
      ProblemTagsSection.tsx
      HotContentSection.tsx
      HotCreatorsSection.tsx
    /assessment
      QuestionCard.tsx
      AssessmentProgress.tsx
      ResultSummary.tsx
      SkillBreakdown.tsx
    /diagnose
      DiagnoseInput.tsx
      DiagnoseResult.tsx
      DrillSuggestions.tsx
    /library
      LibraryFilters.tsx
      ContentCard.tsx
    /rankings
      CreatorCard.tsx
      CreatorDetailModal.tsx
    /plan
      PlanSummary.tsx
      DayPlanCard.tsx
  /data
    assessmentQuestions.ts
    contents.ts
    creators.ts
    diagnosisRules.ts
    planTemplates.ts
  /lib
    assessment.ts
    diagnosis.ts
    plans.ts
    utils.ts
  /types
    assessment.ts
    content.ts
    creator.ts
    diagnosis.ts
    plan.ts

八、业务逻辑要求

1. 评估逻辑
请在 `/src/lib/assessment.ts` 中封装：
- 统计总分
- 统计各维度分数
- 输出参考等级
- 输出主要短板

2. 诊断逻辑
请在 `/src/lib/diagnosis.ts` 中封装：
- 输入文本标准化
- 基于关键词匹配规则
- 输出诊断结果
- 无匹配时返回兜底结果

3. 训练计划逻辑
请在 `/src/lib/plans.ts` 中封装：
- 根据 problemTag 和 level 获取计划模板
- 无模板时返回默认模板

九、UI 和视觉要求

整体风格：
- 简洁
- 干净
- 有运动感
- 但不要太花哨

建议：
- 大量留白
- 卡片式布局
- 主要颜色可以偏蓝 / 绿色系，但不要写死复杂主题
- 字体和排版清晰
- 移动端下按钮、标签、卡片都要可点击

十、状态要求

请处理以下状态：
- 加载状态（可简单）
- 空状态
- 无匹配状态
- 本地数据缺失时的兜底状态
- 页面直接访问时无来源数据的跳转或提示

十一、实现范围边界

请不要做以下内容：
- 不接真实后端
- 不接 Supabase / Firebase / Prisma
- 不接真实 OpenAI / AI API
- 不接真实登录
- 不做支付
- 不做评论区
- 不做社区
- 不做复杂动画
- 不做国际化
- 不做 CMS 后台

十二、验收标准

完成后，请保证：
1. 7 个页面都能访问
2. 顶部导航可跳转
3. 首页可进入两条主流程
4. 评估页能完整做题并得到结果
5. 结果页能展示分项能力和下一步按钮
6. 诊断页能根据输入返回结构化结果
7. 内容库可搜索和筛选
8. 博主榜可筛选并查看详情弹层
9. 训练计划页能根据问题标签展示 7 天模板
10. 所有页面在桌面和移动端都基本可用
11. 所有数据都来自本地 mock 文件，方便后续人工替换

十三、输出要求

请直接输出完整可运行的 Next.js 项目代码，不要只给方案。
要求：
- 代码文件尽量完整
- 每个页面都有基础样式
- mock 数据要带一些中文 placeholder 示例
- 不需要写测试
- 在项目根目录补充一个 README，说明如何启动项目、数据放在哪、后续如何替换 placeholder 内容
- 再补充一个 `CONTENT_EDIT_GUIDE.md`，专门告诉我后续如何替换：
  - 博主名称
  - 博主介绍
  - 视频标题
  - 视频链接
  - 推荐理由
  - 诊断规则
  - 训练计划模板

补充要求：
1. 所有 mock 数据尽量用独立文件维护，不要把内容硬编码在页面里
2. 页面间传值尽量简单，优先使用 URL 参数、本地状态或 localStorage
3. 代码以“方便后续人工维护内容”为第一原则
4. 先把框架和内容占位跑通，不要过度工程化
5. 所有文案先中文
6. 组件命名清晰，避免抽象过度
7. 结果页、诊断页、计划页都要有兜底状态

请基于以下原则组织 mock 数据：
1. creators.ts、contents.ts、diagnosisRules.ts、planTemplates.ts 独立维护
2. 先做中文社区版本
3. creators.ts 中优先放 6-10 位中文博主 placeholder
4. contents.ts 中优先放 20-30 条中文内容 placeholder
5. diagnosisRules.ts 先覆盖 20 个高频问题
6. planTemplates.ts 先覆盖 5 个问题模板
7. 内容推荐逻辑优先使用 diagnosisRules.ts 中的 recommendedContentIds
8. 所有链接先允许 placeholder，后续我会人工替换
9. 页面上不要把内容写死，必须从 mock 数据读取
10. 页面要便于我后续加英文社区内容

请从项目初始化、目录结构、页面代码、组件代码、mock 数据、工具函数开始，直接生成。