import { AssessmentResult } from "@/types/assessment";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";

export function SkillBreakdown({ result }: { result: AssessmentResult }) {
  if (result.dimensions.length === 0) {
    return (
      <Card className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">分项能力</h2>
        <p className="text-sm text-slate-600">完成题目后可查看分项能力表现。</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">分项能力</h2>
      {result.dimensions.map((dimension) => (
        <div key={dimension.key} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>{dimension.label}</span>
            <span>{dimension.score} / {dimension.maxScore}</span>
          </div>
          <Progress value={(dimension.score / dimension.maxScore) * 100} />
          <p className="text-xs text-slate-500">状态：{dimension.status}</p>
        </div>
      ))}
    </Card>
  );
}
