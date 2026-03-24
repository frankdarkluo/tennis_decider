import { assessmentQuestions } from "@/data/assessmentQuestions";
import {
  AssessmentAnswers,
  AssessmentQuestion,
  AssessmentResult,
  DimensionKey,
  DimensionSummary
} from "@/types/assessment";

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  forehand: "正手",
  backhand: "反手",
  serve: "发球",
  net: "网前",
  movement: "移动",
  matchplay: "比赛意识"
};

export function getDimensionLabel(key: DimensionKey): string {
  return DIMENSION_LABELS[key] ?? key;
}

export function getLevelFromScore(score: number): "3.0" | "3.5" | "4.0" {
  if (score <= 18) return "3.0";
  if (score <= 30) return "3.5";
  return "4.0";
}

export function getLevelHintFromAverage(avg: number): "3.0" | "3.5" | "4.0" {
  if (avg <= 2.3) return "3.0";
  if (avg <= 3.8) return "3.5";
  return "4.0";
}

export function getConfidence(
  answeredCount: number,
  uncertainCount: number,
  totalQuestions: number
): "较低" | "中等" | "较高" {
  const effectiveRatio = totalQuestions === 0 ? 0 : answeredCount / totalQuestions;
  if (effectiveRatio < 0.5 || uncertainCount >= 3) return "较低";
  if (effectiveRatio < 0.875 || uncertainCount >= 1) return "中等";
  return "较高";
}

export function buildSummary(
  level: "3.0" | "3.5" | "4.0",
  weaknesses: string[],
  strengths: string[],
  observationNeeded: string[]
): string {
  const weaknessText = weaknesses.length > 0 ? weaknesses.join("、") : "整体稳定性";
  const strengthText = strengths.length > 0 ? strengths.join("、") : "基础击球";

  if (observationNeeded.length > 0) {
    return `你的参考能力区间更接近 ${level}。目前相对短板集中在 ${weaknessText}，相对优势是 ${strengthText}。不过 ${observationNeeded.join("、")} 这几个维度你选择了“不太确定”，建议后续结合训练或内容再观察。`;
  }

  if (level === "3.0") {
    return `你的能力区间更接近 3.0，目前更需要先建立稳定性，尤其建议优先补强 ${weaknessText}。相对来说，你在 ${strengthText} 上已经有一定基础。`;
  }

  if (level === "3.5") {
    return `你的能力区间更接近 3.5，已经具备一定对抗能力，但在 ${weaknessText} 上还有明显提升空间。相对优势是 ${strengthText}。`;
  }

  return `你的能力区间更接近 4.0，整体基础较完整，但如果继续提升，建议重点优化 ${weaknessText}。你当前相对更成熟的环节是 ${strengthText}。`;
}

export function calculateAssessmentResult(
  answers: AssessmentAnswers,
  questions: AssessmentQuestion[] = assessmentQuestions
): AssessmentResult {
  const totalQuestions = questions.length;
  const uncertainQuestions = questions.filter((q) => answers[q.id] === 0);
  const scoringQuestions = questions.filter((q) => typeof answers[q.id] === "number" && answers[q.id] > 0);
  const answeredCount = scoringQuestions.length;
  const uncertainCount = uncertainQuestions.length;

  const rawTotalScore = scoringQuestions.reduce((sum, q) => sum + Number(answers[q.id] ?? 0), 0);
  const maxScore = totalQuestions * 5;
  const normalizedScore =
    answeredCount === 0
      ? 0
      : Math.round((rawTotalScore / answeredCount) * totalQuestions);

  const totalScore = normalizedScore;
  const level = getLevelFromScore(totalScore);
  const confidence = getConfidence(answeredCount, uncertainCount, totalQuestions);

  const grouped = questions.reduce<Record<DimensionKey, number[]>>((acc, question) => {
    const key = question.dimension as DimensionKey;
    const value = answers[question.id];
    if (typeof value === "number") {
      if (!acc[key]) acc[key] = [];
      acc[key].push(value);
    }
    return acc;
  }, {} as Record<DimensionKey, number[]>);

  const allDimensionKeys: DimensionKey[] = [
    "forehand",
    "backhand",
    "serve",
    "net",
    "movement",
    "matchplay"
  ];

  const dimensions: DimensionSummary[] = allDimensionKeys
    .map((key) => {
      const relatedQuestions = questions.filter((q) => q.dimension === key);
      const values = relatedQuestions.map((q) => answers[q.id]).filter((v): v is number => typeof v === "number");
      const positiveValues = values.filter((v) => v > 0);
      const uncertainValues = values.filter((v) => v === 0);

      if (values.length === 0) {
        return null;
      }

      const score = positiveValues.reduce((sum, v) => sum + v, 0);
      const max = relatedQuestions.length * 5;
      const average = positiveValues.length > 0 ? Number((score / positiveValues.length).toFixed(2)) : 0;

      return {
        key,
        label: getDimensionLabel(key),
        score,
        maxScore: max,
        average,
        levelHint: positiveValues.length > 0 ? getLevelHintFromAverage(average) : "3.0",
        answeredCount: positiveValues.length,
        uncertainCount: uncertainValues.length,
        status: positiveValues.length === 0 || uncertainValues.length > 0 ? "待观察" : "正常"
      };
    })
    .filter((item): item is DimensionSummary => Boolean(item));

  const scoredDimensions = dimensions.filter((d) => d.answeredCount > 0);

  const strengths = [...scoredDimensions]
    .sort((a, b) => b.average - a.average)
    .slice(0, 2)
    .map((d) => d.label);

  const weaknesses = [...scoredDimensions]
    .sort((a, b) => a.average - b.average)
    .slice(0, 2)
    .map((d) => d.label);

  const observationNeeded = dimensions
    .filter((d) => d.status === "待观察")
    .map((d) => d.label);

  const summary = buildSummary(level, weaknesses, strengths, observationNeeded);

  return {
    totalScore,
    maxScore,
    normalizedScore,
    answeredCount,
    uncertainCount,
    totalQuestions,
    level,
    confidence,
    dimensions,
    strengths,
    weaknesses,
    observationNeeded,
    summary
  };
}

export function getDefaultAssessmentResult(): AssessmentResult {
  return {
    totalScore: 0,
    maxScore: assessmentQuestions.length * 5,
    normalizedScore: 0,
    answeredCount: 0,
    uncertainCount: 0,
    totalQuestions: assessmentQuestions.length,
    level: "3.0",
    confidence: "较低",
    dimensions: [],
    strengths: [],
    weaknesses: [],
    observationNeeded: [],
    summary: "请先完成评估题目，再查看你的参考能力区间。"
  };
}
