"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AssessmentResult } from "@/types/assessment";
import { ASSESSMENT_STORAGE_KEY } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";
import { ResultSummary } from "@/components/assessment/ResultSummary";
import { SkillBreakdown } from "@/components/assessment/SkillBreakdown";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function AssessmentResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(ASSESSMENT_STORAGE_KEY);
    if (!raw) {
      router.replace("/assessment");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as AssessmentResult;
      setResult(parsed);
    } catch {
      router.replace("/assessment");
    }
  }, [router]);

  if (!result) {
    return (
      <PageContainer>
        <p className="text-slate-600">正在加载评估结果...</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-5">
        <ResultSummary result={result} />
        <SkillBreakdown result={result} />
        <Card className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">主要短板总结</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            {result.weakSummary.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
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
