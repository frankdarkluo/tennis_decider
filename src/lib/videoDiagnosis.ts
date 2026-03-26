import { creators } from "@/data/creators";
import { diagnoseProblem, getDiagnosisTitle } from "@/lib/diagnosis";
import { getPlanFromDiagnosis } from "@/lib/plans";
import { Creator } from "@/types/creator";
import { DiagnosisConfidence } from "@/types/diagnosis";
import { VideoAnalysisRequest, VideoDiagnosisResult, VideoSceneType, VideoStrokeType, VLMObservation } from "@/types/videoDiagnosis";

function mapPlanLevel(level?: string): "3.0" | "3.5" | "4.0" {
  if (level === "4.0" || level === "4.5") return "4.0";
  if (level === "3.5") return "3.5";
  return "3.0";
}

function getStrokeHints(stroke: VideoStrokeType) {
  const map: Record<VideoStrokeType, string[]> = {
    forehand: ["正手", "forehand", "topspin"],
    backhand: ["反手", "backhand", "slice"],
    serve: ["发球", "serve", "二发"],
    volley: ["网前", "截击", "volley"],
    other: ["基础", "稳定性"]
  };
  return map[stroke];
}

function getSceneHints(scene: VideoSceneType) {
  const map: Record<VideoSceneType, string[]> = {
    drill: ["喂球训练", "定点练习"],
    rally: ["对拉", "相持"],
    serve_practice: ["发球练习", "发球"],
    match: ["比赛", "得分", "紧张"],
    unknown: []
  };
  return map[scene];
}

function buildMergedInput(observation: VLMObservation, request: Pick<VideoAnalysisRequest, "userDescription" | "selectedStroke" | "selectedScene">) {
  return [
    request.userDescription ?? "",
    ...observation.keyIssues,
    observation.overallAssessment,
    observation.contactPoint,
    observation.footwork,
    observation.swingPath,
    ...getStrokeHints(request.selectedStroke ?? observation.strokeType),
    ...getSceneHints(request.selectedScene ?? observation.sceneType)
  ].filter(Boolean).join(" ");
}

function getConfidenceBand(confidence: number): DiagnosisConfidence {
  if (confidence >= 0.75) return "较高";
  if (confidence >= 0.45) return "中等";
  return "较低";
}

function buildPrimaryProblem(
  observation: VLMObservation,
  diagnosisTitle: string,
  causes: string[],
  fixes: string[]
) {
  return {
    label: diagnosisTitle.replace("你的问题更接近：", ""),
    description: observation.keyIssues[0] ?? diagnosisTitle,
    cause: causes[0] ?? "当前最主要的问题，还是准备、击球点和节奏没有稳定下来。",
    fix: fixes[0] ?? "先围绕最明显的一个问题做 7 天连续练习。"
  };
}

function buildSecondaryProblems(observation: VLMObservation, causes: string[]) {
  return observation.keyIssues.slice(1, 3).map((issue, index) => ({
    label: issue,
    description: causes[index + 1] ?? "这是次一级的问题，建议放在主要问题之后处理。"
  }));
}

function buildSearchSuggestions(problemLabel: string, strokeType: VideoStrokeType) {
  const englishStrokeMap: Record<VideoStrokeType, string> = {
    forehand: "forehand",
    backhand: "backhand",
    serve: "serve",
    volley: "volley",
    other: "tennis"
  };

  return [
    { platform: "Bilibili" as const, keyword: problemLabel.replace("你的问题更接近：", ""), language: "zh" as const },
    { platform: "Xiaohongshu" as const, keyword: `${problemLabel.replace("你的问题更接近：", "")} 纠正`, language: "zh" as const },
    { platform: "YouTube" as const, keyword: `${englishStrokeMap[strokeType]} technique fix`, language: "en" as const }
  ];
}

function scoreCreator(
  creator: Creator,
  level: string,
  contentCreatorIds: Set<string>,
  featuredContentIds: Set<string>,
  specialtyHints: string[]
) {
  let score = 0;

  if (contentCreatorIds.has(creator.id)) score += 5;
  if (creator.levels.includes(level)) score += 3;
  score += creator.featuredContentIds.filter((id) => featuredContentIds.has(id)).length * 2;
  score += creator.specialties.filter((specialty) => specialtyHints.includes(specialty)).length;

  return score;
}

function getRecommendedCreators(
  level: string,
  featuredContentIds: string[],
  contentCreatorIds: string[],
  observation: VLMObservation
) {
  const contentCreatorIdSet = new Set(contentCreatorIds);
  const featuredContentIdSet = new Set(featuredContentIds);
  const specialtyHints = Array.from(new Set([
    observation.strokeType === "volley" ? "net" : observation.strokeType,
    observation.sceneType === "match" ? "matchplay" : "",
    observation.sceneType === "serve_practice" ? "serve" : "",
    "basics"
  ].filter(Boolean)));

  return creators
    .filter((creator) => creator.discoveryEligible !== false)
    .map((creator) => ({
      creator,
      score: scoreCreator(creator, level, contentCreatorIdSet, featuredContentIdSet, specialtyHints)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.creator.name.localeCompare(b.creator.name))
    .slice(0, 3)
    .map((item) => item.creator);
}

export function buildVideoDiagnosisResult(
  observation: VLMObservation,
  request: Pick<VideoAnalysisRequest, "userDescription" | "userLevel" | "selectedStroke" | "selectedScene">
): VideoDiagnosisResult {
  const level = request.userLevel ?? observation.estimatedLevel ?? "3.5";
  const mergedInput = buildMergedInput(observation, request);
  const diagnosis = diagnoseProblem(mergedInput, { level });
  const confidenceBand = getConfidenceBand(observation.confidence);
  const diagnosisTitle = diagnosis.title || getDiagnosisTitle(diagnosis.problemTag);
  const featuredContentIds = diagnosis.recommendedContents.map((item) => item.id);
  const contentCreatorIds = diagnosis.recommendedContents.map((item) => item.creatorId);

  return {
    userDescription: request.userDescription ?? "",
    selectedStroke: request.selectedStroke ?? observation.strokeType,
    selectedScene: request.selectedScene ?? observation.sceneType,
    observation,
    diagnosis: {
      ...diagnosis,
      confidence: confidenceBand
    },
    primaryProblem: buildPrimaryProblem(observation, diagnosisTitle, diagnosis.causes, diagnosis.fixes),
    secondaryProblems: buildSecondaryProblems(observation, diagnosis.causes),
    recommendedContents: diagnosis.recommendedContents,
    recommendedCreators: getRecommendedCreators(level, featuredContentIds, contentCreatorIds, observation),
    trainingPlan: getPlanFromDiagnosis({
      level: mapPlanLevel(level),
      problemTag: diagnosis.problemTag,
      title: diagnosisTitle,
      fixes: diagnosis.fixes
    }),
    searchSuggestions: buildSearchSuggestions(diagnosisTitle.replace("你的问题更接近：", ""), observation.strokeType),
    confidence: observation.confidence,
    confidenceBand,
    chargeable: observation.confidence >= 0.45,
    fallbackReason: observation.confidence < 0.45
      ? observation.retakeAdvice ?? "当前视频信息不足，建议重新拍一段更完整、更清晰的视频。"
      : undefined
  };
}
