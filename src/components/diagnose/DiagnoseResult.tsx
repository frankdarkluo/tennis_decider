"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DiagnosisResult as DiagnosisResultType } from "@/types/diagnosis";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlatformVideoSearch } from "@/components/PlatformVideoSearch";
import {
  getContentCoachNote,
  getContentFocusLine,
  getContentPrimaryTitle,
  getContentSecondaryTitle
} from "@/lib/content/display";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { getThumbnail, getVideoInitial } from "@/lib/thumbnail";

function RecommendationCard({
  item,
  source
}: {
  item: DiagnosisResultType["recommendedContents"][number];
  source: "diagnosis_featured" | "diagnosis_more";
}) {
  const { language, t } = useI18n();
  const thumbnail = getThumbnail(item);
  const primaryTitle = getContentPrimaryTitle(item, language);
  const secondaryTitle = getContentSecondaryTitle(item, language);
  const targetLabel = getContentFocusLine(item, language);
  const coachNote = getContentCoachNote(item, language);

  return (
    <div className="rounded-xl border border-[var(--line)] p-4 text-sm">
      <div className="flex gap-3">
        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={primaryTitle}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-lg font-medium text-slate-300">{getVideoInitial(primaryTitle)}</span>
            </div>
          )}
          {item.duration ? (
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1 py-0.5 text-[11px] font-medium text-white">
              {item.duration}
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{primaryTitle}</p>
          {secondaryTitle ? (
            <p className="mt-1 text-xs leading-5 text-slate-400">{secondaryTitle}</p>
          ) : null}
          {targetLabel && targetLabel !== primaryTitle ? (
            <p className="mt-1 text-sm text-slate-600">{t("content.targetPrefix")} {targetLabel}</p>
          ) : null}
          {coachNote && !coachNote.includes("[待填写") ? (
            <p className="mt-2 text-xs text-slate-500">{t("content.coachNote")} {coachNote}</p>
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
          <Button variant="secondary">{t("content.open")}</Button>
        </a>
      </div>
    </div>
  );
}

export function DiagnoseResult({ result }: { result: DiagnosisResultType }) {
  const { language, t } = useI18n();
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
        <p className="text-sm font-semibold text-brand-700">{t("diagnose.result.badge")}</p>
        <h2 className="text-2xl font-black text-slate-900">{result.title}</h2>
        <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
          <p className="text-sm font-semibold text-slate-700">{t("diagnose.result.today")}</p>
          <p className="mt-2 text-base font-medium text-slate-900">{primaryFix}</p>
        </div>
        {result.fallbackUsed && result.fallbackMode ? (
          <div className="rounded-xl border border-brand-100 bg-brand-50/70 p-3 text-sm text-slate-700">
            <p>
              {result.fallbackMode === "assessment"
                ? (language === "en"
                  ? "This first pass uses the weakest area from the assessment. A more specific description will make the diagnosis more precise."
                  : "这次先按你评估里最需要补的环节给你一组方向，后面你再把问题描述得更具体一点，我们会更准。")
                : (language === "en"
                  ? "This first pass uses a general improvement bundle. After the 1-minute assessment, recommendations will be more precise."
                  : "这次先给你一组通用提升内容。做完 1 分钟评估后，我们能把推荐收得更准。")}
            </p>
            {result.fallbackMode === "no-assessment" ? (
              <div className="mt-3">
                <Link href="/assessment"><Button variant="secondary">{t("video.assessment.cta")}</Button></Link>
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
            {t("diagnose.result.expand1")}
          </button>
        ) : null}
      </div>

      {layer >= 2 ? (
        <div className="space-y-4 border-t border-[var(--line)] pt-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">{t("diagnose.result.why")}</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {result.causes.slice(0, 2).map((cause) => (
                <li key={cause}>{cause}</li>
              ))}
            </ul>
          </div>

          {featuredContent ? (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-900">{t("diagnose.result.featured")}</p>
              <RecommendationCard item={featuredContent} source="diagnosis_featured" />
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={planHref}
              onClick={() => logEvent("cta_click", { ctaLabel: t("cta.generatePlan"), ctaLocation: "diagnosis_result", targetPage: "/plan" })}
            >
              <Button>{t("diagnose.result.plan")}</Button>
            </Link>
          </div>

          {layer === 2 ? (
            <button
              type="button"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
              onClick={() => setLayer(3)}
            >
              {t("diagnose.result.expand2")}
            </button>
          ) : null}
        </div>
      ) : null}

      {layer >= 3 ? (
        <div className="space-y-4 border-t border-[var(--line)] pt-4">
          {moreContents.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">{t("diagnose.result.more")}</p>
              {moreContents.map((item) => (
                <RecommendationCard key={item.id} item={item} source="diagnosis_more" />
              ))}
            </div>
          ) : null}

          {result.searchQueries ? (
            <PlatformVideoSearch
              queries={result.searchQueries}
              title={t("diagnose.result.search")}
            />
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
              onClick={() => {
                logEvent("cta_click", { ctaLabel: t("cta.continueDiagnosis"), ctaLocation: "diagnosis_result", targetPage: "scroll_to_input" });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              {t("diagnose.result.continue")}
            </button>
            <Link
              href="/video-diagnose"
              onClick={() => logEvent("cta_click", { ctaLabel: t("cta.videoUpgrade"), ctaLocation: "diagnosis_result", targetPage: "/video-diagnose" })}
            >
              <Button variant="secondary">{t("diagnose.result.video")}</Button>
            </Link>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
