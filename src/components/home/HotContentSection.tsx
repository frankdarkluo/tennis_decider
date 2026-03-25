import Link from "next/link";
import { contents } from "@/data/contents";
import { creators } from "@/data/creators";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PlatformBadge } from "@/components/ui/PlatformBadge";

const featuredContentIds = ["content_fr_01", "content_gaiao_02"];

export function HotContentSection() {
  const featuredContents = featuredContentIds
    .map((id) => contents.find((item) => item.id === id))
    .filter((item): item is (typeof contents)[number] => Boolean(item));

  return (
    <section className="flex h-full flex-col space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">从这些内容开始练，更像真的有人在带你</h3>
        </div>
        <Link href="/library" className="shrink-0 pt-1 text-sm font-medium text-slate-500 transition hover:text-slate-700">
          查看更多 →
        </Link>
      </div>
      <div className="grid flex-1 auto-rows-fr gap-3">
        {featuredContents.map((item) => {
          const creator = creators.find((entry) => entry.id === item.creatorId);

          return (
            <Link key={item.id} href="/library" className="h-full">
              <Card className="flex h-full flex-col justify-between gap-3 p-4 transition hover:-translate-y-0.5 hover:border-brand-200">
                <div className="flex flex-wrap items-center gap-2">
                  <PlatformBadge platform={item.platform} />
                  <Badge className="bg-slate-100 text-slate-700">{item.levels.join("/")}</Badge>
                  {creator ? <span className="text-xs font-medium text-slate-500">{creator.name}</span> : null}
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm leading-6 text-slate-600">{item.reason}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
