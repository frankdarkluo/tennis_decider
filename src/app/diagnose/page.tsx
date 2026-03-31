"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  diagnoseProblem,
  getContentsByIds,
  getDefaultDiagnosisResult,
  getProblemPreviewOptions
} from "@/lib/diagnosis";
import {
  hasCompletedAssessmentResult,
  readAssessmentResultFromStorage,
  writeAssessmentResultToStorage
} from "@/lib/assessmentStorage";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { persistStudyArtifact } from "@/lib/study/client";
import { sanitizeDiagnosisArtifact } from "@/lib/study/privacy";
import { hasStudyTaskRating } from "@/lib/study/taskRatings";
import { getLatestAssessmentResult, saveDiagnosisHistory } from "@/lib/userData";
import {
  readLocalDiagnosisSnapshot,
  updateLocalStudyProgress,
  writeLocalDiagnosisSnapshot
} from "@/lib/study/localData";
import { AssessmentResult } from "@/types/assessment";
import { DiagnosisEffortMode, DiagnosisResult, DiagnosisSnapshot } from "@/types/diagnosis";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { DiagnoseInput } from "@/components/diagnose/DiagnoseInput";
import { DiagnoseResult as DiagnoseResultPanel } from "@/components/diagnose/DiagnoseResult";
import { ActionabilityPrompt } from "@/components/study/ActionabilityPrompt";
import { useAuth } from "@/components/auth/AuthProvider";
import { useStudy } from "@/components/study/StudyProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function toConfidenceBucket(score: number) {
  if (score >= 6) return "high";
  if (score >= 3) return "mid";
  return "low";
}

function createDiagnosisSnapshot(result: DiagnosisResult, locale: "zh" | "en"): DiagnosisSnapshot {
  return {
    inputSummary: locale === "en"
      ? `Diagnosis snapshot: ${result.title}`
      : `诊断快照：${result.title}`,
    capturedAt: new Date().toISOString(),
    matchedRuleId: result.matchedRuleId,
    matchScore: result.matchScore,
    confidence: result.confidence,
    effortMode: result.effortMode,
    evidenceLevel: result.evidenceLevel,
    needsNarrowing: result.needsNarrowing,
    narrowingPrompts: [...result.narrowingPrompts],
    narrowingSuggestions: [...result.narrowingSuggestions],
    refusalReasonCodes: [...(result.refusalReasonCodes ?? [])],
    missingEvidenceSlots: [...(result.missingEvidenceSlots ?? [])],
    primaryNextStep: result.primaryNextStep,
    problemTag: result.problemTag,
    category: [...result.category],
    title: result.title,
    summary: result.summary,
    detailedSummary: result.detailedSummary ?? null,
    causes: [...result.causes],
    fixes: [...result.fixes],
    drills: [...result.drills],
    recommendedContentIds: result.recommendedContents.map((item) => item.id),
    fallbackUsed: result.fallbackUsed,
    fallbackMode: result.fallbackMode,
    level: result.level
  };
}

function replayDiagnosisFromSnapshot(
  snapshot: DiagnosisSnapshot,
  fallbackLevel?: string
): DiagnosisResult {
  return {
    input: snapshot.inputSummary,
    normalizedInput: snapshot.inputSummary.toLowerCase(),
    matchedRuleId: snapshot.matchedRuleId,
    matchedKeywords: [],
    matchedSynonyms: [],
    matchScore: snapshot.matchScore,
    confidence: snapshot.confidence,
    effortMode: snapshot.effortMode,
    evidenceLevel: snapshot.evidenceLevel,
    needsNarrowing: snapshot.needsNarrowing,
    narrowingPrompts: [...snapshot.narrowingPrompts],
    narrowingSuggestions: [...snapshot.narrowingSuggestions],
    refusalReasonCodes: [...(snapshot.refusalReasonCodes ?? [])],
    missingEvidenceSlots: [...(snapshot.missingEvidenceSlots ?? [])],
    primaryNextStep: snapshot.primaryNextStep,
    problemTag: snapshot.problemTag,
    category: [...snapshot.category],
    title: snapshot.title,
    summary: snapshot.summary,
    detailedSummary: snapshot.detailedSummary ?? null,
    causes: [...snapshot.causes],
    fixes: [...snapshot.fixes],
    drills: [...snapshot.drills],
    recommendedContents: getContentsByIds(snapshot.recommendedContentIds, undefined, 3, snapshot.level ?? fallbackLevel),
    searchQueries: null,
    fallbackUsed: snapshot.fallbackUsed,
    fallbackMode: snapshot.fallbackMode,
    level: snapshot.level ?? fallbackLevel
  };
}

