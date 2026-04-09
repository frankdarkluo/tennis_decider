import { sanitizeTennisSceneExtraction, type StructuredTennisSceneExtraction } from "@/lib/intake/schema";
import { ensureScenarioInternals } from "@/lib/scenarioReconstruction/runtime";
import type { ScenarioQuestion, ScenarioState } from "@/types/scenario";

type FetchLike = typeof fetch;

export type PreparedDiagnoseSubmission = {
  source: "structured_intake" | "deterministic_fallback" | "request_failed";
  decision: "direct_result" | "needs_followup" | "raw_text_fallback";
  diagnosisInput: string;
  extraction: StructuredTennisSceneExtraction | null;
  scenario: ScenarioState | null;
  selectedQuestion: ScenarioQuestion | null;
  eligibleQuestions: ScenarioQuestion[];
  missingSlots: ScenarioState["missing_slots"];
  done: boolean;
};

type IntakeRouteResponse = {
  source?: unknown;
  decision?: unknown;
  diagnosis_input?: unknown;
  extraction?: unknown;
  scenario?: unknown;
  selected_question?: unknown;
  eligible_questions?: unknown;
  missing_slots?: unknown;
  done?: unknown;
};

function isScenarioPayload(value: unknown): value is Partial<ScenarioState> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isScenarioQuestionPayload(value: unknown): value is ScenarioQuestion {
  return typeof value === "object" && value !== null && !Array.isArray(value) && "id" in value;
}

export async function prepareDiagnoseSubmission({
  text,
  locale,
  fetchImpl = fetch
}: {
  text: string;
  locale: "zh" | "en";
  fetchImpl?: FetchLike;
}): Promise<PreparedDiagnoseSubmission> {
  const trimmedText = text.trim();

  try {
    const response = await fetchImpl("/api/intake/extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: trimmedText,
        ui_language: locale
      })
    });

    if (!response.ok) {
      throw new Error(`Intake request failed: ${response.status}`);
    }

    const body = await response.json() as IntakeRouteResponse;
    const source = body.source === "structured_intake" ? "structured_intake" : "deterministic_fallback";
    const decision = body.decision === "needs_followup" || body.decision === "direct_result"
      ? body.decision
      : "raw_text_fallback";
    const diagnosisInput = typeof body.diagnosis_input === "string" && body.diagnosis_input.trim()
      ? body.diagnosis_input.trim()
      : trimmedText;
    const extraction = sanitizeTennisSceneExtraction(body.extraction);
    const scenario = isScenarioPayload(body.scenario)
      ? ensureScenarioInternals(body.scenario as ScenarioState)
      : null;
    const selectedQuestion = isScenarioQuestionPayload(body.selected_question)
      ? body.selected_question
      : null;
    const eligibleQuestions = Array.isArray(body.eligible_questions)
      ? body.eligible_questions.filter(isScenarioQuestionPayload)
      : [];
    const missingSlots = Array.isArray(body.missing_slots)
      ? body.missing_slots.filter((item): item is ScenarioState["missing_slots"][number] => typeof item === "string")
      : [];

    return {
      source,
      decision,
      diagnosisInput,
      extraction,
      scenario,
      selectedQuestion,
      eligibleQuestions,
      missingSlots,
      done: body.done === true
    };
  } catch {
    return {
      source: "request_failed",
      decision: "raw_text_fallback",
      diagnosisInput: trimmedText,
      extraction: null,
      scenario: null,
      selectedQuestion: null,
      eligibleQuestions: [],
      missingSlots: [],
      done: false
    };
  }
}
