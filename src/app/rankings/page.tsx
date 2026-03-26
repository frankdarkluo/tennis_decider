"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import { toChineseSkill } from "@/lib/utils";

const specialtyOptions = [
  { label: "全部方向", value: "全部方向" },
  { label: toChineseSkill("serve"), value: "serve" },
  { label: toChineseSkill("forehand"), value: "forehand" },
  { label: toChineseSkill("backhand"), value: "backhand" },
  { label: toChineseSkill("doubles"), value: "doubles" },
  { label: toChineseSkill("matchplay"), value: "matchplay" },
  { label: toChineseSkill("net"), value: "net" },
  { label: toChineseSkill("movement"), value: "movement" },
  { label: toChineseSkill("return"), value: "return" },
  { label: toChineseSkill("training"), value: "training" },
  { label: toChineseSkill("mental"), value: "mental" },
  { label: toChineseSkill("grip"), value: "grip" },
  { label: toChineseSkill("basics"), value: "basics" },
  { label: toChineseSkill("consistency"), value: "consistency" },
  { label: toChineseSkill("topspin"), value: "topspin" },
  { label: toChineseSkill("footwork"), value: "footwork" }
];

function FilterSelect(
  { value, setValue, options }: { value: string; setValue: (value: string) => void; options: Array<{ label: string; value: string }> }
) {
  return (
    <select className="min-h-11 rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm" value={value} onChange={(e) => setValue(e.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

const LEVEL_ORDER = ["2.5", "3.0", "3.5", "4.0", "4.5"] as const;

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

function getSpecialtyMatchScore(creator: Creator, specialty: string) {
  if (specialty === "全部方向") {
    return 0.55;
  }

  return creator.specialties.includes(specialty) ? 1 : 0.15;
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

function getCreatorSortScore(creator: Creator, targetLevel: string | undefined, specialty: string) {
  const matchScore = clamp01(0.72 * getLevelMatchScore(creator, targetLevel) + 0.28 * getSpecialtyMatchScore(creator, specialty));
  const qualityScore = getQualityScore(creator.rankingSignals);
  const curatorScore = getCuratorScore(creator.rankingSignals);

  return 0.58 * matchScore + 0.32 * qualityScore + 0.1 * curatorScore;
}

export default function RankingsPage() {
  const router = useRouter();
  const { user, configured, loading } = useAuth();
  const [region, setRegion] = useState<"domestic" | "overseas">("domestic");
  const [level, setLevel] = useState("全部等级");
  const [specialty, setSpecialty] = useState("全部方向");
  const [platform, setPlatform] = useState("全部平台");
  const [style, setStyle] = useState("全部风格");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [viewerLevel, setViewerLevel] = useState<string | undefined>(undefined);
  const previousFiltersRef = useRef<Record<string, string> | null>(null);

  const list = useMemo(() => {
    const targetLevel = level === "全部等级" ? viewerLevel : level;

    return creators
      .filter((creator) => {
        const hitRegion = creator.region === region;
        const hitLevel = level === "全部等级" ? true : creator.levels.includes(level);
        const hitSpecialty = specialty === "全部方向" ? true : creator.specialties.includes(specialty as never);
        const hitPlatform = platform === "全部平台" ? true : creator.platforms.includes(platform as never);
        const hitStyle = style === "全部风格" ? true : creator.styleTags.includes(style as never);
        const hitRanking = creator.rankingEligible !== false;

        return hitRegion && hitLevel && hitSpecialty && hitPlatform && hitStyle && hitRanking;
      })
      .map((creator) => ({
        creator,
        score: getCreatorSortScore(creator, targetLevel, specialty),
        recommendedCount: creator.featuredContentIds.length
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
  }, [level, platform, region, specialty, style, viewerLevel]);

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

  useEffect(() => {
    const currentFilters = { region, level, specialty, platform, style };

    if (!previousFiltersRef.current) {
      previousFiltersRef.current = currentFilters;
      return;
    }

    for (const [filterType, filterValue] of Object.entries(currentFilters)) {
      if (previousFiltersRef.current[filterType] !== filterValue) {
        logEvent("creator_filter", { filterType, filterValue });
      }
    }

    previousFiltersRef.current = currentFilters;
  }, [level, platform, region, specialty, style]);

  const pageTitle = "教学博主榜";
  const pageDescription = region === "domestic"
    ? "优先展示更适合中文语境学习的博主，再按你的水平匹配度、内容质量与活跃度做重排。"
    : "优先展示英文教学博主，再按你的水平匹配度、内容质量与活跃度做重排。";

  return (
    <PageContainer>
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{pageTitle}</h1>
          <p className="mt-2 text-slate-600">{pageDescription}</p>
          {viewerLevel ? (
            <p className="mt-2 text-sm text-slate-500">当前已识别你的常用水平为 {viewerLevel}，排行榜会默认向这个等级倾斜。</p>
          ) : null}
        </div>

        <div className="flex gap-2">
          <TabButton active={region === "domestic"} onClick={() => setRegion("domestic")}>中文博主</TabButton>
          <TabButton active={region === "overseas"} onClick={() => setRegion("overseas")}>英文博主</TabButton>
        </div>

        <div className="grid gap-2 rounded-2xl border border-[var(--line)] bg-white p-4 md:grid-cols-4">
          <FilterSelect value={level} setValue={setLevel} options={["全部等级", "2.5", "3.0", "3.5", "4.0", "4.5"].map((item) => ({ label: item, value: item }))} />
          <FilterSelect value={specialty} setValue={setSpecialty} options={specialtyOptions} />
          <FilterSelect value={platform} setValue={setPlatform} options={["全部平台", "Bilibili", "YouTube"].map((item) => ({ label: item, value: item }))} />
          <FilterSelect value={style} setValue={setStyle} options={["全部风格", "新手友好", "讲解清晰", "实战导向", "细节导向"].map((item) => ({ label: item, value: item }))} />
        </div>

        {list.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onDetail={() => {
                  logEvent("creator_click", { creatorId: creator.id });
                  setSelectedCreator(creator);
                }}
                onViewLibrary={() => {
                  logEvent("cta_click", { ctaLabel: "查看推荐内容", ctaLocation: "creator_card", targetPage: "/library" });
                  router.push(`/library?creator=${creator.id}`);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white p-6 text-slate-600">当前筛选条件下暂无博主，建议放宽筛选条件。</div>
        )}
      </div>
      <CreatorDetailModal creator={selectedCreator} open={Boolean(selectedCreator)} onClose={() => setSelectedCreator(null)} />
    </PageContainer>
  );
}
