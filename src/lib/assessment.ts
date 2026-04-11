import { ASSESSMENT_QUESTIONS, SCORED_QUESTION_IDS } from "@/data/assessmentQuestions";
import { buildPlayerProfileVector } from "@/lib/assessment/profile";
import type {
  AssessmentAnswerMap,
  AssessmentDimensionStatus,
  AssessmentResult,
  DimensionSummary,
  LevelBand,
  PlayContext,
  PlayStyle,
  PlayerProfileVector,
  ScoredDimension
} from "@/types/assessment";

type AssessmentLocale = "zh" | "en";
type LegacyAssessmentDimensionLike = {
  key?: string;
  label?: string;
  score?: number;
  average?: number;
};
type LegacyAssessmentLike = {
  version?: string;
  level?: string | null;
  totalScore?: number;
  answeredCount?: number;
  coreAnsweredCount?: number;
  totalQuestions?: number;
  completedAt?: string;
  created_at?: string;
  answers?: AssessmentAnswerMap;
  dimensions?: LegacyAssessmentDimensionLike[];
  strengths?: string[];
  weaknesses?: string[];
  summary?: string | null;
};

const DIMENSION_LABELS_ZH: Record<ScoredDimension, string> = {
  rally: "对拉稳定性",
  forehand: "正手主动能力",
  backhand_slice: "反手与切削",
  serve: "发球",
  return: "接发",
  movement: "跑动与还原",
  net: "网前与截击",
  overhead: "高球与高压",
  pressure: "关键分与压力处理",
  tactics: "战术组织"
};

const DIMENSION_LABELS_EN: Record<ScoredDimension, string> = {
  rally: "rally stability",
  forehand: "forehand weapon",
  backhand_slice: "backhand and slice",
  serve: "serve quality",
  return: "return quality",
  movement: "movement and recovery",
  net: "net transition and volley",
  overhead: "high ball and overhead",
  pressure: "pressure match play",
  tactics: "point construction"
};

const PLAY_STYLE_LABELS_ZH: Record<PlayStyle, string> = {
  defensive: "稳定防守型",
  baseline_attack: "底线推进型",
  all_court: "全场过渡型",
  net_pressure: "网前压迫型"
};

const PLAY_STYLE_LABELS_EN: Record<PlayStyle, string> = {
  defensive: "defensive",
  baseline_attack: "baseline attack",
  all_court: "all-court",
  net_pressure: "net pressure"
};

const PLAY_CONTEXT_LABELS_ZH: Record<PlayContext, string> = {
  singles_standard: "单打为主",
  singles_limited_mobility: "单打为主但需控负荷",
  mixed_with_doubles: "单双都打",
  doubles_primary: "双打为主"
};

const PLAY_CONTEXT_LABELS_EN: Record<PlayContext, string> = {
  singles_standard: "singles first",
  singles_limited_mobility: "singles with load control",
  mixed_with_doubles: "singles and doubles mix",
  doubles_primary: "doubles first"
};

const STATUS_LABELS: Record<AssessmentLocale, Record<AssessmentDimensionStatus, string>> = {
  zh: {
    weak: "薄弱",
    needs_work: "待提升",
    normal: "正常",
    strength: "强项"
  },
  en: {
    weak: "weak",
    needs_work: "needs work",
    normal: "normal",
    strength: "strength"
  }
};

const DEFAULT_DIMENSION_SCORES: Record<ScoredDimension, 1 | 2 | 3 | 4> = {
  rally: 3,
  forehand: 3,
  backhand_slice: 3,
  serve: 3,
  return: 3,
  movement: 3,
  net: 3,
  overhead: 3,
  pressure: 3,
  tactics: 3
};

