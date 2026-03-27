import { Progress } from "@/components/ui/Progress";

type AssessmentProgressProps = {
  current: number;
  total: number;
  hint?: string;
};

export function AssessmentProgress({ current, total, hint }: AssessmentProgressProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="space-y-2">
      <Progress value={percentage} />
      {hint ? <p className="text-sm text-slate-400">{hint}</p> : null}
    </div>
  );
}
