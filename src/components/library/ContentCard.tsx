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

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-5 w-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M6 3.5h8A1.5 1.5 0 0 1 15.5 5v11l-5.5-3-5.5 3V5A1.5 1.5 0 0 1 6 3.5Z" />
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

export function ContentCard({
  item,
  source = "library",
  bookmarked = false,
  bookmarkLoading = false,
  onToggleBookmark
}: ContentCardProps) {
  const creator = creators.find((c) => c.id === item.creatorId);
  const isProfileCompact = source === "profile";
  const displayReason = getDisplayReason(item);
  const thumbnail = getThumbnail(item);

  return (
    <Card className="self-start overflow-hidden p-0">
      <div className="relative aspect-video bg-slate-100">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl font-semibold text-slate-300">{getVideoInitial(item.title)}</span>
          </div>
        )}
        {item.duration ? (
          <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white">
            {item.duration}
          </span>
        ) : null}
      </div>
      <div className="space-y-2.5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge className="px-5 py-2 text-base font-semibold leading-none">{item.platform}</Badge>
            <Badge className="bg-slate-100 px-5 py-2 text-base font-semibold leading-none text-slate-700">{item.levels.join("/")}</Badge>
          </div>
          {onToggleBookmark ? (
            <button
              type="button"
              className={isProfileCompact
                ? "text-sm font-semibold text-slate-500 transition hover:text-slate-700"
                : bookmarked
                  ? "inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-700 transition hover:bg-brand-50"
                  : "inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"}
              onClick={onToggleBookmark}
              disabled={bookmarkLoading}
              aria-pressed={bookmarked}
              aria-label={isProfileCompact ? "移出收藏" : bookmarked ? "取消收藏" : "加入收藏"}
            >
              {isProfileCompact ? (
                <span>{bookmarkLoading ? "处理中..." : "移出收藏"}</span>
              ) : (
                <BookmarkIcon filled={bookmarked} />
              )}
            </button>
          ) : null}
        </div>
        <h3 className="line-clamp-2 text-lg font-bold leading-7 text-slate-900">{item.title}</h3>
        <p className="text-sm text-slate-600">来源：{creator?.name ?? "未知"}</p>
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 flex-1 text-sm leading-6 text-slate-600">{displayReason}</p>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
            onClick={() => {
              logEvent("content_click", { contentId: item.id, source });
              logEvent("content_external", { contentId: item.id, platform: item.platform, url: item.url });
            }}
          >
            点击观看 →
          </a>
        </div>
      </div>
    </Card>
  );
}
