import type { ScenarioQuestion, ScenarioState } from "@/types/scenario";

export type ScenarioUiLanguage = "zh" | "en";

const scenarioUiCopy = {
  zh: {
    badge: "测试版",
    title: "场景还原诊断",
    subtitle: "先还原发生场景，再决定下一步该问什么。",
    helper: "这不是开放聊天，而是一条受约束的追问链路。",
    inputLabel: "先写一句你的问题",
    placeholder: "例如：比赛里我反手老下网，特别是对手压得比较深的时候",
    submit: "开始还原",
    submitting: "处理中...",
    reset: "重新开始",
    summary: "当前场景",
    summaryStroke: "击球",
    summarySession: "场景",
    summaryMovement: "移动",
    summaryOutcome: "结果",
    summaryDepth: "来球深度",
    summaryFeeling: "主观感觉",
    summaryMissing: "还缺这些信息",
    question: "下一步先问",
    questionDone: "当前场景已经足够进入后续分析。",
    questionDoneDetail: "仍有少量非关键字段未补全，但不影响继续诊断。",
    continueAnalysis: "进入后续分析",
    doneBackDiagnosis: "返回普通诊断",
    debug: "查看调试信息",
    debugSelected: "当前问题 ID",
    debugMissing: "缺失槽位",
    error: "请求失败，请稍后再试。",
    testingOnly: "该原型目前只在测试模式下开放",
    testingOnlyBody: "请在 testing 环境或研究会话中查看这个页面。",
    entryTitle: "场景还原测试版",
    entryBody: "先用固定问题库把模糊问题还原成一个最小可分析场景。",
    entryButton: "打开场景还原测试版",
    backDiagnose: "返回文字诊断"
  },
  en: {
    badge: "Prototype",
    title: "Scenario Reconstruction",
    subtitle: "Reconstruct the scene first, then decide the best next follow-up.",
    helper: "This is not open chat. It is a constrained follow-up flow.",
    inputLabel: "Start with one short problem description",
    placeholder: "For example: My backhand keeps going into the net in matches, especially on deeper balls",
    submit: "Start reconstruction",
    submitting: "Working...",
    reset: "Restart",
    summary: "Current scenario",
    summaryStroke: "Stroke",
    summarySession: "Context",
    summaryMovement: "Movement",
    summaryOutcome: "Outcome",
    summaryDepth: "Incoming depth",
    summaryFeeling: "Feeling",
    summaryMissing: "Still missing",
    question: "Ask this next",
    questionDone: "The scene is now concrete enough for downstream analysis.",
    questionDoneDetail: "Some non-critical fields may still be missing, but they do not block diagnosis.",
    continueAnalysis: "Continue to analysis",
    doneBackDiagnosis: "Back to diagnosis",
    debug: "Show debug info",
    debugSelected: "Selected question ID",
    debugMissing: "Missing slots",
    error: "Request failed. Please try again.",
    testingOnly: "This prototype is available only in testing mode",
    testingOnlyBody: "Open it from a testing environment or an active study session.",
    entryTitle: "Scenario Reconstruction Prototype",
    entryBody: "Use a fixed question bank to turn a vague complaint into a minimally analyzable scene.",
    entryButton: "Open the prototype",
    backDiagnose: "Back to text diagnosis"
  }
} as const;

const scenarioValueLabels: Record<string, { zh: string; en: string }> = {
  unknown: { zh: "未知", en: "Unknown" },
  backhand: { zh: "反手", en: "Backhand" },
  forehand: { zh: "正手", en: "Forehand" },
  serve: { zh: "发球", en: "Serve" },
  return: { zh: "接发", en: "Return" },
  volley: { zh: "截击", en: "Volley" },
  overhead: { zh: "高压", en: "Overhead" },
  practice: { zh: "练习", en: "Practice" },
  match: { zh: "比赛", en: "Matches" },
  both: { zh: "都有", en: "Both" },
  stationary: { zh: "原地", en: "Set" },
  moving: { zh: "跑动中", en: "Moving" },
  recovering: { zh: "回位中", en: "Recovering" },
  approaching_net: { zh: "上网中", en: "Approaching net" },
  net: { zh: "下网", en: "Into the net" },
  long: { zh: "出界偏长", en: "Long" },
  wide: { zh: "出界偏宽", en: "Wide" },
  weak: { zh: "偏软", en: "Weak" },
  late: { zh: "偏晚", en: "Late" },
  framed: { zh: "打框", en: "Framed" },
  no_power: { zh: "没力量", en: "No power" },
  no_control: { zh: "不受控", en: "No control" },
  short: { zh: "短球", en: "Short" },
  mid: { zh: "中等", en: "Medium" },
  deep: { zh: "深球", en: "Deep" },
  tight: { zh: "发紧", en: "Tight" },
  rushed: { zh: "来不及", en: "Rushed" },
  nervous: { zh: "紧张", en: "Nervous" }
};

const getCopy = (language: ScenarioUiLanguage) => scenarioUiCopy[language];

export function getScenarioUiText(
  key: keyof typeof scenarioUiCopy.zh,
  language: ScenarioUiLanguage
) {
  return getCopy(language)[key];
}

export function getScenarioValueLabel(value: string, language: ScenarioUiLanguage) {
  return (scenarioValueLabels[value] ?? scenarioValueLabels.unknown)[language];
}

export function getScenarioQuestionText(question: ScenarioQuestion, language: ScenarioUiLanguage) {
  return language === "en" ? question.en : question.zh;
}

export function getScenarioQuestionSecondaryText(question: ScenarioQuestion, language: ScenarioUiLanguage) {
  return language === "en" ? question.zh : question.en;
}

export function getScenarioQuestionOptionLabel(
  option: ScenarioQuestion["options"][number],
  language: ScenarioUiLanguage
) {
  return language === "en" ? option.en : option.zh;
}

export function getScenarioQuestionOptionSecondaryLabel(
  option: ScenarioQuestion["options"][number],
  language: ScenarioUiLanguage
) {
  return language === "en" ? option.zh : option.en;
}

export function getScenarioFeelingSummary(scenario: ScenarioState, language: ScenarioUiLanguage) {
  const feelings: string[] = [];

  if (scenario.subjective_feeling.tight) {
    feelings.push(getScenarioValueLabel("tight", language));
  }

  if (scenario.subjective_feeling.rushed) {
    feelings.push(getScenarioValueLabel("rushed", language));
  }

  if (scenario.subjective_feeling.nervous) {
    feelings.push(getScenarioValueLabel("nervous", language));
  }

  return feelings.length > 0 ? feelings.join(language === "en" ? ", " : "、") : getScenarioValueLabel("unknown", language);
}
