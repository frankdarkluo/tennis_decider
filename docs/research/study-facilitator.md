---
aliases:
  - Study Facilitator Checklist
tags:
  - type/research
  - area/study
  - status/checklist
---

1. what changed  
- 无代码改动。  
- 我给你整理一份可直接口头引导参与者的“开始前检查清单”。

## Related docs
- [[index]]
- [[research/study-mode]]
- [[research/study-snapshot]]
- [[weekly/project-progress-summary]]

2. files touched  
- 无。

3. tests added or updated  
- 无。

4. verification performed  
- 无需验证；这是研究执行流程说明。

5. remaining risks or ambiguities  
- 参与者不熟悉流程很正常，所以你最好用统一口径引导。  
- 关键不是讲太多，而是确保他们：
  - 用对链接
  - 输入对编号
  - 知道要完成哪几步
  - 不在中途乱切窗口或换浏览器

6. recommended next reasoning effort  
Recommended next effort: low  
Why: 现在最重要的是稳定执行正式收数。

你可以直接照这个引导，每位参与者开始前都过一遍。

**参与者开始前检查清单**

1. 打开正确链接  
让参与者打开：

```text
https://tennis-decider.vercel.app/study/start
```

2. 使用新的无痕窗口  
你可以直接说：  
“请用一个新的无痕/隐私窗口打开，这样不会带上前一个人的测试记录。”

3. 确认 participant 编号  
你提前告诉对方他的编号，比如：

- `P001`
- `P002`
- `P003`

并提醒：  
“请准确输入这个编号，不要自己改格式。”

4. 确认语言  
让参与者选自己要测试的语言：
- 中文就选 `ZH`
- 英文就选 `EN`

5. 填写背景信息  
告诉他：  
“这部分只是匿名背景信息，用来研究分析，没有姓名和联系方式。”

6. 勾选同意并开始  
提醒他一定要点：
- 同意
- 开始测试

---

**测试过程中你要怎么引导**

你可以这样说：

“这次测试没有标准答案，你就按真实想法使用就好。”  
“如果哪里不明白，可以问我，但我不会告诉你应该点哪里，除非你卡住。”  
“请尽量按你的自然方式完成任务。”  
“每一步做完后继续往下，不要提前退出页面。”

---

**你要提醒参与者完成的核心任务**

你可以用很简单的话说：

1. 先进入系统并完成开始页  
2. 完成一次水平评估  
3. 看结果后继续做下一步探索  
4. 试着诊断一个具体问题  
5. 看推荐内容 / 博主 / 训练计划  
6. 最后完成问卷

---

**每位参与者开始后，你自己要立刻检查**

在 Supabase 看有没有新记录：

1. `study_participants`
2. `study_sessions`
3. `event_logs`

最少先确认这两条：
- 有新的 `participant_id`
- 有新的 `session_id`

---

**你现场最推荐的话术**

你可以直接念这个简版：

“你好，这次测试大概几分钟到十几分钟。”  
“请先用无痕窗口打开这个链接。”  
“输入你的参与者编号，不要改格式。”  
“按你的真实想法使用，不需要做对，只需要自然完成。”  
“如果你卡住可以告诉我，但我尽量不会提示你具体怎么做。”  
“做到最后请把问卷也完成。”

如果你愿意，我下一条可以继续给你：
- 一份“主持人现场引导稿”
- 一份“每位参与者结束后你要马上核对的数据清单”
