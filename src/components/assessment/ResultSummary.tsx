import { AssessmentResult } from "@/types/assessment";
import { Card } from "@/components/ui/Card";

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
  if (result.answeredCount === 0) {
    return (
      <Card className="space-y-2">
        <h1 className="text-2xl font-black text-slate-900">先完成一次水平评估</h1>
        <p className="text-slate-600">做完后，我们会直接告诉你大概处在哪个能力区间，以及接下来更值得优先补哪一块。</p>
      </Card>
    );
  }

  const strengths = pickDisplayStrengths(result);
  const weaknesses = pickDisplayWeaknesses(result);
  const strengthText = strengths.length > 0 ? strengths.join("和") : "基础稳定性";
  const weaknessText = weaknesses.length > 0 ? weaknesses.join("、") : "比赛中的下一拍处理";

  return (
    <Card className="space-y-4">
      <h1 className="text-2xl font-black text-slate-900">你的能力区间接近 {result.level}</h1>
      <div className="space-y-3 rounded-2xl bg-[var(--surface-soft)] p-4">
        <p className="text-base font-semibold text-slate-900">
          你的 {strengthText} 比较强
        </p>
        <p className="text-base text-slate-700">
          可以重点提升：{weaknessText}
        </p>
      </div>
    </Card>
  );
}
