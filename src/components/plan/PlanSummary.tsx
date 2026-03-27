import { Card } from "@/components/ui/Card";

export function PlanSummary({
  headline,
  supportingText
}: {
  headline: string;
  supportingText?: string;
}) {
  return (
    <Card className="space-y-2">
      <p className="text-sm font-semibold text-brand-700">这 7 天先练这一件事</p>
      <h2 className="text-xl font-bold leading-8 text-slate-900">{headline}</h2>
      {supportingText ? (
        <p className="text-sm leading-6 text-slate-600">{supportingText}</p>
      ) : null}
    </Card>
  );
}
