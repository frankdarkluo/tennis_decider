import type { EnrichedDiagnosisContext } from "@/types/enrichedDiagnosis";
import type { PlanContext } from "@/types/plan";
import type { PlanLocale } from "@/lib/plan-core/baseSkeleton";

export function buildSceneSpecificSummary(
  summary: string | undefined,
  locale: PlanLocale,
  planContext: PlanContext | null,
  deepContext?: EnrichedDiagnosisContext | null
): string | undefined {
  const base = summary?.trim();
  const sceneLabel = deepContext?.isDeepModeReady
    ? (locale === "en" ? deepContext.sceneSummaryEn : deepContext.sceneSummaryZh)
    : (() => {
        const parts: string[] = [];
        if (planContext?.pressureContext === "high") {
          parts.push(locale === "en" ? "key-point pressure" : "关键分压力");
        }
        if (planContext?.movementContext === "moving") {
          parts.push(locale === "en" ? "on the move" : "跑动中");
        }
        if (planContext?.incomingBallDepth === "deep") {
          parts.push(locale === "en" ? "against deeper balls" : "深球条件下");
        }
        return parts.length > 0 ? parts.join(locale === "en" ? ", " : "、") : null;
      })();

  if (!sceneLabel) {
    return base;
  }

  if (!base) {
    return locale === "en"
      ? `Keep the plan anchored to this scene: ${sceneLabel}.`
      : `这套 7 步计划始终围绕这个场景：${sceneLabel}。`;
  }

  if (base.includes(sceneLabel)) {
    return base;
  }

  return locale === "en"
    ? `${base} Keep the plan anchored to this scene: ${sceneLabel}.`
    : `${base} 这套 7 步计划始终围绕这个场景：${sceneLabel}。`;
}
