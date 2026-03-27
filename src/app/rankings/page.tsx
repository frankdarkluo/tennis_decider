"use client";

import { useEffect, useMemo, useState } from "react";
import { readAssessmentResultFromStorage, writeAssessmentResultToStorage } from "@/lib/assessmentStorage";
import { creators } from "@/data/creators";
import { getLatestAssessmentResult } from "@/lib/userData";
import { Creator, CreatorRankingSignals } from "@/types/creator";
import { PageContainer } from "@/components/layout/PageContainer";
import { TabButton } from "@/components/ui/Tabs";
import { CreatorCard } from "@/components/rankings/CreatorCard";
import { CreatorDetailModal } from "@/components/rankings/CreatorDetailModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { logEvent } from "@/lib/eventLogger";

const LEVEL_ORDER = ["2.5", "3.0", "3.5", "4.0", "4.0+", "4.5"] as const;
const INITIAL_VISIBLE_CREATORS = 20;

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

function getCreatorSortScore(creator: Creator, targetLevel?: string) {
  const matchScore = getLevelMatchScore(creator, targetLevel);
  const qualityScore = getQualityScore(creator.rankingSignals);
  const curatorScore = getCuratorScore(creator.rankingSignals);

  return 0.58 * matchScore + 0.28 * qualityScore + 0.14 * curatorScore;
}

function matchesSearch(creator: Creator, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return (
    [
      creator.name,
      creator.shortDescription,
      creator.bio
    ].some((value) => value.toLowerCase().includes(normalizedQuery))
    || creator.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
  );
}

export default function RankingsPage() {
  const { user, configured, loading } = useAuth();
  const [region, setRegion] = useState<"domestic" | "overseas">("domestic");
  const [query, setQuery] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [viewerLevel, setViewerLevel] = useState<string | undefined>(undefined);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_CREATORS);

  const list = useMemo(() => {
    return creators
      .filter((creator) => {
        return creator.region === region && creator.rankingEligible !== false && matchesSearch(creator, query);
      })
      .map((creator) => ({
        creator,
        score: getCreatorSortScore(creator, viewerLevel),
        recommendedCount: creator.featuredVideos?.length ?? creator.featuredContentIds.length
      }))
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
  }, [query, region, viewerLevel]);

  const visibleList = useMemo(() => list.slice(0, visibleCount), [list, visibleCount]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_CREATORS);
  }, [query, region]);

  useEffect(() => {
    if (loading) {
      return;
    }

    let active = true;

    async function hydrateViewerLevel() {
      const localResult = readAssessmentResultFromStorage();
      let nextLevel = localResult?.level;

      if (user?.id && configured) {
        const remoteResult = await getLatestAssessmentResult(user.id);

        if (!active) {
          return;
        }

        if (remoteResult.data) {
          nextLevel = remoteResult.data.level;
          writeAssessmentResultToStorage(remoteResult.data);
        }
      }

      if (!active) {
        return;
      }

      setViewerLevel(nextLevel);
    }

    void hydrateViewerLevel();

    return () => {
      active = false;
    };
  }, [configured, loading, user?.id]);

  const pageTitle = "博主榜";

  return (
    <PageContainer>
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{pageTitle}</h1>
        </div>

        <div className="flex gap-2">
          <TabButton active={region === "domestic"} onClick={() => {
            setRegion("domestic");
            logEvent("creator_filter", { filterType: "region", filterValue: "domestic" });
          }}>中文博主</TabButton>
          <TabButton active={region === "overseas"} onClick={() => {
            setRegion("overseas");
            logEvent("creator_filter", { filterType: "region", filterValue: "overseas" });
          }}>英文博主</TabButton>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索博主或标签..."
            className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm outline-none transition focus:border-brand-300 focus:bg-white"
            aria-label="搜索博主"
          />
        </div>

        {list.length > 0 ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
            {visibleList.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onDetail={() => {
                  logEvent("creator_click", { creatorId: creator.id });
                  setSelectedCreator(creator);
                }}
              />
            ))}
            </div>
            {visibleCount < list.length ? (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => Math.min(count + INITIAL_VISIBLE_CREATORS, list.length))}
                  className="rounded-2xl border border-[var(--line)] bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                >
                  查看更多
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white p-6 text-slate-600">没找到，换个关键词试试。</div>
        )}
      </div>
      <CreatorDetailModal creator={selectedCreator} open={Boolean(selectedCreator)} onClose={() => setSelectedCreator(null)} />
    </PageContainer>
  );
}
