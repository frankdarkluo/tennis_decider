import type {
  IncomingBallDepth,
  MissingSlotPath,
  ScenarioLanguage,
  ScenarioMovement,
  ScenarioPrimaryError,
  ScenarioPressure,
  ScenarioSessionType,
  ScenarioStroke,
  ServeVariant
} from "@/types/scenario";

export type IntakeSkillCategory =
  | "serve"
  | "return"
  | "groundstroke"
  | "volley"
  | "overhead"
  | "slice"
  | "unknown";

export type IntakeSubjectiveFeeling =
  | "tight"
  | "rushed"
  | "awkward"
  | "hesitant"
  | "nervous"
  | "late_contact"
  | "no_timing";

export type StructuredTennisSceneExtraction = {
  skillCategory: IntakeSkillCategory;
  strokeFamily: ScenarioStroke;
  problemCandidate: ScenarioPrimaryError;
  outcome: ScenarioPrimaryError;
  movement: ScenarioMovement;
  pressureContext: ScenarioPressure;
  sessionType: ScenarioSessionType;
  serveSubtype: ServeVariant;
  subjectiveFeeling: IntakeSubjectiveFeeling[];
  incomingBallDepth: IncomingBallDepth;
  missingSlots: MissingSlotPath[];
  confidence: "low" | "medium" | "high";
  sourceLanguage: ScenarioLanguage;
  rawSummary: string | null;
};

const intakeSkillCategories = ["serve", "return", "groundstroke", "volley", "overhead", "slice", "unknown"] as const;
const strokeFamilies = ["forehand", "backhand", "groundstroke", "serve", "return", "volley", "overhead", "slice", "unknown"] as const;
const primaryErrors = ["net", "long", "wide", "weak", "late", "framed", "no_power", "no_control", "unknown"] as const;
const movements = ["stationary", "moving", "recovering", "approaching_net", "unknown"] as const;
const pressures = ["none", "some", "high", "unknown"] as const;
const sessionTypes = ["practice", "match", "both", "unknown"] as const;
const serveSubtypes = ["first_serve", "second_serve", "both", "unknown"] as const;
const subjectiveFeelings = ["tight", "rushed", "awkward", "hesitant", "nervous", "late_contact", "no_timing"] as const;
const incomingBallDepths = ["short", "mid", "deep", "unknown"] as const;
const missingSlotPaths = [
  "stroke",
  "context.session_type",
  "context.serve_variant",
  "context.movement",
  "outcome.primary_error",
  "serve.control_pattern",
  "serve.mechanism_family",
  "incoming_ball.depth",
  "subjective_feeling.rushed"
] as const;
const sourceLanguages = ["zh", "en", "mixed"] as const;
const confidenceLevels = ["low", "medium", "high"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T) {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

function pickArrayEnum<T extends string>(value: unknown, allowed: readonly T[]) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is T => typeof item === "string" && allowed.includes(item as T));
}

export function sanitizeTennisSceneExtraction(input: unknown): StructuredTennisSceneExtraction | null {
  if (!isRecord(input)) {
    return null;
  }

  const rawSummary = typeof input.rawSummary === "string" && input.rawSummary.trim()
    ? input.rawSummary.trim()
    : null;

  return {
    skillCategory: pickEnum(input.skillCategory, intakeSkillCategories, "unknown"),
    strokeFamily: pickEnum(input.strokeFamily, strokeFamilies, "unknown"),
    problemCandidate: pickEnum(input.problemCandidate, primaryErrors, "unknown"),
    outcome: pickEnum(input.outcome, primaryErrors, "unknown"),
    movement: pickEnum(input.movement, movements, "unknown"),
    pressureContext: pickEnum(input.pressureContext, pressures, "unknown"),
    sessionType: pickEnum(input.sessionType, sessionTypes, "unknown"),
    serveSubtype: pickEnum(input.serveSubtype, serveSubtypes, "unknown"),
    subjectiveFeeling: pickArrayEnum(input.subjectiveFeeling, subjectiveFeelings),
    incomingBallDepth: pickEnum(input.incomingBallDepth, incomingBallDepths, "unknown"),
    missingSlots: pickArrayEnum(input.missingSlots, missingSlotPaths),
    confidence: pickEnum(input.confidence, confidenceLevels, "low"),
    sourceLanguage: pickEnum(input.sourceLanguage, sourceLanguages, "mixed"),
    rawSummary
  };
}

export function hasStructuredSceneSignal(extraction: StructuredTennisSceneExtraction) {
  return (
    extraction.strokeFamily !== "unknown" ||
    extraction.problemCandidate !== "unknown" ||
    extraction.outcome !== "unknown" ||
    extraction.sessionType !== "unknown" ||
    extraction.pressureContext !== "unknown" ||
    extraction.movement !== "unknown" ||
    extraction.serveSubtype !== "unknown" ||
    extraction.incomingBallDepth !== "unknown" ||
    extraction.subjectiveFeeling.length > 0
  );
}
