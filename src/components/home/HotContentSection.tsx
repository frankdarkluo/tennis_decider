import Link from "next/link";
import { contents } from "@/data/contents";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function HotContentSection() {
  return (
    <section className="space-y-3">
      <h3 className="text-xl font-bold text-slate-900">热门内容</h3>
      <div className="space-y-3">
        {contents.slice(0, 3).map((item) => (
          <Link key={item.id} href="/library">
            <Card className="space-y-2 p-4">
              <div className="flex items-center gap-2">
                <Badge>{item.platform}</Badge>
                <Badge>{item.levels.join("/")}</Badge>
              </div>
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="text-sm text-slate-600">{item.reason}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
