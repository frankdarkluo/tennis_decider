"use client";

import Link from "next/link";
import { creators } from "@/data/creators";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { CreatorAvatar } from "@/components/ui/CreatorAvatar";
import { logEvent } from "@/lib/eventLogger";

const featuredCreatorIds = ["creator_gaiao", "creator_furao"];

export function HotCreatorsSection() {
  const featuredCreators = featuredCreatorIds
    .map((id) => creators.find((creator) => creator.id === id))
    .filter((creator): creator is (typeof creators)[number] => Boolean(creator))
    .slice(0, 1);

  return (
    <section className="flex h-full flex-col space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">网球博主</h3>
        </div>
        <Link
          href="/rankings"
          className="shrink-0 pt-1 text-sm font-medium text-slate-500 transition hover:text-slate-700"
          onClick={() => logEvent("cta_click", { ctaLabel: "查看更多博主", ctaLocation: "home_hot_creators", targetPage: "/rankings" })}
        >
          查看更多 →
        </Link>
      </div>
      <div className="grid flex-1 auto-rows-fr gap-3">
        {featuredCreators.map((creator) => (
          <Link
            key={creator.id}
            href="/rankings"
            className="h-full"
            onClick={() => logEvent("creator_click", { creatorId: creator.id, source: "homepage" })}
          >
            <Card className="flex h-full flex-col justify-between p-4 transition hover:-translate-y-0.5 hover:border-brand-200">
              <div className="flex items-start gap-3">
                <CreatorAvatar name={creator.name} avatarUrl={creator.avatar} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{creator.name}</p>
                    <PlatformBadge platform={creator.platforms[0]} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{creator.bio}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {creator.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
