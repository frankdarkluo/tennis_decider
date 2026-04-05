We need to upgrade the training-plan system so that “deep mode” actually produces a deeper, more scenario-specific, more progressive 7-day plan.

High-level product goal
- Standard mode stays lightweight.
- Deep mode should mean:
  1. the user explicitly enters a scenario reconstruction flow
  2. the system collects more structured context
  3. the generated 7-day plan becomes materially more specific and more progressive
- Deep mode must not just produce longer wording. It must change plan structure, daily focus, pressure rules, success criteria, and progression.

Important architectural observation
Right now, richer scene information is not being fully preserved into the plan layer.
The current plan pipeline mainly revolves around:
- problemTag
- level
- preferredContentIds
- sourceType
- primaryNextStep

That is not enough for deep mode.
We need a deterministic deep-plan context object.

Constraints
- Do not replace the current plan system with an open-ended runtime LLM plan generator.
- Keep plan generation deterministic and testable.
- Reuse the existing template/fallback pipeline as a base when useful, but do not let deep mode collapse back into generic late-week repetition.
- Prefer root-cause improvements over patchy phrasing changes.
- Keep the existing architecture unless small refactors clearly improve correctness and maintainability.

Primary implementation target
Introduce a “deep plan context” layer that sits between scenario reconstruction / diagnosis and the 7-day plan generator.

What to build

A. Add an explicit deep mode concept
1. In the diagnose experience, expose:
   - Standard mode
   - Deep mode
2. Deep mode entry should clearly tell the user they are entering a more detailed scenario reconstruction path.
3. Deep mode should ultimately produce a deep-plan-ready context object, not just a text query.

Suggested user-facing wording
ZH:
- 深入模式
- 进入场景还原模式
- 这会多花一点时间，但能生成更具体的训练计划
EN:
- Deep mode
- Enter scenario reconstruction mode
- This takes a little longer, but produces a more specific training plan

B. Introduce a deterministic PlanDeepContext type
Add a new type, e.g.:
- src/types/planDeepContext.ts
or extend plan types carefully

Suggested shape:
{
  mode: "standard" | "deep",
  sourceRoute: "diagnosis" | "scenario_reconstruction",
  sourceInput: string,
  sceneSummaryZh: string,
  sceneSummaryEn: string,

  problemTag: string,
  level: PlanLevel,

  strokeFamily: "forehand" | "backhand" | "serve" | "volley" | "overhead" | "general",
  serveSubtype?: "first_serve" | "second_serve",

  sessionType?: "practice" | "match",
  pressureContext?: "none" | "key_points" | "general_match_pressure",
  movement?: "stationary" | "moving",
  outcome?: "net" | "long" | "short" | "float" | "miss_in" | "double_fault",
  incomingBallDepth?: "shallow" | "medium" | "deep" | "unknown",
  subjectiveFeeling?: "tight" | "rushed" | "late" | "hesitant" | "low_confidence" | "awkward" | "unknown",

  isDeepModeReady: boolean
}

Requirements:
- This object must be deterministic
- It must be serializable
- It must be preserved from deep-mode handoff into the plan layer

C. Persist deep context into the plan pipeline
Current plan handoff is too thin.
We need the plan page / generator to receive deep context, not just problemTag and primaryNextStep.

Implement this minimally:
1. extend LocalStudyPlanDraft / normalized plan draft snapshot to optionally carry deepContext
2. when scenario reconstruction hands off into diagnosis and then into plan, preserve deepContext
3. when /plan loads, if deepContext exists, prefer deep-mode generation logic
4. if deepContext does not exist, preserve current behavior

Do NOT force a giant query-string payload into the URL if local draft storage is cleaner in this repo.

D. Build a deep-plan generation layer
Do not delete the existing template system.
Instead:
1. generate the current plan as a base
2. if deepContext exists and isDeepModeReady === true:
   - rewrite the plan into a scenario-specific 7-day progression
   - keep deterministic structure
   - keep content recommendation compatible with existing content IDs
   - but do not keep generic late-week blocks unchanged

Suggested new helper files
- src/lib/planDeepMode.ts
- src/lib/planProgression.ts
- src/lib/planContext.ts

Or equivalent minimal structure that fits the repo.

Deep-plan generation rules

1. Each deep plan must have a weekly narrative:
   - what exact scene we are trying to improve
   - what the main mechanical or execution bottleneck is
   - what progression the week follows

