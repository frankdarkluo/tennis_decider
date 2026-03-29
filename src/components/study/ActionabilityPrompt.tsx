"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useStudy } from "@/components/study/StudyProvider";
import { useI18n } from "@/lib/i18n/config";
import { logEvent } from "@/lib/eventLogger";
import { persistStudyTaskRating } from "@/lib/study/taskRatings";
import { StudyTaskId } from "@/types/study";

type ActionabilityPromptProps = {
  taskId: StudyTaskId;
  onSubmitted?: (score: number) => void;
};

export function ActionabilityPrompt({ taskId, onSubmitted }: ActionabilityPromptProps) {
  const pathname = usePathname() ?? "/";
  const { session, language } = useStudy();
  const { t } = useI18n();
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const scoreOptions = useMemo(() => [1, 2, 3, 4, 5, 6, 7] as const, []);

  useEffect(() => {
    logEvent("task.actionability_prompt_viewed", {
      route: pathname,
      taskId,
      language
    }, { page: pathname });
  }, [language, pathname, taskId]);

  const handleSubmit = async () => {
    if (!session || !selectedScore || submitting) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    const result = await persistStudyTaskRating(session, {
      taskId,
      score: selectedScore as 1 | 2 | 3 | 4 | 5 | 6 | 7,
      language
    });

    logEvent("task.actionability_submitted", {
      route: pathname,
      taskId,
      score: selectedScore,
      language
    }, { page: pathname });

    if (result.error) {
      setMessage(result.error);
      setSubmitting(false);
      return;
    }

    onSubmitted?.(selectedScore);
    setMessage(t("study.actionability.saved"));
    setSubmitting(false);
  };

  return (
    <Card className="mx-auto max-w-2xl space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-brand-700">{t("study.actionability.title")}</p>
        <h2 className="text-2xl font-black text-slate-900">{t("study.actionability.prompt")}</h2>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-7 gap-2 text-[11px] font-medium text-slate-500">
          <div className="text-left">{t("study.actionability.scale.min")}</div>
          <div />
          <div />
          <div className="text-center">{t("study.actionability.scale.neutral")}</div>
          <div />
          <div />
          <div className="text-right">{t("study.actionability.scale.max")}</div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {scoreOptions.map((score) => (
            <label
              key={score}
              className={[
                "flex min-h-12 w-full cursor-pointer items-center justify-center rounded-2xl border px-2 py-2 text-base font-semibold transition",
                selectedScore === score
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-[var(--line)] bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700"
              ].join(" ")}
            >
              <input
                type="radio"
                name={`actionability_${taskId}`}
                value={score}
                checked={selectedScore === score}
                onChange={() => setSelectedScore(score)}
                className="sr-only"
                aria-label={String(score)}
              />
              <span>{score}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{message}</p>
        <Button onClick={() => void handleSubmit()} disabled={!session || !selectedScore || submitting}>
          {submitting ? t("study.actionability.submitting") : t("study.actionability.submit")}
        </Button>
      </div>
    </Card>
  );
}
