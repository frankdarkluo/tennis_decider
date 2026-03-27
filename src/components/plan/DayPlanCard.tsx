"use client";

import { useState } from "react";
import { contents } from "@/data/contents";
import { DayPlan } from "@/types/plan";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getThumbnail, getVideoInitial } from "@/lib/thumbnail";

function compactFocus(value: string, maxLength = 15) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}…`;
}

export function DayPlanCard({
  day,
  onViewDetails,
  isToday = false
}: {
  day: DayPlan;
  onViewDetails?: (dayNumber: number) => void;
  isToday?: boolean;
}) {
  const relatedContents = contents.filter((content) => day.contentIds.includes(content.id)).slice(0, 1);
  const [expanded, setExpanded] = useState(isToday);
  const displayExpanded = isToday || expanded;

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
    const featuredContent = relatedContents[0];
    const thumbnail = featuredContent ? getThumbnail(featuredContent) : null;

    return (
      <Card className="space-y-4 border-brand-200 bg-brand-50/40">
        <div>
          <p className="text-sm font-semibold text-brand-700">Day {day.day} · 今天</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900">{day.focus}</h3>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">练什么</p>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
            {day.drills.map((drill) => (
              <li key={drill}>{drill}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">练多久</p>
          <p className="mt-1 text-sm text-slate-700">{day.duration}</p>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">看这条</p>
          {featuredContent ? (
            <a
              href={featuredContent.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-[var(--line)] bg-white p-3 transition hover:border-brand-200"
            >
              <div className="flex gap-3">
                <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={featuredContent.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-lg font-medium text-slate-300">{getVideoInitial(featuredContent.title)}</span>
                    </div>
                  )}
                  {featuredContent.duration ? (
                    <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1 py-0.5 text-[11px] font-medium text-white">
                      {featuredContent.duration}
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{featuredContent.title}</p>
                  {featuredContent.useCases[0] ? (
                    <p className="mt-1 text-sm text-slate-600">针对：{featuredContent.useCases[0]}</p>
                  ) : null}
                  <p className="mt-2 text-sm font-medium text-slate-500">点击观看 →</p>
                </div>
              </div>
            </a>
          ) : (
            <p className="text-sm text-slate-600">今天先按这组练习走，内容库里的视频按需补充即可。</p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Day {day.day}</p>
          <p className="mt-1 text-sm text-slate-600">{compactFocus(day.focus)}</p>
        </div>
        <Button variant="ghost" className="px-3 text-sm" onClick={toggleExpanded}>
          {displayExpanded ? "收起" : "展开"}
        </Button>
      </div>

      {displayExpanded ? (
        <div className="mt-4 space-y-3 border-t border-[var(--line)] pt-4">
          <p className="text-sm text-slate-600">练多久：{day.duration}</p>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
            {day.drills.map((drill) => (
              <li key={drill}>{drill}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
