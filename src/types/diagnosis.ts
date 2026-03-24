export type DiagnosisRule = {
  id: string;
  keywords: string[];
  category: string[];
  problemTag: string;
  causes: string[];
  fixes: string[];
  recommendedContentIds: string[];
  drills: string[];
  fallbackLevel?: string[];
};

export type DiagnosisResult = {
  matched: boolean;
  matchedRuleId?: string;
  problemTag: string;
  categories: string[];
  causes: string[];
  fixes: string[];
  drills: string[];
  recommendedContentIds: string[];
  fallbackText?: string;
};