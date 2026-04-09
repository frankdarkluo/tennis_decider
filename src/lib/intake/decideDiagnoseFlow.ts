import { getEligibleQuestions } from "@/lib/scenarioReconstruction/selector";
import { isScenarioMinimallyAnalyzable } from "@/lib/scenarioReconstruction/runtime";
import { toDiagnosisInput } from "@/lib/scenarioReconstruction/toDiagnosisInput";
import type { ScenarioQuestion, ScenarioState } from "@/types/scenario";

export const CONSUMER_VISIBLE_FOLLOWUP_CAP = 3;

export type DiagnoseFlowDecision =
  | {
    type: "raw_text_fallback";
    diagnosisInput: null;
    eligibleQuestions: ScenarioQuestion[];
    selectedQuestion: null;
  }
  | {
    type: "direct_result";
    diagnosisInput: string;
    eligibleQuestions: ScenarioQuestion[];
    selectedQuestion: null;
  }
  | {
    type: "needs_followup";
    diagnosisInput: string;
    eligibleQuestions: ScenarioQuestion[];
    selectedQuestion: ScenarioQuestion;
  };

export function decideDiagnoseFlow({
  scenario,
  locale,
  followupCount,
  selectedQuestion
}: {
  scenario: ScenarioState | null;
  locale: "zh" | "en";
  followupCount: number;
  selectedQuestion?: ScenarioQuestion | null;
}): DiagnoseFlowDecision {
  if (!scenario) {
    return {
      type: "raw_text_fallback",
      diagnosisInput: null,
      eligibleQuestions: [],
      selectedQuestion: null
    };
  }

  const eligibleQuestions = getEligibleQuestions(scenario);

  if (isScenarioMinimallyAnalyzable(scenario) || followupCount >= CONSUMER_VISIBLE_FOLLOWUP_CAP) {
    return {
      type: "direct_result",
      diagnosisInput: toDiagnosisInput({ scenario, locale }),
      eligibleQuestions,
      selectedQuestion: null
    };
  }

  const nextQuestion = (
    selectedQuestion
      ? eligibleQuestions.find((question) => question.id === selectedQuestion.id) ?? null
      : eligibleQuestions[0] ?? null
  );

  if (!nextQuestion) {
    return {
      type: "direct_result",
      diagnosisInput: toDiagnosisInput({ scenario, locale }),
      eligibleQuestions,
      selectedQuestion: null
    };
  }

  return {
    type: "needs_followup",
    diagnosisInput: toDiagnosisInput({ scenario, locale }),
    eligibleQuestions,
    selectedQuestion: nextQuestion
  };
}
