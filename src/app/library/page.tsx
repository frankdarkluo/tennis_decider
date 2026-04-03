"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { creators } from "@/data/creators";
import {
  getContentFocusLine,
  getContentLanguageTag,
  getContentPrimaryTitle,
  getSubtitleAvailability
} from "@/lib/content/display";
import {
  hasCompletedAssessmentResult,
  hasStoredCompletedAssessmentResult,
  readAssessmentResultFromStorage,
  writeAssessmentResultToStorage
} from "@/lib/assessmentStorage";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { buildLibraryItemsForMode, sortLibraryItemsForMode } from "@/lib/library/studyOrder";
import { persistStudyArtifact } from "@/lib/study/client";
import { getStudySnapshot } from "@/lib/study/snapshot";
import { readLocalStudyBookmarks, toggleLocalStudyBookmark } from "@/lib/study/localData";
import { addBookmark, getBookmarkedContentIds, getLatestAssessmentResult, removeBookmark } from "@/lib/userData";
import { getThumbnail } from "@/lib/thumbnail";
import { toChineseSkill } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import {
  LibraryContentLanguageFilter,
  LibraryFilters,
  LibraryPlatformFilter,
  LibrarySubtitleFilter
} from "@/components/library/LibraryFilters";
import { ContentCard } from "@/components/library/ContentCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useStudy } from "@/components/study/StudyProvider";

const PAGE_SIZE = 20;
type LibraryGateState = "checking" | "study_session_required" | "assessment_required" | "ready";

function inferQueryLanguage(query: string) {
  const hasChinese = /[\u3400-\u9fff]/.test(query);
  const hasEnglish = /[A-Za-z]/.test(query);

  if (hasChinese && hasEnglish) return "mixed";
  if (hasChinese) return "zh";
  if (hasEnglish) return "en";
  return "unknown";
}

