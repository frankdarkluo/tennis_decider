"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCompactViewCount } from "@/lib/content/display";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { formatLocalizedDate } from "@/lib/i18n/format";
import { SearchPlatform, SearchVideoResult, SearchVideosResponse } from "@/types/platformSearch";
import { DiagnosisSearchQueries } from "@/types/diagnosis";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { TabButton } from "@/components/ui/Tabs";

type PlatformVideoSearchProps = {
  queries: DiagnosisSearchQueries;
  title?: string;
  sourceContext?: "diagnose" | "generic";
};

const platformLabels: Record<SearchPlatform, "Bilibili" | "YouTube"> = {
  bilibili: "Bilibili",
  youtube: "YouTube"
};

function LoadingCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
      <div className="aspect-video animate-pulse bg-slate-100" />
      <div className="space-y-3 p-4">
        <div className="h-5 animate-pulse rounded-full bg-slate-100" />
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

export function PlatformVideoSearch({
  queries,
  title,
  sourceContext = "generic"
}: PlatformVideoSearchProps) {
  const { language, t } = useI18n();
  const [activePlatform, setActivePlatform] = useState<SearchPlatform>("bilibili");
  const [queryIndexes, setQueryIndexes] = useState<Record<SearchPlatform, number>>({
    bilibili: 0,
    youtube: 0
  });
  const [results, setResults] = useState<SearchVideoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cached, setCached] = useState(false);

  const activeQueries = useMemo(() => {
    return queries[activePlatform].filter((item) => item.trim().length > 0);
  }, [activePlatform, queries]);

  const activeQueryIndex = queryIndexes[activePlatform] ?? 0;
  const activeQuery = activeQueries[activeQueryIndex] ?? activeQueries[0] ?? "";

  useEffect(() => {
    if (!activeQuery) {
      setResults([]);
      setError("");
      setCached(false);
      return;
    }

    let active = true;

    async function runSearch() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/search-videos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            platform: activePlatform,
            query: activeQuery,
            maxResults: 5
          })
        });

        const data = await response.json() as Partial<SearchVideosResponse> & { error?: string };
        if (!response.ok) {
          throw new Error(typeof data.error === "string" ? data.error : t("platform.search.failed"));
        }

        if (!active) {
          return;
        }

        setResults(Array.isArray(data.results) ? data.results : []);
        setCached(Boolean(data.cached));
      } catch (searchError) {
        if (!active) {
          return;
        }

        setResults([]);
        setCached(false);
        setError(searchError instanceof Error ? searchError.message : t("platform.search.failed"));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void runSearch();

    return () => {
      active = false;
    };
  }, [activePlatform, activeQuery, t]);

  const handleSwitchPlatform = (nextPlatform: SearchPlatform) => {
    setActivePlatform(nextPlatform);
    setQueryIndexes((prev) => ({
      ...prev,
      [nextPlatform]: 0
    }));
  };

  const handleRotateQuery = () => {
    if (activeQueries.length <= 1) {
      return;
    }

    setQueryIndexes((prev) => ({
      ...prev,
      [activePlatform]: ((prev[activePlatform] ?? 0) + 1) % activeQueries.length
    }));
  };

  const sectionTitle = title ?? t("platform.search.title");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-bold text-slate-900">{sectionTitle}</p>
          {cached ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">{t("platform.search.cache")}</span>
          ) : null}
        </div>
        <p className="text-sm text-slate-500">{t("platform.search.subtitle")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TabButton
          active={activePlatform === "bilibili"}
          onClick={() => handleSwitchPlatform("bilibili")}
          type="button"
        >
          Bilibili
        </TabButton>
        <TabButton
          active={activePlatform === "youtube"}
          onClick={() => handleSwitchPlatform("youtube")}
          type="button"
        >
          YouTube
        </TabButton>
      </div>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-slate-50 px-4 py-6 text-sm text-slate-600">
          {error}
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-slate-50 px-4 py-6 text-sm text-slate-600">
          {t("platform.search.empty")}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => {
            const compactViews = formatCompactViewCount(item.viewCount ?? undefined, language);
            const publishedAt = item.publishedAt ? formatLocalizedDate(item.publishedAt, language) : null;
            const viewCountLabel = compactViews ? t("platform.search.views", { value: compactViews }) : t("platform.search.unknownViews");

            return (
              <a
                key={`${item.platform}-${item.videoId}`}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white transition hover:-translate-y-0.5 hover:shadow-sm"
                onClick={() => {
                  if (sourceContext === "diagnose") {
                    logEvent("diagnose.search_suggestion_clicked", {
                      platform: item.platform,
                      suggestionType: "platform_search"
                    }, { page: "/diagnose" });
                  }
                }}
              >
                {item.thumbnail ? (
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-slate-100 text-sm text-slate-400">
                    {t("platform.search.noThumbnail")}
                  </div>
                )}

                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <PlatformBadge platform={platformLabels[item.platform]} />
                  </div>

                  <p
                    className="text-sm font-semibold leading-6 text-slate-900"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}
                  >
                    {item.title}
                  </p>

                  <div className="space-y-1 text-xs text-slate-500">
                    <p>{item.author || t("platform.search.unknownAuthor")}</p>
                    <p>
                      {[viewCountLabel, item.duration, publishedAt].filter(Boolean).join(" · ")}
                    </p>
                  </div>

                  <p className="text-xs font-medium text-brand-700">
                    {t("platform.search.open", { platform: platformLabels[item.platform] })}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <span>{t("platform.search.query")}: {activeQuery || t("platform.search.none")}</span>
        {activeQueries.length > 1 ? (
          <button
            type="button"
            className="font-medium text-slate-500 transition hover:text-brand-700"
            onClick={handleRotateQuery}
          >
            {t("platform.search.rotate")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
