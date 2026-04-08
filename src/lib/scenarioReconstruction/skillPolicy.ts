import type { MissingSlotPath, QuestionFamily, SkillCategory, ScenarioState } from "@/types/scenario";

export type SkillCategoryPolicy = {
  allowedQuestionFamilies: QuestionFamily[];
  requiredSlots: MissingSlotPath[];
  optionalSlots: MissingSlotPath[];
  fallbackPriority: number;
  maxFollowups: number;
  isDone(input: {
    scenario: ScenarioState;
    missingSlots: MissingSlotPath[];
  }): boolean;
};

const policies: Record<SkillCategory, SkillCategoryPolicy> = {
  serve: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern", "serve_variant"],
    requiredSlots: ["context.session_type", "outcome.primary_error"],
    optionalSlots: ["context.serve_variant", "subjective_feeling.rushed"],
    fallbackPriority: 100,
    maxFollowups: 2,
    isDone: ({ scenario, missingSlots }) => {
      const hasRequiredSlots = ["context.session_type", "outcome.primary_error"].every((slot) => !missingSlots.includes(slot as MissingSlotPath));
      const hasServeSignal =
        scenario.context.serve_variant !== "unknown" ||
        scenario.context.pressure === "high" ||
        scenario.subjective_feeling.tight ||
        scenario.subjective_feeling.rushed;

      return hasRequiredSlots && (hasServeSignal || scenario.asked_followup_ids.length >= 1);
    }
  },
  return: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern"],
    requiredSlots: ["context.session_type", "outcome.primary_error"],
    optionalSlots: ["subjective_feeling.rushed"],
    fallbackPriority: 70,
    maxFollowups: 2,
    isDone: ({ missingSlots }) => ["context.session_type", "outcome.primary_error"].every((slot) => !missingSlots.includes(slot as MissingSlotPath))
  },
  groundstroke_set: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "movement_context", "outcome_pattern", "incoming_ball_depth"],
    requiredSlots: ["context.session_type", "context.movement", "outcome.primary_error"],
    optionalSlots: ["incoming_ball.depth", "subjective_feeling.rushed"],
    fallbackPriority: 90,
    maxFollowups: 2,
    isDone: ({ missingSlots }) =>
      ["context.session_type", "context.movement", "outcome.primary_error"].every((slot) => !missingSlots.includes(slot as MissingSlotPath))
  },
  groundstroke_on_move: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "movement_context", "outcome_pattern", "incoming_ball_depth"],
    requiredSlots: ["context.session_type", "context.movement", "outcome.primary_error"],
    optionalSlots: ["incoming_ball.depth", "subjective_feeling.rushed"],
    fallbackPriority: 90,
    maxFollowups: 2,
    isDone: ({ missingSlots }) =>
      ["context.session_type", "context.movement", "outcome.primary_error"].every((slot) => !missingSlots.includes(slot as MissingSlotPath))
  },
  volley: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern"],
    requiredSlots: ["context.session_type", "outcome.primary_error"],
    optionalSlots: ["subjective_feeling.rushed"],
    fallbackPriority: 70,
    maxFollowups: 2,
    isDone: ({ missingSlots }) => ["context.session_type", "outcome.primary_error"].every((slot) => !missingSlots.includes(slot as MissingSlotPath))
  },
  overhead: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern"],
    requiredSlots: ["context.session_type", "outcome.primary_error"],
    optionalSlots: ["subjective_feeling.rushed"],
    fallbackPriority: 60,
    maxFollowups: 2,
    isDone: ({ missingSlots }) => ["context.session_type", "outcome.primary_error"].every((slot) => !missingSlots.includes(slot as MissingSlotPath))
  },
  slice: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern"],
    requiredSlots: ["context.session_type", "outcome.primary_error"],
    optionalSlots: ["subjective_feeling.rushed"],
    fallbackPriority: 60,
    maxFollowups: 2,
    isDone: ({ missingSlots }) => ["context.session_type", "outcome.primary_error"].every((slot) => !missingSlots.includes(slot as MissingSlotPath))
  },
  contextual_match_situation: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern", "broad_shot_family_clarification"],
    requiredSlots: ["context.session_type"],
    optionalSlots: ["outcome.primary_error", "stroke", "subjective_feeling.rushed"],
    fallbackPriority: 80,
    maxFollowups: 2,
    isDone: ({ scenario, missingSlots }) => {
      const hasRequiredSlots = !missingSlots.includes("context.session_type");
      const hasEnoughContext =
        scenario.context.pressure === "high" ||
        !missingSlots.includes("outcome.primary_error") ||
        !missingSlots.includes("stroke");

      return hasRequiredSlots && (hasEnoughContext || scenario.asked_followup_ids.length >= 1);
    }
  },
  generic_safe_fallback: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern", "broad_shot_family_clarification"],
    requiredSlots: [],
    optionalSlots: ["context.session_type", "outcome.primary_error", "stroke", "subjective_feeling.rushed"],
    fallbackPriority: 10,
    maxFollowups: 1,
    isDone: ({ scenario, missingSlots }) => {
      const hasAnyOptionalSignal =
        !missingSlots.includes("context.session_type") ||
        !missingSlots.includes("outcome.primary_error") ||
        !missingSlots.includes("stroke");

      return scenario.asked_followup_ids.length >= 1 || hasAnyOptionalSignal;
    }
  }
};

export function getSkillCategoryPolicy(category: SkillCategory) {
  return policies[category];
}