function LibraryPageContent() {
  const router = useRouter();
  const { user, configured, loading } = useAuth();
  const { openLoginModal } = useAuthModal();
  const { session, studyMode, pendingStudySetup } = useStudy();
  const { t } = useI18n();
  const [gateState, setGateState] = useState<LibraryGateState>("checking");
  const [keyword, setKeyword] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<LibraryPlatformFilter>("all");
  const [selectedContentLanguage, setSelectedContentLanguage] = useState<LibraryContentLanguageFilter>("all");
  const [selectedSubtitleAvailability, setSelectedSubtitleAvailability] = useState<LibrarySubtitleFilter>("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [bookmarkPendingId, setBookmarkPendingId] = useState<string | null>(null);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const previousFiltersRef = useRef<Record<string, string | boolean> | null>(null);
  const previousKeywordRef = useRef("");
  const loggedSnapshotRef = useRef<string | null>(null);
  const previousSortContextRef = useRef<string | null>(null);
  const blockedByPendingStudySetup = pendingStudySetup && !session;
  const productSeed = useMemo(() => new Date().toLocaleDateString("en-CA"), []);
  const creatorNameById = useMemo(
    () => new Map(creators.map((creator) => [creator.id, creator.name])),
    []
  );
  const libraryItems = useMemo(
    () => buildLibraryItemsForMode({ studyMode }),
    [studyMode]
  );

  useEffect(() => {
    if (blockedByPendingStudySetup) {
      router.replace("/study/start");
      setGateState("study_session_required");
      return;
    }

    // In study mode, allow direct access without forcing the assessment gate.
    if (studyMode && session) {
      setGateState("ready");
      return;
    }

    if (studyMode && !session) {
      setGateState("study_session_required");
      return;
    }

    if (loading) {
      return;
    }

    let active = true;

    async function resolveGate() {
      const localResult = readAssessmentResultFromStorage();
      let hasCompletedAssessment = hasCompletedAssessmentResult(localResult);

      if (!hasCompletedAssessment && !studyMode && user?.id && configured) {
        const remoteResult = await getLatestAssessmentResult(user.id);

        if (!active) {
          return;
        }

        const remoteAssessment = remoteResult.data;
        if (hasCompletedAssessmentResult(remoteAssessment)) {
          hasCompletedAssessment = true;
          writeAssessmentResultToStorage(remoteAssessment);
        }
      }

      if (!active) {
        return;
      }

      setGateState(hasCompletedAssessment ? "ready" : "assessment_required");
    }

    void resolveGate();

    return () => {
      active = false;
    };
  }, [blockedByPendingStudySetup, configured, loading, router, session, studyMode, user?.id]);

  useEffect(() => {
    if (gateState !== "ready") {
      return;
    }

    if (loading) {
      return;
    }

    let active = true;

    async function loadBookmarks() {
      if (studyMode) {
        setBookmarkedIds(readLocalStudyBookmarks().contentIds);
        return;
      }

      if (!user?.id || !configured) {
        setBookmarkedIds([]);
        return;
      }

      const response = await getBookmarkedContentIds(user.id);

      if (!active) {
        return;
      }

      if (response.error) {
        console.error("[library] failed to load bookmarks", response.error);
        return;
      }

      setBookmarkedIds(response.data);
    }

    void loadBookmarks();

    return () => {
      active = false;
    };
  }, [configured, gateState, loading, studyMode, user?.id]);

  useEffect(() => {
    if (gateState !== "ready") {
      return;
    }

    logEvent("library.viewed", {
      sourceRoute: null,
      prefilledProblemTag: null,
      prefilledLevelBand: null
    }, { page: "/library" });
  }, [gateState]);

  useEffect(() => {
    if (gateState !== "ready") {
      return;
    }

    if (!studyMode || !session) {
      loggedSnapshotRef.current = null;
      return;
    }

    if (loggedSnapshotRef.current === session.snapshotId) {
      return;
    }

    const snapshot = getStudySnapshot();
    logEvent("library.snapshot_loaded", {
      snapshotVersion: session.snapshotId,
      snapshotSeed: session.snapshotSeed,
      buildVersion: session.buildVersion,
      sortingMode: snapshot.sortingMode,
      fixedSeed: snapshot.fixedSeed,
      randomSurfacingDisabled: snapshot.randomSurfacingDisabled,
      viewCountBoostDisabled: snapshot.viewCountBoostDisabled
    }, { page: "/library" });
    loggedSnapshotRef.current = session.snapshotId;
  }, [gateState, session, studyMode]);

  useEffect(() => {
    if (gateState !== "ready") {
      return;
    }

    const currentFilters: Record<string, string | boolean> = {
      platform: selectedPlatform,
      contentLanguage: selectedContentLanguage,
      subtitleAvailability: selectedSubtitleAvailability,
      bookmarked: showBookmarkedOnly
    };

    if (!previousFiltersRef.current) {
      previousFiltersRef.current = currentFilters;
      return;
    }

    for (const [filterType, filterValue] of Object.entries(currentFilters)) {
      if (previousFiltersRef.current[filterType] !== filterValue) {
        const filterName = filterType === "contentLanguage"
          ? "content_language"
          : filterType === "subtitleAvailability"
            ? "subtitle_availability"
            : filterType;
        logEvent("library.filter_changed", {
          filterName,
          filterValue
        }, { page: "/library" });
      }
    }

    previousFiltersRef.current = currentFilters;
  }, [gateState, selectedContentLanguage, selectedPlatform, selectedSubtitleAvailability, showBookmarkedOnly]);

  useEffect(() => {
    if (gateState !== "ready") {
      return;
    }

    const trimmed = keyword.trim();
    if (!trimmed || previousKeywordRef.current === trimmed) {
      previousKeywordRef.current = trimmed;
      return;
    }

    previousKeywordRef.current = trimmed;
    logEvent("library.search_used", {
      queryLength: trimmed.length,
      queryLanguage: inferQueryLanguage(trimmed)
    }, { page: "/library" });
  }, [gateState, keyword]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [keyword, selectedContentLanguage, selectedPlatform, selectedSubtitleAvailability, showBookmarkedOnly]);

  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    const matchedItems = libraryItems.filter((item) => {
      const searchableFields = [
        item.title,
        item.sourceTitle ?? "",
        getContentPrimaryTitle(item, "en"),
        getContentFocusLine(item, "en"),
        getContentFocusLine(item, "zh"),
        creatorNameById.get(item.creatorId) ?? "",
        item.coachReason ?? "",
        item.reason,
        ...item.skills,
        ...item.skills.map((skill) => toChineseSkill(skill)),
        ...item.useCases
      ].join(" ").toLowerCase();

      const hitKeyword = query ? searchableFields.includes(query) : true;
      const hitPlatform = selectedPlatform === "all" ? true : item.platform === selectedPlatform;
      const itemLanguage = getContentLanguageTag(item);
      const itemSubtitleAvailability = getSubtitleAvailability(item);
      const hitContentLanguage = selectedContentLanguage === "all" ? true : itemLanguage === selectedContentLanguage;
      const hitSubtitle = selectedSubtitleAvailability === "all"
        ? true
        : selectedSubtitleAvailability === "english"
          ? itemSubtitleAvailability === "english" || itemSubtitleAvailability === "not_needed"
          : itemSubtitleAvailability === "none";
      const hitBookmark = showBookmarkedOnly ? bookmarkedIds.includes(item.id) : true;
      return hitKeyword && hitPlatform && hitContentLanguage && hitSubtitle && hitBookmark;
    });

    const activeSeed = studyMode && session ? session.snapshotSeed : productSeed;
    const withThumbnail = sortLibraryItemsForMode(matchedItems.filter((item) => Boolean(getThumbnail(item))), {
      studyMode: studyMode && Boolean(session),
      seed: `${activeSeed}:with-thumb`
    });
    const withoutThumbnail = sortLibraryItemsForMode(matchedItems.filter((item) => !getThumbnail(item)), {
      studyMode: studyMode && Boolean(session),
      seed: `${activeSeed}:no-thumb`
    });
    return [...withThumbnail, ...withoutThumbnail];
  }, [bookmarkedIds, creatorNameById, keyword, productSeed, selectedContentLanguage, selectedPlatform, selectedSubtitleAvailability, session, showBookmarkedOnly, studyMode]);
  const visibleItems = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );
  const hasMore = visibleItems.length < filtered.length;

  useEffect(() => {
    if (gateState !== "ready") {
      return;
    }

    if (!studyMode || !session) {
      previousSortContextRef.current = null;
      return;
    }

    const sortContext = JSON.stringify({
      snapshotVersion: session.snapshotId,
      snapshotSeed: session.snapshotSeed,
      keyword: keyword.trim().toLowerCase(),
      platform: selectedPlatform,
      contentLanguage: selectedContentLanguage,
      subtitleAvailability: selectedSubtitleAvailability,
      bookmarkedOnly: showBookmarkedOnly,
      totalMatched: filtered.length
    });

    if (previousSortContextRef.current === sortContext) {
      return;
    }

    logEvent("library.sort_context_logged", {
      snapshotVersion: session.snapshotId,
      snapshotSeed: session.snapshotSeed,
      keywordLength: keyword.trim().length,
      platform: selectedPlatform,
      contentLanguage: selectedContentLanguage,
      subtitleAvailability: selectedSubtitleAvailability,
      bookmarkedOnly: showBookmarkedOnly,
      totalMatched: filtered.length
    }, { page: "/library" });
    previousSortContextRef.current = sortContext;
  }, [
    filtered.length,
    keyword,
    selectedContentLanguage,
    selectedPlatform,
    selectedSubtitleAvailability,
    session,
    showBookmarkedOnly,
    studyMode,
    gateState
  ]);

  useEffect(() => {
    if (gateState !== "ready") {
      return;
    }

    if (visibleItems.length === 0) {
      return;
    }

    logEvent("library.batch_loaded", {
      visibleCount: visibleItems.length,
      batchIndex: Math.ceil(visibleItems.length / PAGE_SIZE)
    }, { page: "/library" });
  }, [gateState, visibleItems.length]);

  const clearAll = () => {
    setKeyword("");
    setSelectedPlatform("all");
    setSelectedContentLanguage("all");
    setSelectedSubtitleAvailability("all");
    setShowBookmarkedOnly(false);
  };

  const handleToggleBookmark = async (contentId: string) => {
    if (studyMode && session) {
      const nextIds = toggleLocalStudyBookmark(contentId);
      setBookmarkedIds(nextIds);
      const bookmarked = nextIds.includes(contentId);
      const action = bookmarked ? "add" : "remove";
      logEvent("content.bookmark_toggled", { contentId, bookmarked }, { page: "/library" });
      await persistStudyArtifact(session, "bookmark", { contentId, action, contentIds: nextIds });
      return;
    }

    if (!user?.id || !configured) {
      openLoginModal(t("library.bookmarkLogin"), "bookmark");
      return;
    }

    const isBookmarked = bookmarkedIds.includes(contentId);
    setBookmarkPendingId(contentId);

    const response = isBookmarked
      ? await removeBookmark(user.id, contentId)
      : await addBookmark(user.id, contentId);

    if (response.error) {
      console.error("[library] failed to toggle bookmark", response.error);
      setBookmarkPendingId(null);
      return;
    }

    setBookmarkedIds((prev) =>
      isBookmarked ? prev.filter((id) => id !== contentId) : [...prev, contentId]
    );
    logEvent("content.bookmark_toggled", {
      contentId,
      bookmarked: !isBookmarked
    }, { page: "/library" });
    setBookmarkPendingId(null);
  };

  if (gateState === "checking") {
    return (
      <PageContainer>
        <Card className="text-sm text-slate-600">{t("assessment.loading")}</Card>
      </PageContainer>
    );
  }

  if (gateState === "study_session_required") {
    return (
      <PageContainer>
        <Card className="mx-auto max-w-2xl space-y-4">
          <h1 className="text-2xl font-black text-slate-900">{t("study.start.title")}</h1>
          <p className="text-sm leading-6 text-slate-600">{t("study.start.subtitle")}</p>
          <Link href="/study/start">
            <Button>{t("study.start.button")}</Button>
          </Link>
        </Card>
      </PageContainer>
    );
  }

  if (gateState === "assessment_required") {
    return (
      <PageContainer>
        <Card className="mx-auto max-w-2xl space-y-4">
          <h1 className="text-2xl font-black text-slate-900">{t("assessment.empty.title")}</h1>
          <p className="text-sm leading-6 text-slate-600">{t("assessment.empty.subtitle")}</p>
          <Link href="/assessment">
            <Button>{t("assessment.result.ctaStart")}</Button>
          </Link>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{t("library.title")}</h1>
          <p className="mt-2 text-slate-600">{t("library.subtitle")}</p>
        </div>

        <LibraryFilters
          keyword={keyword}
          setKeyword={setKeyword}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          selectedContentLanguage={selectedContentLanguage}
          setSelectedContentLanguage={setSelectedContentLanguage}
          selectedSubtitleAvailability={selectedSubtitleAvailability}
          setSelectedSubtitleAvailability={setSelectedSubtitleAvailability}
          showBookmarkedOnly={showBookmarkedOnly}
          setShowBookmarkedOnly={setShowBookmarkedOnly}
          bookmarkFilterEnabled={studyMode || Boolean(user?.id && configured)}
        />

        {filtered.length > 0 ? (
          <div className="space-y-6">
            <div className="grid items-stretch gap-4 md:grid-cols-2">
              {visibleItems.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  source="library"
                  bookmarked={bookmarkedIds.includes(item.id)}
                  bookmarkLoading={bookmarkPendingId === item.id}
                  onToggleBookmark={() => void handleToggleBookmark(item.id)}
                />
              ))}
            </div>

            {hasMore ? (
              <div className="flex justify-center">
                <Button
                  variant="secondary"
                  className="min-w-32 rounded-xl border border-slate-200 px-5 text-slate-700 shadow-sm"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                >
                  {t("library.more")}
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-slate-500 shadow-soft">
            {t("library.empty")}
            <div className="mt-4">
              <Button variant="secondary" onClick={clearAll}>{t("library.clear")}</Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<LibraryLoadingFallback />}>
      <LibraryPageContent />
    </Suspense>
  );
}

function LibraryLoadingFallback() {
  const { t } = useI18n();

  return <PageContainer>{t("library.loading")}</PageContainer>;
}
