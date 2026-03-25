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
import { DrillSuggestions } from "@/components/diagnose/DrillSuggestions";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/auth/AuthProvider";

function DiagnosePageContent() {
  const searchParams = useSearchParams();
  const { user, configured, loading } = useAuth();
  const [text, setText] = useState("");
  const [followUpText, setFollowUpText] = useState("");
  const [currentLevel, setCurrentLevel] = useState<string | undefined>(undefined);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [result, setResult] = useState<DiagnosisResult>(getDefaultDiagnosisResult());
  const [diagnosedProblemTags, setDiagnosedProblemTags] = useState<string[]>([]);
  const [contextReady, setContextReady] = useState(false);
  const handledQueryRef = useRef<string | null>(null);

  const previewOptions = getProblemPreviewOptions();
  const quickTags = previewOptions.map((item) => item.label);
  const continueQuickTags = previewOptions
    .filter((item) => !diagnosedProblemTags.includes(item.problemTag))
    .map((item) => item.label);
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
    setFollowUpText("");

    if (diagnosisResult.problemTag !== "general-improvement") {
      setDiagnosedProblemTags((prev) =>
        prev.includes(diagnosisResult.problemTag) ? prev : [...prev, diagnosisResult.problemTag]
      );
    }

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
    setFollowUpText("");
    setDiagnosedProblemTags([]);
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
          <h1 className="text-3xl font-black text-slate-900">直接描述你的问题</h1>
          <p className="mt-2 text-slate-600">用一句话说出你的困惑，我们帮你定位原因</p>
        </div>

        <DiagnoseInput
          value={text}
          quickTags={quickTags}
          quickTagsLabel="猜你想问，也可以直接点一个常见问题："
          onChange={setText}
          onDiagnose={onDiagnose}
          onClear={onClear}
          onQuickTagClick={(tag) => void runDiagnosis(tag, "tag_click")}
        />

        <DiagnoseResultPanel result={result} />
        <DrillSuggestions drills={result.drills} />

        {hasDiagnosed ? (
          <Card className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-brand-700">还有其他问题？</p>
              <h2 className="text-xl font-bold text-slate-900">继续问下一个问题</h2>
              <p className="text-sm text-slate-600">不用回到首页，直接在这里继续诊断就行。</p>
            </div>

            <DiagnoseInput
              value={followUpText}
              quickTags={continueQuickTags.slice(0, 6)}
              quickTagsLabel="也可以继续点一个常见问题："
              variant="compact"
              onChange={setFollowUpText}
              onDiagnose={() => void runDiagnosis(followUpText)}
              onClear={() => setFollowUpText("")}
              onQuickTagClick={(tag) => void runDiagnosis(tag, "tag_click")}
            />
          </Card>
        ) : null}
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
