import { creators } from "@/data/creators";
import { ContentItem } from "@/types/content";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { logEvent } from "@/lib/eventLogger";
import { toChineseSkill } from "@/lib/utils";

type ContentCardProps = {
  item: ContentItem;
  viewerLevel?: string;
  source?: "library" | "profile";
  bookmarked?: boolean;
  bookmarkLoading?: boolean;
  onToggleBookmark?: () => void;
};

function getLevelFitMeta(levels: string[], viewerLevel?: string) {
  if (!viewerLevel) {
    return null;
  }

  if (levels.includes(viewerLevel)) {
    return {
      label: "适合你的水平",
      className: "bg-brand-100 text-brand-800"
    };
  }

  const viewerScore = Number.parseFloat(viewerLevel);
  const nearest = levels
    .map((level) => ({ level, diff: Number.parseFloat(level) - viewerScore }))
    .sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff))[0];

  if (!nearest || Math.abs(nearest.diff) > 0.5) {
    return null;
  }

  return {
    label: nearest.diff > 0 ? "略高于你的水平" : "略低于你的水平",
    className: "bg-slate-100 text-slate-600"
  };
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M6 3.5h8A1.5 1.5 0 0 1 15.5 5v11l-5.5-3-5.5 3V5A1.5 1.5 0 0 1 6 3.5Z" />
    </svg>
  );
}

export function ContentCard({
  item,
  viewerLevel,
  source = "library",
  bookmarked = false,
  bookmarkLoading = false,
  onToggleBookmark
}: ContentCardProps) {
  const creator = creators.find((c) => c.id === item.creatorId);
  const shouldShowCoachReason = item.coachReason && !item.coachReason.includes("[待填写");
  const levelFitMeta = getLevelFitMeta(item.levels, viewerLevel);
  const isProfileCompact = source === "profile";
  const bookmarkLabel = isProfileCompact
    ? (bookmarkLoading ? "处理中..." : "移出收藏")
    : (bookmarkLoading ? "处理中..." : bookmarked ? "已收藏" : "收藏");

  return (
    <Card className={isProfileCompact ? "space-y-2.5" : "space-y-3"}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge>{item.platform}</Badge>
          <Badge>{item.language === "zh" ? "中文" : "英文"}</Badge>
          {!isProfileCompact ? <Badge>{item.type}</Badge> : null}
          {levelFitMeta ? <Badge className={levelFitMeta.className}>{levelFitMeta.label}</Badge> : null}
        </div>
        {onToggleBookmark ? (
          <Button
            type="button"
            variant={isProfileCompact ? "secondary" : "ghost"}
            className={isProfileCompact
              ? "h-9 px-3 text-slate-700"
              : bookmarked ? "h-9 px-3 text-brand-700" : "h-9 px-3 text-slate-500"}
            onClick={onToggleBookmark}
            disabled={bookmarkLoading}
            aria-pressed={bookmarked}
          >
            <BookmarkIcon filled={bookmarked} />
            <span className="ml-1">{bookmarkLabel}</span>
          </Button>
        ) : null}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
      <p className="text-sm text-slate-600">来源：{creator?.name ?? "未知"}</p>
      <p className="text-sm text-slate-600">{isProfileCompact ? item.reason : item.summary}</p>
      {!isProfileCompact ? (
        <>
          <p className="text-sm text-slate-600">技术标签：{item.skills.map((skill) => toChineseSkill(skill)).join(" / ")}</p>
          <p className="text-sm text-slate-700">推荐理由：{item.reason}</p>
          {shouldShowCoachReason ? <p className="text-sm text-slate-500">教练视角：{item.coachReason}</p> : null}
          {item.useCases.length > 0 ? (
            <p className="text-xs text-slate-500">适用场景：{item.useCases.slice(0, 2).join(" / ")}</p>
          ) : null}
        </>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            logEvent("content_click", { contentId: item.id, source });
            logEvent("content_external", { contentId: item.id, platform: item.platform, url: item.url });
          }}
        >
          <Button>{isProfileCompact ? "去看" : "查看"}</Button>
        </a>
      </div>
    </Card>
  );
}
