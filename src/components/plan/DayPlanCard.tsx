"use client";

import { useState } from "react";
import { contents } from "@/data/contents";
import { expandedContents } from "@/data/expandedContents";
import { DayPlan } from "@/types/plan";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  getContentFocusLine,
  getContentLanguageTag,
  getContentPrimaryTitle,
  getContentSecondaryTitle,
  getSubtitleAvailability
} from "@/lib/content/display";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { getThumbnail, getVideoInitial } from "@/lib/thumbnail";

function compactFocus(value: string, maxLength = 15) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}…`;
}

const contentById = new Map([...contents, ...expandedContents].map((content) => [content.id, content]));

export function DayPlanCard({
  day,
  onViewDetails,
  isToday = false
}: {
  day: DayPlan;
  onViewDetails?: (dayNumber: number) => void;
  isToday?: boolean;
}) {
  const { language, t } = useI18n();
  const relatedContents = day.contentIds
    .map((id) => contentById.get(id))
    .filter((content) => Boolean(content));
  const [expanded, setExpanded] = useState(isToday);
  const displayExpanded = isToday || expanded;
  const featuredContent = relatedContents[0] ?? null;
  const thumbnail = featuredContent ? getThumbnail(featuredContent) : null;
  const primaryTitle = featuredContent ? getContentPrimaryTitle(featuredContent, language) : null;
  const secondaryTitle = featuredContent ? getContentSecondaryTitle(featuredContent, language) : null;
  const focusLine = featuredContent ? getContentFocusLine(featuredContent, language) : null;
  const contentLanguage = featuredContent ? getContentLanguageTag(featuredContent) : null;
  const subtitleAvailability = featuredContent ? getSubtitleAvailability(featuredContent) : null;
  const subtitleLabel = subtitleAvailability === "english"
    ? t("content.subtitle.yes")
    : subtitleAvailability === "none"
      ? t("content.subtitle.no")
      : subtitleAvailability === "not_needed"
        ? t("content.subtitle.notNeeded")
        : t("content.subtitle.unknown");

  const featuredContentCard = featuredContent ? (
    <a
      href={featuredContent.url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-2xl border border-[var(--line)] bg-white p-3 transition hover:border-brand-200"
      onClick={() => {
        logEvent("content.outbound_clicked", {
          contentId: featuredContent.id,
          platform: featuredContent.platform,
          sourceContext: "plan"
        }, { page: "/plan" });
      }}
    >
      <div className="flex gap-3">
        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={primaryTitle ?? featuredContent.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-lg font-medium text-slate-300">{getVideoInitial(primaryTitle ?? featuredContent.title)}</span>
            </div>
          )}
          {featuredContent.duration ? (
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1 py-0.5 text-[11px] font-medium text-white">
              {featuredContent.duration}
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          {featuredContent ? (
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge className="bg-slate-100 px-4 py-1.5 text-sm font-semibold leading-none text-slate-700">
                {contentLanguage === "zh" ? t("content.lang.zh") : t("content.lang.en")}
              </Badge>
              <Badge className="bg-slate-100 px-4 py-1.5 text-sm font-semibold leading-none text-slate-700">
                {subtitleLabel}
              </Badge>
            </div>
          ) : null}
          <p className="font-semibold text-slate-900">{primaryTitle ?? featuredContent.title}</p>
          {secondaryTitle ? (
            <div className="mt-1 space-y-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                {t("content.secondaryTitle")}
              </p>
              <p className="text-xs leading-5 text-slate-400">{secondaryTitle}</p>
            </div>
          ) : null}
          {focusLine && focusLine !== primaryTitle ? (
            <p className="mt-1 text-sm text-slate-600">{t("content.targetPrefix")} {focusLine}</p>
          ) : null}
          <p className="mt-2 text-sm font-medium text-slate-500">{t("plan.day.open")} →</p>
        </div>
      </div>
    </a>
  ) : null;

  const toggleExpanded = () => {
    if (isToday) {
      return;
    }

    if (!expanded) {
      onViewDetails?.(day.day);
    }

    setExpanded((prev) => !prev);
  };

  if (isToday) {
    return (
      <Card className="space-y-4 border-brand-200 bg-brand-50/40">
        <div>
          <p className="text-sm font-semibold text-brand-700">{t("plan.day.label", { day: day.day })} · {t("plan.day.today")}</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900">{day.focus}</h3>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">{t("plan.day.what")}</p>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
            {day.drills.map((drill) => (
              <li key={drill}>{drill}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">{t("plan.day.duration")}</p>
          <p className="mt-1 text-sm text-slate-700">{day.duration}</p>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">{t("plan.day.watch")}</p>
          {featuredContentCard ?? (
            <p className="text-sm text-slate-600">{t("plan.day.fallback")}</p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{t("plan.day.label", { day: day.day })}</p>
          <p className="mt-1 text-sm text-slate-600">{compactFocus(day.focus)}</p>
        </div>
        <Button variant="ghost" className="px-3 text-sm" onClick={toggleExpanded}>
          {displayExpanded ? t("plan.day.collapse") : t("plan.day.expand")}
        </Button>
      </div>

      {displayExpanded ? (
        <div className="mt-4 space-y-3 border-t border-[var(--line)] pt-4">
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-700">{t("plan.day.duration")}</span> {day.duration}
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
            {day.drills.map((drill) => (
              <li key={drill}>{drill}</li>
            ))}
          </ul>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">{t("plan.day.watch")}</p>
            {featuredContentCard ?? (
              <p className="text-sm text-slate-600">{t("plan.day.fallback")}</p>
            )}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
