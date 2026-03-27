"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DiagnosisResult as DiagnosisResultType } from "@/types/diagnosis";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlatformVideoSearch } from "@/components/PlatformVideoSearch";
import { logEvent } from "@/lib/eventLogger";

export function DiagnoseResult({ result }: { result: DiagnosisResultType }) {
  const planHref = `/plan?problemTag=${encodeURIComponent(result.problemTag)}${result.level ? `&level=${encodeURIComponent(result.level)}` : ""}`;
  const canGeneratePlan = Boolean(result.input.trim());
  const [layer, setLayer] = useState<1 | 2 | 3>(1);
  const primaryFix = result.fixes[0] ?? result.summary;
  const featuredContent = result.recommendedContents[0];
  const moreContents = result.recommendedContents.slice(1);

  useEffect(() => {
    setLayer(1);
  }, [result.input, result.problemTag]);

  if (!canGeneratePlan) {
    return null;
  }

  return (
    <Card className="space-y-4">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-brand-700">你现在最该先改的是：</p>
        <h2 className="text-2xl font-black text-slate-900">{result.title.replace("你的问题更接近：", "").replace("你的问题暂时更接近：", "")}</h2>
        <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
          <p className="text-sm font-semibold text-slate-700">今天先记住一件事：</p>
          <p className="mt-2 text-base font-medium text-slate-900">{primaryFix}</p>
        </div>
        {result.fallbackUsed && result.fallbackMode ? (
          <div className="rounded-xl border border-brand-100 bg-brand-50/70 p-3 text-sm text-slate-700">
            <p>
              {result.fallbackMode === "assessment"
                ? "这次先按你评估里最需要补的环节给你一组方向，后面你再把问题描述得更具体一点，我们会更准。"
                : "这次先给你一组通用提升内容。做完 1 分钟评估后，我们能把推荐收得更准。"}
            </p>
            {result.fallbackMode === "no-assessment" ? (
              <div className="mt-3">
                <Link href="/assessment">
                  <Button variant="secondary">先去做评估</Button>
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
        {layer === 1 ? (
          <button
            type="button"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            onClick={() => setLayer(2)}
          >
            展开看更多 ↓
          </button>
        ) : null}
      </div>

      {layer >= 2 ? (
        <div className="space-y-4 border-t border-[var(--line)] pt-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">为什么会这样？</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {result.causes.slice(0, 2).map((cause) => (
                <li key={cause}>{cause}</li>
              ))}
            </ul>
          </div>

          {featuredContent ? (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-900">推荐先看这条：</p>
              <div className="rounded-xl border border-[var(--line)] p-4 text-sm">
                <p className="font-semibold text-slate-900">{featuredContent.title}</p>
                <p className="mt-1 text-slate-600">{featuredContent.reason}</p>
                {featuredContent.coachReason && !featuredContent.coachReason.includes("[待填写") ? (
                  <p className="mt-2 text-xs text-slate-500">教练视角：{featuredContent.coachReason}</p>
                ) : null}
                <div className="mt-3">
                  <a
                    href={featuredContent.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      logEvent("content_click", { contentId: featuredContent.id, source: "diagnosis_featured" });
                      logEvent("content_external", { contentId: featuredContent.id, platform: featuredContent.platform, url: featuredContent.url });
                    }}
                  >
                    <Button variant="secondary">去看这条内容</Button>
                  </a>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={planHref}
              onClick={() => logEvent("cta_click", { ctaLabel: "根据这个问题生成 7 天训练计划", ctaLocation: "diagnosis_result", targetPage: "/plan" })}
            >
              <Button>根据这个问题生成 7 天训练计划</Button>
            </Link>
          </div>

          {layer === 2 ? (
            <button
              type="button"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
              onClick={() => setLayer(3)}
            >
              展开搜索更多 ↓
            </button>
          ) : null}
        </div>
      ) : null}

      {layer >= 3 ? (
        <div className="space-y-4 border-t border-[var(--line)] pt-4">
          {moreContents.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">更多推荐内容</p>
              {moreContents.map((item) => (
                <div key={item.id} className="rounded-xl border border-[var(--line)] p-3 text-sm">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-slate-600">{item.reason}</p>
                  <div className="mt-3">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => {
                        logEvent("content_click", { contentId: item.id, source: "diagnosis_more" });
                        logEvent("content_external", { contentId: item.id, platform: item.platform, url: item.url });
                      }}
                    >
                      <Button variant="secondary">去看 →</Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {result.searchQueries ? (
            <PlatformVideoSearch
              queries={result.searchQueries}
              title="在其他平台搜索更多"
            />
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
              onClick={() => {
                logEvent("cta_click", { ctaLabel: "继续诊断别的问题", ctaLocation: "diagnosis_result", targetPage: "scroll_to_input" });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              继续诊断别的问题 →
            </button>
            <Link
              href="/video-diagnose"
              onClick={() => logEvent("cta_click", { ctaLabel: "上传视频做更精准诊断", ctaLocation: "diagnosis_result", targetPage: "/video-diagnose" })}
            >
              <Button variant="secondary">上传视频做更精准诊断</Button>
            </Link>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
