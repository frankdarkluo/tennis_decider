"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  diagnoseProblem,
  getDefaultDiagnosisResult,
  getProblemPreviewOptions
} from "@/lib/diagnosis";
import {
  readAssessmentResultFromStorage,
  writeAssessmentResultToStorage
} from "@/lib/assessmentStorage";
import { logEvent } from "@/lib/eventLogger";
import { getLatestAssessmentResult, saveDiagnosisHistory } from "@/lib/userData";
import { AssessmentResult } from "@/types/assessment";
import { DiagnosisResult } from "@/types/diagnosis";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { DiagnoseInput } from "@/components/diagnose/DiagnoseInput";
import { DiagnoseResult as DiagnoseResultPanel } from "@/components/diagnose/DiagnoseResult";
import { useAuth } from "@/components/auth/AuthProvider";

function DiagnosePageContent() {
  const searchParams = useSearchParams();
  const { user, configured, loading } = useAuth();
  const [text, setText] = useState("");
  const [currentLevel, setCurrentLevel] = useState<string | undefined>(undefined);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [result, setResult] = useState<DiagnosisResult>(getDefaultDiagnosisResult());
  const [contextReady, setContextReady] = useState(false);
  const handledQueryRef = useRef<string | null>(null);

  const previewOptions = getProblemPreviewOptions();
  const quickTags = previewOptions.map((item) => item.label);
  const hasDiagnosed = Boolean(result.input.trim());

  const runDiagnosis = async (nextText: string, inputSource: "typed" | "tag_click" = "typed") => {
    const trimmedText = nextText.trim();

    setText(nextText);

    if (!trimmedText) {
      setResult(getDefaultDiagnosisResult(currentLevel));
      return;
    }

    logEvent("diagnosis_submit", { inputText: trimmedText, inputSource });

    const diagnosisResult = diagnoseProblem(trimmedText, {
      level: currentLevel,
      assessmentResult
    });

    if (inputSource === "tag_click") {
      logEvent("diagnosis_tag_click", { tagText: trimmedText });
    }

    setResult(diagnosisResult);

    if (diagnosisResult.matchedRuleId) {
      logEvent("diagnosis_result", {
        matchedRuleId: diagnosisResult.matchedRuleId,
        problemLabel: diagnosisResult.title,
        contentCount: diagnosisResult.recommendedContents.length
      });
    } else {
      logEvent("diagnosis_no_match", {
        inputText: trimmedText,
        fallbackType: diagnosisResult.fallbackMode ?? "generic"
      });
    }

    if (user?.id && configured) {
      const saveResult = await saveDiagnosisHistory(user.id, trimmedText, diagnosisResult);
      if (saveResult.error) {
        console.error("[diagnose] failed to save diagnosis history", saveResult.error);
      }
    }
  };

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setText(q);
    }

    if (loading) {
      return;
    }

    let active = true;

    async function hydrateAssessmentContext() {
      const localResult = readAssessmentResultFromStorage();
      let nextLevel = localResult?.level;
      let nextAssessmentResult = localResult ?? null;

      if (user?.id && configured) {
        const remoteResult = await getLatestAssessmentResult(user.id);

        if (!active) {
          return;
        }

        if (remoteResult.data) {
          nextLevel = remoteResult.data.level;
          nextAssessmentResult = remoteResult.data;
          writeAssessmentResultToStorage(remoteResult.data);
        }
      }

      if (!active) {
        return;
      }

      setCurrentLevel(nextLevel);
      setAssessmentResult(nextAssessmentResult);
      setResult(getDefaultDiagnosisResult(nextLevel));
      setContextReady(true);
    }

    void hydrateAssessmentContext();

    return () => {
      active = false;
    };
  }, [configured, loading, searchParams, user?.id]);

  useEffect(() => {
    if (!contextReady) {
      return;
    }

    const q = searchParams.get("q")?.trim();
    if (!q || handledQueryRef.current === q) {
      return;
    }

    handledQueryRef.current = q;
    void runDiagnosis(q, "typed");
  }, [contextReady, searchParams]);

  const onDiagnose = async () => {
    await runDiagnosis(text);
  };

  const onClear = () => {
    setText("");
    setResult(getDefaultDiagnosisResult(currentLevel));
  };

  return (
    <PageContainer>
      <div className="space-y-5">
        {hasDiagnosed ? (
          <PageBreadcrumbs items={[
            { href: "/diagnose", label: "← 重新诊断" },
            { href: "/", label: "回到首页" }
          ]} />
        ) : null}
        <div>
          <h1 className="text-3xl font-black text-slate-900">说一句你的问题</h1>
          <p className="mt-2 text-slate-600">我来帮你判断先改什么。</p>
        </div>

        <DiagnoseInput
          value={text}
          quickTags={quickTags}
          quickTagsLabel="也可以直接点："
          onChange={setText}
          onDiagnose={onDiagnose}
          onClear={onClear}
          onQuickTagClick={(tag) => void runDiagnosis(tag, "tag_click")}
        />

        {hasDiagnosed ? <DiagnoseResultPanel result={result} /> : null}
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
