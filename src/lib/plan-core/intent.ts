import { PLAN_MICROCYCLE_ROLES } from "@/data/planBlueprints";
import type { PlanLevel, PlanContext, PlanIntent, PlanMechanismFamily, PlanSkillFamily, PlanTemplate } from "@/types/plan";

function inferSkillFamily(problemTag: string, planContext: PlanContext | null): PlanSkillFamily {
  const normalized = `${problemTag} ${planContext?.primaryProblemTag ?? ""}`.toLowerCase();

  if (/serve|toss|double/.test(normalized)) return "serve";
  if (/return/.test(normalized)) return "return";
  if (/forehand|moonball|short/.test(normalized)) return "forehand";
  if (/backhand|slice/.test(normalized)) return "backhand";
  if (/volley|doubles|net-confidence|net-/.test(normalized)) return "net";
  if (/overhead|lob/.test(normalized)) return "overhead";
  if (/movement|mobility|late-contact|running|stamina|fatigue/.test(normalized)) return "movement";
  if (/pressure|anxiety|tight/.test(normalized)) return "mental";
  if (/tactic|position/.test(normalized)) return "tactics";
  return "general";
}

function inferMechanismFamily(problemTag: string, planContext: PlanContext | null): PlanMechanismFamily {
  const normalized = `${problemTag} ${planContext?.primaryProblemTag ?? ""}`.toLowerCase();

  if (/pressure|anxiety|tight/.test(normalized)) return "pressure_regulation";
  if (/doubles-positioning|position|coverage/.test(normalized)) return "positioning";
  if (/movement|mobility|late-contact|running|stamina|fatigue/.test(normalized)) return "recovery";
  if (/decision|tactic|shot-selection|cant-self-practice/.test(normalized)) return "decision";
  if (/toss|serve|second-serve|rhythm/.test(normalized)) return "rhythm";
  if (/out|long|net|contact|short/.test(normalized)) return "contact_window";
  if (/spacing|distance|jammed/.test(normalized)) return "spacing";
  return "shape_control";
}

export function buildPlanIntent(input: {
  source: PlanIntent["source"];
  problemTag: string;
  level: PlanLevel;
  locale: PlanIntent["locale"];
  candidateContentIds?: string[];
  primaryNextStep?: string;
  planContext?: PlanContext | null;
  templateSeed?: PlanTemplate | null;
  deepContext?: PlanIntent["deepContext"];
}): PlanIntent {
  const planContext = input.planContext ?? null;
  const microcycle = PLAN_MICROCYCLE_ROLES.map((entry) => entry.role);

  return {
    source: input.source,
    locale: input.locale,
    levelBand: input.level,
    primaryProblemTag: input.problemTag,
    skillFamily: inferSkillFamily(input.problemTag, planContext),
    mechanismFamily: inferMechanismFamily(input.problemTag, planContext),
    primaryWeakness: planContext?.weakDimensions?.[0],
    secondaryWeakness: planContext?.weakDimensions?.[1] ?? planContext?.observationDimensions?.[0],
    playStyle: planContext?.playStyle,
    playContext: planContext?.playContext,
    primaryNextStep: input.primaryNextStep?.trim() || undefined,
    candidateContentIds: input.candidateContentIds ?? [],
    planContext,
    templateSeed: input.templateSeed ?? null,
    deepContext: input.deepContext ?? null,
    microcycle
  };
}
