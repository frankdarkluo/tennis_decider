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

export function buildTennisSceneExtractionPrompt(text: string) {
  return [
    "You extract structured tennis scene signals from colloquial amateur player complaints.",
    "Return JSON only.",
    "Do not explain.",
    "Use only these enum values:",
    'skillCategory: "serve" | "return" | "groundstroke" | "volley" | "overhead" | "slice" | "unknown"',
    'strokeFamily: "forehand" | "backhand" | "groundstroke" | "serve" | "return" | "volley" | "overhead" | "slice" | "unknown"',
    'problemCandidate/outcome: "net" | "long" | "wide" | "weak" | "late" | "framed" | "no_power" | "no_control" | "unknown"',
    'movement: "stationary" | "moving" | "recovering" | "approaching_net" | "unknown"',
    'pressureContext: "none" | "some" | "high" | "unknown"',
    'sessionType: "practice" | "match" | "both" | "unknown"',
    'serveSubtype: "first_serve" | "second_serve" | "both" | "unknown"',
    'subjectiveFeeling items: "tight" | "rushed" | "awkward" | "hesitant" | "nervous" | "late_contact" | "no_timing"',
    'incomingBallDepth: "short" | "mid" | "deep" | "unknown"',
    'missingSlots items: "stroke" | "context.session_type" | "context.serve_variant" | "context.movement" | "outcome.primary_error" | "serve.control_pattern" | "serve.mechanism_family" | "incoming_ball.depth" | "subjective_feeling.rushed" | "skill_detail.return_positioning" | "skill_detail.return_first_ball_goal" | "skill_detail.volley_height" | "skill_detail.volley_racket_face" | "skill_detail.overhead_contact" | "skill_detail.slice_response_pattern"',
    'confidence: "low" | "medium" | "high"',
    'sourceLanguage: "zh" | "en" | "mixed"',
    'Return an object with exactly these keys: skillCategory, strokeFamily, problemCandidate, outcome, movement, pressureContext, sessionType, serveSubtype, subjectiveFeeling, incomingBallDepth, missingSlots, confidence, sourceLanguage, rawSummary.',
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
