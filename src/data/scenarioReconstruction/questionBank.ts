import type { ScenarioQuestion } from "@/types/scenario";

export const scenarioQuestionBank: ScenarioQuestion[] = [
  {
    id: "q_match_or_practice",
    category: "scenario_localization",
    target_slots: ["context.session_type"],
    priority: 100,
    zh: "这个问题更多出现在练习里，还是比赛里？",
    en: "Does this happen more in practice or in matches?",
    ask_when: ["context.session_type is missing"],
    do_not_ask_when: ["context.session_type is already known"],
    information_gain_weight: 1,
    presupposition_risk: 0.1,
    easy_to_answer_score: 0.95,
    options: [
      { key: "practice", zh: "练习", en: "Practice" },
      { key: "match", zh: "比赛", en: "Matches" },
      { key: "both", zh: "都有", en: "Both" },
      { key: "unknown", zh: "不确定", en: "Not sure" }
    ]
  },
  {
    id: "q_movement_state",
    category: "scenario_localization",
    target_slots: ["context.movement"],
    priority: 90,
    zh: "这更像是原地打的时候，还是跑动中更容易出问题？",
    en: "Is this more of a problem when you are set, or when you are moving?",
    ask_when: ["context.session_type is known", "context.movement is missing"],
    do_not_ask_when: ["context.movement is already known"],
    information_gain_weight: 0.95,
    presupposition_risk: 0.15,
    easy_to_answer_score: 0.9,
    options: [
      { key: "stationary", zh: "原地更明显", en: "Mostly when set" },
      { key: "moving", zh: "跑动中更明显", en: "Mostly when moving" },
      { key: "both", zh: "都差不多", en: "About the same" }
    ]
  },
  {
    id: "q_outcome_pattern",
    category: "outcome_clarification",
    target_slots: ["outcome.primary_error"],
    priority: 80,
    zh: "更常见的结果是哪种：下网、出界，还是没力量/不受控？",
    en: "What is the more typical outcome: into the net, long, or weak/out of control?",
    ask_when: ["outcome.primary_error is missing"],
    do_not_ask_when: ["outcome.primary_error is already known"],
    information_gain_weight: 0.92,
    presupposition_risk: 0.18,
    easy_to_answer_score: 0.88,
    options: [
      { key: "net", zh: "下网", en: "Into the net" },
      { key: "long", zh: "出界偏长", en: "Long" },
      { key: "weak", zh: "没力量", en: "Weak" },
      { key: "no_control", zh: "不太受控", en: "Out of control" }
    ]
  },
  {
    id: "q_incoming_ball_depth",
    category: "scenario_localization",
    target_slots: ["incoming_ball.depth"],
    priority: 70,
    zh: "这个问题更常出现在对手球比较深的时候吗？",
    en: "Does this happen more when the incoming ball is deeper?",
    ask_when: ["core scene is mostly known", "incoming_ball.depth is missing"],
    do_not_ask_when: ["incoming_ball.depth is already known"],
    information_gain_weight: 0.8,
    presupposition_risk: 0.28,
    easy_to_answer_score: 0.82,
    options: [
      { key: "deep", zh: "深球更明显", en: "More on deep balls" },
      { key: "mid", zh: "中等来球也会", en: "Also on medium balls" },
      { key: "short", zh: "短球时也会", en: "Also on short balls" },
      { key: "unknown", zh: "说不准", en: "Hard to tell" }
    ]
  },
  {
    id: "q_feeling_rushed_or_tight",
    category: "subjective_experience",
    target_slots: ["subjective_feeling.rushed"],
    priority: 60,
    zh: "出问题时更像是被催急了，还是身体发紧？",
    en: "When this happens, does it feel more rushed or more tight?",
    ask_when: ["core scene is known", "subjective feeling is still helpful"],
    do_not_ask_when: ["the same feeling is already grounded"],
    information_gain_weight: 0.55,
    presupposition_risk: 0.22,
    easy_to_answer_score: 0.84,
    options: [
      { key: "rushed", zh: "更像来不及", en: "More rushed" },
      { key: "tight", zh: "更像发紧", en: "More tight" },
      { key: "neither", zh: "都不太像", en: "Neither" }
    ]
  }
];
