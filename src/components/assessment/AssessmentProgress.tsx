import { Progress } from "@/components/ui/Progress";

type AssessmentProgressProps = {
  current: number;
  total: number;
};

export function AssessmentProgress({ current, total }: AssessmentProgressProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          第 {current} 题 / 共 {total} 题
        </span>
        <span>{percentage}%</span>
      </div>
      <Progress value={percentage} />
    </div>
  );
}
