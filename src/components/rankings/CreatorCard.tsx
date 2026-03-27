import { Creator } from "@/types/creator";
import { Card } from "@/components/ui/Card";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { CreatorAvatar } from "@/components/ui/CreatorAvatar";
import { logEvent } from "@/lib/eventLogger";

type CreatorCardProps = {
  creator: Creator;
  onDetail: () => void;
};

export function CreatorCard({ creator, onDetail }: CreatorCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <CreatorAvatar name={creator.name} avatarUrl={creator.avatar} />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="truncate text-base font-bold text-slate-900">{creator.name}</h3>
            <div className="flex flex-wrap gap-2">
              {creator.platforms.map((platform) => {
                const href = creator.platformLinks?.[platform] ?? (platform === creator.platforms[0] ? creator.profileUrl : undefined);

                if (!href) {
                  return <PlatformBadge key={platform} platform={platform} size="md" />;
                }

                return (
                  <a
                    key={platform}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`前往 ${creator.name} 的${platform}主页`}
                    className="platform-link-wiggle inline-flex rounded-full transition-transform duration-200 hover:scale-[1.04] focus-visible:scale-[1.04]"
                    onClick={() => logEvent("creator_click", { creatorId: creator.id, source: "creator_card_platform_badge", platform, targetUrl: href })}
                  >
                    <PlatformBadge platform={platform} size="md" />
                  </a>
                );
              })}
            </div>
          </div>

          <p className="text-sm text-slate-600">{creator.shortDescription}</p>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {creator.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-medium text-emerald-700"
                >
                  {tag}
                </span>
              ))}
            </div>

            <button
              type="button"
              className="shrink-0 text-sm font-medium text-slate-500 transition hover:text-slate-700"
              onClick={onDetail}
            >
              查看详情 →
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
