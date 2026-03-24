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
    days: defaultDays
  };
}
