import { assessmentQuestions } from "@/data/assessmentQuestions";
import {
  AssessmentAnswers,
  AssessmentBranch,
  AssessmentDimension,
  AssessmentLevel,
  AssessmentProfile,
  AssessmentQuestion,
  AssessmentResult,
  DimensionKey,
  DimensionSummary
} from "@/types/assessment";

type AssessmentLocale = "zh" | "en";

const DIMENSION_LABELS_ZH: Record<AssessmentDimension, string> = {
  basics: "基础稳定性",
  forehand: "正手",
  backhand: "反手",
  serve: "发球",
  net: "网前",
  movement: "移动",
  matchplay: "比赛意识",
  rally: "对拉稳定性",
  awareness: "比赛意识",
  fundamentals: "基础动作",
  receiving: "接球应变",
  consistency: "稳定性",
  both_sides: "正反手均衡",
  direction: "方向控制",
  rhythm: "节奏适应",
  net_play: "网前",
  depth_variety: "深度和变化",
  forcing: "施压能力",
  tactics: "策略执行",
  tactical_adaptability: "战术适应",
  pressure_performance: "关键分表现"
};

const DIMENSION_LABELS_EN: Record<AssessmentDimension, string> = {
  basics: "baseline stability",
  forehand: "forehand",
  backhand: "backhand",
  serve: "serve",
  net: "net play",
  movement: "movement",
  matchplay: "match play",
  rally: "rally stability",
  awareness: "match awareness",
  fundamentals: "fundamentals",
  receiving: "receiving skills",
  consistency: "consistency",
  both_sides: "forehand-backhand balance",
  direction: "direction control",
  rhythm: "timing",
  net_play: "net play",
  depth_variety: "depth and variation",
  forcing: "pressure skills",
  tactics: "tactical execution",
  tactical_adaptability: "tactical adaptability",
  pressure_performance: "big-point performance"
};

const SUMMARY_TEMPLATES_ZH: Record<AssessmentLevel, string> = {
  "2.5": "你目前处于入门阶段，动作还在成型中。建议先稳定基础动作，不急着加力。",
  "3.0": "你已经能打起来了，但稳定性和控制力还有空间。建议先减少失误，再想变化。",
  "3.5": "你的基本功比较扎实，下一步可以开始练方向控制和节奏变化。",
  "4.0": "你已经有不错的全场能力，可以开始强化网前和战术执行。",
  "4.5": "你的水平已经很高，力量和旋转运用成熟，建议针对比赛中的薄弱环节做专项强化。"
};

const SUMMARY_TEMPLATES_EN: Record<AssessmentLevel, string> = {
  "2.5": "You are still in the early stage. Build a steadier basic swing first before adding pace.",
  "3.0": "You can already rally, but stability and control still need work. Clean up errors before adding variety.",
  "3.5": "Your fundamentals are taking shape. The next step is direction control and better rhythm changes.",
  "4.0": "You already have solid all-court foundations. It is worth sharpening net play and tactical execution next.",
  "4.5": "You are playing at an advanced level with strong power and spin. Target your remaining match-day weaknesses for the next gains."
};

const CONFIDENCE_LABELS = {
  zh: {
    low: "较低",
    medium: "中等",
    high: "较高"
  },
  en: {
    low: "Lower confidence",
    medium: "Medium confidence",
    high: "Higher confidence"
  }
} as const;

const STATUS_LABELS = {
  zh: {
    normal: "正常",
    watch: "待观察"
  },
  en: {
    normal: "solid",
    watch: "watch next"
  }
} as const;

function resolveDimensionKey(label: string): AssessmentDimension | null {
  const foundZh = (Object.entries(DIMENSION_LABELS_ZH) as Array<[AssessmentDimension, string]>)
    .find(([, value]) => value === label)?.[0];
  if (foundZh) {
    return foundZh;
  }

  const foundEn = (Object.entries(DIMENSION_LABELS_EN) as Array<[AssessmentDimension, string]>)
    .find(([, value]) => value === label)?.[0];
  return foundEn ?? null;
}

export function getDimensionLabel(key: DimensionKey, locale: AssessmentLocale = "zh"): string {
  const dictionary = locale === "en" ? DIMENSION_LABELS_EN : DIMENSION_LABELS_ZH;
  return dictionary[key] ?? key;
}

export function translateAssessmentLabel(label: string, locale: AssessmentLocale = "zh"): string {
  const key = resolveDimensionKey(label);
  if (!key) {
    return label;
  }

  return getDimensionLabel(key, locale);
}

export function getAssessmentConfidenceLabel(
  confidence: AssessmentResult["confidence"],
  locale: AssessmentLocale = "zh"
) {
  if (confidence === "较高") {
    return CONFIDENCE_LABELS[locale].high;
  }

  if (confidence === "中等") {
    return CONFIDENCE_LABELS[locale].medium;
  }

  return CONFIDENCE_LABELS[locale].low;
}

export function getAssessmentStatusLabel(status: DimensionSummary["status"], locale: AssessmentLocale = "zh") {
  if (status === "待观察") {
    return STATUS_LABELS[locale].watch;
  }

  return STATUS_LABELS[locale].normal;
}

export function getAssessmentSummary(level: AssessmentLevel, locale: AssessmentLocale = "zh") {
  return (locale === "en" ? SUMMARY_TEMPLATES_EN : SUMMARY_TEMPLATES_ZH)[level];
}

