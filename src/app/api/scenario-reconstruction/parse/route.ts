import { NextResponse } from "next/server";
import { createLocalQwenClient } from "@/lib/scenarioReconstruction/llm/client";
import {
  finalizeScenarioProgress,
  isScenarioMinimallyAnalyzable,
  parseScenarioText
} from "@/lib/scenarioReconstruction/runtime";
import { getEligibleQuestions, selectNextQuestionWithLlm } from "@/lib/scenarioReconstruction/selector";
import {
  buildScenarioDecisionLogEntry,
  recordScenarioDecision
} from "@/lib/scenarioReconstruction/logging";

type ParseRequestBody = {
  text?: string;
  ui_language?: "zh" | "en";
};

export async function POST(request: Request) {
  const { text, ui_language } = (await request.json()) as ParseRequestBody;

  if (!text?.trim()) {
    return NextResponse.json({ ok: false, message: "Missing scenario text." }, { status: 400 });
  }

  const uiLanguage = ui_language === "en" ? "en" : "zh";
  const client = createLocalQwenClient();
  const scenario = await parseScenarioText(text, { client });
  const eligibleQuestions = getEligibleQuestions(scenario);
  const selectedQuestion = isScenarioMinimallyAnalyzable(scenario)
    ? null
    : await selectNextQuestionWithLlm(scenario, client);
  const progress = finalizeScenarioProgress(scenario, eligibleQuestions, selectedQuestion);

  recordScenarioDecision(
    buildScenarioDecisionLogEntry({
      scenario: progress.scenario,
      missingSlots: progress.missingSlots,
      selectedQuestionId: progress.selectedQuestion?.id ?? null,
      uiLanguage
    })
  );

  return NextResponse.json({
    scenario: progress.scenario,
    missing_slots: progress.missingSlots,
    eligible_questions: progress.eligibleQuestions,
    selected_question: progress.selectedQuestion,
    done: progress.done
  });
}
