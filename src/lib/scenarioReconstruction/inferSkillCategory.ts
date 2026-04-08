import type { ScenarioState, SkillCategoryInference } from "@/types/scenario";

function mentionsAny(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

export function inferSkillCategory(scenario: ScenarioState): SkillCategoryInference {
  const raw = scenario.raw_user_input.trim();

  if (scenario.stroke === "serve") {
    return { category: "serve", confidence: "high", reasons: ["scenario.stroke=serve"] };
  }

  if (scenario.stroke === "return") {
    return { category: "return", confidence: "high", reasons: ["scenario.stroke=return"] };
  }

  if (scenario.stroke === "volley") {
    return { category: "volley", confidence: "high", reasons: ["scenario.stroke=volley"] };
  }

  if (scenario.stroke === "overhead") {
    return { category: "overhead", confidence: "high", reasons: ["scenario.stroke=overhead"] };
  }

  if (scenario.stroke === "slice") {
    return { category: "slice", confidence: "high", reasons: ["scenario.stroke=slice"] };
  }

  if (scenario.stroke === "forehand" || scenario.stroke === "backhand" || scenario.stroke === "groundstroke") {
    if (scenario.context.movement === "moving") {
      return { category: "groundstroke_on_move", confidence: "high", reasons: ["groundstroke with grounded movement"] };
    }

    if (scenario.context.movement === "stationary") {
      return { category: "groundstroke_set", confidence: "high", reasons: ["groundstroke when set"] };
    }

    return { category: "groundstroke_set", confidence: "medium", reasons: ["groundstroke family present but movement unresolved"] };
  }

  if (mentionsAny(raw, [/(关键分|盘点|局点|deuce|break point|key point|under pressure)/i])) {
    return { category: "contextual_match_situation", confidence: "medium", reasons: ["pressure context without grounded stroke"] };
  }

  return { category: "generic_safe_fallback", confidence: "low", reasons: ["no reliable technique family"] };
}
