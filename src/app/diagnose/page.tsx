"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { diagnoseText } from "@/lib/diagnosis";
import { DiagnosisResult } from "@/types/diagnosis";
import { PageContainer } from "@/components/layout/PageContainer";
import { DiagnoseInput } from "@/components/diagnose/DiagnoseInput";
import { DiagnoseResult as DiagnoseResultPanel } from "@/components/diagnose/DiagnoseResult";
import { DrillSuggestions } from "@/components/diagnose/DrillSuggestions";
import { Button } from "@/components/ui/Button";

export default function DiagnosePage() {
  const searchParams = useSearchParams();
  const [text, setText] = useState("");
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setText(q);
    }
  }, [searchParams]);

  const onDiagnose = () => {
    setResult(diagnoseText(text));
  };

  const onClear = () => {
    setText("");
    setResult(null);
  };

  return (
    <PageContainer>
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900">直接描述你的问题</h1>
          <p className="mt-2 text-slate-600">用一句话说出你的困惑，我们帮你定位原因</p>
        </div>

        <DiagnoseInput value={text} onChange={setText} onDiagnose={onDiagnose} onClear={onClear} />

        <DiagnoseResultPanel result={result} />
        <DrillSuggestions drills={result?.drills ?? ["先完成一次诊断，这里会展示 2-3 条训练建议"]} />

        <div className="flex flex-wrap gap-2">
          <Button onClick={onDiagnose}>开始诊断</Button>
          <Button variant="secondary" onClick={onClear}>清空</Button>
          <Link href={`/plan?problemTag=${encodeURIComponent(result?.problemTag ?? "no-plan")}`}>
            <Button variant="ghost">生成训练计划</Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