2. Each day must do real work in the progression ladder:
   Day 1: establish baseline / clean contact / stable pattern
   Day 2: stabilize the same pattern with clearer constraints
   Day 3: add the key scene variable
   Day 4: add movement or timing variability
   Day 5: add score / pressure / consequence
   Day 6: transfer into realistic sequence or point fragment
   Day 7: consolidate + evaluate + carry forward one next-week rule

3. Later days must not decay into generic “review template” filler.
4. The scenario-specific variables must show up in the plan body:
   - deep incoming balls
   - key-point pressure
   - second serve
   - running contact
   - tightness / rushing
5. Success criteria must evolve by day, not stay flat.
6. Pressure blocks must be scenario-specific.

E. Add progression dimensions explicitly
For each day, compute these progression knobs:
- complexity
- tempo
- movement demand
- decision demand
- pressure demand

Suggested progression pattern:
Day 1: low complexity, slow tempo, no decision pressure
Day 2: same scene, cleaner repetition, slightly stricter success rule
Day 3: add one key contextual variable
Day 4: add variability or movement
Day 5: add explicit pressure rule
Day 6: integrate into sequence / point fragment
Day 7: evaluate and define carry-forward rule

These progression knobs should materially alter:
- focus
- goal
- warmupBlock
- mainBlock
- pressureBlock
- successCriteria

F. Deep mode should override the weak current behavior
Current weak behavior to eliminate:
- only Day 1 reflects the primaryNextStep
- later days drift back to generic rhythm/review/fallback language

Instead, in deep mode:
- all 7 days must remain coupled to the reconstructed scene
- day-to-day change must be obvious and non-repetitive
- every day should answer: “why this day exists in the progression”

G. Scenario-aware plan rewrite families
Implement deterministic rewrite logic for at least these families:

1. Serve control family
   - generic serve
   - first serve long/out
   - second serve net / double-fault

2. Groundstroke depth / net-error family
   - forehand/backhand into net
   - especially on deeper incoming balls

3. Movement-timing family
   - running forehand / running backhand
   - late contact under movement pressure

4. Pressure-execution family
   - key-point tightening
   - pressure-related execution breakdown

These families should reuse shared scaffolding where possible.

H. UI changes on the plan page
When the plan is deep-mode-generated:
1. show a “Deep mode” badge
2. show a short “scene recap”
3. show a one-line weekly progression summary
   e.g.
   ZH:
   本周从“稳定动作”推进到“带压力下仍能完成同一场景”
   EN:
   This week progresses from stable execution to holding the same scene under pressure.

4. optionally show a compact “Why this plan is specific to your scenario” block

I. Keep runtime deterministic
Do not make the runtime generator call another LLM for the final 7-day plan.
Codex may use few-shot examples as implementation guidance and test fixtures, but production plan generation should remain deterministic.

Files likely to touch
- src/types/plan.ts
- new deep-context type file
- src/lib/plans.ts
- src/lib/study/localData.ts
- whichever page/component prepares the plan handoff
- /plan page rendering for deep-mode badges and scene recap
- possibly scenario handoff and diagnosis -> plan bridge

Acceptance criteria
This slice is done when:
1. deep mode actually produces a deeper plan, not just longer copy
2. the 7-day plan remains scene-specific through Day 7
3. late-week days show visible progression rather than generic repetition
4. serve / deep-ball / pressure / movement-specific contexts visibly alter the daily plan
5. standard mode behavior is preserved
6. deep mode remains deterministic and testable

Testing requirements
1. Add deterministic fixture-based tests for deep mode
2. Add at least 3 golden examples
3. Assert that deep-mode plans:
   - include scenario-specific language
   - include progression changes across days
   - do not flatten after Day 4
4. Keep browser smoke narrow; most verification should be unit-level and fixture-level

In addition, Few-shot examples：给 Codex 的“金标准样例”

这些不是让运行时用 LLM 生成，而是让 Codex 学习你希望的“深入版训练计划”长什么样，并最好把它们做成 fixture / regression tests。

Example 1：深球压迫下反手下网
Input deep context (JSON format)

{
  "mode": "deep",
  "problemTag": "backhand-into-net",
  "level": "3.5",
  "strokeFamily": "backhand",
  "sessionType": "match",
  "pressureContext": "general_match_pressure",
  "movement": "stationary",
  "outcome": "net",
  "incomingBallDepth": "deep",
  "subjectiveFeeling": "unknown",
  "sceneSummaryZh": "比赛里反手老下网，尤其对手压深的时候更明显",
  "sceneSummaryEn": "My backhand keeps going into the net in matches, especially on deeper balls"
}

