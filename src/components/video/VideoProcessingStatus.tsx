"use client";

import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/config";

type VideoProcessingStep = "extracting" | "analyzing" | "matching";

export function VideoProcessingStatus({ step }: { step: VideoProcessingStep }) {
  const { t } = useI18n();
  const steps: Array<{ key: VideoProcessingStep; title: string; description: string }> = [
    {
      key: "extracting",
      title: t("video.processing.extracting.title"),
      description: t("video.processing.extracting.body")
    },
    {
      key: "analyzing",
      title: t("video.processing.analyzing.title"),
      description: t("video.processing.analyzing.body")
    },
    {
      key: "matching",
      title: t("video.processing.matching.title"),
      description: t("video.processing.matching.body")
    }
  ];
  const currentIndex = steps.findIndex((item) => item.key === step);

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-brand-700">{t("video.processing.badge")}</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">{t("video.processing.title")}</h2>
      </div>

      <div className="space-y-3">
        {steps.map((item, index) => {
          const active = index === currentIndex;
          const completed = index < currentIndex;

          return (
            <div
              key={item.key}
              className={`rounded-2xl border px-4 py-3 ${
                active ? "border-brand-200 bg-brand-50/70" : completed ? "border-emerald-100 bg-emerald-50/60" : "border-[var(--line)] bg-white"
              }`}
            >
              <p className="text-sm font-semibold text-slate-900">
                {completed ? t("video.status.done") : active ? t("video.status.current") : t("video.status.todo")} · {item.title}
              </p>
              <p className="mt-1 text-sm text-slate-600">{item.description}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
