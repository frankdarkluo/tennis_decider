import { creators } from "@/data/creators";
import { ContentItem } from "@/types/content";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toChineseSkill } from "@/lib/utils";

type ContentCardProps = {
  item: ContentItem;
  bookmarked?: boolean;
  bookmarkLoading?: boolean;
  onToggleBookmark?: () => void;
};

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
  bookmarked = false,
  bookmarkLoading = false,
  onToggleBookmark
}: ContentCardProps) {
  const creator = creators.find((c) => c.id === item.creatorId);
  const shouldShowCoachReason = item.coachReason && !item.coachReason.includes("[待填写");

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge>{item.platform}</Badge>
          <Badge>{item.language === "zh" ? "中文" : "英文"}</Badge>
          <Badge>{item.type}</Badge>
        </div>
        {onToggleBookmark ? (
          <Button
            type="button"
            variant="ghost"
            className={bookmarked ? "h-9 px-3 text-brand-700" : "h-9 px-3 text-slate-500"}
            onClick={onToggleBookmark}
            disabled={bookmarkLoading}
            aria-pressed={bookmarked}
          >
            <BookmarkIcon filled={bookmarked} />
            <span className="ml-1">{bookmarkLoading ? "处理中..." : bookmarked ? "已收藏" : "收藏"}</span>
          </Button>
        ) : null}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
      <p className="text-sm text-slate-600">{item.summary}</p>
      <p className="text-sm text-slate-600">博主：{creator?.name ?? "未知"}</p>
      <p className="text-sm text-slate-600">技术标签：{item.skills.map((skill) => toChineseSkill(skill)).join(" / ")}</p>
      <p className="text-sm text-slate-700">推荐理由：{item.reason}</p>
      {shouldShowCoachReason ? <p className="text-sm text-slate-500">教练视角：{item.coachReason}</p> : null}
      {item.useCases.length > 0 ? (
        <p className="text-xs text-slate-500">适用场景：{item.useCases.slice(0, 2).join(" / ")}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <a href={item.url} target="_blank" rel="noreferrer"><Button>查看</Button></a>
      </div>
    </Card>
  );
}