const LEGACY_DIMENSION_ALIASES: Record<string, ScoredDimension> = {
  rally: "rally",
  "对拉稳定性": "rally",
  forehand: "forehand",
  "正手": "forehand",
  "正手主动能力": "forehand",
  backhand: "backhand_slice",
  both_sides: "backhand_slice",
  slice: "backhand_slice",
  "反手": "backhand_slice",
  "切削": "backhand_slice",
  "反手与切削": "backhand_slice",
  serve: "serve",
  "发球": "serve",
  receiving: "return",
  return: "return",
  "接发": "return",
  movement: "movement",
  rhythm: "movement",
  "移动": "movement",
  "跑动与还原": "movement",
  net: "net",
  volley: "net",
  net_play: "net",
  "网前": "net",
  "截击": "net",
  "网前与截击": "net",
  overhead: "overhead",
  "高压球": "overhead",
  "高球与高压": "overhead",
  pressure: "pressure",
  matchplay: "pressure",
  awareness: "pressure",
  pressure_performance: "pressure",
  "比赛意识": "pressure",
  "关键分与压力处理": "pressure",
  tactics: "tactics",
  tactical_adaptability: "tactics",
  "战术组织": "tactics"
};

function getDimensionStatus(score: DimensionSummary["score"]): AssessmentDimensionStatus {
  if (score === 1) {
    return "weak";
  }

  if (score === 2) {
    return "needs_work";
  }

  if (score === 4) {
    return "strength";
  }

  return "normal";
}

function coerceDimensionScore(value: unknown): 1 | 2 | 3 | 4 | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const rounded = Math.round(value);

  if (rounded <= 1) return 1;
  if (rounded === 2) return 2;
  if (rounded === 3) return 3;
  return 4;
}

function normalizeLegacyLevelBand(value: unknown): LevelBand | null {
  if (value === "2.5" || value === "3.0" || value === "3.5" || value === "4.0" || value === "4.0+") {
    return value;
  }

  if (value === "4.5") {
    return "4.0+";
  }

  return null;
}

function normalizeLegacyDimension(rawKey?: string, rawLabel?: string): ScoredDimension | null {
  const candidates = [rawKey, rawLabel]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => value.trim().toLowerCase());

  for (const candidate of candidates) {
    const mapped = LEGACY_DIMENSION_ALIASES[candidate];
    if (mapped) {
      return mapped;
    }
  }

  return null;
}

function mapLegacyRawScoreToLevelBand(rawScore: number): LevelBand {
  if (rawScore >= 36) return "4.0+";
  if (rawScore >= 30) return "4.0";
  if (rawScore >= 23) return "3.5";
  if (rawScore >= 16) return "3.0";
  return "2.5";
}

function deriveLegacyDimensionScores(dimensions: LegacyAssessmentDimensionLike[] | undefined) {
  const dimensionScores = { ...DEFAULT_DIMENSION_SCORES };

  for (const dimension of dimensions ?? []) {
    const normalizedDimension = normalizeLegacyDimension(dimension.key, dimension.label);
    const normalizedScore = coerceDimensionScore(dimension.score ?? dimension.average);

    if (normalizedDimension && normalizedScore) {
      dimensionScores[normalizedDimension] = normalizedScore;
    }
  }

  return dimensionScores;
}

function getLegacyStrongDimensions(
  dimensionScores: PlayerProfileVector["dimensionScores"],
  strengths?: string[]
): ScoredDimension[] {
  const labeledStrengths = (strengths ?? [])
    .map((label) => normalizeLegacyDimension(label))
    .filter((value): value is ScoredDimension => Boolean(value));

  if (labeledStrengths.length > 0) {
    return Array.from(new Set(labeledStrengths)).slice(0, 2);
  }

  return (Object.entries(dimensionScores) as Array<[ScoredDimension, 1 | 2 | 3 | 4]>)
    .sort((left, right) => right[1] - left[1])
    .filter(([, score]) => score >= 3)
    .map(([dimension]) => dimension)
    .slice(0, 2);
}

