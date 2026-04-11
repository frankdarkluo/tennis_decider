import { ScoredDimension } from "@/types/assessment";
import { ContentItem } from "@/types/content";
import { isProblemTag, ProblemTag } from "@/types/problemTag";

export const PLAN_TAG_ALIASES: Partial<Record<ProblemTag, ProblemTag>> = {
  "second-serve-confidence": "second-serve-reliability",
  "serve-toss-inconsistent": "serve-toss-consistency",
  "slice-too-high": "backhand-slice-floating",
  "trouble-with-slice": "incoming-slice-trouble"
};

export const PLAN_COMPATIBILITY_FALLBACKS: Partial<Record<ProblemTag, ProblemTag>> = {
  "pressure-tightness": "match-anxiety",
  "stamina-drop": "movement-slow"
};

export const PLAN_CONTENT_PROBLEM_TAG_ALIASES: Partial<Record<ProblemTag, ProblemTag[]>> = {
  "second-serve-confidence": ["second-serve-reliability"],
  "serve-toss-inconsistent": ["serve-toss-consistency"],
  "slice-too-high": ["backhand-slice-floating", "slice-depth-control"],
  "trouble-with-slice": ["incoming-slice-trouble"],
  "slow-preparation": ["late-contact"],
  "volley-errors": ["volley-floating", "volley-into-net", "volley-contact-instability"],
  "doubles-net-fear": ["net-confidence", "doubles-poach-hesitation"]
};

export const ASSESSMENT_DIMENSION_PLAN_HINTS: Record<
  ScoredDimension,
  { primaryProblemTag: ProblemTag; relatedProblemTags: ProblemTag[]; skills: string[] }
> = {
  forehand: {
    primaryProblemTag: "forehand-out",
    relatedProblemTags: ["topspin-low", "forehand-no-power", "balls-too-short"],
    skills: ["forehand", "topspin"]
  },
  backhand_slice: {
    primaryProblemTag: "backhand-into-net",
    relatedProblemTags: ["backhand-slice-floating", "slice-depth-control", "incoming-slice-trouble"],
    skills: ["backhand", "slice"]
  },
  serve: {
    primaryProblemTag: "second-serve-reliability",
    relatedProblemTags: ["serve-toss-consistency", "serve-accuracy"],
    skills: ["serve"]
  },
  return: {
    primaryProblemTag: "return-under-pressure",
    relatedProblemTags: ["late-contact", "balls-too-short"],
    skills: ["return", "timing", "movement"]
  },
  net: {
    primaryProblemTag: "volley-contact-instability",
    relatedProblemTags: ["half-volley-late-contact", "doubles-positioning", "doubles-poach-hesitation"],
    skills: ["net", "doubles"]
  },
  movement: {
    primaryProblemTag: "late-contact",
    relatedProblemTags: ["movement-slow", "balls-too-short", "on-the-run-late-contact", "recovery-delay"],
    skills: ["movement", "footwork"]
  },
  rally: {
    primaryProblemTag: "backhand-into-net",
    relatedProblemTags: ["forehand-out", "balls-too-short", "general-improvement"],
    skills: ["consistency", "forehand", "backhand"]
  },
  overhead: {
    primaryProblemTag: "overhead-timing",
    relatedProblemTags: ["overhead-spacing", "late-contact", "general-improvement"],
    skills: ["overhead", "footwork", "serve"]
  },
  tactics: {
    primaryProblemTag: "passive-point-construction",
    relatedProblemTags: ["doubles-formation-confusion", "key-point-indecision", "cant-self-practice"],
    skills: ["matchplay", "mental", "doubles", "tactics"]
  },
  pressure: {
    primaryProblemTag: "pressure-tightness",
    relatedProblemTags: ["match-anxiety", "safe-short-collapse", "key-point-indecision", "return-under-pressure", "second-serve-reliability"],
    skills: ["matchplay", "mental", "serve", "return"]
  }
};

export const DIMENSION_TO_PROBLEM_TAG: Record<ScoredDimension, ProblemTag> = {
  forehand: "forehand-out",
  backhand_slice: "backhand-into-net",
  serve: "second-serve-reliability",
  return: "return-under-pressure",
  net: "net-confidence",
  overhead: "overhead-timing",
  movement: "late-contact",
  pressure: "pressure-tightness",
  tactics: "match-anxiety",
  rally: "general-improvement"
};

function uniqueProblemTags(values: readonly string[]): ProblemTag[] {
  return Array.from(new Set(
    values
      .map((value) => normalizePlanProblemTag(value))
      .filter((value): value is ProblemTag => isProblemTag(value))
  ));
}

export function normalizePlanProblemTag(problemTag: string): ProblemTag {
  const canonical = PLAN_TAG_ALIASES[problemTag as ProblemTag] ?? problemTag;
  return isProblemTag(canonical) ? canonical : "unknown-problem";
}

export function getPlanLookupProblemTags(problemTag: string): ProblemTag[] {
  const canonicalProblemTag = normalizePlanProblemTag(problemTag);
  const compatibilityFallback = PLAN_COMPATIBILITY_FALLBACKS[canonicalProblemTag];

  return uniqueProblemTags([
    canonicalProblemTag,
    compatibilityFallback ?? ""
  ]);
}

export function normalizePlanProblemTags(problemTags: readonly string[]): ProblemTag[] {
  const canonical = problemTags.flatMap((tag) => PLAN_CONTENT_PROBLEM_TAG_ALIASES[tag as ProblemTag] ?? []);
  return uniqueProblemTags([...problemTags, ...canonical]);
}

export function getNormalizedPlanContentProblemTags(content: ContentItem): ProblemTag[] {
  return normalizePlanProblemTags(content.problemTags);
}
