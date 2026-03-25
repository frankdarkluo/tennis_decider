import { ContentItem } from "@/types/content";

export type DiagnosisRule = {
  id: string;
  keywords: string[];
  synonyms?: string[];
  category: string[];
  problemTag: string;
  causes: string[];
  fixes: string[];
  recommendedContentIds: string[];
  drills: string[];
  fallbackLevel?: string[];
};

export type DiagnosisConfidence = "较低" | "中等" | "较高";

export type DiagnosisResult = {
  input: string;
  normalizedInput: string;
  matchedRuleId: string | null;
  matchedKeywords: string[];
  matchedSynonyms: string[];
  matchScore: number;
  confidence: DiagnosisConfidence;
  problemTag: string;
  category: string[];
  title: string;
  summary: string;
  causes: string[];
  fixes: string[];
  drills: string[];
  recommendedContents: ContentItem[];
  fallbackUsed: boolean;
  fallbackMode: "assessment" | "no-assessment" | null;
  level?: string;
};
