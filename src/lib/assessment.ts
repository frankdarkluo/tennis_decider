import { AssessmentDimension, AssessmentQuestion, AssessmentResult } from "@/types/assessment";

const dimensionOrder: AssessmentDimension[] = ["forehand", "backhand", "serve", "net", "movement", "matchplay"];

const weakLabel: Record<AssessmentDimension, string> = {
  forehand: "正手稳定性需要优先提升，建议先从上旋和击球点开始。",
  backhand: "反手质量偏弱，先把击球点和拍面控制做稳定。",
  serve: "发球环节是当前短板，建议先建立稳定二发节奏。",
  net: "网前环节失误偏多，先从缩小动作和站位入手。",
  movement: "移动与到位速度有提升空间，建议加强分腿垫步与回位。",
  matchplay: "比赛执行不稳定，建议建立固定的关键分流程。"
};

export function getLevelByScore(totalScore: number): "3.0" | "3.5" | "4.0" {
  if (totalScore <= 47) {
    return "3.0";
  }
  if (totalScore <= 65) {
    return "3.5";
  }
  return "4.0";
}

export function calculateAssessmentResult(
  questions: AssessmentQuestion[],
  answers: Record<string, number>
): AssessmentResult {
  const dimensionScores = {
    forehand: 0,
    backhand: 0,
    serve: 0,
    net: 0,
    movement: 0,
    matchplay: 0
  } as Record<AssessmentDimension, number>;

  let totalScore = 0;

  for (const question of questions) {
    const score = answers[question.id] ?? 0;
    totalScore += score;
    dimensionScores[question.dimension] += score;
  }

  const weakDimensions = [...dimensionOrder].sort(
    (a, b) => dimensionScores[a] - dimensionScores[b]
  ).slice(0, 3);

  return {
    totalScore,
    level: getLevelByScore(totalScore),
    dimensionScores,
    weakDimensions,
    weakSummary: weakDimensions.map((item) => weakLabel[item]).slice(0, 3),
    updatedAt: new Date().toISOString()
  };
}
