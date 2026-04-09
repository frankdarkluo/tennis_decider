import { Card } from "@/components/ui/Card";

export function PlanSummary({
  headline,
  supportingText
}: {
  headline: string;
  supportingText?: string;
  focusLine?: string;
  rationale?: string;
  sourceType?: "diagnosis" | "assessment" | "default";
}) {
  return (
    <Card className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between px-6 py-5">
      <h2 className="text-lg font-bold text-slate-900">{headline}</h2>
      {supportingText ? (
        <p className="text-sm font-medium text-slate-500">{supportingText}</p>
      ) : null}
    </Card>
  );
}
