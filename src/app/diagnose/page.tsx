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
import { useI18n } from "@/lib/i18n/config";
import { persistStudyArtifact } from "@/lib/study/client";
import { sanitizeDiagnosisArtifact } from "@/lib/study/privacy";
import { hasStudyTaskRating } from "@/lib/study/taskRatings";
import { getLatestAssessmentResult, saveDiagnosisHistory } from "@/lib/userData";
import { updateLocalStudyProgress } from "@/lib/study/localData";
import { AssessmentResult } from "@/types/assessment";
import { DiagnosisResult } from "@/types/diagnosis";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { DiagnoseInput } from "@/components/diagnose/DiagnoseInput";
import { DiagnoseResult as DiagnoseResultPanel } from "@/components/diagnose/DiagnoseResult";
import { ActionabilityPrompt } from "@/components/study/ActionabilityPrompt";
import { useAuth } from "@/components/auth/AuthProvider";
import { useStudy } from "@/components/study/StudyProvider";

function toConfidenceBucket(score: number) {
  if (score >= 6) return "high";
  if (score >= 3) return "mid";
  return "low";
}

function DiagnosePageContent() {
  const searchParams = useSearchParams();
  const { user, configured, loading } = useAuth();
  const { session, studyMode, language } = useStudy();
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [currentLevel, setCurrentLevel] = useState<string | undefined>(undefined);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [result, setResult] = useState<DiagnosisResult>(getDefaultDiagnosisResult());
  const [contextReady, setContextReady] = useState(false);
  const [actionabilitySubmitted, setActionabilitySubmitted] = useState(false);
  const handledQueryRef = useRef<string | null>(null);

  const previewOptions = getProblemPreviewOptions();
  const quickTags = previewOptions.map((item) => language === "en" ? item.label_en : item.label);
  const hasDiagnosed = Boolean(result.input.trim());
  const shouldShowActionability =
    studyMode
    && Boolean(session)
    && hasDiagnosed
    && !actionabilitySubmitted
    && !hasStudyTaskRating(session?.sessionId ?? "", "task_1_problem_entry");

  const runDiagnosis = async (nextText: string, inputSource: "typed" | "tag_click" = "typed") => {
    const trimmedText = nextText.trim();

    setText(nextText);

    if (!trimmedText) {
      setResult(getDefaultDiagnosisResult(currentLevel, undefined, undefined, language));
      return;
    }

    logEvent("diagnose.input_method_selected", {
      inputMethod: inputSource === "tag_click" ? "quick_tag" : "typing"
    }, { page: "/diagnose" });
    logEvent("diagnose.submitted", {
      inputMethod: inputSource === "tag_click" ? "quick_tag" : "typing",
      queryLength: trimmedText.length,
      inheritedLevelBand: currentLevel ?? null,
      usedAssessmentContext: Boolean(assessmentResult)
    }, { page: "/diagnose" });

    const diagnosisResult = diagnoseProblem(trimmedText, {
      level: currentLevel,
      assessmentResult,
      locale: language
    });

    setResult(diagnosisResult);

    logEvent("diagnose.rule_matched", {
      matched: Boolean(diagnosisResult.matchedRuleId),
      ruleId: diagnosisResult.matchedRuleId,
      confidenceBucket: toConfidenceBucket(diagnosisResult.matchScore)
    }, { page: "/diagnose" });

    if (diagnosisResult.fallbackUsed) {
      logEvent("diagnose.fallback_used", {
        fallbackType: diagnosisResult.fallbackMode === "assessment" ? "assessment_based" : "general_guidance"
      }, { page: "/diagnose" });
    }

    logEvent("diagnose.result_viewed", {
      problemTag: diagnosisResult.problemTag,
      immediateFixCode: diagnosisResult.fixes[0] ?? null
    }, { page: "/diagnose" });

    if (studyMode && session) {
      await persistStudyArtifact(session, "diagnosis", sanitizeDiagnosisArtifact(trimmedText, diagnosisResult));
      updateLocalStudyProgress({
        lastVisitedPath: `/diagnose?q=${encodeURIComponent(trimmedText)}`,
        lastDiagnosisPath: `/diagnose?q=${encodeURIComponent(trimmedText)}`,
        lastDiagnosisTitle: diagnosisResult.title
      });
    } else if (user?.id && configured) {
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

      if (!studyMode && user?.id && configured) {
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
      setResult(getDefaultDiagnosisResult(nextLevel, undefined, undefined, language));
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

    logEvent("diagnose.started", {
      sourceRoute: null,
      inheritedLevelBand: currentLevel ?? null
    }, { page: "/diagnose" });
  }, [contextReady, currentLevel]);

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
    setResult(getDefaultDiagnosisResult(currentLevel, undefined, undefined, language));
  };

  return (
    <PageContainer>
      <div className="space-y-5">
        {hasDiagnosed ? (
          <PageBreadcrumbs items={[
            { href: "/diagnose", label: language === "en" ? "← Diagnose again" : "← 重新诊断" },
            { href: "/", label: language === "en" ? "Back home" : "回到首页" }
          ]} />
        ) : null}
        <div>
          <h1 className="text-3xl font-black text-slate-900">{t("diagnose.title")}</h1>
          <p className="mt-2 text-slate-600">{t("diagnose.subtitle")}</p>
        </div>

        <DiagnoseInput
          value={text}
          quickTags={quickTags}
          quickTagsLabel={t("diagnose.quickTags")}
          onChange={setText}
          onDiagnose={onDiagnose}
          onClear={onClear}
          onQuickTagClick={(tag) => void runDiagnosis(tag, "tag_click")}
        />

        {hasDiagnosed ? <DiagnoseResultPanel result={result} /> : null}
        {shouldShowActionability ? (
          <ActionabilityPrompt
            taskId="task_1_problem_entry"
            onSubmitted={() => setActionabilitySubmitted(true)}
          />
        ) : null}
      </div>
    </PageContainer>
  );
}

export default function DiagnosePage() {
  return (
    <Suspense fallback={<PageContainer><p className="text-slate-600">Loading...</p></PageContainer>}>
      <DiagnosePageContent />
    </Suspense>
  );
}
