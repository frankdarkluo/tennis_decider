import { useState } from "react";

import { creators } from "@/data/creators";
import { ContentItem } from "@/types/content";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { logEvent } from "@/lib/eventLogger";
import { getThumbnail, getVideoInitial } from "@/lib/thumbnail";

type ContentCardProps = {
  item: ContentItem;
  source?: "library" | "profile";
  bookmarked?: boolean;
  bookmarkLoading?: boolean;
  onToggleBookmark?: () => void;
};

function BookmarkIcon({
  filled,
  className = "h-[1.45rem] w-[1.45rem]"
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M6 3.5h8A1.5 1.5 0 0 1 15.5 5v11l-5.5-3-5.5 3V5A1.5 1.5 0 0 1 6 3.5Z" />
    </svg>
  );
}

function ViewsIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.25" y="4.75" width="17.5" height="14.5" rx="4.25" />
      <path d="M10 9.2v5.6l4.8-2.8-4.8-2.8Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function clampText(value: string, maxLength = 20) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength)}…`;
}


function normalizeBilibiliTitle(value: string) {
  return value
    .replace(/[|｜]\s*LeonTV(?:网球频道|频道)?\s*[|｜]?/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getDisplayTitle(item: ContentItem) {
  const rawTitle = (item.platform === "Bilibili" && item.language === "zh"
    ? normalizeBilibiliTitle(item.sourceTitle ?? item.title)
    : item.title)
    .replace(/\s+/g, " ")
    .trim();

  const strippedTitle = rawTitle.replace(/[＃#].*$/, "").trim();
  if (strippedTitle.length > 1) {
    return strippedTitle;
  }

  const afterFirstTag = rawTitle
    .replace(/^[＃#][^\s＃#]+\s*/, "")
    .replace(/[＃#].*$/, "")
    .trim();

  if (afterFirstTag.length > 1) {
    return afterFirstTag;
  }

  return rawTitle;
}

function getDisplayReason(item: ContentItem) {
  const useCase = item.useCases[0]?.trim();
  if (useCase) {
    const normalized = useCase.replace(/。/g, "").trim();
    return clampText(`针对: ${normalized}`);
  }

  const reason = item.reason?.trim();
  if (reason) {
    const normalized = reason
      .replace(/^适合作为/, "")
      .replace(/^适合/, "")
      .replace(/^针对[:：]\s*/, "")
      .replace(/。/g, "")
      .trim();
    return clampText(`针对: ${normalized}`);
  }

  return clampText(
    `针对: ${item.summary
      .replace(/^适合作为/, "")
      .replace(/^适合/, "")
      .replace(/^针对[:：]\s*/, "")
      .replace(/。/g, "")
      .trim()}`
  );
}

function formatChineseViewCount(value?: number) {
  if (!value || value <= 0) {
    return null;
  }

  if (value < 10000) {
    return String(Math.round(value));
  }

  const wan = Math.round((value / 10000) * 10) / 10;
  return `${wan.toFixed(1)}万`;
}

function ThumbnailFallback({ title, platform }: { title: string; platform: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-brand-50">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-4xl font-semibold text-slate-300 shadow-sm ring-1 ring-slate-200/70">
          {getVideoInitial(title)}
        </span>
        <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-slate-400 shadow-sm ring-1 ring-slate-200/70">
          {platform.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

export function ContentCard({
  item,
  source = "library",
  bookmarked = false,
  bookmarkLoading = false,
  onToggleBookmark
}: ContentCardProps) {
  const creator = creators.find((c) => c.id === item.creatorId);
  const isProfileCompact = source === "profile";
  const displayTitle = getDisplayTitle(item);
  const displayReason = getDisplayReason(item);
  const thumbnail = getThumbnail(item);
  const viewCountLabel = formatChineseViewCount(item.viewCount);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const showThumbnail = Boolean(thumbnail) && !thumbnailFailed;

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden p-0">
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`打开视频：${displayTitle}`}
        className="absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/70"
        onClick={() => {
          logEvent("content_click", { contentId: item.id, source, target: "card" });
          logEvent("content_external", { contentId: item.id, platform: item.platform, url: item.url });
        }}
      />
      <div className="relative z-10 flex h-full flex-col pointer-events-none">
        <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-slate-100">
          {showThumbnail ? (
            <img
              src={thumbnail ?? undefined}
              alt={displayTitle}
              className="absolute inset-0 h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              onError={() => setThumbnailFailed(true)}
            />
          ) : (
            <ThumbnailFallback title={displayTitle} platform={item.platform} />
          )}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-slate-200/70" />
          {viewCountLabel ? (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded bg-black/75 px-2 py-1 text-xs font-medium text-white">
              <ViewsIcon />
              {viewCountLabel}
            </span>
          ) : null}
          {item.duration ? (
            <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white">
              {item.duration}
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col px-5 pt-5 pb-0">
          <div className="space-y-2.5">
            <div className="flex flex-wrap gap-2">
              <Badge className="px-5 py-2 text-base font-semibold leading-none">{item.platform}</Badge>
              <Badge className="bg-slate-100 px-5 py-2 text-base font-semibold leading-none text-slate-700">{item.levels.join("/")}</Badge>
            </div>
            <div className="space-y-1">
              <h3 className="line-clamp-2 text-[0.96rem] font-bold leading-[1.35] text-slate-900 sm:text-[1rem]">
                {displayTitle}
              </h3>
              <p className="text-sm leading-6 text-slate-600">{creator?.name ?? "未知"}</p>
            </div>
          </div>
          <div className="relative mt-0.5 pr-10">
            <p className="min-w-0 text-sm leading-6 text-slate-600">{displayReason}</p>
            {onToggleBookmark ? (
              <button
                type="button"
                className={isProfileCompact
                  ? "pointer-events-auto text-sm font-semibold text-slate-500 transition hover:text-slate-700"
                  : bookmarked
                    ? "pointer-events-auto absolute right-[-4px] top-1/2 z-20 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-brand-700 transition duration-200 hover:scale-[1.03] hover:text-brand-800"
                    : "pointer-events-auto absolute right-[-4px] top-1/2 z-20 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-slate-400 transition duration-200 hover:scale-[1.03] hover:text-slate-600"}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleBookmark();
                }}
                disabled={bookmarkLoading}
                aria-pressed={bookmarked}
                aria-label={isProfileCompact ? "移出收藏" : bookmarked ? "取消收藏" : "加入收藏"}
              >
                {isProfileCompact ? (
                  <span>{bookmarkLoading ? "处理中..." : "移出收藏"}</span>
                ) : (
                  <BookmarkIcon filled={bookmarked} className="h-[1.6rem] w-[1.6rem]" />
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