function getLegacyWeakDimensions(
  dimensionScores: PlayerProfileVector["dimensionScores"],
  weaknesses?: string[]
): ScoredDimension[] {
  const labeledWeaknesses = (weaknesses ?? [])
    .map((label) => normalizeLegacyDimension(label))
    .filter((value): value is ScoredDimension => Boolean(value));

  if (labeledWeaknesses.length > 0) {
    return Array.from(new Set(labeledWeaknesses)).slice(0, 3);
  }

  return (Object.entries(dimensionScores) as Array<[ScoredDimension, 1 | 2 | 3 | 4]>)
    .filter(([, score]) => score <= 2)
    .sort((left, right) => left[1] - right[1])
    .map(([dimension]) => dimension)
    .slice(0, 3);
}

function hasAllScoredAnswers(answers: AssessmentAnswerMap) {
  return SCORED_QUESTION_IDS.every((id) => Boolean(answers[id]));
}

export function getDimensionLabel(key: ScoredDimension, locale: AssessmentLocale = "zh") {
  return locale === "en" ? DIMENSION_LABELS_EN[key] : DIMENSION_LABELS_ZH[key];
}

export function getPlayStyleLabel(value: PlayStyle, locale: AssessmentLocale = "zh") {
  return locale === "en" ? PLAY_STYLE_LABELS_EN[value] : PLAY_STYLE_LABELS_ZH[value];
}

export function getPlayContextLabel(value: PlayContext, locale: AssessmentLocale = "zh") {
  return locale === "en" ? PLAY_CONTEXT_LABELS_EN[value] : PLAY_CONTEXT_LABELS_ZH[value];
}

export function getAssessmentStatusLabel(status: AssessmentDimensionStatus, locale: AssessmentLocale = "zh") {
  return STATUS_LABELS[locale][status];
}

export function formatAssessmentLevelRange(level: LevelBand) {
  return level;
}

function buildLocalizedProfileSummary(profileVector: PlayerProfileVector, locale: AssessmentLocale) {
  const primaryWeaknessLabel = profileVector.primaryWeakness
    ? getDimensionLabel(profileVector.primaryWeakness, locale)
    : null;

  if (locale === "en") {
    return {
      headline: primaryWeaknessLabel
        ? `The current priority to strengthen is ${primaryWeaknessLabel}`
        : "Your current profile is relatively balanced, so you can move into more specific development next.",
      oneLineLevelSummary: `You are roughly in the ${profileVector.levelBand} band right now.`,
      oneLinePlanHint: primaryWeaknessLabel
        ? `The next plan should start from ${primaryWeaknessLabel}.`
        : "The next plan can start from a general build block or a more personal specialty."
    };
  }

  return {
    headline: primaryWeaknessLabel
      ? `当前最值得优先补强的是${primaryWeaknessLabel}`
      : "当前能力分布相对均衡，可以开始更细的专项提升",
    oneLineLevelSummary: `你目前大致在 ${profileVector.levelBand} 区间。`,
    oneLinePlanHint: primaryWeaknessLabel
      ? `后续训练计划应先围绕${primaryWeaknessLabel}展开。`
      : "后续训练计划可以从综合提升或个性化专项开始。"
  };
}

export function buildAssessmentDimensionSummaries(profileVector: PlayerProfileVector): DimensionSummary[] {
  return (Object.entries(profileVector.dimensionScores) as Array<[ScoredDimension, 1 | 2 | 3 | 4]>)
    .map(([key, score]) => ({
      key,
      score,
      maxScore: 4 as const,
      status: getDimensionStatus(score)
    }))
    .sort((left, right) => left.score - right.score);
}

export function calculateAssessmentResult(answers: AssessmentAnswerMap): AssessmentResult {
  const profileVector = buildPlayerProfileVector(answers);

  return {
    version: "assessment_10_plus_2",
    answeredCount: ASSESSMENT_QUESTIONS.filter((question) => Boolean(answers[question.id])).length,
    coreAnsweredCount: SCORED_QUESTION_IDS.filter((id) => Boolean(answers[id])).length,
    totalQuestions: ASSESSMENT_QUESTIONS.length,
    profileVector,
    dimensionSummaries: buildAssessmentDimensionSummaries(profileVector),
    completedAt: new Date().toISOString()
  };
}

