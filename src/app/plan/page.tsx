"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPlanTemplate } from "@/lib/plans";
import { toChineseLevel } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";
import { PlanSummary } from "@/components/plan/PlanSummary";
import { DayPlanCard } from "@/components/plan/DayPlanCard";
import { Button } from "@/components/ui/Button";

export default function PlanPage() {
  const params = useSearchParams();
  const defaultProblemTag = params.get("problemTag") ?? "no-plan";
  const defaultLevel = (params.get("level") as "3.0" | "3.5" | "4.0") ?? "3.0";

  const [problemTag, setProblemTag] = useState(defaultProblemTag);
  const [level, setLevel] = useState<"3.0" | "3.5" | "4.0">(defaultLevel);

  const plan = useMemo(() => getPlanTemplate(problemTag, level), [problemTag, level]);

  const regenerate = () => {
    setLevel((prev) => (prev === "3.0" ? "3.5" : prev === "3.5" ? "4.0" : "3.0"));
  };

  const hasSource = Boolean(params.get("problemTag") || params.get("level"));

  if (!hasSource && problemTag === "no-plan") {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white p-8 text-center">
          <p className="text-slate-700">暂无可用来源数据，请先完成水平评估或问题诊断。</p>
          <div className="mt-4 flex justify-center gap-2">
            <Link href="/assessment"><Button>去水平评估</Button></Link>
            <Link href="/diagnose"><Button variant="secondary">去问题诊断</Button></Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900">你的 7 天提升计划</h1>
          <p className="mt-2 text-slate-600">根据你的问题自动生成练习路径</p>
        </div>

        <PlanSummary level={toChineseLevel(plan.level)} problem={plan.problemTag} target={plan.target} />

        <div className="grid gap-4 md:grid-cols-2">
          {plan.days.map((day) => (
            <DayPlanCard key={day.day} day={day} />
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => alert("已保存到本地计划（示意）")}>保存计划</Button>
          <Button variant="secondary" onClick={regenerate}>重新生成</Button>
          <Link href="/diagnose"><Button variant="ghost">返回诊断</Button></Link>
        </div>
      </div>
    </PageContainer>
  );
}
