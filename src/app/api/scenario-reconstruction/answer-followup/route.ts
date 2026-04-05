import { NextResponse } from "next/server";
import { createLocalQwenClient } from "@/lib/scenarioReconstruction/llm/client";
import {
  applyScenarioAnswer,
  finalizeScenarioProgress,
  getMissingSlots,
  isScenarioMinimallyAnalyzable
} from "@/lib/scenarioReconstruction/runtime";
import { getEligibleQuestions, selectNextQuestionWithLlm } from "@/lib/scenarioReconstruction/selector";
import {
  buildScenarioDecisionLogEntry,
  recordScenarioDecision
} from "@/lib/scenarioReconstruction/logging";
import type { ScenarioState } from "@/types/scenario";

type AnswerFollowupBody = {
  scenario?: ScenarioState;
  question_id?: string;
  answer?: string;
  ui_language?: "zh" | "en";
};

export async function POST(request: Request) {
  const { scenario, question_id, answer, ui_language } = (await request.json()) as AnswerFollowupBody;

  if (!scenario || !question_id || typeof answer !== "string") {
    return NextResponse.json({ ok: false, message: "Missing follow-up payload." }, { status: 400 });
  }

  const uiLanguage = ui_language === "en" ? "en" : "zh";
  const client = createLocalQwenClient();
  const nextScenario = applyScenarioAnswer(scenario, question_id, answer);
  nextScenario.missing_slots = getMissingSlots(nextScenario);
  const eligibleQuestions = getEligibleQuestions(nextScenario);
  const selectedQuestion = isScenarioMinimallyAnalyzable(nextScenario)
    ? null
    : await selectNextQuestionWithLlm(nextScenario, client);
  const progress = finalizeScenarioProgress(nextScenario, eligibleQuestions, selectedQuestion);

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
