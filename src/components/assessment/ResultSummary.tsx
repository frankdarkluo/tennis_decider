import { AssessmentResult } from "@/types/assessment";
import { Card } from "@/components/ui/Card";

export function ResultSummary({ result }: { result: AssessmentResult }) {
  return (
    <Card className="space-y-2">
      <p className="text-sm font-semibold text-brand-700">参考结果</p>
      <h1 className="text-2xl font-black text-slate-900">你的能力区间接近 {result.level}</h1>
      <p className="text-slate-600">这是基于问卷的参考结果，不代表官方评级。建议结合训练和实战持续校准。</p>
      <p className="text-sm text-slate-500">总分：{result.totalScore} / {result.maxScore}</p>
      <p className="text-sm text-slate-500">结果置信度：{result.confidence}</p>
    </Card>
  );
}
