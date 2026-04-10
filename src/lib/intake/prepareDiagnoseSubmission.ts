import { sanitizeTennisSceneExtraction, type StructuredTennisSceneExtraction } from "@/lib/intake/schema";
import { ensureScenarioInternals } from "@/lib/scenarioReconstruction/runtime";
import type { ScenarioQuestion, ScenarioState } from "@/types/scenario";
import { shouldMediateDiagnoseComplaint } from "@/lib/intake/diagnoseMediation/gate";
import { mediateDiagnoseComplaint } from "@/lib/intake/diagnoseMediation/mediate";
import type {
  DiagnoseGateDecision,
  DiagnoseMediationMode,
  DiagnoseMediationResult,
  ObserveDiagnoseMediation
} from "@/lib/intake/diagnoseMediation/types";

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
  mediationMode: DiagnoseMediationMode;
  mediationDisplayText: string | null;
  mediationQuestion: string | null;
  clarificationUsed: boolean;
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

type MediationRunner = (input: {
  complaint: string;
  locale: "zh" | "en";
  gateDecision: DiagnoseGateDecision;
  observe?: ObserveDiagnoseMediation;
}) => Promise<DiagnoseMediationResult>;

function isScenarioPayload(value: unknown): value is Partial<ScenarioState> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isScenarioQuestionPayload(value: unknown): value is ScenarioQuestion {
  return typeof value === "object" && value !== null && !Array.isArray(value) && "id" in value;
}

export async function prepareDiagnoseSubmission({
  text,
  locale,
  clarificationUsed = false,
  fetchImpl = fetch,
  mediateImpl = mediateDiagnoseComplaint,
  gateImpl = shouldMediateDiagnoseComplaint,
  observeMediation
}: {
  text: string;
  locale: "zh" | "en";
  clarificationUsed?: boolean;
  fetchImpl?: FetchLike;
  mediateImpl?: MediationRunner;
  gateImpl?: typeof shouldMediateDiagnoseComplaint;
  observeMediation?: ObserveDiagnoseMediation;
}): Promise<PreparedDiagnoseSubmission> {
  const trimmedText = text.trim();
  const gateDecision = clarificationUsed
    ? {
      shouldMediate: false,
      reason: "clear_enough" as const,
      lockedCategory: null
    }
    : gateImpl(trimmedText, locale);
  observeMediation?.({
    type: "gate",
    shouldMediate: gateDecision.shouldMediate,
    reason: gateDecision.reason,
    lockedCategory: gateDecision.lockedCategory,
    clarificationUsed
  });

  if (!gateDecision.shouldMediate) {
    const prepared = await fetchIntakeSubmission({
      trimmedText,
      text: trimmedText,
      locale,
      fetchImpl
    });
    observeMediation?.({
      type: "mode",
      mode: "skip",
      reason: gateDecision.reason,
      clarificationUsed
    });

    return {
      ...prepared,
      mediationMode: "skip",
      mediationDisplayText: null,
      mediationQuestion: null,
      clarificationUsed
    };
  }

  const mediation = await mediateImpl({
    complaint: trimmedText,
    locale,
    gateDecision,
    observe: observeMediation
  });
  observeMediation?.({
    type: "mode",
    mode: mediation.mode,
    reason: mediation.reason,
    clarificationUsed
  });

  if (mediation.mode === "clarify") {
    return {
      source: "deterministic_fallback",
      decision: "raw_text_fallback",
      diagnosisInput: trimmedText,
      extraction: null,
      scenario: null,
      selectedQuestion: null,
      eligibleQuestions: [],
      missingSlots: [],
      done: false,
      mediationMode: "clarify",
      mediationDisplayText: null,
      mediationQuestion: mediation.clarificationQuestion,
      clarificationUsed: false
    };
  }

  const prepared = await fetchIntakeSubmission({
    trimmedText,
    text: mediation.mode === "paraphrase" && mediation.normalizedComplaint
      ? mediation.normalizedComplaint
      : trimmedText,
    locale,
    fetchImpl
  });

  return {
    ...prepared,
    mediationMode: mediation.mode,
    mediationDisplayText: mediation.displayText,
    mediationQuestion: mediation.clarificationQuestion,
    clarificationUsed
  };
}

async function fetchIntakeSubmission({
  trimmedText,
  text,
  locale,
  fetchImpl
}: {
  trimmedText: string;
  text: string;
  locale: "zh" | "en";
  fetchImpl: FetchLike;
}): Promise<Omit<PreparedDiagnoseSubmission, "mediationMode" | "mediationDisplayText" | "mediationQuestion" | "clarificationUsed">> {
  try {
    const response = await fetchImpl("/api/intake/extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
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
