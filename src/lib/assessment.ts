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

const DIMENSION_LABELS: Record<AssessmentDimension, string> = {
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
  tactics: "策略执行"
};

const SUMMARY_TEMPLATES: Record<AssessmentLevel, string> = {
  "2.5": "你目前处于入门阶段，动作还在成型中。建议先稳定基础动作，不急着加力。",
  "3.0": "你已经能打起来了，但稳定性和控制力还有空间。建议先减少失误，再想变化。",
  "3.5": "你的基本功比较扎实，下一步可以开始练方向控制和节奏变化。",
  "4.0": "你已经有不错的全场能力，可以开始强化网前和战术执行。",
  "4.0+": "你的水平已经比较高了，建议针对比赛中的薄弱环节做专项强化。"
};

export function getDimensionLabel(key: DimensionKey): string {
  return DIMENSION_LABELS[key] ?? key;
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

  if (fineScore <= 5) {
    return "3.5";
  }

  if (fineScore <= 8) {
    return "4.0";
  }

  return "4.0+";
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
  level: AssessmentLevel
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
      label: getDimensionLabel(question.dimension),
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

function buildSummary(level: AssessmentLevel): string {
  return SUMMARY_TEMPLATES[level];
}

export function calculateAssessmentResult(
  answers: AssessmentAnswers,
  questions: AssessmentQuestion[] = assessmentQuestions,
  profile?: AssessmentProfile
): AssessmentResult {
  const coarseQuestions = getCoarseQuestions(questions);
  const coarseScore = coarseQuestions.reduce((sum, question) => sum + Number(answers[question.id] ?? 0), 0);
  const branch = determineBranch(coarseScore);
  const fineQuestions = getFineQuestionsForBranch(branch, questions);
  const fineScore = fineQuestions.reduce((sum, question) => sum + Number(answers[question.id] ?? 0), 0);
  const level = calculateLevel(coarseScore, fineScore);
  const scoredQuestions = [...coarseQuestions, ...fineQuestions];
  const dimensions = buildDimensionSummaries(scoredQuestions, answers, level);
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
    summary: buildSummary(level),
    profile,
    branch,
    coarseScore,
    fineScore
  };
}

export function getDefaultAssessmentResult(): AssessmentResult {
  return {
    totalScore: 0,
    maxScore: 24,
    normalizedScore: 0,
    answeredCount: 0,
    uncertainCount: 0,
    totalQuestions: 6,
    level: "2.5",
    confidence: "较低",
    dimensions: [],
    strengths: [],
    weaknesses: [],
    observationNeeded: [],
    summary: "请先完成评估题目，再查看你的参考能力区间。"
  };
}
