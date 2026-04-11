import type { DiagnosisCategoryConflict, DiagnosisRule, DiagnosisResult } from "@/types/diagnosis";
import type { DeepDiagnosisHandoff } from "@/types/enrichedDiagnosis";

export type DiagnosisCategoryGate = {
  expectedSkillCategory: DeepDiagnosisHandoff["skillCategory"];
  allowedProblemTags: string[];
};

const SERVE_PROBLEM_TAGS = [
  "first-serve-in",
  "second-serve-reliability",
  "serve-toss-consistency",
  "serve-timing",
  "serve-accuracy"
] as const;

const RETURN_PROBLEM_TAGS = ["return-under-pressure"] as const;
const VOLLEY_PROBLEM_TAGS = ["volley-floating", "volley-into-net", "volley-contact-instability", "half-volley-late-contact", "net-confidence"] as const;
const OVERHEAD_PROBLEM_TAGS = ["overhead-timing", "overhead-spacing", "cant-hit-lob"] as const;
const SLICE_PROBLEM_TAGS = ["backhand-slice-floating", "slice-depth-control", "incoming-slice-trouble"] as const;
const CONTEXTUAL_PROBLEM_TAGS = [
  "match-anxiety",
  "pressure-tightness",
  "safe-short-collapse",
  "key-point-indecision",
  "passive-point-construction",
  "doubles-positioning",
  "doubles-poach-hesitation",
  "doubles-formation-confusion"
] as const;
const GROUNDSTROKE_SHARED_TAGS = ["late-contact", "rally-consistency", "balls-too-short", "moonball-trouble", "on-the-run-late-contact", "recovery-delay"] as const;
const FOREHAND_PROBLEM_TAGS = ["forehand-out", "forehand-no-power", "running-forehand", "topspin-low"] as const;
const BACKHAND_PROBLEM_TAGS = ["backhand-into-net", "running-backhand", "backhand-slice-floating", "incoming-slice-trouble"] as const;

function hasReliableGate(handoff: DeepDiagnosisHandoff) {
  return handoff.mode === "deep" &&
    handoff.skillCategory !== "generic_safe_fallback" &&
    handoff.skillCategoryConfidence !== "low";
}

export function buildDiagnosisCategoryGate(handoff: DeepDiagnosisHandoff | null | undefined): DiagnosisCategoryGate | null {
  if (!handoff || !hasReliableGate(handoff)) {
    return null;
  }

  if (handoff.skillCategory === "serve") {
    return { expectedSkillCategory: handoff.skillCategory, allowedProblemTags: [...SERVE_PROBLEM_TAGS] };
  }

  if (handoff.skillCategory === "return") {
    return { expectedSkillCategory: handoff.skillCategory, allowedProblemTags: [...RETURN_PROBLEM_TAGS] };
  }

  if (handoff.skillCategory === "volley") {
    return { expectedSkillCategory: handoff.skillCategory, allowedProblemTags: [...VOLLEY_PROBLEM_TAGS] };
  }

  if (handoff.skillCategory === "overhead") {
    return { expectedSkillCategory: handoff.skillCategory, allowedProblemTags: [...OVERHEAD_PROBLEM_TAGS] };
  }

  if (handoff.skillCategory === "slice") {
    return { expectedSkillCategory: handoff.skillCategory, allowedProblemTags: [...SLICE_PROBLEM_TAGS] };
  }

  if (handoff.skillCategory === "contextual_match_situation") {
    return { expectedSkillCategory: handoff.skillCategory, allowedProblemTags: [...CONTEXTUAL_PROBLEM_TAGS] };
  }

  if (handoff.skillCategory === "groundstroke_set" || handoff.skillCategory === "groundstroke_on_move") {
    if (handoff.strokeFamily === "forehand") {
      return {
        expectedSkillCategory: handoff.skillCategory,
        allowedProblemTags: [...FOREHAND_PROBLEM_TAGS, ...GROUNDSTROKE_SHARED_TAGS]
      };
    }

    if (handoff.strokeFamily === "backhand" || handoff.strokeFamily === "slice") {
      return {
        expectedSkillCategory: handoff.skillCategory,
        allowedProblemTags: [...BACKHAND_PROBLEM_TAGS, ...GROUNDSTROKE_SHARED_TAGS]
      };
    }

    return {
      expectedSkillCategory: handoff.skillCategory,
      allowedProblemTags: [...GROUNDSTROKE_SHARED_TAGS]
    };
  }

  return null;
}

export function ruleMatchesDiagnosisCategoryGate(rule: DiagnosisRule, gate: DiagnosisCategoryGate | null) {
  if (!gate) {
    return true;
  }

  return gate.allowedProblemTags.includes(rule.problemTag);
}

export function buildDiagnosisCategoryConflict(input: {
  handoff: DeepDiagnosisHandoff;
  rule: DiagnosisRule | null;
  reason: string;
}): DiagnosisCategoryConflict {
  return {
    expectedSkillCategory: input.handoff.skillCategory,
    actualProblemTag: input.rule?.problemTag ?? null,
    actualCategory: input.rule?.category ?? [],
    reason: input.reason
  };
}

export function isDiagnosisResultConsistentWithHandoff(
  result: Pick<DiagnosisResult, "problemTag">,
  handoff: DeepDiagnosisHandoff | null | undefined
) {
  const gate = buildDiagnosisCategoryGate(handoff);
  if (!gate) {
    return true;
  }

  return gate.allowedProblemTags.includes(result.problemTag);
}
