import { creators } from "@/data/creators";
import { getStudySnapshotCreators } from "@/lib/study/snapshot";
import { seededSort } from "@/lib/study/seededSort";
import type { Creator, CreatorRankingSignals } from "@/types/creator";

const LEVEL_ORDER = ["2.5", "3.0", "3.5", "4.0", "4.0+", "4.5"] as const;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getLevelMatchScore(creator: Creator, targetLevel?: string) {
  if (!targetLevel) {
    return 0.6;
  }

  const targetIndex = LEVEL_ORDER.indexOf(targetLevel as (typeof LEVEL_ORDER)[number]);
  if (targetIndex < 0) {
    return 0.6;
  }

  const creatorIndexes = creator.levels
    .map((level) => LEVEL_ORDER.indexOf(level as (typeof LEVEL_ORDER)[number]))
    .filter((index) => index >= 0);

  if (creatorIndexes.length === 0) {
    return 0.45;
  }

  const minDistance = Math.min(...creatorIndexes.map((index) => Math.abs(index - targetIndex)));
  if (minDistance === 0) return 1;
  if (minDistance === 1) return 0.82;
  if (minDistance === 2) return 0.6;
  return 0.35;
}

function getQualityScore(signals?: CreatorRankingSignals) {
  if (!signals) {
    return 0.5;
  }

  return clamp01(
    0.35 * signals.subscriberScore
      + 0.35 * signals.averageViewsScore
      + 0.15 * signals.activityScore
      + 0.15 * signals.catalogScore
  );
}

function getCuratorScore(signals?: CreatorRankingSignals) {
  if (!signals) {
    return 0.5;
  }

  return clamp01((signals.authorityScore + signals.curatorBoost) / 2);
}

export function getCreatorSortScore(creator: Creator, targetLevel?: string) {
  const matchScore = getLevelMatchScore(creator, targetLevel);
  const qualityScore = getQualityScore(creator.rankingSignals);
  const curatorScore = getCuratorScore(creator.rankingSignals);

  return 0.58 * matchScore + 0.28 * qualityScore + 0.14 * curatorScore;
}

export function buildRankingsCreatorsForMode(options: { studyMode: boolean }) {
  return options.studyMode ? getStudySnapshotCreators() : creators;
}

export function sortRankingsCreatorsForMode(
  items: Creator[],
  options: { studyMode: boolean; seed: string; targetLevel?: string }
) {
  const scored = items.map((creator) => ({
    creator,
    score: getCreatorSortScore(creator, options.targetLevel),
    recommendedCount: creator.featuredVideos?.length ?? creator.featuredContentIds.length
  }));

  if (options.studyMode) {
    return seededSort(
      scored,
      options.seed,
      (item) => item.creator.id,
      (item) => item.score * 100,
      (left, right) => left.creator.name.localeCompare(right.creator.name, "zh-CN")
    ).map(({ creator }) => creator);
  }

  return scored
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (b.recommendedCount !== a.recommendedCount) {
        return b.recommendedCount - a.recommendedCount;
      }

      return a.creator.name.localeCompare(b.creator.name, "zh-CN");
    })
    .map(({ creator }) => creator);
}
