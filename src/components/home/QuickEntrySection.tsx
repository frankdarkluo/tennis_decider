"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { logEvent } from "@/lib/eventLogger";

const entries = [
  {
    eyebrow: "先从困扰开始",
    title: "说一句“反手总下网”，我们帮你拆原因",
    desc: "不用先懂术语，也不用自己判断是动作、节奏还是脚步问题。",
    href: "/diagnose",
    cta: "进入问题诊断"
  },
  {
    eyebrow: "知道短板之后",
    title: "直接找更适合你当前阶段的练法和内容",
    desc: "按等级和问题筛选，不用自己在一堆泛教程里反复试错。",
    href: "/library",
    cta: "查看内容库"
  }
];

export function QuickEntrySection() {
  return (
    <section className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
      {entries.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => logEvent("cta_click", { ctaLabel: item.cta, ctaLocation: "home_quick_entry", targetPage: item.href })}
        >
          <Card className="h-full transition hover:-translate-y-0.5 hover:border-brand-200">
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-700">{item.eyebrow}</p>
            <h3 className="mt-3 text-lg font-bold leading-7 text-slate-900">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.desc}</p>
            <p className="mt-5 text-sm font-medium text-slate-500">{item.cta}</p>
          </Card>
        </Link>
      ))}
    </section>
  );
}