export function migrateLegacyAssessmentResult(input: unknown): AssessmentResult | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const legacy = input as LegacyAssessmentLike;

  if (legacy.version === "assessment_10_plus_2" && "profileVector" in legacy) {
    return legacy as AssessmentResult;
  }

  if (legacy.answers && hasAllScoredAnswers(legacy.answers)) {
    const recalculated = calculateAssessmentResult(legacy.answers);
    return {
      ...recalculated,
      completedAt: typeof legacy.completedAt === "string" ? legacy.completedAt : recalculated.completedAt
    };
  }

  const dimensionScores = deriveLegacyDimensionScores(legacy.dimensions);
  const rawScore = typeof legacy.totalScore === "number"
    ? legacy.totalScore
    : (Object.values(dimensionScores) as Array<1 | 2 | 3 | 4>).reduce((sum, score) => sum + score, 0);
  const levelBand = normalizeLegacyLevelBand(legacy.level) ?? mapLegacyRawScoreToLevelBand(rawScore);
  const weakDimensions = getLegacyWeakDimensions(dimensionScores, legacy.weaknesses);
  const strongDimensions = getLegacyStrongDimensions(dimensionScores, legacy.strengths);
  const primaryWeakness = weakDimensions[0];
  const secondaryWeakness = weakDimensions[1];
  const primaryWeaknessLabel = primaryWeakness ? getDimensionLabel(primaryWeakness, "zh") : "当前最弱环节";
  const profileVector: PlayerProfileVector = {
    rawScore,
    levelBand,
    dimensionScores,
    weakDimensions,
    strongDimensions,
    primaryWeakness,
    secondaryWeakness,
    playStyle: "baseline_attack",
    playContext: "singles_standard",
    summary: {
      headline: typeof legacy.summary === "string" && legacy.summary.trim().length > 0
        ? legacy.summary.trim()
        : `当前最值得优先补强的是${primaryWeaknessLabel}`,
      oneLineLevelSummary: `你目前大致在 ${levelBand} 区间。`,
      oneLinePlanHint: primaryWeakness
        ? `后续训练计划应先围绕${primaryWeaknessLabel}展开。`
        : "后续训练计划可以从综合提升或个性化专项开始。"
    }
  };
  const answeredCount = typeof legacy.answeredCount === "number" ? legacy.answeredCount : 0;
  const totalQuestions = typeof legacy.totalQuestions === "number"
    ? legacy.totalQuestions
    : answeredCount > 0
      ? answeredCount
      : ASSESSMENT_QUESTIONS.length;

  return {
    version: "assessment_10_plus_2",
    answeredCount,
    coreAnsweredCount: typeof legacy.coreAnsweredCount === "number"
      ? legacy.coreAnsweredCount
      : Math.min(answeredCount, SCORED_QUESTION_IDS.length),
    totalQuestions,
    profileVector,
    dimensionSummaries: buildAssessmentDimensionSummaries(profileVector),
    completedAt: typeof legacy.completedAt === "string"
      ? legacy.completedAt
      : typeof legacy.created_at === "string"
        ? legacy.created_at
        : undefined
  };
}

export function getLocalizedAssessmentResult(
  result: AssessmentResult,
  locale: AssessmentLocale = "zh"
): AssessmentResult {
  if (!result.profileVector) {
    return result;
  }

  return {
    ...result,
    profileVector: {
      ...result.profileVector,
      summary: buildLocalizedProfileSummary(result.profileVector, locale)
    }
  };
}

export function getDefaultAssessmentResult(_locale: AssessmentLocale = "zh"): AssessmentResult {
  return {
    version: "assessment_10_plus_2",
    answeredCount: 0,
    coreAnsweredCount: 0,
    totalQuestions: ASSESSMENT_QUESTIONS.length,
    profileVector: null,
    dimensionSummaries: []
  };
}

export function getAssessmentLevelBand(result?: AssessmentResult | null) {
  return result?.profileVector?.levelBand ?? null;
}
