import { ContentItem } from "@/types/content";

export type DiagnosisSearchQueries = {
  bilibili: string[];
  youtube: string[];
};

export type DiagnosisAlias =
  | "first_serve"
  | "second_serve"
  | "overhead"
  | "moonball"
  | "slice"
  | "key_point"
  | "tight"
  | "age"
  | "mobility_limit";

export type DiagnosisModifier = "age" | "tight";

export type DiagnosisSupportSignal = string;

export type DiagnosisSlotType = "stroke" | "outcome" | "context" | "condition";

export type DiagnosisInternalSignal = `slot_${DiagnosisSlotType}_${string}`;

export type DiagnosisSlot = {
  type: DiagnosisSlotType;
  value: string;
  signal: DiagnosisInternalSignal;
};

export type DiagnosisSignalSource = "raw" | "alias" | "modifier" | "support" | "internal";

export type DiagnosisSignalSegment = {
  source: DiagnosisSignalSource;
  value: string;
};

export type DiagnosisSignalLayer = "primary" | "modifier" | "trigger" | "support" | "unknown";

export type DiagnosisClause = {
  text: string;
  normalizedText: string;
};

export type DiagnosisLayeredSignals = {
  primaryCandidates: string[];
  modifiers: string[];
  triggers: string[];
};

export type DiagnosisSignalBundle = {
  rawInput: string;
  normalizedInput: string;
  matchableText: string;
  clauses: DiagnosisClause[];
  layeredSignals: DiagnosisLayeredSignals;
  segments: DiagnosisSignalSegment[];
  aliases: DiagnosisAlias[];
  modifiers: DiagnosisModifier[];
  supportSignals: DiagnosisSupportSignal[];
  slots: DiagnosisSlot[];
  internalSignals: DiagnosisInternalSignal[];
};

export type DiagnosisRule = {
  id: string;
  keywords: string[];
  synonyms?: string[];
  category: string[];
  problemTag: string;
  causes: string[];
  fixes: string[];
  causes_en?: string[];
  fixes_en?: string[];
  drills_en?: string[];
  recommendedContentIds: string[];
  drills: string[];
  searchQueries: DiagnosisSearchQueries;
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
  searchQueries: DiagnosisSearchQueries | null;
  fallbackUsed: boolean;
  fallbackMode: "assessment" | "no-assessment" | null;
  level?: string;
};
