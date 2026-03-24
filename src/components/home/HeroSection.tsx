import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="rounded-3xl border border-[var(--line)] bg-white p-8 shadow-soft md:p-10">
      <p className="mb-4 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
        网球学习推荐 MVP
      </p>
      <h1 className="max-w-3xl text-3xl font-black leading-tight text-slate-900 md:text-5xl">
        把“我哪里有问题”变成“我下一步该练什么”
      </h1>
      <p className="mt-4 max-w-3xl text-slate-600 md:text-lg">
        根据你的水平、技术短板和具体困惑，推荐适合你的网球教学内容与训练策略。
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/assessment"><Button className="h-11 px-6">先测我的水平</Button></Link>
        <Link href="/diagnose"><Button variant="secondary" className="h-11 px-6">直接描述问题</Button></Link>
      </div>
    </section>
  );
}
