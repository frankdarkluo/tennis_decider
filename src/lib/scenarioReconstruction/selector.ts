import { getQuestionBank } from "@/lib/scenarioReconstruction/questionBank";
import { createLocalQwenClient, type LocalQwenClient } from "@/lib/scenarioReconstruction/llm/client";
import { getMissingSlots } from "@/lib/scenarioReconstruction/runtime";
import type { MissingSlotPath, ScenarioQuestion, ScenarioState } from "@/types/scenario";

function isSlotMissing(scenario: ScenarioState, slot: MissingSlotPath) {
  const missingSlots = getMissingSlots(scenario);
  return missingSlots.includes(slot);
}

function isQuestionEligible(scenario: ScenarioState, question: ScenarioQuestion) {
  return question.target_slots.some((slot) => isSlotMissing(scenario, slot));
}

function slotPriority(slot: MissingSlotPath): number {
  if (slot === "context.session_type") return 100;
  if (slot === "context.movement") return 90;
  if (slot === "outcome.primary_error") return 80;
  if (slot === "incoming_ball.depth") return 70;
  return 60;
}

export function getEligibleQuestions(scenario: ScenarioState): ScenarioQuestion[] {
  return getQuestionBank()
    .filter((question) => isQuestionEligible(scenario, question))
    .sort((left, right) => {
      const leftPriority = Math.max(...left.target_slots.map(slotPriority));
      const rightPriority = Math.max(...right.target_slots.map(slotPriority));

      if (rightPriority !== leftPriority) {
        return rightPriority - leftPriority;
      }

      if (right.priority !== left.priority) {
        return right.priority - left.priority;
      }

      return left.id.localeCompare(right.id);
    });
}

export function selectNextQuestion(scenario: ScenarioState): ScenarioQuestion | null {
  return getEligibleQuestions(scenario)[0] ?? null;
}

export async function selectNextQuestionWithLlm(
  scenario: ScenarioState,
  client: LocalQwenClient = createLocalQwenClient()
) {
  const eligibleQuestions = getEligibleQuestions(scenario);
  const fallback = eligibleQuestions[0] ?? null;

  if (eligibleQuestions.length <= 1) {
    return fallback;
  }

  try {
    const rankedIds = await client.rankQuestions(scenario, eligibleQuestions);

    if (!rankedIds || rankedIds.length === 0) {
      return fallback;
    }

    const eligibleById = new Map(eligibleQuestions.map((question) => [question.id, question]));

    for (const rankedId of rankedIds) {
      const matched = eligibleById.get(rankedId);

      if (matched) {
        return matched;
      }
    }

    return fallback;
  } catch {
    return fallback;
  }
}
