import { hasStructuredSceneSignal, type StructuredTennisSceneExtraction } from "@/lib/intake/schema";
import { createEmptyScenario, recalculateScenarioState } from "@/lib/scenarioReconstruction/runtime";
import type { ScenarioState } from "@/types/scenario";

type NormalizeToScenarioOptions = {
  rawInput: string;
  extraction: StructuredTennisSceneExtraction;
};

export function normalizeToScenario({ rawInput, extraction }: NormalizeToScenarioOptions) {
  const scenario = createEmptyScenario(rawInput.trim());

  if (extraction.sourceLanguage !== "mixed") {
    scenario.language = extraction.sourceLanguage;
  }

  scenario.stroke = extraction.strokeFamily;
  scenario.context.session_type = extraction.sessionType;
  scenario.context.pressure = extraction.pressureContext;
  scenario.context.movement = extraction.movement;
  scenario.context.serve_variant = extraction.serveSubtype;
  scenario.incoming_ball.depth = extraction.incomingBallDepth;
  scenario.outcome.primary_error = extraction.outcome !== "unknown"
    ? extraction.outcome
    : extraction.problemCandidate;
  scenario.user_confidence = extraction.confidence;

  extraction.subjectiveFeeling.forEach((feeling) => {
    if (feeling === "tight") scenario.subjective_feeling.tight = true;
    if (feeling === "rushed") scenario.subjective_feeling.rushed = true;
    if (feeling === "awkward") scenario.subjective_feeling.awkward = true;
    if (feeling === "hesitant") scenario.subjective_feeling.hesitant = true;
    if (feeling === "nervous") scenario.subjective_feeling.nervous = true;
    if (feeling === "late_contact") scenario.subjective_feeling.late_contact = true;
    if (feeling === "no_timing") scenario.subjective_feeling.no_timing = true;
  });

  return recalculateScenarioState(scenario);
}

function getStructuredSignalCount(scenario: ScenarioState) {
  const signals = [
    scenario.stroke !== "unknown",
    scenario.outcome.primary_error !== "unknown",
    scenario.context.session_type !== "unknown",
    scenario.context.pressure !== "unknown",
    scenario.context.movement !== "unknown",
    scenario.context.serve_variant !== "unknown",
    scenario.incoming_ball.depth !== "unknown",
    scenario.subjective_feeling.tight,
    scenario.subjective_feeling.rushed,
    scenario.subjective_feeling.nervous,
    scenario.subjective_feeling.awkward,
    scenario.subjective_feeling.hesitant,
    scenario.subjective_feeling.late_contact,
    scenario.subjective_feeling.no_timing
  ];

  return signals.filter(Boolean).length;
}

export function shouldUseStructuredDiagnosisInput({
  scenario,
  extractionConfidence
}: {
  scenario: ScenarioState;
  extractionConfidence: StructuredTennisSceneExtraction["confidence"];
}) {
  if (extractionConfidence === "low") {
    return false;
  }

  if (!hasStructuredSceneSignal({
    skillCategory: "unknown",
    strokeFamily: scenario.stroke,
    problemCandidate: scenario.outcome.primary_error,
    outcome: scenario.outcome.primary_error,
    movement: scenario.context.movement,
    pressureContext: scenario.context.pressure,
    sessionType: scenario.context.session_type,
    serveSubtype: scenario.context.serve_variant,
    subjectiveFeeling: [
      ...(scenario.subjective_feeling.tight ? ["tight" as const] : []),
      ...(scenario.subjective_feeling.rushed ? ["rushed" as const] : []),
      ...(scenario.subjective_feeling.awkward ? ["awkward" as const] : []),
      ...(scenario.subjective_feeling.hesitant ? ["hesitant" as const] : []),
      ...(scenario.subjective_feeling.nervous ? ["nervous" as const] : []),
      ...(scenario.subjective_feeling.late_contact ? ["late_contact" as const] : []),
      ...(scenario.subjective_feeling.no_timing ? ["no_timing" as const] : [])
    ],
    incomingBallDepth: scenario.incoming_ball.depth,
    missingSlots: scenario.missing_slots,
    confidence: extractionConfidence,
    sourceLanguage: scenario.language,
    rawSummary: null
  })) {
    return false;
  }

  return getStructuredSignalCount(scenario) >= 2 || extractionConfidence === "high";
}
