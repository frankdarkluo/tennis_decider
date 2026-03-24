import { planTemplates } from "@/data/planTemplates";
import { GeneratedPlan, PlanTemplate } from "@/types/plan";

const defaultDays = [1, 2, 3, 4, 5, 6, 7].map((day) => ({
  day,
  focus: `Day ${day} 稳定性训练`,
  contentIds: [],
  drills: ["基础挥拍 20 次", "稳定过网练习 20 球"],
  duration: "20 分钟"
}));

function toGenerated(template: PlanTemplate): GeneratedPlan {
  return {
    source: "template",
    level: template.level,
    problemTag: template.problemTag,
    title: template.title,
    target: template.target,
    days: template.days
  };
}

export function getPlanTemplate(problemTag: string, level: "3.0" | "3.5" | "4.0"): GeneratedPlan {
  const exact = planTemplates.find((item) => item.problemTag === problemTag && item.level === level);
  if (exact) {
    return toGenerated(exact);
  }

  const sameTag = planTemplates.find((item) => item.problemTag === problemTag);
  if (sameTag) {
    return toGenerated(sameTag);
  }

  return {
    source: "fallback",
    level,
    problemTag,
    title: "通用 7 天基础提升计划",
    target: "在一周内建立稳定击球与可执行训练节奏",
    summary: "当前上下文不足，先使用一份通用且可执行的 7 天训练节奏。",
    days: defaultDays
  };
}

const DIMENSION_TO_PROBLEM_TAG: Record<string, string> = {
  正手: "forehand-out",
  反手: "backhand-into-net",
  发球: "second-serve-confidence",
  网前: "net-confidence",
  移动: "late-contact",
  比赛意识: "match-anxiety"
};

export function getPlanFromDiagnosis(input: {
  level?: "3.0" | "3.5" | "4.0";
  problemTag?: string;
  title?: string;
  fixes?: string[];
}): GeneratedPlan {
  const level = input.level ?? "3.5";
  const problemTag = input.problemTag ?? "general-improvement";
  const base = getPlanTemplate(problemTag, level);

  return {
    ...base,
    title: input.title ? `${input.title}：7 天提升计划` : base.title,
    target: input.fixes?.[0] ? `先围绕“${input.fixes[0]}”建立连续 7 天的小步训练。` : base.target,
    summary: "这份计划围绕你当前最主要的问题设计，先追求连续执行，不求一次改完。"
  };
}

export function getPlanFromAssessment(input: {
  level?: "3.0" | "3.5" | "4.0";
  weaknesses?: string[];
  observationNeeded?: string[];
}): GeneratedPlan {
  const level = input.level ?? "3.5";
  const mapped =
    (input.weaknesses?.[0] && DIMENSION_TO_PROBLEM_TAG[input.weaknesses[0]]) ||
    (input.observationNeeded?.[0] && DIMENSION_TO_PROBLEM_TAG[input.observationNeeded[0]]) ||
    "general-improvement";

  const base = getPlanTemplate(mapped, level);
  return {
    ...base,
    summary: input.observationNeeded?.length
      ? `计划会先补强短板，同时把 ${input.observationNeeded.join("、")} 作为待观察维度。`
      : "计划会优先围绕评估中的相对短板建立训练节奏。"
  };
}

export function getPlanPreviewTags(): string[] {
  return ["反手总下网", "二发没信心", "正手总出界", "比赛容易紧张", "不会自己练"];
}
