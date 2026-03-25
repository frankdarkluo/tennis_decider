"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

const quickTags = [
  "反手总是下网",
  "发球没有旋转",
  "正手一发力就出界",
  "不知道怎么打双打",
  "比赛一紧张就乱"
];

export function HeroSection() {
  const [question, setQuestion] = useState("");
  const diagnoseHref = `/diagnose?q=${encodeURIComponent(question)}`;

  return (
    <section className="rounded-3xl border border-[var(--line)] bg-white p-8 shadow-soft md:p-10">
      <p className="mb-4 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
        网球练习方向指南
      </p>
      <h1 className="max-w-3xl text-3xl font-black leading-tight text-slate-900 md:text-5xl">
        一句话，帮你找到下一步该练什么
      </h1>
      <p className="mt-4 max-w-3xl text-slate-600 md:text-lg">
        直接描述你最近在网球里遇到的问题，我们会给你更像教练的诊断、内容推荐和训练方向。
      </p>
      <div className="mt-6 space-y-3">
        <Textarea
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="例如：我的反手总是下网，尤其对方来球一快我就更容易失误"
        />
        <p className="text-sm text-slate-500">不知道怎么开口时，也可以直接点一个常见问题：</p>
        <div className="flex flex-wrap gap-2">
          {quickTags.map((tag) => (
            <button
              key={tag}
              className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-slate-700 hover:border-brand-300"
              onClick={() => setQuestion(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Link href={diagnoseHref}><Button className="h-11 px-6">立即诊断</Button></Link>
        <Link
          href="/assessment"
          className="text-sm font-medium text-slate-500 transition hover:text-brand-700"
        >
          想更精准？先花 1 分钟评估水平
        </Link>
      </div>
    </section>
  );
}
