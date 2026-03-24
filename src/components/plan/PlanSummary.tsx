import { Card } from "@/components/ui/Card";

export function PlanSummary({ level, problem, target }: { level: string; problem: string; target: string }) {
  return (
    <Card className="space-y-2">
      <h2 className="text-xl font-bold text-slate-900">问题摘要</h2>
      <p className="text-sm text-slate-700">当前等级：{level}</p>
      <p className="text-sm text-slate-700">当前核心问题：{problem}</p>
      <p className="text-sm text-slate-700">当前训练目标：{target}</p>
    </Card>
  );
}
