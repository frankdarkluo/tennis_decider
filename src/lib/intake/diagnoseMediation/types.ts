import type { SkillCategory } from "@/types/scenario";

export type { SkillCategory };

export type DiagnoseGateReason = "clear_enough" | "ambiguous" | "too_vague" | "transcript_noise";

export type DiagnoseGateDecision = {
  shouldMediate: boolean;
  reason: DiagnoseGateReason;
  lockedCategory: SkillCategory | null;
};

export type DiagnoseMediationMode = "skip" | "paraphrase" | "clarify" | "fallback";

export type DiagnoseMediationReason =
  | DiagnoseGateReason
  | "model_unavailable"
  | "low_confidence";

export type DiagnoseMediationRejectionReason =
  | "invalid_shape"
  | "missing_required_fields"
  | "contains_diagnosis_or_plan"
  | "contains_advice_or_chatty_text"
  | "contains_multiple_questions"
  | "empty_or_overlong";

export type DiagnoseMediationResult = {
  mode: DiagnoseMediationMode;
  reason: DiagnoseMediationReason;
  displayText: string | null;
  normalizedComplaint: string | null;
  clarificationQuestion: string | null;
};

export type DiagnoseMediationObservation =
  | {
    type: "gate";
    shouldMediate: boolean;
    reason: DiagnoseGateReason;
    lockedCategory: SkillCategory | null;
    clarificationUsed: boolean;
  }
  | {
    type: "mode";
    mode: DiagnoseMediationMode;
    reason: DiagnoseMediationReason;
    clarificationUsed: boolean;
  }
  | {
    type: "validator_rejected";
    rejectionReason: DiagnoseMediationRejectionReason;
  }
  | {
    type: "fallback";
    reason: "model_unavailable" | "low_confidence";
  };

export type ObserveDiagnoseMediation = (event: DiagnoseMediationObservation) => void;
