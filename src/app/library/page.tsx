"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { contents } from "@/data/contents";
import { expandedContents } from "@/data/expandedContents";
import { creators } from "@/data/creators";
import { ContentItem } from "@/types/content";
import {
  getContentFocusLine,
  getContentLanguageTag,
  getContentPrimaryTitle,
  getFeaturedVideoPrimaryTitle,
  getFeaturedVideoTarget,
  getSubtitleAvailability
} from "@/lib/content/display";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { persistStudyArtifact } from "@/lib/study/client";
import { readLocalStudyBookmarks, toggleLocalStudyBookmark } from "@/lib/study/localData";
import { seededSort } from "@/lib/study/seededSort";
import { addBookmark, getBookmarkedContentIds, removeBookmark } from "@/lib/userData";
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
import { useStudy } from "@/components/study/StudyProvider";

const PAGE_SIZE = 20;

function normalizeUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function sortByMixedPriority(items: ContentItem[], seed: string) {
  if (items.length <= 1) {
    return items;
  }

  const maxLogViews = items.reduce((currentMax, item) => {
    const nextValue = item.viewCount ? Math.log10(item.viewCount + 10) : 0;
    return Math.max(currentMax, nextValue);
  }, 0);

  return [...items].sort((left, right) => {
    const leftViewScore = left.viewCount ? Math.log10(left.viewCount + 10) / (maxLogViews || 1) : 0;
    const rightViewScore = right.viewCount ? Math.log10(right.viewCount + 10) / (maxLogViews || 1) : 0;

    const leftRandom = hashString(`${seed}:${left.id}`);
    const rightRandom = hashString(`${seed}:${right.id}`);

    const leftScore = leftRandom * 0.65 + leftViewScore * 0.35;
    const rightScore = rightRandom * 0.65 + rightViewScore * 0.35;

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return left.title.localeCompare(right.title, "zh-Hans-CN");
  });
}

function sortByStudyPriority(items: ContentItem[], seed: string) {
  if (items.length <= 1) {
    return items;
  }

  const maxLogViews = items.reduce((currentMax, item) => {
    const nextValue = item.viewCount ? Math.log10(item.viewCount + 10) : 0;
    return Math.max(currentMax, nextValue);
  }, 0);

  return seededSort(
    items,
    seed,
    (item) => item.id,
    (item) => {
      const thumbBoost = getThumbnail(item) ? 0.15 : 0;
      const viewScore = item.viewCount ? Math.log10(item.viewCount + 10) / (maxLogViews || 1) : 0;
      return thumbBoost + viewScore;
    },
    (left, right) => left.title.localeCompare(right.title, "zh-Hans-CN")
  );
}

function mergeLibraryItem(existing: ContentItem, candidate: ContentItem): ContentItem {
  return {
    ...existing,
    originalTitle: existing.originalTitle ?? candidate.originalTitle,
    sourceTitle: existing.sourceTitle ?? candidate.sourceTitle,
    displayTitleZh: existing.displayTitleZh ?? candidate.displayTitleZh,
    displayTitleEn: existing.displayTitleEn ?? candidate.displayTitleEn,
    focusLineEn: existing.focusLineEn ?? candidate.focusLineEn,
    contentLanguage: existing.contentLanguage ?? candidate.contentLanguage,
    subtitleAvailability: existing.subtitleAvailability ?? candidate.subtitleAvailability,
    useCases: existing.useCases.length > 0 ? existing.useCases : candidate.useCases,
    coachReason: existing.coachReason || candidate.coachReason,
    thumbnail: candidate.thumbnail ?? existing.thumbnail,
    duration: candidate.duration ?? existing.duration,
    viewCount: candidate.viewCount ?? existing.viewCount
  };
}