Expected weekly progression
Day 1: 找到反手对深球的基本过网轨迹，不追求速度
Day 2: 保持同样反手过网轨迹，同时加入更明确的落点深度目标
Day 3: 专门加入“深球”变量，训练站位后撤和击球点管理
Day 4: 加入恢复步和下一拍准备，不再只是站桩反手
Day 5: 用 streak / score rule 做压力重复，要求连续 4 球过网且落深
Day 6: 进入“对手压深 → 你反手处理 → 回到中位”的序列练习
Day 7: 做一个 mini evaluation，总结下周继续保留的一条规则
What Codex should learn from this example
深球不是一句修饰语，而是 Day 3 以后必须成为核心变量
后几天不该回到通用“复盘模板”
Day 6 必须更接近真实回合片段

Example 2：关键分下一发容易出界
Input deep context

{
  "mode": "deep",
  "problemTag": "first-serve-in",
  "level": "3.5",
  "strokeFamily": "serve",
  "serveSubtype": "first_serve",
  "sessionType": "match",
  "pressureContext": "key_points",
  "movement": "stationary",
  "outcome": "long",
  "incomingBallDepth": "unknown",
  "subjectiveFeeling": "tight",
  "sceneSummaryZh": "关键分时我的一发容易出界，而且会发紧",
  "sceneSummaryEn": "My first serve tends to fly long on key points, and I get tight"
}

Expected weekly progression
Day 1: 建立一发更安全的进区弧线与目标区，不谈发力
Day 2: 固定抛球与击球节奏，减少“越想进越平”的问题
Day 3: 在不加压的前提下，把一发目标区命中率稳定下来
Day 4: 加入口令和呼吸，开始把“关键分发紧”显式纳入训练
Day 5: 做关键分一发模拟：例如 30-30 / deuce 才能发
Day 6: 做一发 + 下一拍的连续决策，不只是单颗发球
Day 7: 保留一个关键分发球流程模板，形成下周可继续执行的 routine
What Codex should learn
“关键分 + 发紧”不能只写到摘要里，必须影响 Day 4–7
后半周应该从技术稳定转向 压力执行

Example 3：关键分下二发容易下网
Input deep context

{
  "mode": "deep",
  "problemTag": "second-serve-reliability",
  "level": "3.5",
  "strokeFamily": "serve",
  "serveSubtype": "second_serve",
  "sessionType": "match",
  "pressureContext": "key_points",
  "movement": "stationary",
  "outcome": "net",
  "incomingBallDepth": "unknown",
  "subjectiveFeeling": "rushed",
  "sceneSummaryZh": "关键分时我的二发容易下网，感觉来不及",
  "sceneSummaryEn": "My second serve tends to go into the net on key points, and it feels rushed"
}

Expected weekly progression
Day 1: 二发过网与旋转安全感，目标是先过网再谈攻击性
Day 2: 固定二发节奏，消除“赶着把球推出去”的感觉
Day 3: 用更高的过网弧线和更稳定的目标区建立信心
Day 4: 加入关键分限定，但仍只做二发，不混一发
Day 5: 做“只能二发起分”的压力小局
Day 6: 做“关键分二发 + 接下一拍”的 mini pattern
Day 7: 总结一条“关键分二发保命规则”和一条“下周升级方向”
What Codex should learn
二发问题不能和一发模板混用
二发下网要优先围绕 clearance / spin / tempo / pressure routine
后半周必须有“关键分 + 二发”情境模拟

Example 4：跑动中正手老晚点
Input deep context

{
  "mode": "deep",
  "problemTag": "running-forehand",
  "level": "4.0",
  "strokeFamily": "forehand",
  "sessionType": "match",
  "pressureContext": "none",
  "movement": "moving",
  "outcome": "net",
  "incomingBallDepth": "deep",
  "subjectiveFeeling": "late",
  "sceneSummaryZh": "比赛里跑动中正手老晚点，尤其对手打得又深又开时更明显",
  "sceneSummaryEn": "My running forehand gets late in matches, especially when the ball is deep and wide"
}

Expected weekly progression
Day 1: 先建立 split-step + 第一启动步
Day 2: 加入跑动后的击球点管理，不只练脚步
Day 3: 专门加入“又深又开”的球路变量
Day 4: 加入 recovery step 和回中
Day 5: 做连续 2 球跑动正手，而不是单拍
Day 6: 做“被拉开 → 跑动正手 → 回到中位”的真实片段
Day 7: 测试在较快节奏下是否还能保持同一准备规则
What Codex should learn
跑动问题不该只变成 generic footwork plan
必须把 宽度 + 深度 + recovery 都写进 progression