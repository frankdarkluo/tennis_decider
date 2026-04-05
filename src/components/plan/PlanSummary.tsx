import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/config";

export function PlanSummary({
  headline,
  supportingText,
  focusLine,
  rationale
}: {
  headline: string;
  supportingText?: string;
  focusLine?: string;
  rationale?: string;
}) {
  const { t } = useI18n();

  return (
    <Card className="space-y-2">
      <p className="text-sm font-semibold text-brand-700">{t("plan.summary.badge")}</p>
      <h2 className="text-xl font-bold leading-8 text-slate-900">{headline}</h2>
      {focusLine ? (
        <p className="text-sm font-medium leading-6 text-slate-700">{focusLine}</p>
      ) : null}
      {rationale ? (
        <p className="text-sm leading-6 text-slate-700">{rationale}</p>
      ) : null}
      {supportingText ? (
        <p className="text-sm leading-6 text-slate-600">{supportingText}</p>
      ) : null}
    </Card>
  );
}
