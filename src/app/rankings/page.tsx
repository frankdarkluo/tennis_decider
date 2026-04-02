"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  hasStoredCompletedAssessmentResult,
  readAssessmentResultFromStorage,
  writeAssessmentResultToStorage
} from "@/lib/assessmentStorage";
import {
  getCreatorBio,
  getCreatorPrimaryName,
  getCreatorSecondaryName,
  getCreatorShortDescription,
  getCreatorSuitableFor,
  getCreatorTags
} from "@/lib/content/display";
import { useI18n } from "@/lib/i18n/config";
import { getLatestAssessmentResult } from "@/lib/userData";
import { Creator } from "@/types/creator";
import { PageContainer } from "@/components/layout/PageContainer";
import { TabButton } from "@/components/ui/Tabs";
import { CreatorCard } from "@/components/rankings/CreatorCard";
import { CreatorDetailModal } from "@/components/rankings/CreatorDetailModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { logEvent } from "@/lib/eventLogger";
import {
  buildRankingsCreatorsForMode,
  sortRankingsCreatorsForMode
} from "@/lib/rankings/studyOrder";
import { getStudySnapshot } from "@/lib/study/snapshot";
import { useStudy } from "@/components/study/StudyProvider";

const INITIAL_VISIBLE_CREATORS = 20;

function matchesSearch(creator: Creator, query: string, locale: "zh" | "en") {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const translatedTags = getCreatorTags(creator.tags, locale);

  return (
    [
      getCreatorPrimaryName(creator, locale),
      getCreatorSecondaryName(creator, locale) ?? "",
      getCreatorShortDescription(creator, locale),
      getCreatorBio(creator, locale),
      ...getCreatorSuitableFor(creator, locale),
      ...translatedTags
    ].some((value) => value.toLowerCase().includes(normalizedQuery))
  );
}

