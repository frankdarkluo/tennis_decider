import Link from "next/link";
import { Card } from "@/components/ui/Card";

const entries = [
  { title: "水平评估", desc: "5 分钟完成能力区间评估", href: "/assessment" },
  { title: "问题诊断", desc: "一句话定位你的技术瓶颈", href: "/diagnose" },
  { title: "精选内容推荐", desc: "按等级和问题快速找内容", href: "/library" }
];

export function QuickEntrySection() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {entries.map((item) => (
        <Link key={item.href} href={item.href}>
          <Card className="h-full transition hover:-translate-y-0.5 hover:border-brand-200">
            <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
          </Card>
        </Link>
      ))}
    </section>
  );
}