function DiagnosePageContent() {
  const searchParams = useSearchParams();
  const { user, configured, loading } = useAuth();
  const { session, studyMode, language, loading: studyLoading } = useStudy();
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [effortMode, setEffortMode] = useState<DiagnosisEffortMode>("standard");
  const [currentLevel, setCurrentLevel] = useState<string | undefined>(undefined);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [result, setResult] = useState<DiagnosisResult>(getDefaultDiagnosisResult());
  const [latestSnapshot, setLatestSnapshot] = useState<DiagnosisSnapshot | null>(null);
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
      usedAssessmentContext: Boolean(assessmentResult),
      effortMode
    }, { page: "/diagnose" });

    const diagnosisResult = diagnoseProblem(trimmedText, {
      level: currentLevel,
      assessmentResult,
      effortMode,
      locale: language
    });

    setResult(diagnosisResult);
    const snapshot = createDiagnosisSnapshot(diagnosisResult, language);
    writeLocalDiagnosisSnapshot(snapshot);
    setLatestSnapshot(snapshot);

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
      setLatestSnapshot(readLocalDiagnosisSnapshot());
      setContextReady(true);
    }

    void hydrateAssessmentContext();

    return () => {
      active = false;
    };
  }, [configured, language, loading, searchParams, studyMode, user?.id]);

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

  if (studyLoading || !contextReady) {
    return (
      <PageContainer>
        <Card className="text-sm text-slate-600">{t("assessment.loading")}</Card>
      </PageContainer>
    );
  }

  if (studyMode && !session) {
    return (
      <PageContainer>
        <Card className="mx-auto max-w-2xl space-y-4">
          <h1 className="text-2xl font-black text-slate-900">{t("study.start.title")}</h1>
          <p className="text-sm leading-6 text-slate-600">{t("study.start.subtitle")}</p>
          <Link href="/study/start">
            <Button>{t("study.start.button")}</Button>
          </Link>
        </Card>
      </PageContainer>
    );
  }

  if (!hasCompletedAssessmentResult(assessmentResult)) {
    return (
      <PageContainer>
        <Card className="mx-auto max-w-2xl space-y-4">
          <h1 className="text-2xl font-black text-slate-900">{t("assessment.empty.title")}</h1>
          <p className="text-sm leading-6 text-slate-600">{t("assessment.empty.subtitle")}</p>
          <Link href="/assessment">
            <Button>{t("assessment.result.ctaStart")}</Button>
          </Link>
        </Card>
      </PageContainer>
    );
  }

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
          effortMode={effortMode}
          onChange={setText}
          onEffortModeChange={setEffortMode}
          onDiagnose={onDiagnose}
          onClear={onClear}
          onQuickTagClick={(tag) => void runDiagnosis(tag, "tag_click")}
        />

        {!hasDiagnosed && latestSnapshot ? (
          <Card className="space-y-3 border-slate-200 bg-slate-50/60">
            <p className="text-sm font-semibold text-slate-900">
              {language === "en" ? "Latest diagnosis snapshot" : "最近一次诊断快照"}
            </p>
            <p className="text-sm text-slate-600">{latestSnapshot.title}</p>
            <p className="text-sm font-medium text-slate-900">{latestSnapshot.primaryNextStep}</p>
            <div>
              <Button
                variant="secondary"
                onClick={() => {
                  setEffortMode(latestSnapshot.effortMode);
                  setResult(replayDiagnosisFromSnapshot(latestSnapshot, currentLevel));
                }}
              >
                {language === "en" ? "Replay this diagnosis" : "重演本次判断"}
              </Button>
            </div>
          </Card>
        ) : null}

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
