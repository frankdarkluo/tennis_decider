import { scoreAssessment } from "@/lib/assessment/scoring";
import { rankWeaknesses } from "@/lib/assessment/ranking";
import type {
  AssessmentAnswerMap,
  PlayContext,
  PlayStyle,
  PlayerProfileVector,
  ScoredDimension,
  WeaknessRankingItem
} from "@/types/assessment";

function parsePlayStyle(answers: AssessmentAnswerMap): PlayStyle {
  const value = answers.play_style_profile;

  switch (value) {
    case "defensive":
    case "baseline_attack":
    case "all_court":
    case "net_pressure":
      return value;
    default:
      return "baseline_attack";
  }
}

function parsePlayContext(answers: AssessmentAnswerMap): PlayContext {
  const value = answers.play_context_modifier;

  switch (value) {
    case "singles_standard":
    case "singles_limited_mobility":
    case "mixed_with_doubles":
    case "doubles_primary":
      return value;
    default:
      return "singles_standard";
  }
}

function getStrongDimensions(
  dimensionScores: PlayerProfileVector["dimensionScores"]
): ScoredDimension[] {
  return (Object.entries(dimensionScores) as Array<[ScoredDimension, 1 | 2 | 3 | 4]>)
    .sort((left, right) => right[1] - left[1])
    .filter(([, score]) => score >= 3)
    .map(([dimension]) => dimension)
    .slice(0, 2);
}

function getWeakDimensionsFromRanking(ranking: WeaknessRankingItem[]): ScoredDimension[] {
  return ranking.map((item) => item.dimension);
}

function isDirectSupportPair(primary: ScoredDimension, secondary: ScoredDimension) {
  const directSupportPairs = new Set([
    "serve|movement",
    "movement|serve",
    "return|rally",
    "rally|return",
    "forehand|movement",
    "movement|forehand",
    "net|overhead",
    "overhead|net"
  ]);

  return directSupportPairs.has(`${primary}|${secondary}`);
}

function selectPrimaryWeakness(ranking: WeaknessRankingItem[]): ScoredDimension | undefined {
  return ranking.find((item) => !item.suppressedAsPrimary)?.dimension;
}

function selectSecondaryWeakness(
  ranking: WeaknessRankingItem[],
  primaryWeakness?: ScoredDimension
): ScoredDimension | undefined {
  if (!primaryWeakness) {
    return undefined;
  }

  const primaryItem = ranking.find((item) => item.dimension === primaryWeakness);

  if (!primaryItem) {
    return undefined;
  }

  return ranking.find((item) => {
    if (item.dimension === primaryWeakness) {
      return false;
    }

    const closeEnough = item.priorityScore >= primaryItem.priorityScore * 0.88;
    const directSupport = isDirectSupportPair(primaryWeakness, item.dimension);

    return closeEnough || directSupport;
  })?.dimension;
}

function toChineseDimensionLabel(dimension: ScoredDimension): string {
  const map: Record<ScoredDimension, string> = {
    serve: "发球",
    return: "接发",
    rally: "对拉稳定性",
    forehand: "正手",
    backhand_slice: "反手与切削",
    movement: "跑动与还原",
    net: "网前与截击",
    overhead: "高球与高压",
    tactics: "战术组织",
    pressure: "关键分与压力处理"
  };

  return map[dimension];
}

export function buildPlayerProfileVector(answers: AssessmentAnswerMap): PlayerProfileVector {
  const { rawScore, levelBand, dimensionScores } = scoreAssessment(answers);
  const playStyle = parsePlayStyle(answers);
  const playContext = parsePlayContext(answers);
  const weaknessRanking = rankWeaknesses({
    dimensionScores,
    levelBand,
    playStyle,
    playContext
  });
  const weakDimensions = getWeakDimensionsFromRanking(weaknessRanking);
  const strongDimensions = getStrongDimensions(dimensionScores);
  const primaryWeakness = selectPrimaryWeakness(weaknessRanking);
  const secondaryWeakness = selectSecondaryWeakness(weaknessRanking, primaryWeakness);
  const headline = primaryWeakness
    ? `当前最值得优先补强的是${toChineseDimensionLabel(primaryWeakness)}`
    : "当前能力分布相对均衡，可以开始更细的专项提升";
  const oneLineLevelSummary = `你目前大致在 ${levelBand} 区间。`;
  const oneLinePlanHint = primaryWeakness
    ? `后续训练计划应先围绕${toChineseDimensionLabel(primaryWeakness)}展开。`
    : "后续训练计划可以从综合提升或个性化专项开始。";

  return {
    rawScore,
    levelBand,
    dimensionScores,
    weakDimensions,
    strongDimensions,
    primaryWeakness,
    secondaryWeakness,
    playStyle,
    playContext,
    summary: {
      headline,
      oneLineLevelSummary,
      oneLinePlanHint
    }
  };
}
