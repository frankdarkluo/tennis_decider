import { Creator } from "@/types/creator";
import { Card } from "@/components/ui/Card";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { CreatorAvatar } from "@/components/ui/CreatorAvatar";
import {
  getCreatorPrimaryName,
  getCreatorSecondaryName,
  getCreatorShortDescription,
  getCreatorTags
} from "@/lib/content/display";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";

type CreatorCardProps = {
  creator: Creator;
  onDetail: () => void;
};

export function CreatorCard({ creator, onDetail }: CreatorCardProps) {
  const { language, t } = useI18n();
  const translatedTags = getCreatorTags(creator.tags.slice(0, 3), language);
  const primaryName = getCreatorPrimaryName(creator, language);
  const secondaryName = getCreatorSecondaryName(creator, language);

  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-center gap-3">
        <CreatorAvatar name={creator.name} avatarUrl={creator.avatar} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-bold text-slate-900">{primaryName}</h3>
            {creator.levels.length > 0 ? (
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                {creator.levels.join("/")}
              </span>
            ) : null}
          </div>
          {secondaryName ? (
            <p className="truncate text-xs text-slate-400">{secondaryName}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2">
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
                aria-label={t("creator.platformAria", { name: creator.name, platform })}
                className="platform-link-wiggle inline-flex rounded-full transition-transform duration-200 hover:scale-[1.04] focus-visible:scale-[1.04]"
                onClick={() => logEvent("creator_click", { creatorId: creator.id, source: "creator_card_platform_badge", platform, targetUrl: href })}
              >
                <PlatformBadge platform={platform} size="md" />
              </a>
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex-1 space-y-3">
        <p className="line-clamp-1 text-sm text-slate-600">{getCreatorShortDescription(creator, language)}</p>

        <div className="flex flex-wrap gap-2">
          {translatedTags.map((tag, index) => (
            <span
              key={`${creator.id}:${index}`}
              className="rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-medium text-emerald-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          className="shrink-0 text-sm font-medium text-slate-500 transition hover:text-slate-700"
          onClick={onDetail}
        >
          {t("rankings.detail")} →
        </button>
      </div>
    </Card>
  );
}
