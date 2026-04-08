export type ScenarioLanguage = "zh" | "en" | "mixed";

export type ScenarioStroke =
  | "forehand"
  | "backhand"
  | "groundstroke"
  | "serve"
  | "return"
  | "volley"
  | "overhead"
  | "slice"
  | "unknown";

export type ServeVariant = "first_serve" | "second_serve" | "both" | "unknown";
export type ScenarioSessionType = "practice" | "match" | "both" | "unknown";
export type ScenarioPressure = "none" | "some" | "high" | "unknown";
export type ScenarioMovement = "stationary" | "moving" | "recovering" | "approaching_net" | "unknown";
export type ScenarioFormat = "singles" | "doubles" | "unknown";
export type IncomingBallDepth = "short" | "mid" | "deep" | "unknown";
export type IncomingBallHeight = "low" | "waist" | "high" | "unknown";
export type IncomingBallPace = "slow" | "medium" | "fast" | "unknown";
export type IncomingBallSpin = "flat" | "topspin" | "slice" | "kick" | "unknown";
export type IncomingBallDirection = "fh_side" | "bh_side" | "body" | "unknown";
export type ScenarioPrimaryError =
  | "net"
  | "long"
  | "wide"
  | "weak"
  | "late"
  | "framed"
  | "no_power"
  | "no_control"
  | "unknown";
export type ScenarioFrequency = "rare" | "sometimes" | "often" | "always" | "unknown";
export type ScenarioUserConfidence = "low" | "medium" | "high" | "unknown";
export type SlotResolutionState = "unasked" | "answered" | "skipped" | "cannot_answer";

export type MissingSlotPath =
  | "stroke"
  | "context.session_type"
  | "context.serve_variant"
  | "context.movement"
  | "outcome.primary_error"
  | "incoming_ball.depth"
  | "subjective_feeling.rushed";

export type SlotResolutionMap = Record<MissingSlotPath, SlotResolutionState>;

export type SkillCategory =
  | "serve"
  | "return"
  | "groundstroke_set"
  | "groundstroke_on_move"
  | "volley"
  | "overhead"
  | "slice"
  | "contextual_match_situation"
  | "generic_safe_fallback";

export type QuestionFamily =
  | "session_context"
  | "pressure_context"
  | "broad_shot_family_clarification"
  | "movement_context"
  | "outcome_pattern"
  | "incoming_ball_depth"
  | "serve_variant"
  | "serve_toss"
  | "serve_contact"
  | "serve_side"
  | "serve_spin_control"
  | "return_positioning"
  | "return_first_ball_goal"
  | "groundstroke_side"
  | "groundstroke_contact_height"
  | "volley_side"
  | "volley_height"
  | "volley_racket_face"
  | "overhead_contact"
  | "slice_response_pattern";

export type SkillCategoryInference = {
  category: SkillCategory;
  confidence: "high" | "medium" | "low";
  reasons: string[];
};

export type DeepModeProgress = {
  deepReady: boolean;
  stoppedByCap: boolean;
  requiredRemaining: MissingSlotPath[];
  optionalRemaining: MissingSlotPath[];
  unresolvedRequiredBecauseOfSkip: MissingSlotPath[];
  unresolvedRequiredBecauseUnavailable: MissingSlotPath[];
};

export type ScenarioQuestionCategory =
  | "scenario_localization"
  | "outcome_clarification"
  | "subjective_experience";

export type ScenarioQuestionOption = {
  key: string;
  zh: string;
  en: string;
};

export type ScenarioQuestion = {
  id: string;
  family: QuestionFamily;
  category: ScenarioQuestionCategory;
  target_slots: MissingSlotPath[];
  fillsSlots: MissingSlotPath[];
  priority: number;
  zh: string;
  en: string;
  ask_when: string[];
  do_not_ask_when: string[];
  information_gain_weight: number;
  presupposition_risk: number;
  easy_to_answer_score: number;
  options: ScenarioQuestionOption[];
};

export type ScenarioState = {
  raw_user_input: string;
  language: ScenarioLanguage;
  stroke: ScenarioStroke;
  context: {
    session_type: ScenarioSessionType;
    serve_variant: ServeVariant;
    pressure: ScenarioPressure;
    movement: ScenarioMovement;
    format: ScenarioFormat;
  };
  incoming_ball: {
    depth: IncomingBallDepth;
    height: IncomingBallHeight;
    pace: IncomingBallPace;
    spin: IncomingBallSpin;
    direction: IncomingBallDirection;
  };
  outcome: {
    primary_error: ScenarioPrimaryError;
    frequency: ScenarioFrequency;
  };
  subjective_feeling: {
    tight: boolean;
    rushed: boolean;
    awkward: boolean;
    hesitant: boolean;
    nervous: boolean;
    late_contact: boolean;
    no_timing: boolean;
    other: string[];
  };
  user_confidence: ScenarioUserConfidence;
  slot_resolution: SlotResolutionMap;
  deep_progress: DeepModeProgress;
  missing_slots: MissingSlotPath[];
  next_question_candidates: string[];
  selected_next_question_id: string | null;
  asked_followup_ids: string[];
};