function buildLibraryItems(): ContentItem[] {
  const itemsByUrl = new Map<string, ContentItem>();

  const upsert = (item: ContentItem) => {
    const normalizedUrl = normalizeUrl(item.url);
    const existing = itemsByUrl.get(normalizedUrl);
    itemsByUrl.set(normalizedUrl, existing ? mergeLibraryItem(existing, item) : item);
  };

  contents.forEach(upsert);
  expandedContents.forEach(upsert);

  creators.forEach((creator) => {
    (creator.featuredVideos ?? []).forEach((video, index) => {
      upsert({
        id: `content_featured_${creator.id}_${index + 1}`,
        title: video.title,
        sourceTitle: video.sourceTitle ?? video.title,
        originalTitle: video.originalTitle ?? video.sourceTitle ?? video.title,
        displayTitleZh: video.displayTitleZh ?? (creator.region === "domestic" ? (video.sourceTitle ?? video.title) : undefined),
        displayTitleEn: creator.region === "domestic"
          ? getFeaturedVideoPrimaryTitle(video, "en", creator)
          : video.displayTitleEn ?? video.title,
        focusLineEn: creator.region === "domestic"
          ? getFeaturedVideoTarget(video, "en", creator)
          : video.targetEn,
        creatorId: creator.id,
        platform: video.platform,
        type: "video",
        levels: video.levels,
        skills: creator.specialties,
        problemTags: [],
        language: creator.region === "domestic" ? "zh" : "en",
        contentLanguage: video.contentLanguage ?? (creator.region === "domestic" ? "zh" : "en"),
        subtitleAvailability: video.subtitleAvailability ?? (creator.region === "overseas" ? "not_needed" : video.platform === "Bilibili" ? "none" : "unknown"),
        summary: creator.shortDescription,
        reason: video.target,
        useCases: [video.target],
        coachReason: creator.bio,
        thumbnail: video.thumbnail,
        duration: video.duration,
        viewCount: video.viewCount,
        url: video.url
      });
    });
  });

  return Array.from(itemsByUrl.values());
}

const libraryItems = buildLibraryItems();

function LibraryPageContent() {
  const { user, configured, loading } = useAuth();
  const { openLoginModal } = useAuthModal();
  const { session, studyMode } = useStudy();
  const { t } = useI18n();
  const [keyword, setKeyword] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<LibraryPlatformFilter>("all");
  const [selectedContentLanguage, setSelectedContentLanguage] = useState<LibraryContentLanguageFilter>("all");
  const [selectedSubtitleAvailability, setSelectedSubtitleAvailability] = useState<LibrarySubtitleFilter>("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [bookmarkPendingId, setBookmarkPendingId] = useState<string | null>(null);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const previousFiltersRef = useRef<Record<string, string | boolean> | null>(null);
  const productSeed = useMemo(() => new Date().toLocaleDateString("en-CA"), []);
  const creatorNameById = useMemo(
    () => new Map(creators.map((creator) => [creator.id, creator.name])),
    []
  );

  useEffect(() => {
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
  }, [configured, loading, studyMode, user?.id]);

  useEffect(() => {
    const currentFilters: Record<string, string | boolean> = {
      keyword,
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
        logEvent("content_filter", { filterType, filterValue });
      }
    }

    previousFiltersRef.current = currentFilters;
  }, [keyword, selectedContentLanguage, selectedPlatform, selectedSubtitleAvailability, showBookmarkedOnly]);

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

    const sorter = studyMode && session ? sortByStudyPriority : sortByMixedPriority;
    const activeSeed = studyMode && session ? session.snapshotSeed : productSeed;
    const withThumbnail = sorter(matchedItems.filter((item) => Boolean(getThumbnail(item))), `${activeSeed}:with-thumb`);
    const withoutThumbnail = sorter(matchedItems.filter((item) => !getThumbnail(item)), `${activeSeed}:no-thumb`);
    return [...withThumbnail, ...withoutThumbnail];
  }, [bookmarkedIds, creatorNameById, keyword, productSeed, selectedContentLanguage, selectedPlatform, selectedSubtitleAvailability, session, showBookmarkedOnly, studyMode]);
  const visibleItems = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );
  const hasMore = visibleItems.length < filtered.length;

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
      const action = nextIds.includes(contentId) ? "add" : "remove";
      logEvent("content_bookmark", { contentId, action });
      await persistStudyArtifact(session, "bookmark", { contentId, action, contentIds: nextIds });
      logEvent("study_artifact_save", { artifactType: "bookmark" });
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
    logEvent("content_bookmark", { contentId, action: isBookmarked ? "remove" : "add" });
    setBookmarkPendingId(null);
  };

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
