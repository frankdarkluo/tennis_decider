"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreatorAvatar } from "@/components/ui/CreatorAvatar";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { logEvent } from "@/lib/eventLogger";
import { getThumbnail, getVideoInitial } from "@/lib/thumbnail";
import { VideoDiagnosisResult } from "@/types/videoDiagnosis";

function getConfidenceTone(confidence: VideoDiagnosisResult["confidenceBand"]) {
  if (confidence === "较高") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (confidence === "中等") {
    return "bg-amber-50 text-amber-700";
  }
  return "bg-rose-50 text-rose-700";
}

function RecommendationCard({
  item,
  source
}: {
  item: VideoDiagnosisResult["recommendedContents"][number];
  source: "video_diagnosis_featured" | "video_diagnosis_more";
}) {
  const thumbnail = getThumbnail(item);

  return (
    <div className="rounded-xl border border-[var(--line)] p-4">
      <div className="flex gap-3">
        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={item.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-lg font-medium text-slate-300">{getVideoInitial(item.title)}</span>
            </div>
          )}
          {item.duration ? (
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1 py-0.5 text-[11px] font-medium text-white">
              {item.duration}
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <PlatformBadge platform={item.platform} />
            <Badge className="bg-slate-100 text-slate-700">{item.levels.join("/")}</Badge>
          </div>
          <p className="mt-2 font-semibold text-slate-900">{item.title}</p>
          <p className="mt-1 text-sm text-slate-600">针对：{item.useCases[0] ?? item.reason}</p>
          {item.coachReason ? (
            <p className="mt-2 text-xs leading-5 text-slate-500">教练视角：{item.coachReason}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-3">
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            logEvent("content_click", { contentId: item.id, source });
            logEvent("content_external", { contentId: item.id, platform: item.platform, url: item.url });
          }}
        >
          <Button variant="secondary">点击观看</Button>
        </a>
      </div>
    </div>
  );
}

export function VideoAnalysisResult({ result }: { result: VideoDiagnosisResult }) {
  const planHref = `/plan?problemTag=${encodeURIComponent(result.trainingPlan.problemTag)}&level=${encodeURIComponent(result.trainingPlan.level)}`;
  const [layer, setLayer] = useState<1 | 2 | 3>(1);
  const primaryFix = result.primaryProblem.fix || result.primaryProblem.cause;
  const featuredContent = result.recommendedContents[0];
  const moreContents = result.recommendedContents.slice(1);

  useEffect(() => {
    setLayer(1);
  }, [result.primaryProblem.label, result.observation.overallAssessment]);

  return (
    <Card className="space-y-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-700">视频诊断结果</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">先改这一个：{result.primaryProblem.label}</h2>
          </div>
          <Badge className={getConfidenceTone(result.confidenceBand)}>
            置信度：{result.confidenceBand}
          </Badge>
        </div>

        <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
          <p className="text-sm font-semibold text-slate-700">今天先记住一件事：</p>
          <p className="mt-2 text-base font-medium text-slate-900">{primaryFix}</p>
        </div>

        {!result.chargeable && result.fallbackReason ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
            <p className="font-semibold">这次先别下太重的动作结论</p>
            <p className="mt-1 leading-6">{result.fallbackReason}</p>
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">AI 观察到了什么</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>身体姿态：{result.observation.bodyPosture}</li>
                <li>击球点：{result.observation.contactPoint}</li>
                <li>脚步：{result.observation.footwork}</li>
                <li>挥拍路径：{result.observation.swingPath}</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">为什么会这样</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
                <li>{result.primaryProblem.cause}</li>
                {result.secondaryProblems.slice(0, 2).map((item) => (
                  <li key={item.label}>{item.description}</li>
                ))}
              </ul>
            </div>
          </div>

          {featuredContent ? (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-900">推荐先看这条：</p>
              <RecommendationCard item={featuredContent} source="video_diagnosis_featured" />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Link
              href={planHref}
              onClick={() => logEvent("video_plan_generate", { problemTag: result.trainingPlan.problemTag, level: result.trainingPlan.level })}
            >
              <Button>{result.chargeable ? "根据这个问题生成 7 天训练计划" : "先看看这份训练方向"}</Button>
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
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">更多推荐内容</p>
              {moreContents.map((item) => (
                <RecommendationCard key={item.id} item={item} source="video_diagnosis_more" />
              ))}
            </div>
          ) : null}

          {result.recommendedCreators.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">推荐博主</p>
              {result.recommendedCreators.map((creator) => (
                <div key={creator.id} className="rounded-2xl border border-[var(--line)] p-4">
                  <div className="flex items-start gap-3">
                    <CreatorAvatar name={creator.name} avatarUrl={creator.avatar} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-bold text-slate-900">{creator.name}</p>
                        {creator.platforms.slice(0, 1).map((platform) => (
                          <PlatformBadge key={platform} platform={platform} />
                        ))}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{creator.bio}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {creator.styleTags.slice(0, 2).map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                      {creator.profileUrl ? (
                        <div className="mt-3">
                          <a
                            href={creator.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => logEvent("creator_click", { creatorId: creator.id, source: "video_diagnosis" })}
                          >
                            <Button variant="ghost">去看这位博主</Button>
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {result.searchSuggestions.length > 0 ? (
            <Card className="space-y-3">
              <p className="text-sm font-semibold text-brand-700">你还可以这样搜</p>
              <div className="space-y-2">
                {result.searchSuggestions.map((item) => (
                  <div key={`${item.platform}-${item.keyword}`} className="rounded-2xl border border-[var(--line)] px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <PlatformBadge platform={item.platform} />
                      <span className="text-sm font-medium text-slate-900">{item.keyword}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
