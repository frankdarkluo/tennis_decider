"use client";

import { useState } from "react";
import { contents } from "@/data/contents";
import { DayPlan } from "@/types/plan";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function DayPlanCard({ day, onViewDetails }: { day: DayPlan; onViewDetails?: (dayNumber: number) => void }) {
  const relatedContents = contents.filter((content) => day.contentIds.includes(content.id)).slice(0, 2);
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    if (!expanded) {
      onViewDetails?.(day.day);
    }

    setExpanded((prev) => !prev);
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Day {day.day} · {day.focus}</h3>
          <p className="mt-1 text-sm text-slate-600">建议时长：{day.duration}</p>
        </div>
        <Button variant="ghost" className="px-3" onClick={toggleExpanded}>
          {expanded ? "收起" : "查看详情"}
        </Button>
      </div>
      {expanded ? (
        <>
          <div>
            <p className="mb-1 text-sm font-semibold text-slate-900">练习动作</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {day.drills.map((drill) => (
                <li key={drill}>{drill}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold text-slate-900">推荐内容</p>
            {relatedContents.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                {relatedContents.map((item) => (
                  <li key={item.id}>{item.title}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">今日以基础训练为主，可按需在内容库补充学习。</p>
            )}
          </div>
        </>
      ) : null}
    </Card>
  );
}
