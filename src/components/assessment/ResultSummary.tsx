import { AssessmentResult } from "@/types/assessment";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/config";
import {
  getAssessmentFallbackStrength,
  getAssessmentFallbackWeakness,
  translateAssessmentLabel
} from "@/lib/assessment";

function uniqLabels(labels: string[]) {
  return Array.from(new Set(labels));
}

function pickDisplayStrengths(result: AssessmentResult) {
  const taggedStrengths = uniqLabels(result.strengths);

  if (taggedStrengths.length > 0) {
    return taggedStrengths.slice(0, 2);
  }

  return uniqLabels(
    [...result.dimensions]
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, "zh-CN"))
      .map((dimension) => dimension.label)
  ).slice(0, 2);
}

function pickDisplayWeaknesses(result: AssessmentResult) {
  const taggedWeaknesses = uniqLabels(result.weaknesses);

  if (taggedWeaknesses.length > 0) {
    return taggedWeaknesses.slice(0, 2);
  }

  return uniqLabels(
    [...result.dimensions]
      .sort((a, b) => a.score - b.score || a.label.localeCompare(b.label, "zh-CN"))
      .map((dimension) => dimension.label)
  ).slice(0, 2);
}

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

  const strengths = pickDisplayStrengths(result);
  const weaknesses = pickDisplayWeaknesses(result);
  const localizedStrengths = strengths.map((label) => translateAssessmentLabel(label, language));
  const localizedWeaknesses = weaknesses.map((label) => translateAssessmentLabel(label, language));
  const listFormatter = new Intl.ListFormat(language === "en" ? "en" : "zh-CN", {
    style: "long",
    type: "conjunction"
  });
  const strengthText = localizedStrengths.length > 0
    ? listFormatter.format(localizedStrengths)
    : getAssessmentFallbackStrength(language);
  const weaknessText = localizedWeaknesses.length > 0
    ? listFormatter.format(localizedWeaknesses)
    : getAssessmentFallbackWeakness(language);

  return (
    <Card className="space-y-4">
      <h1 className="text-2xl font-black text-slate-900">{t("assessment.result.headline")} {result.level}</h1>
      <div className="space-y-3 rounded-2xl bg-[var(--surface-soft)] p-4">
        <p className="text-base font-semibold text-slate-900">
          {t("assessment.result.strength", { value: strengthText })}
        </p>
        <p className="text-base text-slate-700">
          {t("assessment.result.weakness", { value: weaknessText })}
        </p>
      </div>
    </Card>
  );
}
