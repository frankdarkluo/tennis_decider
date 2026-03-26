import { Creator } from "@/types/creator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { CreatorAvatar } from "@/components/ui/CreatorAvatar";
import { logEvent } from "@/lib/eventLogger";
import { toChineseSkill } from "@/lib/utils";

type CreatorCardProps = {
  creator: Creator;
  onDetail: () => void;
  onViewLibrary: () => void;
};

export function CreatorCard({ creator, onDetail, onViewLibrary }: CreatorCardProps) {
  const recommendedCount = creator.featuredContentIds.length;
  const hasRecommendedContent = recommendedCount > 0;

  return (
    <Card className="space-y-3">
      <div className="flex items-start gap-3">
        <CreatorAvatar name={creator.name} avatarUrl={creator.avatar} />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900">{creator.name}</h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {creator.platforms.map((platform) => {
              const href = creator.platformLinks?.[platform] ?? (platform === creator.platforms[0] ? creator.profileUrl : undefined);

              if (!href) {
                return <PlatformBadge key={platform} platform={platform} />;
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
                  <PlatformBadge platform={platform} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-600">{creator.bio}</p>
      <p className="text-xs text-slate-600">擅长：{creator.specialties.map((item) => toChineseSkill(item)).join(" / ")}</p>
      <p className="text-xs text-slate-600">适合等级：{creator.levels.join(" / ")}</p>
      {hasRecommendedContent ? <p className="text-xs text-slate-600">推荐内容数量：{recommendedCount}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button onClick={onDetail}>查看详情</Button>
        {hasRecommendedContent ? <Button variant="secondary" onClick={onViewLibrary}>查看推荐内容</Button> : null}
      </div>
    </Card>
  );
}
