import { AssessmentResult } from "@/types/assessment";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";

const labelMap: Record<string, string> = {
  forehand: "正手",
  backhand: "反手",
  serve: "发球",
  net: "网前",
  movement: "移动",
  matchplay: "比赛意识"
};

export function SkillBreakdown({ result }: { result: AssessmentResult }) {
  const maxDimensionScore = 15;

  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">分项能力</h2>
      {Object.entries(result.dimensionScores).map(([key, score]) => (
        <div key={key} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>{labelMap[key] ?? key}</span>
            <span>{score} 分</span>
          </div>
          <Progress value={(score / maxDimensionScore) * 100} />
        </div>
      ))}
    </Card>
  );
}
