"use client";

import Link from "next/link";
import { creators } from "@/data/creators";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { CreatorAvatar } from "@/components/ui/CreatorAvatar";
import {
  getCreatorBio,
  getCreatorPrimaryName,
  getCreatorSecondaryName,
  getCreatorTags
} from "@/lib/content/display";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";

const featuredCreatorIds = ["creator_gaiao", "creator_furao"];

export function HotCreatorsSection() {
  const { language, t } = useI18n();
  const featuredCreators = featuredCreatorIds
    .map((id) => creators.find((creator) => creator.id === id))
    .filter((creator): creator is (typeof creators)[number] => Boolean(creator))
    .slice(0, 1);

  return (
    <section className="flex h-full flex-col space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{t("home.hotCreators.title")}</h3>
        </div>
        <Link
          href="/rankings"
          className="shrink-0 pt-1 text-sm font-medium text-slate-500 transition hover:text-slate-700"
          onClick={() => logEvent("home.entry_selected", { entryMode: "browse_creators" }, { page: "/" })}
        >
          {t("home.more")}
        </Link>
      </div>
      <div className="grid flex-1 auto-rows-fr gap-3">
        {featuredCreators.map((creator) => {
          const translatedTags = getCreatorTags(creator.tags.slice(0, 3), language);
          const primaryName = getCreatorPrimaryName(creator, language);
          const secondaryName = getCreatorSecondaryName(creator, language);

          return (
          <Link
            key={creator.id}
            href="/rankings"
            className="h-full"
            onClick={() => {
              logEvent("home.entry_selected", { entryMode: "browse_creators" }, { page: "/" });
              logEvent("home.hot_creator_clicked", {
                creatorId: creator.id,
                creatorRegion: creator.region,
                position: 1
              }, { page: "/" });
            }}
          >
            <Card className="flex h-full flex-col justify-between p-4 transition hover:-translate-y-0.5 hover:border-brand-200">
              <div className="flex items-start gap-3">
                <CreatorAvatar name={primaryName} avatarUrl={creator.avatar} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{primaryName}</p>
                      {secondaryName ? (
                        <p className="text-xs text-slate-400">{secondaryName}</p>
                      ) : null}
                    </div>
                    <PlatformBadge platform={creator.platforms[0]} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{getCreatorBio(creator, language)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {translatedTags.map((tag, index) => (
                      <Badge key={`${creator.id}:${index}`}>{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
          );
        })}
      </div>
    </section>
  );
}
