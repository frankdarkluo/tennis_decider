import type {
  MissingSlotPath,
  QuestionFamily,
  ScenarioState,
  SkillCategory
} from "@/types/scenario";

export type SkillCategoryPolicy = {
  allowedQuestionFamilies: QuestionFamily[];
  deepRequiredSlots: MissingSlotPath[];
  deepOptionalSlots: MissingSlotPath[];
  maxDeepFollowups: number;
  includeSlotAsRequired?: (input: { scenario: ScenarioState; slot: MissingSlotPath }) => boolean;
};

const policies: Record<SkillCategory, SkillCategoryPolicy> = {
  serve: {
    allowedQuestionFamilies: [
      "session_context",
      "pressure_context",
      "outcome_pattern",
      "serve_variant",
      "serve_control_pattern",
      "serve_mechanism_family"
    ],
    deepRequiredSlots: [
      "context.session_type",
      "outcome.primary_error",
      "context.serve_variant",
      "serve.control_pattern",
      "serve.mechanism_family",
      "subjective_feeling.rushed"
    ],
    deepOptionalSlots: [],
    maxDeepFollowups: 5,
    includeSlotAsRequired: ({ scenario, slot }) => {
      if (slot === "serve.control_pattern") {
        return scenario.outcome.primary_error === "no_control" || scenario.outcome.primary_error === "unknown";
      }

      return true;
    }
  },
  return: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern"],
    deepRequiredSlots: ["context.session_type", "outcome.primary_error", "subjective_feeling.rushed"],
    deepOptionalSlots: [],
    maxDeepFollowups: 4
  },
  groundstroke_set: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "movement_context", "outcome_pattern", "incoming_ball_depth"],
    deepRequiredSlots: [
      "context.session_type",
      "context.movement",
      "outcome.primary_error",
      "subjective_feeling.rushed",
      "incoming_ball.depth"
    ],
    deepOptionalSlots: [],
    maxDeepFollowups: 5,
    includeSlotAsRequired: ({ scenario, slot }) => {
      if (slot !== "incoming_ball.depth") {
        return true;
      }

      return scenario.context.session_type === "match" || scenario.context.movement === "moving";
    }
  },
  groundstroke_on_move: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "movement_context", "outcome_pattern", "incoming_ball_depth"],
    deepRequiredSlots: [
      "context.session_type",
      "context.movement",
      "outcome.primary_error",
      "subjective_feeling.rushed",
      "incoming_ball.depth"
    ],
    deepOptionalSlots: [],
    maxDeepFollowups: 5,
    includeSlotAsRequired: ({ scenario, slot }) => {
      if (slot !== "incoming_ball.depth") {
        return true;
      }

      return scenario.context.movement === "moving" || scenario.context.session_type === "match";
    }
  },
  volley: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern"],
    deepRequiredSlots: ["context.session_type", "outcome.primary_error", "subjective_feeling.rushed"],
    deepOptionalSlots: [],
    maxDeepFollowups: 4
  },
  overhead: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern"],
    deepRequiredSlots: ["context.session_type", "outcome.primary_error", "subjective_feeling.rushed"],
    deepOptionalSlots: [],
    maxDeepFollowups: 4
  },
  slice: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern"],
    deepRequiredSlots: ["context.session_type", "outcome.primary_error", "subjective_feeling.rushed"],
    deepOptionalSlots: [],
    maxDeepFollowups: 4
  },
  contextual_match_situation: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern", "broad_shot_family_clarification"],
    deepRequiredSlots: ["context.session_type", "stroke", "subjective_feeling.rushed"],
    deepOptionalSlots: ["outcome.primary_error"],
    maxDeepFollowups: 4
  },
  generic_safe_fallback: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern", "broad_shot_family_clarification"],
    deepRequiredSlots: ["context.session_type", "stroke", "subjective_feeling.rushed"],
    deepOptionalSlots: ["outcome.primary_error"],
    maxDeepFollowups: 3
  }
};

export function getSkillCategoryPolicy(category: SkillCategory) {
  return policies[category];
}
