import type { ScenarioQuestion, ScenarioState, SkillCategory } from "@/types/scenario";

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

export function buildDiagnoseMediationPrompt(input: {
  complaint: string;
  locale: "zh" | "en";
  lockedCategory: SkillCategory | null;
}) {
  return [
    "You normalize weak tennis complaints into one tiny mediation contract.",
    "Return JSON only.",
    "Do not explain.",
    "Do not diagnose.",
    "Do not give drills, plans, or training advice.",
    "Keep the user's language mix.",
    "Use at most one short question.",
    "No markdown, bullets, or multiple paragraphs.",
    'Allowed mode: "paraphrase" | "clarify" | "fallback".',
    'Allowed reason: "ambiguous" | "too_vague" | "transcript_noise" | "low_confidence".',
    "If the complaint is noisy but recoverable, use paraphrase.",
    "If the complaint is too vague to route safely, use clarify.",
    "If you cannot help safely, use fallback.",
    input.lockedCategory
      ? `Stay inside this skill category if you mention stroke family cues: ${input.lockedCategory}.`
      : "No category lock is provided.",
    'Return an object with exactly these keys: mode, reason, displayText, normalizedComplaint, clarificationQuestion.',
    `Locale hint: ${input.locale}`,
    `Input: ${input.complaint}`
  ].join("\n");
}
