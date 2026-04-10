import { AssessmentResult } from "@/types/assessment";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/config";
import {
  formatAssessmentLevelRange,
  getAssessmentConfidenceLabel,
  getCoverageAreaLabel,
  getLocalizedAssessmentResult
} from "@/lib/assessment";
import { SkillBreakdown } from "@/components/assessment/SkillBreakdown";

export function ResultSummary({ result }: { result: AssessmentResult }) {
  const { language, t } = useI18n();

  if (result.answeredCount === 0) {
    return (
      <Card className="space-y-2">
        <h1 className="text-2xl font-black text-slate-900">{t("assessment.empty.title")}</h1>
        <p className="text-slate-600">{t("assessment.empty.subtitle")}</p>
      </Card>
    );
  }

  const localizedResult = getLocalizedAssessmentResult(result, language);
  const rangeLabel = formatAssessmentLevelRange(localizedResult.level, localizedResult.ceilingLevel);
  const confidenceLabel = getAssessmentConfidenceLabel(localizedResult.confidence, language);
  const observedAreas = Array.from(new Set(localizedResult.observedAreas ?? []))
    .map((area) => getCoverageAreaLabel(area, language));
  const weaknesses = Array.from(new Set(localizedResult.weaknesses));
  const observationNeeded = Array.from(new Set(localizedResult.observationNeeded));
  const unobservedAreas = Array.from(new Set(localizedResult.unobservedAreas ?? []))
    .map((area) => getCoverageAreaLabel(area, language));

  return (
    <Card className="space-y-5">
      <div className="space-y-3">
        <h1 className="text-2xl font-black text-slate-900">{t("assessment.result.headline")} {rangeLabel}</h1>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
            <p className="text-sm font-semibold text-brand-700">{t("assessment.result.range")}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{rangeLabel}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t("assessment.result.selfReportNote")}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-semibold text-slate-700">{t("assessment.result.confidence")}</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{confidenceLabel}</p>
            <p className="mt-4 text-sm font-semibold text-slate-700">{t("assessment.result.observed")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {observedAreas.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
          <p className="text-sm font-semibold text-brand-700">{t("assessment.result.summary")}</p>
          <p className="mt-2 text-base leading-7 text-slate-800">{localizedResult.summary}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
          <p className="text-sm font-semibold text-rose-700">{t("assessment.result.weaknesses")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {weaknesses.length > 0 ? (
              weaknesses.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-rose-200 bg-white px-3 py-1 text-sm font-medium text-rose-700"
                >
                  {label}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-600">{t("assessment.result.noWeaknesses")}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
          <p className="text-sm font-semibold text-amber-700">{t("assessment.result.observationNeeded")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {observationNeeded.length > 0 ? (
              observationNeeded.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-amber-200 bg-white px-3 py-1 text-sm font-medium text-amber-700"
                >
                  {label}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-600">{t("assessment.result.noObservationNeeded")}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
          <p className="text-sm font-semibold text-sky-700">{t("assessment.result.unobserved")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {unobservedAreas.length > 0 ? (
              unobservedAreas.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-sky-200 bg-white px-3 py-1 text-sm font-medium text-sky-700"
                >
                  {label}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-600">{t("assessment.result.noUnobserved")}</p>
            )}
          </div>
        </div>
      </div>

      <SkillBreakdown result={localizedResult} />
    </Card>
  );
}
