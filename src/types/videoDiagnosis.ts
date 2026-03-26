import { ContentItem } from "@/types/content";
import { Creator } from "@/types/creator";
import { DiagnosisConfidence, DiagnosisResult } from "@/types/diagnosis";
import { GeneratedPlan } from "@/types/plan";

export type VideoStrokeType = "forehand" | "backhand" | "serve" | "volley" | "other";
export type VideoSceneType = "drill" | "rally" | "serve_practice" | "match" | "unknown";

export type VideoAnalysisRequest = {
  frames: string[];
  userDescription?: string;
  userLevel?: string;
  selectedStroke?: VideoStrokeType;
  selectedScene?: VideoSceneType;
  durationSeconds?: number;
  fileName?: string;
};

export type VLMObservation = {
  strokeType: VideoStrokeType;
  sceneType: VideoSceneType;
  bodyPosture: string;
  contactPoint: string;
  footwork: string;
  swingPath: string;
  overallAssessment: string;
  keyIssues: string[];
  estimatedLevel: string;
  confidence: number;
  retakeAdvice?: string;
};

export type VideoPrimaryProblem = {
  label: string;
  description: string;
  cause: string;
  fix: string;
};

export type VideoSecondaryProblem = {
  label: string;
  description: string;
};

export type VideoSearchSuggestion = {
  platform: "Bilibili" | "YouTube" | "Xiaohongshu";
  keyword: string;
  language: "zh" | "en";
};

export type VideoDiagnosisResult = {
  userDescription: string;
  selectedStroke: VideoStrokeType;
  selectedScene: VideoSceneType;
  observation: VLMObservation;
  diagnosis: DiagnosisResult;
  primaryProblem: VideoPrimaryProblem;
  secondaryProblems: VideoSecondaryProblem[];
  recommendedContents: ContentItem[];
  recommendedCreators: Creator[];
  trainingPlan: GeneratedPlan;
  searchSuggestions: VideoSearchSuggestion[];
  confidence: number;
  confidenceBand: DiagnosisConfidence;
  chargeable: boolean;
  fallbackReason?: string;
};

