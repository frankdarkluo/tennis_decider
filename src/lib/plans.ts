import { planTemplates } from "@/data/planTemplates";
import { DayPlan, GeneratedPlan, PlanLevel, PlanTemplate } from "@/types/plan";

type PlanLocale = "zh" | "en";

const defaultDaysZh = [1, 2, 3, 4, 5, 6, 7].map((day) => ({
  day,
  focus: `Day ${day} 稳定性训练`,
  contentIds: [],
  drills: ["基础挥拍 20 次", "稳定过网练习 20 球"],
  duration: "20 分钟"
}));

const defaultDaysEn = [1, 2, 3, 4, 5, 6, 7].map((day) => ({
  day,
  focus: `Day ${day} stability training`,
  contentIds: [],
  drills: ["20 basic swing reps", "20 target shots — focus on clearing the net"],
  duration: "20 minutes"
}));

function toGenerated(template: PlanTemplate, locale: PlanLocale): GeneratedPlan {
  const isEn = locale === "en";

  return {
    source: "template",
    level: template.level,
    problemTag: template.problemTag,
    title: isEn ? template.titleEn : template.title,
    target: isEn ? template.targetEn : template.target,
    days: template.days.map<DayPlan>((day) => ({
      day: day.day,
      focus: isEn ? day.focusEn : day.focus,
      contentIds: day.contentIds,
      drills: isEn ? day.drillsEn : day.drills,
      duration: isEn ? day.durationEn : day.duration
    }))
  };
}

function normalizePlanLevel(level: PlanLevel): PlanTemplate["level"] {
  if (level === "2.5") {
    return "3.0";
  }

  if (level === "4.0+") {
    return "4.0";
  }

  return level;
}

export function getPlanTemplate(problemTag: string, level: PlanLevel, locale: PlanLocale = "zh"): GeneratedPlan {
  const templateLevel = normalizePlanLevel(level);
  const exact = planTemplates.find((item) => item.problemTag === problemTag && item.level === templateLevel);
  if (exact) {
    return {
      ...toGenerated(exact, locale),
      level
    };
  }

  const sameTag = planTemplates.find((item) => item.problemTag === problemTag);
  if (sameTag) {
    return {
      ...toGenerated(sameTag, locale),
      level
    };
  }

  const defaultDays = locale === "en" ? defaultDaysEn : defaultDaysZh;

  return {
    source: "fallback",
    level,
    problemTag,
    title: locale === "en" ? "7-day general improvement plan" : "通用 7 天基础提升计划",
    target: locale === "en"
      ? "Build a steady swing and a practical training rhythm within one week"
      : "在一周内建立稳定击球与可执行训练节奏",
    summary: locale === "en"
      ? "Not enough context to customize yet. Starting with a general, actionable 7-day training rhythm."
      : "当前上下文不足，先使用一份通用且可执行的 7 天训练节奏。",
    days: defaultDays
  };
}

const DIMENSION_TO_PROBLEM_TAG: Record<string, string> = {
  "正手": "forehand-out",
  "反手": "backhand-into-net",
  "发球": "second-serve-confidence",
  "网前": "net-confidence",
  "移动": "late-contact",
  "比赛意识": "match-anxiety",
  // English dimension labels
  "forehand": "forehand-out",
  "backhand": "backhand-into-net",
  "serve": "second-serve-confidence",
  "net play": "net-confidence",
  "movement": "late-contact",
  "match play": "match-anxiety",
  "match awareness": "match-anxiety"
};

export function getPlanFromDiagnosis(input: {
  level?: PlanLevel;
  problemTag?: string;
  title?: string;
  fixes?: string[];
  locale?: PlanLocale;
}): GeneratedPlan {
  const level = input.level ?? "3.5";
  const locale = input.locale ?? "zh";
  const problemTag = input.problemTag ?? "general-improvement";
  const base = getPlanTemplate(problemTag, level, locale);

  if (locale === "en") {
    return {
      ...base,
      title: input.title ? `${input.title}: 7-day improvement plan` : base.title,
      target: input.fixes?.[0] ? `Focus on "${input.fixes[0]}" and build a consistent 7-day training rhythm.` : base.target,
      summary: "This plan is built around your primary issue. Focus on execution over the week — do not try to fix everything at once."
    };
  }

  return {
    ...base,
    title: input.title ? `${input.title}：7 天提升计划` : base.title,
    target: input.fixes?.[0] ? `先围绕"${input.fixes[0]}"建立连续 7 天的小步训练。` : base.target,
    summary: "这份计划围绕你当前最主要的问题设计，先追求连续执行，不求一次改完。"
  };
}

export function getPlanFromAssessment(input: {
  level?: PlanLevel;
  weaknesses?: string[];
  observationNeeded?: string[];
  locale?: PlanLocale;
}): GeneratedPlan {
  const level = input.level ?? "3.5";
  const locale = input.locale ?? "zh";
  const mapped =
    (input.weaknesses?.[0] && DIMENSION_TO_PROBLEM_TAG[input.weaknesses[0]]) ||
    (input.observationNeeded?.[0] && DIMENSION_TO_PROBLEM_TAG[input.observationNeeded[0]]) ||
    "general-improvement";

  const base = getPlanTemplate(mapped, level, locale);

  if (locale === "en") {
    return {
      ...base,
      summary: input.observationNeeded?.length
        ? `The plan will shore up weak spots first, with ${input.observationNeeded.join(" and ")} as watch areas.`
        : "The plan focuses on the weakest areas from the assessment to build training rhythm."
    };
  }

  return {
    ...base,
    summary: input.observationNeeded?.length
      ? `计划会先补强短板，同时把 ${input.observationNeeded.join("、")} 作为待观察维度。`
      : "计划会优先围绕评估中的相对短板建立训练节奏。"
  };
}

export function getPlanPreviewTags(locale: PlanLocale = "zh"): string[] {
  if (locale === "en") {
    return ["Backhand into the net", "No confidence on second serve", "Forehand keeps going out", "Match nerves", "Not sure what to practise"];
  }

  return ["反手总下网", "二发没信心", "正手总出界", "比赛容易紧张", "不会自己练"];
}
