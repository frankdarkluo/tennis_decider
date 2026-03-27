"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { contents } from "@/data/contents";
import { creators } from "@/data/creators";
import { logEvent } from "@/lib/eventLogger";
import { addBookmark, getBookmarkedContentIds, removeBookmark } from "@/lib/userData";
import { toChineseSkill } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { LibraryFilters } from "@/components/library/LibraryFilters";
import { ContentCard } from "@/components/library/ContentCard";
import { Button } from "@/components/ui/Button";

const PAGE_SIZE = 20;

function LibraryPageContent() {
  const { user, configured, loading } = useAuth();
  const { openLoginModal } = useAuthModal();
  const [keyword, setKeyword] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [bookmarkPendingId, setBookmarkPendingId] = useState<string | null>(null);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const previousFiltersRef = useRef<Record<string, string | boolean> | null>(null);
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
  }, [configured, loading, user?.id]);

  useEffect(() => {
    const currentFilters: Record<string, string | boolean> = {
      keyword,
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
  }, [keyword, showBookmarkedOnly]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [keyword, showBookmarkedOnly]);

  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    return contents.filter((item) => {
      const searchableFields = [
        item.title,
        item.sourceTitle ?? "",
        creatorNameById.get(item.creatorId) ?? "",
        item.coachReason ?? "",
        item.reason,
        ...item.skills,
        ...item.skills.map((skill) => toChineseSkill(skill)),
        ...item.useCases
      ].join(" ").toLowerCase();

      const hitKeyword = query ? searchableFields.includes(query) : true;
      const hitBookmark = showBookmarkedOnly ? bookmarkedIds.includes(item.id) : true;
      return hitKeyword && hitBookmark;
    });
  }, [bookmarkedIds, creatorNameById, keyword, showBookmarkedOnly]);
  const visibleItems = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );
  const hasMore = visibleItems.length < filtered.length;

  const clearAll = () => {
    setKeyword("");
    setShowBookmarkedOnly(false);
  };

  const handleToggleBookmark = async (contentId: string) => {
    if (!user?.id || !configured) {
      openLoginModal("登录后可收藏内容", "bookmark");
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
          <h1 className="text-3xl font-black text-slate-900">找内容</h1>
          <p className="mt-2 text-slate-600">搜技术、博主或场景。</p>
        </div>

        <LibraryFilters
          keyword={keyword}
          setKeyword={setKeyword}
          showBookmarkedOnly={showBookmarkedOnly}
          setShowBookmarkedOnly={setShowBookmarkedOnly}
          bookmarkFilterEnabled={Boolean(user?.id && configured)}
        />

        {filtered.length > 0 ? (
          <div className="space-y-6">
            <div className="grid items-start gap-4 md:grid-cols-2">
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
                  查看更多
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white p-8 text-center">
            <p className="text-slate-700">没找到，换个词试试。</p>
            <Button className="mt-3" variant="secondary" onClick={clearAll}>清空搜索</Button>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<PageContainer><p className="text-slate-600">正在加载内容库...</p></PageContainer>}>
      <LibraryPageContent />
    </Suspense>
  );
}
