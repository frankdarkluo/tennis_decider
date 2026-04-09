import type { CatalogContentItem, CatalogRecommendationIntent } from "@/lib/content-catalog/schema";

type RankedCatalogCandidate = {
  item: CatalogContentItem;
  index: number;
  score: number;
};

const LEVEL_PREFERENCE_MAP: Record<string, string[]> = {
  "2.5": ["2.5", "3.0"],
  "3.0": ["2.5", "3.0"],
  "3.5": ["3.0", "3.5"],
  "4.0": ["3.5", "4.0", "4.5"],
  "4.5": ["4.0", "4.5"]
};

function overlapCount(left: string[], right: string[]): number {
  const rightSet = new Set(right);
  return left.reduce((sum, value) => sum + (rightSet.has(value) ? 1 : 0), 0);
}

function scoreLevel(item: CatalogContentItem, level?: string): number {
  if (!level) {
    return 0;
  }

  const preferredLevels = LEVEL_PREFERENCE_MAP[level] ?? [level];
  if (item.levelRange.includes(level)) {
    return 18;
  }

  return overlapCount(item.levelRange, preferredLevels) * 9;
}

function buildSearchText(item: CatalogContentItem): string {
  return [
    item.display.title,
    item.display.sourceTitle,
    item.display.originalTitle,
    item.display.summary,
    item.display.reason,
    item.display.coachReason,
    ...item.display.useCases,
    ...item.skillCategories,
    ...item.problemTags
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function compareCandidates(left: RankedCatalogCandidate, right: RankedCatalogCandidate): number {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  if (right.item.qualityScore !== left.item.qualityScore) {
    return right.item.qualityScore - left.item.qualityScore;
  }

  return left.index - right.index;
}

export function rankCatalogContent(
  items: CatalogContentItem[],
  intent: CatalogRecommendationIntent
): RankedCatalogCandidate[] {
  const requiredIds = new Set(intent.requiredIds ?? []);
  const preferredIds = new Set(intent.preferredIds ?? []);
  const requiredIdOrder = new Map((intent.requiredIds ?? []).map((id, index) => [id, index]));
  const preferredIdOrder = new Map((intent.preferredIds ?? []).map((id, index) => [id, index]));
  const problemTags = intent.problemTags ?? [];
  const skillCategories = intent.skillCategories ?? [];
  const lexicalTerms = (intent.lexicalTerms ?? [])
    .map((term) => term.trim().toLowerCase())
    .filter((term) => term.length >= 3);

  return items
    .map((item, index) => {
      const searchText = buildSearchText(item);
      const problemOverlap = overlapCount(item.problemTags, problemTags);
      const skillOverlap = overlapCount(item.skillCategories, skillCategories);
      const lexicalScore = lexicalTerms.reduce((sum, term) => sum + (searchText.includes(term) ? 3 : 0), 0);
      let score = 0;

      if (requiredIds.has(item.id)) {
        score += 1200 - ((requiredIdOrder.get(item.id) ?? 0) * 80);
      }

      if (preferredIds.has(item.id)) {
        score += 240 - ((preferredIdOrder.get(item.id) ?? 0) * 16);
      }

      score += problemOverlap * 26;
      score += skillOverlap * 18;
      score += lexicalScore;
      score += scoreLevel(item, intent.level);

      if (item.rightsStatus === "direct_source") {
        score += 32;
      } else if (item.rightsStatus === "search_link") {
        score -= 40;
      }

      if (item.ingestionMethod === "curated") {
        score += 16;
      }

      score += item.qualityScore;

      return {
        item,
        index,
        score
      };
    })
    .filter(({ item, score }) => {
      if (requiredIds.has(item.id) || preferredIds.has(item.id)) {
        return true;
      }

      if (score <= 0) {
        return false;
      }

      const hasStructuredSignals =
        problemTags.length > 0 || skillCategories.length > 0 || lexicalTerms.length > 0;

      if (!hasStructuredSignals) {
        return true;
      }

      const problemOverlap = overlapCount(item.problemTags, problemTags);
      const skillOverlap = overlapCount(item.skillCategories, skillCategories);
      const lexicalHit = lexicalTerms.some((term) => buildSearchText(item).includes(term));

      return problemOverlap > 0 || skillOverlap > 0 || lexicalHit;
    })
    .sort(compareCandidates);
}
