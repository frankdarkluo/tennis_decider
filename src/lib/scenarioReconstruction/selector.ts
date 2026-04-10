import { inferSkillCategory } from "@/lib/scenarioReconstruction/inferSkillCategory";
import { getQuestionBank } from "@/lib/scenarioReconstruction/questionBank";
import { createLocalQwenClient, type LocalQwenClient } from "@/lib/scenarioReconstruction/llm/client";
import { getSkillCategoryPolicy } from "@/lib/scenarioReconstruction/skillPolicy";
import { getDeepOptionalSlots, getDeepRequiredSlots } from "@/lib/scenarioReconstruction/runtime";
import type { MissingSlotPath, ScenarioQuestion, ScenarioState } from "@/types/scenario";

function slotRank(requiredRemaining: MissingSlotPath[], optionalRemaining: MissingSlotPath[], slot: MissingSlotPath) {
  if (requiredRemaining.includes(slot)) return 2;
  if (optionalRemaining.includes(slot)) return 1;
  return 0;
}

function isQuestionEligible(scenario: ScenarioState, question: ScenarioQuestion) {
  const inferred = inferSkillCategory(scenario);
  const policy = getSkillCategoryPolicy(inferred.category);
  const requiredRemaining = getDeepRequiredSlots(scenario);
  const optionalRemaining = getDeepOptionalSlots(scenario);

  if (!policy.allowedQuestionFamilies.includes(question.family)) {
    return false;
  }

  if (policy.forbiddenQuestionFamilies.includes(question.family)) {
    return false;
  }

  if (question.fillsSlots.some((slot) => policy.forbiddenSlots.includes(slot))) {
    return false;
  }

  if (scenario.asked_followup_ids.length >= policy.maxDeepFollowups) {
    return false;
  }

  if (question.family === "broad_shot_family_clarification") {
    return inferred.category === "generic_safe_fallback" && scenario.stroke === "unknown";
  }

  if (requiredRemaining.length > 0) {
    return question.fillsSlots.some((slot) => requiredRemaining.includes(slot));
  }

  return question.fillsSlots.some((slot) => optionalRemaining.includes(slot));
}

function slotPriority(slot: MissingSlotPath): number {
  if (slot === "stroke") return 95;
  if (slot === "context.session_type") return 100;
  if (slot === "context.serve_variant") return 75;
  if (slot === "context.movement") return 90;
  if (slot === "outcome.primary_error") return 80;
  if (slot === "serve.control_pattern") return 74;
  if (slot === "serve.mechanism_family") return 68;
  if (slot === "incoming_ball.depth") return 70;
  if (slot === "skill_detail.return_positioning") return 76;
  if (slot === "skill_detail.return_first_ball_goal") return 72;
  if (slot === "skill_detail.volley_height") return 76;
  if (slot === "skill_detail.volley_racket_face") return 72;
  if (slot === "skill_detail.overhead_contact") return 76;
  if (slot === "skill_detail.slice_response_pattern") return 76;
  return 60;
}

export function getEligibleQuestions(scenario: ScenarioState): ScenarioQuestion[] {
  const requiredRemaining = getDeepRequiredSlots(scenario);
  const optionalRemaining = getDeepOptionalSlots(scenario);

  return getQuestionBank()
    .filter((question) => isQuestionEligible(scenario, question))
    .sort((left, right) => {
      const leftRequiredRank = Math.max(...left.target_slots.map((slot) => slotRank(requiredRemaining, optionalRemaining, slot)));
      const rightRequiredRank = Math.max(...right.target_slots.map((slot) => slotRank(requiredRemaining, optionalRemaining, slot)));

      if (rightRequiredRank !== leftRequiredRank) {
        return rightRequiredRank - leftRequiredRank;
      }

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
