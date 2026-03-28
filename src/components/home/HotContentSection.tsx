"use client";

import Link from "next/link";
import { contents } from "@/data/contents";
import { creators } from "@/data/creators";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import {
  getContentFocusLine,
  getContentPrimaryTitle,
  getContentSecondaryTitle
} from "@/lib/content/display";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";

const featuredContentIds = ["content_fr_01", "content_gaiao_02"];

export function HotContentSection() {
  const { language, t } = useI18n();
  const featuredContents = featuredContentIds
    .map((id) => contents.find((item) => item.id === id))
    .filter((item): item is (typeof contents)[number] => Boolean(item))
    .slice(0, 1);

  return (
    <section className="flex h-full flex-col space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{t("home.hotContent.title")}</h3>
        </div>
        <Link
          href="/library"
          className="shrink-0 pt-1 text-sm font-medium text-slate-500 transition hover:text-slate-700"
          onClick={() => logEvent("cta_click", { ctaLabel: t("cta.moreContent"), ctaLocation: "home_hot_content", targetPage: "/library" })}
        >
          {t("home.more")}
        </Link>
      </div>
      <div className="grid flex-1 auto-rows-fr gap-3">
        {featuredContents.map((item) => {
          const creator = creators.find((entry) => entry.id === item.creatorId);
          const primaryTitle = getContentPrimaryTitle(item, language);
          const secondaryTitle = getContentSecondaryTitle(item, language);
          const focusLine = getContentFocusLine(item, language);

          return (
            <Link
              key={item.id}
              href="/library"
              className="h-full"
              onClick={() => logEvent("content_click", { contentId: item.id, source: "homepage" })}
            >
              <Card className="flex h-full flex-col justify-between gap-3 p-4 transition hover:-translate-y-0.5 hover:border-brand-200">
                <div className="flex flex-wrap items-center gap-2">
                  <PlatformBadge platform={item.platform} />
                  <Badge className="bg-slate-100 text-slate-700">{item.levels.join("/")}</Badge>
                  {creator ? <span className="text-xs font-medium text-slate-500">{creator.name}</span> : null}
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-slate-900">{primaryTitle}</p>
                  {secondaryTitle ? (
                    <p className="text-xs leading-5 text-slate-400">{secondaryTitle}</p>
                  ) : null}
                  {focusLine && focusLine !== primaryTitle ? (
                    <p className="text-sm leading-6 text-slate-600">{t("content.targetPrefix")} {focusLine}</p>
                  ) : null}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