export function getAssessmentDefaultSummary(locale: AssessmentLocale = "zh") {
  return locale === "en"
    ? "Complete the assessment first, then we will estimate your current range."
    : "请先完成评估题目，再查看你的参考能力区间。";
}

export function getAssessmentFallbackStrength(locale: AssessmentLocale = "zh") {
  return locale === "en" ? "baseline stability" : "基础稳定性";
}

export function getAssessmentFallbackWeakness(locale: AssessmentLocale = "zh") {
  return locale === "en" ? "the next ball under pressure" : "比赛中的下一拍处理";
}

export function getCoarseQuestions(questions: AssessmentQuestion[] = assessmentQuestions) {
  return questions.filter((question) => question.phase === "coarse");
}

export function getFineQuestionsForBranch(
  branch: AssessmentBranch,
  questions: AssessmentQuestion[] = assessmentQuestions
) {
  return questions.filter((question) => question.phase === "fine" && question.branch === branch);
}

export function determineBranch(coarseScore: number): AssessmentBranch {
  if (coarseScore <= 5) {
    return "A";
  }

  if (coarseScore <= 8) {
    return "B";
  }

  return "C";
}

export function calculateLevel(coarseScore: number, fineScore: number): AssessmentLevel {
  const branch = determineBranch(coarseScore);

  if (branch === "A") {
    return fineScore <= 5 ? "2.5" : "3.0";
  }

  if (branch === "B") {
    return fineScore <= 5 ? "3.0" : "3.5";
  }

  // Branch C: 5 questions, max 20 points
  if (fineScore <= 10) {
    return "3.5";
  }

  if (fineScore <= 15) {
    return "4.0";
  }

  return "4.5";
}

function getConfidence(answeredCount: number, totalQuestions: number): AssessmentResult["confidence"] {
  if (answeredCount <= 2) {
    return "较低";
  }

  if (answeredCount < totalQuestions) {
    return "中等";
  }

  return "较高";
}

function buildDimensionSummaries(
  questions: AssessmentQuestion[],
  answers: AssessmentAnswers,
  level: AssessmentLevel,
  locale: AssessmentLocale = "zh"
): DimensionSummary[] {
  return questions.reduce<DimensionSummary[]>((acc, question) => {
    if (!question.dimension) {
      return acc;
    }

    const score = Number(answers[question.id] ?? 0);
    const status: DimensionSummary["status"] = score === 1 ? "待观察" : "正常";

    if (score <= 0) {
      return acc;
    }

    acc.push({
      key: question.dimension,
      label: getDimensionLabel(question.dimension, locale),
      score,
      maxScore: 4,
      average: score,
      levelHint: level,
      answeredCount: 1,
      uncertainCount: 0,
      status
    });

    return acc;
  }, []);
}

function buildStrengths(dimensions: DimensionSummary[]) {
  return dimensions.filter((dimension) => dimension.score >= 3).map((dimension) => dimension.label);
}

function buildWeaknesses(dimensions: DimensionSummary[]) {
  return dimensions.filter((dimension) => dimension.score === 1).map((dimension) => dimension.label);
}

function buildSummary(level: AssessmentLevel, locale: AssessmentLocale = "zh"): string {
  return (locale === "en" ? SUMMARY_TEMPLATES_EN : SUMMARY_TEMPLATES_ZH)[level];
}

export function calculateAssessmentResult(
  answers: AssessmentAnswers,
  questions: AssessmentQuestion[] = assessmentQuestions,
  profile?: AssessmentProfile,
  locale: AssessmentLocale = "zh"
): AssessmentResult {
  const coarseQuestions = getCoarseQuestions(questions);
  const coarseScore = coarseQuestions.reduce((sum, question) => sum + Number(answers[question.id] ?? 0), 0);
  const branch = determineBranch(coarseScore);
  const fineQuestions = getFineQuestionsForBranch(branch, questions);
  const fineScore = fineQuestions.reduce((sum, question) => sum + Number(answers[question.id] ?? 0), 0);
  const level = calculateLevel(coarseScore, fineScore);
  const scoredQuestions = [...coarseQuestions, ...fineQuestions];
  const dimensions = buildDimensionSummaries(scoredQuestions, answers, level, locale);
  const strengths = buildStrengths(dimensions);
  const weaknesses = buildWeaknesses(dimensions);
  const answeredCount = scoredQuestions.filter((question) => Number(answers[question.id] ?? 0) > 0).length;
  const totalQuestions = scoredQuestions.length;
  const totalScore = coarseScore + fineScore;
  const maxScore = totalQuestions * 4;

  return {
    totalScore,
    maxScore,
    normalizedScore: totalScore,
    answeredCount,
    uncertainCount: 0,
    totalQuestions,
    level,
    confidence: getConfidence(answeredCount, totalQuestions),
    dimensions,
    strengths,
    weaknesses,
    observationNeeded: [],
    summary: buildSummary(level, locale),
    profile,
    branch,
    coarseScore,
    fineScore
  };
}

export function getDefaultAssessmentResult(locale: AssessmentLocale = "zh"): AssessmentResult {
  return {
    totalScore: 0,
    maxScore: 32,
    normalizedScore: 0,
    answeredCount: 0,
    uncertainCount: 0,
    totalQuestions: 8,
    level: "2.5",
    confidence: "较低",
    dimensions: [],
    strengths: [],
    weaknesses: [],
    observationNeeded: [],
    summary: locale === "en"
      ? "Complete the assessment first, then we will estimate your current range."
      : "请先完成评估题目，再查看你的参考能力区间。"
  };
}
