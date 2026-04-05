export type ScenarioLanguage = "zh" | "en" | "mixed";

export type ScenarioStroke =
  | "forehand"
  | "backhand"
  | "serve"
  | "return"
  | "volley"
  | "overhead"
  | "unknown";

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

export type MissingSlotPath =
  | "context.session_type"
  | "context.movement"
  | "outcome.primary_error"
  | "incoming_ball.depth"
  | "subjective_feeling.rushed";

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
  category: ScenarioQuestionCategory;
  target_slots: MissingSlotPath[];
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
  missing_slots: MissingSlotPath[];
  next_question_candidates: string[];
  selected_next_question_id: string | null;
};
