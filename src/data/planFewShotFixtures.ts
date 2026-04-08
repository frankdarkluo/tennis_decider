import type { PlanLevel } from "@/types/plan";
import type { EnrichedDiagnosisContext } from "@/types/enrichedDiagnosis";

type PlanFixtureDayExpectation = {
  day: number;
  goalIncludes: string;
  focusIncludes?: string;
  mainIncludes?: string;
  pressureIncludes?: string;
  successIncludes?: string;
  goalExcludes?: string;
  mainExcludes?: string;
  pressureExcludes?: string;
  successExcludes?: string;
};

type PlanFewShotFixture = {
  id: string;
  locale: "zh" | "en";
  problemTag: string;
  level: PlanLevel;
  diagnosisInput: string;
  primaryNextStep: string;
  summaryIncludes?: string;
  deepContext?: EnrichedDiagnosisContext;
  dayExpectations: PlanFixtureDayExpectation[];
};

export const planFewShotFixtures: PlanFewShotFixture[] = [
  {
    id: "serve_second_pressure_tight",
    locale: "zh",
    problemTag: "second-serve-reliability",
    level: "3.5",
    diagnosisInput: "比赛里关键分时我原地的二发容易下网，而且会发紧。",
    primaryNextStep: "先建立安全二发节奏",
    summaryIncludes: "关键分场景",
    deepContext: {
      mode: "deep",
      sourceInput: "关键分时我的二发容易下网",
      sceneSummaryZh: "比赛里我的原地二发容易下网，而且会发紧。",
      sceneSummaryEn: "In matches my stationary second serve keeps going into the net and it feels tight.",
      skillCategory: "serve",
      skillCategoryConfidence: "high",
      problemTag: "second-serve-reliability",
      level: "3.5",
      strokeFamily: "serve",
      serveSubtype: "second_serve",
      sessionType: "match",
      pressureContext: "key_points",
      movement: "stationary",
      outcome: "net",
      incomingBallDepth: "unknown",
      subjectiveFeeling: "tight",
      unresolvedRequiredSlots: [],
      stoppedByCap: false,
      isDeepModeReady: true
    },
    dayExpectations: [
      {
        day: 4,
        goalIncludes: "节奏",
        mainIncludes: "发紧",
        pressureIncludes: "发紧",
        goalExcludes: "复盘",
        mainExcludes: "录像",
        successExcludes: "提示词"
      },
      {
        day: 5,
        goalIncludes: "压力",
        mainIncludes: "关键分",
        pressureIncludes: "关键分",
        successIncludes: "可打的发球",
        pressureExcludes: "中性重复"
      },
      {
        day: 6,
        goalIncludes: "得分片段",
        mainIncludes: "下一拍",
        pressureIncludes: "下一拍",
        successIncludes: "下一拍片段",
        goalExcludes: "比赛",
        successExcludes: "完整训练"
      },
      {
        day: 7,
        goalIncludes: "带入下一周",
        mainIncludes: "计分二发",
        successIncludes: "规则",
        pressureExcludes: "关键分式的比赛化收口",
        successExcludes: "关键分里也要维持同一套动作流程"
      }
    ]
  },
  {
    id: "running_backhand_deep_ball",
    locale: "zh",
    problemTag: "running-backhand",
    level: "3.5",
    diagnosisInput: "比赛里我跑动中的反手老下网，尤其对手球比较深的时候更明显。",
    primaryNextStep: "先把跑动中的击球点放到身体前面",
    summaryIncludes: "跑动中、深球条件下",
    dayExpectations: [
      { day: 4, goalIncludes: "复盘" },
      { day: 5, goalIncludes: "压力" },
      { day: 6, goalIncludes: "转移", pressureIncludes: "更深", successIncludes: "比赛" },
      { day: 7, goalIncludes: "巩固" }
    ]
  },
  {
    id: "pressure_tightness_match_case",
    locale: "zh",
    problemTag: "pressure-tightness",
    level: "4.0",
    diagnosisInput: "比赛里一到关键分我就手紧，动作会变形。",
    primaryNextStep: "关键分先把注意力放回一个最稳的动作",
    summaryIncludes: "关键分比赛场景",
    dayExpectations: [
      { day: 4, goalIncludes: "复盘" },
      { day: 5, goalIncludes: "压力", pressureIncludes: "关键分" },
      { day: 6, goalIncludes: "比赛", successIncludes: "比赛" },
      { day: 7, goalIncludes: "巩固", pressureIncludes: "关键分", successIncludes: "关键分" }
    ]
  },
  {
    id: "volley_floating_net_case",
    locale: "zh",
    problemTag: "volley-floating",
    level: "3.0",
    diagnosisInput: "双打里我网前截击老冒高。",
    primaryNextStep: "先缩小截击动作并稳住拍面",
    dayExpectations: [
      { day: 4, goalIncludes: "复盘" },
      { day: 5, goalIncludes: "压力" },
      { day: 6, goalIncludes: "转移" },
      { day: 7, goalIncludes: "巩固" }
    ]
  }
];
