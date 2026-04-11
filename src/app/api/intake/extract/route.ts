import { decideDiagnoseFlow } from "@/lib/intake/decideDiagnoseFlow";
import { NextResponse } from "next/server";
import { extractTennisScene } from "@/lib/intake/extractTennisScene";
import { normalizeToScenario } from "@/lib/intake/normalizeToScenario";
import { hasStructuredSceneSignal, type StructuredTennisSceneExtraction } from "@/lib/intake/schema";
import { createLocalModelClient } from "@/lib/localModel/client";
import { getEligibleQuestions, selectNextQuestionWithLlm } from "@/lib/scenarioReconstruction/selector";
import type { ScenarioState } from "@/types/scenario";

type IntakeRequestBody = {
  text?: string;
  ui_language?: "zh" | "en";
};

function buildFallbackResponse({
  text,
  extraction,
  scenario
}: {
  text: string;
  extraction: StructuredTennisSceneExtraction | null;
  scenario: ScenarioState | null;
}) {
  const keepStructuredContext = extraction !== null && scenario !== null && hasStructuredSceneSignal(extraction);

  return NextResponse.json({
    source: "deterministic_fallback",
    decision: "raw_text_fallback",
    extraction: keepStructuredContext ? extraction : null,
    scenario: keepStructuredContext ? scenario : null,
    diagnosis_input: text.trim(),
    eligible_questions: [],
    selected_question: null,
    missing_slots: keepStructuredContext && scenario ? scenario.missing_slots : [],
    done: false
  });
}

export async function POST(request: Request) {
  const { text, ui_language } = (await request.json()) as IntakeRequestBody;

  if (!text?.trim()) {
    return NextResponse.json({ ok: false, message: "Missing intake text." }, { status: 400 });
  }

  const uiLanguage = ui_language === "en" ? "en" : "zh";
  const client = createLocalModelClient();
  const extraction = await extractTennisScene(text, { client });

  if (!extraction) {
    return buildFallbackResponse({
      text,
      extraction: null,
      scenario: null
    });
  }

  if (!hasStructuredSceneSignal(extraction)) {
    return buildFallbackResponse({
      text,
      extraction: null,
      scenario: null
    });
  }

  const scenario = normalizeToScenario({
    rawInput: text,
    extraction
  });
  const eligibleQuestions = getEligibleQuestions(scenario);
  const selectedQuestion = eligibleQuestions.length > 0
    ? await selectNextQuestionWithLlm(scenario, client)
    : null;
  const decision = decideDiagnoseFlow({
    scenario,
    locale: uiLanguage,
    followupCount: 0,
    selectedQuestion
  });

  if (decision.type === "raw_text_fallback") {
    return buildFallbackResponse({
      text,
      extraction,
      scenario
    });
  }

  return NextResponse.json({
    source: "structured_intake",
    decision: decision.type,
    extraction,
    scenario,
    diagnosis_input: decision.diagnosisInput ?? text.trim(),
    eligible_questions: eligibleQuestions,
    selected_question: decision.type === "needs_followup" ? decision.selectedQuestion : null,
    missing_slots: scenario.missing_slots,
    done: decision.type === "direct_result"
  });
}
