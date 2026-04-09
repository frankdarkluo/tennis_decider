import { PLAN_MICROCYCLE_ROLES } from "@/data/planBlueprints";
import { withDeterministicDayContract, withPlanDayContract, type PlanLocale } from "@/lib/plan-core/baseSkeleton";
import { buildSceneDayOverlay } from "@/lib/plan-core/categoryModules";
import { buildSceneSpecificSummary } from "@/lib/plan-core/rationale";
import type { EnrichedDiagnosisContext } from "@/types/enrichedDiagnosis";
import type { GeneratedPlan, PlanContext } from "@/types/plan";

export function applySceneOverlay(
  plan: GeneratedPlan,
  locale: PlanLocale,
  options: {
    problemTag: string;
    planContext: PlanContext | null;
    deepContext?: EnrichedDiagnosisContext | null;
    primaryNextStep?: string;
  }
): GeneratedPlan {
  const overlayedPlan = {
    ...plan,
    summary: buildSceneSpecificSummary(plan.summary, locale, options.planContext, options.deepContext),
    days: plan.days.map((day) => {
      const role = PLAN_MICROCYCLE_ROLES.find((entry) => entry.day === day.day)?.role;
      if (!role) {
        return withDeterministicDayContract(day, locale);
      }

      const overlay = buildSceneDayOverlay({
        problemTag: options.problemTag,
        locale,
        role,
        day,
        planContext: options.planContext,
        deepContext: options.deepContext,
        primaryNextStep: options.primaryNextStep
      });

      if (!overlay) {
        return withDeterministicDayContract(day, locale);
      }

      return withDeterministicDayContract({
        ...day,
        focus: overlay.focus,
        goal: overlay.goal,
        warmupBlock: { ...day.warmupBlock, items: overlay.warmup },
        mainBlock: { ...day.mainBlock, items: overlay.main },
        pressureBlock: { ...day.pressureBlock, items: overlay.pressure },
        successCriteria: overlay.success,
        failureCue: overlay.failureCue,
        progressionNote: overlay.progressionNote,
        transferCue: overlay.transferCue,
        intensity: overlay.intensity,
        tempo: overlay.tempo
      }, locale);
    })
  };

  return withPlanDayContract(overlayedPlan, locale);
}
