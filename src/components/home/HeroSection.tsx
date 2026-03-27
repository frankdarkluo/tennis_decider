"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { logEvent } from "@/lib/eventLogger";

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
        下一步练什么
      </p>
      <h1 className="max-w-3xl text-3xl font-black leading-tight text-slate-900 md:text-5xl">
        一句话，帮你找到下一步该练什么
      </h1>
      <p className="mt-4 max-w-3xl text-slate-600 md:text-lg">你说问题，我帮你判断先练什么。</p>
      <div className="mt-6 space-y-3">
        <Textarea
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="例如：我的反手总是下网，尤其对方来球一快我就更容易失误"
        />
        <p className="text-sm text-slate-500">也可以直接点：</p>
        <div className="flex flex-wrap gap-2">
          {quickTags.map((tag) => (
            <button
              type="button"
              key={tag}
              className="min-h-11 rounded-full border border-[var(--line)] px-4 py-2 text-sm text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
              onClick={() => {
                setQuestion(tag);
                logEvent("cta_click", { ctaLabel: tag, ctaLocation: "home_hero_tag", targetPage: "/diagnose" });
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Link
          href={diagnoseHref}
          onClick={() => logEvent("cta_click", { ctaLabel: "立即诊断", ctaLocation: "home_hero", targetPage: "/diagnose" })}
        >
          <Button className="h-11 px-6">立即诊断</Button>
        </Link>
        <Link
          href="/assessment"
          className="text-sm font-medium text-slate-500 transition hover:text-brand-700"
          onClick={() => logEvent("cta_click", { ctaLabel: "先花 1 分钟评估水平", ctaLocation: "home_hero_secondary", targetPage: "/assessment" })}
        >
          想更准？先做 1 分钟评估
        </Link>
      </div>
      <div className="mt-4">
        <Link
          href="/video-diagnose"
          className="text-sm font-medium text-slate-500 transition hover:text-brand-700"
          onClick={() => logEvent("cta_click", { ctaLabel: "试试 AI 视频诊断", ctaLocation: "home_hero_video", targetPage: "/video-diagnose" })}
        >
          有视频？试试 AI 诊断 →
        </Link>
      </div>
    </section>
  );
}
