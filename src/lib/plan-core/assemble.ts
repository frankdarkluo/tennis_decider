import { buildBlueprintDays, buildBlueprintPlanFrame } from "@/lib/plan-core/blueprints";
import { applyBlueprintContentLinks } from "@/lib/plan-core/contentLinking";
import { withPlanDayContract } from "@/lib/plan-core/baseSkeleton";
import type { GeneratedPlan, PlanIntent } from "@/types/plan";

export function assemblePlanFromIntent(intent: PlanIntent): GeneratedPlan {
  const frame = buildBlueprintPlanFrame(intent);
  const isFallback = intent.source === "direct" && intent.primaryProblemTag === "unknown-problem";
  const basePlan: GeneratedPlan = {
    source: isFallback ? "fallback" : "template",
    level: intent.levelBand,
    problemTag: intent.primaryProblemTag,
    title: frame.title,
    target: frame.target,
    summary: frame.summary,
    days: buildBlueprintDays(intent)
  };

  return withPlanDayContract(applyBlueprintContentLinks(basePlan, intent), intent.locale);
}