export default function RankingsPage() {
  const router = useRouter();
  const { user, configured, loading } = useAuth();
  const { session, studyMode, pendingStudySetup } = useStudy();
  const { language, t } = useI18n();
  const [region, setRegion] = useState<"domestic" | "overseas">("domestic");
  const [query, setQuery] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [viewerLevel, setViewerLevel] = useState<string | undefined>(undefined);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_CREATORS);
  const loggedSnapshotRef = useRef<string | null>(null);
  const previousSortContextRef = useRef<string | null>(null);
  const creatorPool = useMemo(
    () => buildRankingsCreatorsForMode({ studyMode }),
    [studyMode]
  );
  const blockedByPendingStudySetup = pendingStudySetup && !session;
  const blockedByAssessmentGate = studyMode && Boolean(session) && !hasStoredCompletedAssessmentResult();

  useEffect(() => {
    if (!blockedByPendingStudySetup) {
      return;
    }

    router.replace("/study/start");
  }, [blockedByPendingStudySetup, router]);

  useEffect(() => {
    if (!blockedByAssessmentGate) {
      return;
    }

    router.replace("/assessment");
  }, [blockedByAssessmentGate, router]);

  const list = useMemo(() => {
    const matched = creatorPool
      .filter((creator) => {
        return creator.region === region && creator.rankingEligible !== false && matchesSearch(creator, query, language);
      })
    return sortRankingsCreatorsForMode(matched, {
      studyMode: studyMode && Boolean(session),
      seed: studyMode && session ? session.snapshotSeed : `${region}:${language}`,
      targetLevel: viewerLevel
    });
  }, [creatorPool, language, query, region, session, studyMode, viewerLevel]);

  const visibleList = useMemo(() => list.slice(0, visibleCount), [list, visibleCount]);

  useEffect(() => {
    if (blockedByPendingStudySetup || blockedByAssessmentGate) {
      return;
    }

    logEvent("rankings.viewed", {
      sourceRoute: null
    }, { page: "/rankings" });
  }, [blockedByAssessmentGate, blockedByPendingStudySetup]);

  useEffect(() => {
    if (blockedByPendingStudySetup || blockedByAssessmentGate || !studyMode || !session) {
      loggedSnapshotRef.current = null;
      return;
    }

    if (loggedSnapshotRef.current === session.snapshotId) {
      return;
    }

    const snapshot = getStudySnapshot();
    logEvent("rankings.snapshot_loaded", {
      snapshotVersion: session.snapshotId,
      snapshotSeed: session.snapshotSeed,
      buildVersion: session.buildVersion,
      sortingMode: snapshot.sortingMode,
      fixedSeed: snapshot.fixedSeed,
      randomSurfacingDisabled: snapshot.randomSurfacingDisabled,
      viewCountBoostDisabled: snapshot.viewCountBoostDisabled
    }, { page: "/rankings" });
    loggedSnapshotRef.current = session.snapshotId;
  }, [blockedByAssessmentGate, blockedByPendingStudySetup, session, studyMode]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_CREATORS);
  }, [query, region]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    logEvent("rankings.search_used", {
      queryLength: trimmed.length
    }, { page: "/rankings" });
  }, [query]);

  useEffect(() => {
    if (blockedByPendingStudySetup || blockedByAssessmentGate || !studyMode || !session) {
      previousSortContextRef.current = null;
      return;
    }

    const sortContext = JSON.stringify({
      snapshotVersion: session.snapshotId,
      snapshotSeed: session.snapshotSeed,
      region,
      query: query.trim().toLowerCase(),
      viewerLevel: viewerLevel ?? null,
      totalMatched: list.length
    });

    if (previousSortContextRef.current === sortContext) {
      return;
    }

    logEvent("rankings.sort_context_logged", {
      snapshotVersion: session.snapshotId,
      snapshotSeed: session.snapshotSeed,
      region,
      queryLength: query.trim().length,
      viewerLevel: viewerLevel ?? null,
      totalMatched: list.length
    }, { page: "/rankings" });
    previousSortContextRef.current = sortContext;
  }, [blockedByAssessmentGate, blockedByPendingStudySetup, list.length, query, region, session, studyMode, viewerLevel]);

  useEffect(() => {
    if (!selectedCreator) {
      return;
    }

    logEvent("creator.modal_viewed", {
      creatorId: selectedCreator.id
    }, { page: "/rankings" });
  }, [selectedCreator]);

  useEffect(() => {
    if (blockedByPendingStudySetup || blockedByAssessmentGate || loading) {
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
  }, [blockedByAssessmentGate, blockedByPendingStudySetup, configured, loading, user?.id]);

  const pageTitle = t("rankings.title");

  if (blockedByPendingStudySetup || blockedByAssessmentGate) {
    return (
      <PageContainer>
        <div className="text-sm text-slate-600">{t("assessment.loading")}</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{pageTitle}</h1>
        </div>

        <div className="flex gap-2">
          <TabButton active={region === "domestic"} onClick={() => {
            setRegion("domestic");
            logEvent("rankings.region_changed", { region: "domestic" }, { page: "/rankings" });
          }}>{t("rankings.domestic")}</TabButton>
          <TabButton active={region === "overseas"} onClick={() => {
            setRegion("overseas");
            logEvent("rankings.region_changed", { region: "overseas" }, { page: "/rankings" });
          }}>{t("rankings.overseas")}</TabButton>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("rankings.searchPlaceholder")}
            className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm outline-none transition focus:border-brand-300 focus:bg-white"
            aria-label={t("rankings.searchAria")}
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
                  logEvent("creator.card_opened", {
                    creatorId: creator.id,
                    position: visibleList.findIndex((item) => item.id === creator.id) + 1,
                    region: creator.region
                  }, { page: "/rankings" });
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
                  {t("rankings.more")}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white p-6 text-slate-600">{t("rankings.empty")}</div>
        )}
      </div>
      <CreatorDetailModal creator={selectedCreator} open={Boolean(selectedCreator)} onClose={() => setSelectedCreator(null)} />
    </PageContainer>
  );
}
