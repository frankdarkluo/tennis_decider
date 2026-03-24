"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  diagnoseProblem,
  getDefaultDiagnosisResult,
  getProblemPreviewTags
} from "@/lib/diagnosis";
import { AssessmentResult } from "@/types/assessment";
import { DiagnosisResult } from "@/types/diagnosis";
import { PageContainer } from "@/components/layout/PageContainer";
import { DiagnoseInput } from "@/components/diagnose/DiagnoseInput";
import { DiagnoseResult as DiagnoseResultPanel } from "@/components/diagnose/DiagnoseResult";
import { DrillSuggestions } from "@/components/diagnose/DrillSuggestions";
import { Button } from "@/components/ui/Button";

function DiagnosePageContent() {
  const searchParams = useSearchParams();
  const [text, setText] = useState("");
  const [currentLevel, setCurrentLevel] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<DiagnosisResult>(getDefaultDiagnosisResult());

  const quickTags = getProblemPreviewTags();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setText(q);
    }

    try {
      const raw = localStorage.getItem("assessmentResult");
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as AssessmentResult;
      if (parsed.level) {
        setCurrentLevel(parsed.level);
        setResult(getDefaultDiagnosisResult(parsed.level));
      }
    } catch {
      setCurrentLevel(undefined);
    }
  }, [searchParams]);

  const onDiagnose = () => {
    const diagnosisResult = diagnoseProblem(text, {
      level: currentLevel
    });
    setResult(diagnosisResult);
  };

  const onClear = () => {
    setText("");
    setResult(getDefaultDiagnosisResult(currentLevel));
  };

  return (
    <PageContainer>
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900">直接描述你的问题</h1>
          <p className="mt-2 text-slate-600">用一句话说出你的困惑，我们帮你定位原因</p>
        </div>

        <DiagnoseInput
          value={text}
          quickTags={quickTags}
          onChange={setText}
          onDiagnose={onDiagnose}
          onClear={onClear}
        />

        <DiagnoseResultPanel result={result} />
        <DrillSuggestions drills={result.drills} />

        <div className="flex flex-wrap gap-2">
          <Button onClick={onDiagnose}>开始诊断</Button>
          <Button variant="secondary" onClick={onClear}>清空</Button>
          <Link href={`/plan?problemTag=${encodeURIComponent(result.problemTag)}`}>
            <Button variant="ghost">生成训练计划</Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}

export default function DiagnosePage() {
  return (
    <Suspense fallback={<PageContainer><p className="text-slate-600">正在加载诊断页...</p></PageContainer>}>
      <DiagnosePageContent />
    </Suspense>
  );
}
