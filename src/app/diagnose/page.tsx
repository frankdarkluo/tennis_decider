"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  diagnoseProblem,
  getContentsByIds,
  getDefaultDiagnosisResult,
  getProblemPreviewOptions
} from "@/lib/diagnosis";
import {
  hasCompletedAssessmentResult,
  hasStoredCompletedAssessmentResult,
  readAssessmentResultFromStorage,
  writeAssessmentResultToStorage
} from "@/lib/assessmentStorage";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { persistStudyArtifact } from "@/lib/study/client";
import { sanitizeDiagnosisArtifact } from "@/lib/study/privacy";
import { getLatestAssessmentResult, saveDiagnosisHistory } from "@/lib/userData";
import {
  readLocalDiagnosisSnapshot,
  updateLocalStudyProgress,
  writeLocalDiagnosisSnapshot
} from "@/lib/study/localData";
import { AssessmentResult } from "@/types/assessment";
import { DiagnosisEffortMode, DiagnosisResult, DiagnosisSnapshot } from "@/types/diagnosis";
import { buildDeepDiagnosisHandoff, buildEnrichedDiagnosisContext } from "@/lib/diagnose/enrichedContext";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { DeepScenarioModule } from "@/components/diagnose/DeepScenarioModule";
import { DiagnoseInput } from "@/components/diagnose/DiagnoseInput";
import { DiagnoseResult as DiagnoseResultPanel } from "@/components/diagnose/DiagnoseResult";
import { useAuth } from "@/components/auth/AuthProvider";
import { useStudy } from "@/components/study/StudyProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { ScenarioState } from "@/types/scenario";

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
    level: result.level,
    enrichedContext: result.enrichedContext ?? null,
    categoryConsistency: result.categoryConsistency,
    categoryConflict: result.categoryConflict ?? null
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
    level: snapshot.level ?? fallbackLevel,
    enrichedContext: snapshot.enrichedContext ?? null,
    categoryConsistency: snapshot.categoryConsistency,
    categoryConflict: snapshot.categoryConflict ?? null
  };
}

function DiagnosePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, configured, loading } = useAuth();
  const { environment, session, studyMode, language, loading: studyLoading, pendingStudySetup } = useStudy();
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [storedAssessmentExists, setStoredAssessmentExists] = useState<boolean | null>(null);
  const [effortMode, setEffortMode] = useState<DiagnosisEffortMode>("standard");
  const [currentLevel, setCurrentLevel] = useState<string | undefined>(undefined);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [result, setResult] = useState<DiagnosisResult>(getDefaultDiagnosisResult());
  const [hasCommitted, setHasCommitted] = useState(false);
  const [latestSnapshot, setLatestSnapshot] = useState<DiagnosisSnapshot | null>(null);
  const [contextReady, setContextReady] = useState(false);
  const [deepResetSignal, setDeepResetSignal] = useState(0);
  const deepModuleRef = useRef<HTMLDivElement | null>(null);
  const handledQueryRef = useRef<string | null>(null);
  const previousEffortModeRef = useRef<DiagnosisEffortMode>("standard");
  const languageRef = useRef(language);
  languageRef.current = language;
  const blockedByPendingStudySetup = pendingStudySetup && !session;
  const requestedMode = searchParams.get("mode");
  useEffect(() => {
    setStoredAssessmentExists(hasStoredCompletedAssessmentResult());
  }, []);

  const blockedByAssessmentGate = !studyMode && storedAssessmentExists === false;

  const previewOptions = getProblemPreviewOptions();
  const quickTags = previewOptions.map((item) => language === "en" ? item.label_en : item.label);

  function resetDeepFlow(clearCurrentResult = false) {
    setDeepResetSignal((value) => value + 1);

    if (!clearCurrentResult) {
      return;
    }

    setResult(getDefaultDiagnosisResult(currentLevel, undefined, undefined, language));
  }

  useEffect(() => {
    if (!blockedByPendingStudySetup) {
      return;
    }

    router.replace("/study/start");
  }, [blockedByPendingStudySetup, router]);

  useEffect(() => {
    if (!blockedByAssessmentGate) {
      return;
    }

    router.replace("/assessment");
  }, [blockedByAssessmentGate, router]);

  const runDiagnosis = async (
    nextText: string,
    inputSource: "typed" | "tag_click" = "typed",
    options?: {
      scenario?: ScenarioState | null;
      sourceInput?: string;
      preserveEditorText?: string;
    }
  ) => {
    const trimmedText = nextText.trim();

    setText(options?.preserveEditorText ?? nextText);

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

    const deepHandoff = options?.scenario
      ? buildDeepDiagnosisHandoff({
        mode: effortMode === "deep" ? "deep" : "standard",
        sourceInput: options.sourceInput?.trim() || trimmedText,
        scenario: options.scenario,
        level: currentLevel
      })
      : null;

    const diagnosisResult = diagnoseProblem(trimmedText, {
      level: currentLevel,
      assessmentResult,
      maxRecommendations: 5,
      effortMode,
      locale: language,
      environment,
      deepHandoff
    });

    const enrichedContext = deepHandoff
      ? buildEnrichedDiagnosisContext({
        handoff: deepHandoff,
        problemTag: diagnosisResult.problemTag
      })
      : null;
    const finalResult: DiagnosisResult = {
      ...diagnosisResult,
      enrichedContext
    };

    setResult(finalResult);
    setHasCommitted(true);
    const snapshot = createDiagnosisSnapshot(finalResult, language);
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
      await persistStudyArtifact(session, "diagnosis", sanitizeDiagnosisArtifact(trimmedText, finalResult));
      updateLocalStudyProgress({
        lastVisitedPath: `/diagnose?q=${encodeURIComponent(trimmedText)}`,
        lastDiagnosisPath: `/diagnose?q=${encodeURIComponent(trimmedText)}`,
        lastDiagnosisTitle: finalResult.title
      });
    } else if (user?.id && configured) {
      const saveResult = await saveDiagnosisHistory(user.id, trimmedText, finalResult);
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

    if (blockedByPendingStudySetup || blockedByAssessmentGate || loading) {
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
      setResult(getDefaultDiagnosisResult(nextLevel, undefined, undefined, languageRef.current));
      setLatestSnapshot(readLocalDiagnosisSnapshot());
      setContextReady(true);
    }

    void hydrateAssessmentContext();

    return () => {
      active = false;
    };
  }, [blockedByAssessmentGate, blockedByPendingStudySetup, configured, loading, searchParams, studyMode, user?.id]);

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
    if (requestedMode === "deep" && effortMode !== "deep") {
      setEffortMode("deep");
    }
  }, [effortMode, requestedMode]);

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
    setHasCommitted(false);
    setResult(getDefaultDiagnosisResult(currentLevel, undefined, undefined, language));
    resetDeepFlow(true);
  };

  function resumeDeepMode() {
    setEffortMode("deep");
    requestAnimationFrame(() => {
      deepModuleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  useEffect(() => {
    const previousEffortMode = previousEffortModeRef.current;

    if (previousEffortMode === "deep" && effortMode !== "deep") {
      resetDeepFlow(Boolean(result.enrichedContext));
    }

    previousEffortModeRef.current = effortMode;
  }, [currentLevel, effortMode, language, result.enrichedContext]);

  if (blockedByPendingStudySetup || blockedByAssessmentGate || studyLoading || storedAssessmentExists === null || !contextReady) {
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
        {hasCommitted ? (
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
          onChange={(val) => {
            setText(val);
            setHasCommitted(false);
          }}
          onEffortModeChange={(mode) => {
            setEffortMode(mode);
            setHasCommitted(false);
          }}
          onDiagnose={onDiagnose}
          onClear={onClear}
          onQuickTagClick={(tag) => {
            setText(tag);
            setHasCommitted(false);
          }}
        />

        <div ref={deepModuleRef}>
          <DeepScenarioModule
            sourceText={text}
            language={language === "en" ? "en" : "zh"}
            visible={effortMode === "deep"}
            resetSignal={deepResetSignal}
            onApplyScenario={({ scenario, diagnosisInput }) => {
              const sourceInput = scenario.raw_user_input.trim() || text.trim();
              void runDiagnosis(diagnosisInput, "typed", {
                scenario,
                sourceInput,
                preserveEditorText: sourceInput
              });
            }}
          />
        </div>

        {!hasCommitted && latestSnapshot ? (
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
                  setText(latestSnapshot.inputSummary);
                  setResult(replayDiagnosisFromSnapshot(latestSnapshot, currentLevel));
                  setHasCommitted(true);
                }}
              >
                {language === "en" ? "Replay this diagnosis" : "重演本次判断"}
              </Button>
            </div>
          </Card>
        ) : null}

        {hasCommitted ? <DiagnoseResultPanel result={result} onResumeDeepMode={resumeDeepMode} /> : null}
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
