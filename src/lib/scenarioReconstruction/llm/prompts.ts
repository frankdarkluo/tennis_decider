import type { ScenarioQuestion, ScenarioState } from "@/types/scenario";

export function buildScenarioParserPrompt(text: string) {
  return [
    "You map tennis free-text into a strict scenario schema.",
    "Fill only supported fields.",
    "Leave unsupported fields as unknown.",
    "Return JSON only.",
    `Input: ${text}`
  ].join("\n");
}

export function buildQuestionRankerPrompt(
  scenario: ScenarioState,
  eligibleQuestions: ScenarioQuestion[]
) {
  return [
    "You rank follow-up question ids for scenario reconstruction.",
    "Choose only from the provided ids.",
    "Prefer information gain and low presupposition.",
    "Return JSON only.",
    `Scenario: ${JSON.stringify(scenario)}`,
    `Eligible question ids: ${eligibleQuestions.map((question) => question.id).join(", ")}`
  ].join("\n");
}
