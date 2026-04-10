import type {
  MissingSlotPath,
  QuestionFamily,
  ScenarioState,
  SkillCategory
} from "@/types/scenario";

export type SkillCategoryPolicy = {
  allowedQuestionFamilies: QuestionFamily[];
  forbiddenQuestionFamilies: QuestionFamily[];
  deepRequiredSlots: MissingSlotPath[];
  deepOptionalSlots: MissingSlotPath[];
  forbiddenSlots: MissingSlotPath[];
  mechanismFamilies: string[];
  maxDeepFollowups: number;
  includeSlotAsRequired?: (input: { scenario: ScenarioState; slot: MissingSlotPath }) => boolean;
};

const serveFamilies: QuestionFamily[] = ["serve_variant", "serve_control_pattern", "serve_mechanism_family", "serve_toss", "serve_contact", "serve_side", "serve_spin_control"];
const incomingFamilies: QuestionFamily[] = ["incoming_ball_depth"];

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
    forbiddenQuestionFamilies: ["return_positioning", "return_first_ball_goal", "movement_context", "incoming_ball_depth", "volley_side", "volley_height", "volley_racket_face", "overhead_contact", "slice_response_pattern"],
    deepRequiredSlots: [
      "context.session_type",
      "outcome.primary_error",
      "context.serve_variant",
      "serve.control_pattern",
      "serve.mechanism_family",
      "subjective_feeling.rushed"
    ],
    deepOptionalSlots: [],
    forbiddenSlots: ["context.movement", "incoming_ball.depth", "skill_detail.return_positioning", "skill_detail.return_first_ball_goal", "skill_detail.volley_height", "skill_detail.volley_racket_face", "skill_detail.overhead_contact", "skill_detail.slice_response_pattern"],
    mechanismFamilies: ["serve_variant", "control_pattern", "toss", "contact", "rhythm", "direction_control"],
    maxDeepFollowups: 5,
    includeSlotAsRequired: ({ scenario, slot }) => {
      if (slot === "serve.control_pattern") {
        return scenario.outcome.primary_error === "no_control" || scenario.outcome.primary_error === "unknown";
      }

      return true;
    }
  },
  return: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern", "return_positioning", "return_first_ball_goal"],
    forbiddenQuestionFamilies: [...serveFamilies, ...incomingFamilies, "movement_context", "volley_side", "volley_height", "volley_racket_face", "overhead_contact", "slice_response_pattern"],
    deepRequiredSlots: [
      "context.session_type",
      "outcome.primary_error",
      "skill_detail.return_positioning",
      "skill_detail.return_first_ball_goal",
      "subjective_feeling.rushed"
    ],
    deepOptionalSlots: [],
    forbiddenSlots: ["context.serve_variant", "context.movement", "serve.control_pattern", "serve.mechanism_family", "incoming_ball.depth", "skill_detail.volley_height", "skill_detail.volley_racket_face", "skill_detail.overhead_contact", "skill_detail.slice_response_pattern"],
    mechanismFamilies: ["positioning", "first_ball_goal"],
    maxDeepFollowups: 5
  },
  groundstroke_set: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "movement_context", "outcome_pattern", "incoming_ball_depth"],
    forbiddenQuestionFamilies: [...serveFamilies, "return_positioning", "return_first_ball_goal", "volley_side", "volley_height", "volley_racket_face", "overhead_contact", "slice_response_pattern"],
    deepRequiredSlots: [
      "context.session_type",
      "context.movement",
      "outcome.primary_error",
      "subjective_feeling.rushed",
      "incoming_ball.depth"
    ],
    deepOptionalSlots: [],
    forbiddenSlots: ["context.serve_variant", "serve.control_pattern", "serve.mechanism_family", "skill_detail.return_positioning", "skill_detail.return_first_ball_goal", "skill_detail.volley_height", "skill_detail.volley_racket_face", "skill_detail.overhead_contact", "skill_detail.slice_response_pattern"],
    mechanismFamilies: ["movement_state", "incoming_ball_depth", "outcome_pattern"],
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
    forbiddenQuestionFamilies: [...serveFamilies, "return_positioning", "return_first_ball_goal", "volley_side", "volley_height", "volley_racket_face", "overhead_contact", "slice_response_pattern"],
    deepRequiredSlots: [
      "context.session_type",
      "context.movement",
      "outcome.primary_error",
      "subjective_feeling.rushed",
      "incoming_ball.depth"
    ],
    deepOptionalSlots: [],
    forbiddenSlots: ["context.serve_variant", "serve.control_pattern", "serve.mechanism_family", "skill_detail.return_positioning", "skill_detail.return_first_ball_goal", "skill_detail.volley_height", "skill_detail.volley_racket_face", "skill_detail.overhead_contact", "skill_detail.slice_response_pattern"],
    mechanismFamilies: ["movement_state", "incoming_ball_depth", "outcome_pattern"],
    maxDeepFollowups: 5,
    includeSlotAsRequired: ({ scenario, slot }) => {
      if (slot !== "incoming_ball.depth") {
        return true;
      }

      return scenario.context.movement === "moving" || scenario.context.session_type === "match";
    }
  },
  volley: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern", "volley_height", "volley_racket_face"],
    forbiddenQuestionFamilies: [...serveFamilies, ...incomingFamilies, "return_positioning", "return_first_ball_goal", "movement_context", "overhead_contact", "slice_response_pattern"],
    deepRequiredSlots: [
      "context.session_type",
      "outcome.primary_error",
      "skill_detail.volley_height",
      "skill_detail.volley_racket_face",
      "subjective_feeling.rushed"
    ],
    deepOptionalSlots: [],
    forbiddenSlots: ["context.serve_variant", "context.movement", "serve.control_pattern", "serve.mechanism_family", "incoming_ball.depth", "skill_detail.return_positioning", "skill_detail.return_first_ball_goal", "skill_detail.overhead_contact", "skill_detail.slice_response_pattern"],
    mechanismFamilies: ["contact_height", "racket_face"],
    maxDeepFollowups: 5
  },
  overhead: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern", "overhead_contact"],
    forbiddenQuestionFamilies: [...serveFamilies, ...incomingFamilies, "return_positioning", "return_first_ball_goal", "movement_context", "volley_side", "volley_height", "volley_racket_face", "slice_response_pattern"],
    deepRequiredSlots: ["context.session_type", "outcome.primary_error", "skill_detail.overhead_contact", "subjective_feeling.rushed"],
    deepOptionalSlots: [],
    forbiddenSlots: ["context.serve_variant", "context.movement", "serve.control_pattern", "serve.mechanism_family", "incoming_ball.depth", "skill_detail.return_positioning", "skill_detail.return_first_ball_goal", "skill_detail.volley_height", "skill_detail.volley_racket_face", "skill_detail.slice_response_pattern"],
    mechanismFamilies: ["contact_timing"],
    maxDeepFollowups: 4
  },
  slice: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern", "slice_response_pattern"],
    forbiddenQuestionFamilies: [...serveFamilies, ...incomingFamilies, "return_positioning", "return_first_ball_goal", "movement_context", "volley_side", "volley_height", "volley_racket_face", "overhead_contact"],
    deepRequiredSlots: ["context.session_type", "outcome.primary_error", "skill_detail.slice_response_pattern", "subjective_feeling.rushed"],
    deepOptionalSlots: [],
    forbiddenSlots: ["context.serve_variant", "context.movement", "serve.control_pattern", "serve.mechanism_family", "incoming_ball.depth", "skill_detail.return_positioning", "skill_detail.return_first_ball_goal", "skill_detail.volley_height", "skill_detail.volley_racket_face", "skill_detail.overhead_contact"],
    mechanismFamilies: ["response_pattern"],
    maxDeepFollowups: 4
  },
  contextual_match_situation: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern", "broad_shot_family_clarification"],
    forbiddenQuestionFamilies: [...serveFamilies, ...incomingFamilies, "return_positioning", "return_first_ball_goal", "movement_context", "volley_side", "volley_height", "volley_racket_face", "overhead_contact", "slice_response_pattern"],
    deepRequiredSlots: ["context.session_type", "stroke", "subjective_feeling.rushed"],
    deepOptionalSlots: ["outcome.primary_error"],
    forbiddenSlots: ["context.serve_variant", "context.movement", "serve.control_pattern", "serve.mechanism_family", "incoming_ball.depth", "skill_detail.return_positioning", "skill_detail.return_first_ball_goal", "skill_detail.volley_height", "skill_detail.volley_racket_face", "skill_detail.overhead_contact", "skill_detail.slice_response_pattern"],
    mechanismFamilies: ["session_context", "pressure_context", "broad_shot_family"],
    maxDeepFollowups: 4
  },
  generic_safe_fallback: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern", "broad_shot_family_clarification"],
    forbiddenQuestionFamilies: [...serveFamilies, ...incomingFamilies, "return_positioning", "return_first_ball_goal", "movement_context", "volley_side", "volley_height", "volley_racket_face", "overhead_contact", "slice_response_pattern"],
    deepRequiredSlots: ["context.session_type", "stroke", "subjective_feeling.rushed"],
    deepOptionalSlots: ["outcome.primary_error"],
    forbiddenSlots: ["context.serve_variant", "context.movement", "serve.control_pattern", "serve.mechanism_family", "incoming_ball.depth", "skill_detail.return_positioning", "skill_detail.return_first_ball_goal", "skill_detail.volley_height", "skill_detail.volley_racket_face", "skill_detail.overhead_contact", "skill_detail.slice_response_pattern"],
    mechanismFamilies: ["session_context", "pressure_context", "broad_shot_family"],
    maxDeepFollowups: 3
  }
};

export function getSkillCategoryPolicy(category: SkillCategory) {
  return policies[category];
}
