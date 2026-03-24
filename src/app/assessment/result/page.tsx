"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AssessmentResult } from "@/types/assessment";
import { getDefaultAssessmentResult } from "@/lib/assessment";
import { PageContainer } from "@/components/layout/PageContainer";
import { ResultSummary } from "@/components/assessment/ResultSummary";
import { SkillBreakdown } from "@/components/assessment/SkillBreakdown";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function AssessmentResultPage() {
  const [result, setResult] = useState<AssessmentResult>(getDefaultAssessmentResult());

  useEffect(() => {
    const raw = localStorage.getItem("assessmentResult");

    try {
      const parsed = raw ? (JSON.parse(raw) as AssessmentResult) : getDefaultAssessmentResult();
      setResult(parsed);
    } catch {
      setResult(getDefaultAssessmentResult());
    }
  }, []);

  return (
    <PageContainer>
      <div className="space-y-5">
        <ResultSummary result={result} />
        <SkillBreakdown result={result} />
        <Card className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">评估总结</h2>
          <p className="text-sm text-slate-700">{result.summary}</p>
          {result.observationNeeded.length > 0 ? (
            <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-semibold">待观察维度：{result.observationNeeded.join(" / ")}</p>
              <p className="mt-1">建议先看推荐内容并训练 1-2 周，再回来更新判断。</p>
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">相对强项</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {result.strengths.length > 0 ? (
                  result.strengths.map((item) => <li key={item}>{item}</li>)
                ) : (
                  <li>暂无</li>
                )}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">优先补强</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {result.weaknesses.length > 0 ? (
                  result.weaknesses.map((item) => <li key={item}>{item}</li>)
                ) : (
                  <li>暂无</li>
                )}
              </ul>
            </div>
          </div>
        </Card>
        <div className="flex flex-wrap gap-2">
          <Link href="/diagnose"><Button>去做问题诊断</Button></Link>
          <Link href={`/library?level=${result.level}`}><Button variant="secondary">去看推荐内容</Button></Link>
          <Link href="/assessment"><Button variant="ghost">重新测试</Button></Link>
        </div>
      </div>
    </PageContainer>
  );
}
