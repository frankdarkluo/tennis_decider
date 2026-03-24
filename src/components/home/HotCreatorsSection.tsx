import Link from "next/link";
import { creators } from "@/data/creators";
import { Card } from "@/components/ui/Card";

export function HotCreatorsSection() {
  return (
    <section className="space-y-3">
      <h3 className="text-xl font-bold text-slate-900">热门博主</h3>
      <div className="space-y-3">
        {creators.slice(0, 3).map((creator) => (
          <Link key={creator.id} href="/rankings">
            <Card className="p-4">
              <p className="font-semibold text-slate-900">{creator.name}</p>
              <p className="mt-1 text-sm text-slate-600">{creator.bio}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
