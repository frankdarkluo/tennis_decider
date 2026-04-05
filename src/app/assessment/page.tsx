"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { assessmentQuestions } from "@/data/assessmentQuestions";
import {
  calculateAssessmentResult,
  determineBranch,
  getCoarseQuestions,
  getFineQuestionsForBranch
} from "@/lib/assessment";
import {
  hasCompletedAssessmentResult,
  clearAssessmentDraftFromStorage,
  readAssessmentDraftFromStorage,
  readAssessmentResultFromStorage,
  writeAssessmentDraftToStorage,
  writeAssessmentResultToStorage
} from "@/lib/assessmentStorage";
import { getPostAssessmentHref, resolveAppEnvironment } from "@/lib/environment";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { formatAssessmentYearsLabel, getAssessmentOptionLabel } from "@/lib/i18n/assessmentCopy";
import { sanitizeAssessmentArtifact } from "@/lib/study/privacy";
import { persistStudyArtifact } from "@/lib/study/client";
import { updateLocalStudyProgress } from "@/lib/study/localData";
import { saveAssessmentResult } from "@/lib/userData";
import { AssessmentProfile, AssessmentQuestion } from "@/types/assessment";
import { PageContainer } from "@/components/layout/PageContainer";
import { AssessmentProgress } from "@/components/assessment/AssessmentProgress";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useStudy } from "@/components/study/StudyProvider";

const AUTO_ADVANCE_DELAY = 300;
const SLIDER_ADVANCE_DELAY = 500;

function hasProfileProgress(profile: AssessmentProfile, profileQuestions: AssessmentQuestion[]) {
  return profileQuestions.some((question) => {
    if (question.type === "slider") {
      return (profile.yearsPlaying ?? question.sliderConfig.default) !== question.sliderConfig.default;
    }

    if (question.type === "gender") {
      return Boolean(profile.gender);
    }

    return false;
  });
}

function normalizeDraftStepIndex(
  rawStepIndex: number | undefined,
  draftProfile: AssessmentProfile | undefined,
  profileQuestions: AssessmentQuestion[]
) {
  const activeQuestionIds = new Set(profileQuestions.map((question) => question.id));
  let retiredStepCount = 0;

  if (draftProfile?.gender && !activeQuestionIds.has("gender")) {
    retiredStepCount += 1;
  }

  if (
    (draftProfile?.yearsLabel || typeof draftProfile?.yearsPlaying === "number")
    && !activeQuestionIds.has("years")
  ) {
    retiredStepCount += 1;
  }

  return Math.max(0, (rawStepIndex ?? 0) - retiredStepCount);
}

function getSourceRoute() {
  if (typeof document === "undefined" || !document.referrer) {
    return null;
  }

  try {
    return new URL(document.referrer).pathname;
  } catch {
    return null;
  }
}

export default function AssessmentPage() {
  const router = useRouter();
  const { user, configured } = useAuth();
  const { environment, session, studyMode, pendingStudySetup } = useStudy();
  const { language, t } = useI18n();
  const appEnvironment = environment ?? resolveAppEnvironment({
    studyMode,
    hasSession: Boolean(session)
  });
  const postAssessmentHref = getPostAssessmentHref(appEnvironment);
  const [entryState, setEntryState] = useState<"checking" | "questionnaire">("checking");
  const [searchReady, setSearchReady] = useState(false);
  const [retakeRequested, setRetakeRequested] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [profile, setProfile] = useState<AssessmentProfile>({
    yearsPlaying: 2,
    yearsLabel: formatAssessmentYearsLabel(2, language)
  });
  const [submitting, setSubmitting] = useState(false);
  const [autoAdvancing, setAutoAdvancing] = useState(false);
  const timerRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);
  const branchLoggedRef = useRef<string | null>(null);
  const answersRef = useRef<Record<string, number>>({});
  const stepRef = useRef(0);
  const profileRef = useRef<AssessmentProfile>(profile);
  const sliderTouchedRef = useRef(false);
  const draftArtifactStepRef = useRef<number | null>(null);
  const blockedByPendingStudySetup = pendingStudySetup && !session;

  const profileQuestions = useMemo(
    () => assessmentQuestions.filter((question) => question.phase === "profile" && question.type !== "gender"),
    []
  );
  const coarseQuestions = useMemo(() => getCoarseQuestions(assessmentQuestions), []);
  const coarseScore = coarseQuestions.reduce((sum, question) => sum + Number(answers[question.id] ?? 0), 0);
  const branch = determineBranch(coarseScore);
  const fineQuestions = useMemo(() => getFineQuestionsForBranch(branch, assessmentQuestions), [branch]);
  const fineStartStep = profileQuestions.length + coarseQuestions.length;
  const totalSteps = profileQuestions.length + coarseQuestions.length + fineQuestions.length;

  const currentQuestion: AssessmentQuestion | null = useMemo(() => {
    const profileCount = profileQuestions.length;
    const coarseEnd = profileCount + coarseQuestions.length;

    if (stepIndex < profileCount) {
      return profileQuestions[stepIndex] ?? null;
    }

    if (stepIndex < coarseEnd) {
      return coarseQuestions[stepIndex - profileCount] ?? null;
    }

    return fineQuestions[stepIndex - coarseEnd] ?? null;
  }, [coarseQuestions, fineQuestions, profileQuestions, stepIndex]);

  const selectedValue = useMemo(() => {
    if (!currentQuestion) {
      return undefined;
    }

    if (currentQuestion.type === "slider") {
      return profile.yearsPlaying ?? currentQuestion.sliderConfig.default;
    }

    return answers[currentQuestion.id];
  }, [answers, currentQuestion, profile.yearsPlaying]);

  useEffect(() => {
    answersRef.current = answers;
    stepRef.current = stepIndex;
    profileRef.current = profile;
  }, [answers, profile, stepIndex]);

  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      yearsLabel: formatAssessmentYearsLabel(prev.yearsPlaying ?? 2, language)
    }));
  }, [language]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setRetakeRequested(new URLSearchParams(window.location.search).get("retake") === "1");
    setSearchReady(true);
  }, []);

  useEffect(() => {
    if (!blockedByPendingStudySetup) {
      return;
    }

    router.replace("/study/start");
  }, [blockedByPendingStudySetup, router]);

  useEffect(() => {
    if (blockedByPendingStudySetup || !searchReady) {
      return;
    }

    const storedDraft = readAssessmentDraftFromStorage();
    const storedResult = readAssessmentResultFromStorage();

    if (retakeRequested) {
      if (storedDraft) {
        setAnswers(storedDraft.answers ?? {});
        setProfile((prev) => ({
          ...prev,
          ...storedDraft.profile,
          yearsLabel: formatAssessmentYearsLabel(storedDraft.profile?.yearsPlaying ?? prev.yearsPlaying ?? 2, language)
        }));
        setStepIndex(Math.max(0, Math.min(
          totalSteps - 1,
          normalizeDraftStepIndex(storedDraft.stepIndex, storedDraft.profile, profileQuestions)
        )));
        setDraftRestored(true);
      }
      setEntryState("questionnaire");
      return;
    }

    if (hasCompletedAssessmentResult(storedResult)) {
      router.replace("/assessment/result");
      return;
    }

    if (storedDraft) {
      setAnswers(storedDraft.answers ?? {});
      setProfile((prev) => ({
        ...prev,
        ...storedDraft.profile,
        yearsLabel: formatAssessmentYearsLabel(storedDraft.profile?.yearsPlaying ?? prev.yearsPlaying ?? 2, language)
      }));
      setStepIndex(Math.max(0, Math.min(
        totalSteps - 1,
        normalizeDraftStepIndex(storedDraft.stepIndex, storedDraft.profile, profileQuestions)
      )));
      setDraftRestored(true);
      setEntryState("questionnaire");
      return;
    }

    setEntryState("questionnaire");
  }, [blockedByPendingStudySetup, language, profileQuestions, retakeRequested, router, searchReady, totalSteps]);

  useEffect(() => {
    if (blockedByPendingStudySetup || entryState !== "questionnaire") {
      return;
    }

    const hasProgress =
      stepIndex > 0 ||
      Object.keys(answers).length > 0 ||
      hasProfileProgress(profile, profileQuestions);

    if (!hasProgress) {
      return;
    }

    writeAssessmentDraftToStorage({
      stepIndex,
      answers,
      profile,
      updatedAt: new Date().toISOString()
    });

    if (studyMode) {
      updateLocalStudyProgress({
        lastVisitedPath: "/assessment",
        lastAssessmentPath: "/assessment",
        assessmentDraftInProgress: true,
        assessmentDraftStepIndex: stepIndex,
        assessmentDraftUpdatedAt: new Date().toISOString()
      });
    }
  }, [answers, blockedByPendingStudySetup, entryState, profile, profileQuestions, stepIndex]);

  useEffect(() => {
    if (blockedByPendingStudySetup || !studyMode || !session || entryState !== "questionnaire") {
      return;
    }

    const hasProgress =
      stepIndex > 0 ||
      Object.keys(answers).length > 0 ||
      hasProfileProgress(profile, profileQuestions);

    if (!hasProgress || draftArtifactStepRef.current === stepIndex) {
      return;
    }

    draftArtifactStepRef.current = stepIndex;
    void persistStudyArtifact(session, "study_resume", {
      resumeType: "assessment_draft",
      stepIndex,
      answeredCount: Object.keys(answers).length,
      questionId: currentQuestion?.id ?? null
    });
  }, [answers, blockedByPendingStudySetup, currentQuestion?.id, entryState, profile, profileQuestions, session, stepIndex, studyMode]);

  useEffect(() => {
    if (blockedByPendingStudySetup || entryState !== "questionnaire") {
      return;
    }

    startedAtRef.current = Date.now();
    logEvent("assessment.started", {
      sourceRoute: getSourceRoute()
    }, { page: "/assessment" });

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      if (!completedRef.current && stepRef.current > 0) {
        logEvent("assessment.exited", {
          stepReached: stepRef.current + 1,
          completed: false
        }, { page: "/assessment" });
      }
    };
  }, [blockedByPendingStudySetup, entryState]);

  useEffect(() => {
    if (stepIndex < fineStartStep || branchLoggedRef.current === branch) {
      return;
    }

    branchLoggedRef.current = branch;
    logEvent("assessment.branch_resolved", {
      branch: branch === "A" ? "beginner" : branch === "B" ? "intermediate" : "advanced"
    }, { page: "/assessment" });
  }, [branch, fineStartStep, stepIndex]);

  const clearAdvanceTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const moveToStep = (nextStep: number) => {
    clearAdvanceTimer();
    setAutoAdvancing(false);
    sliderTouchedRef.current = false;
    setStepIndex(Math.max(0, Math.min(totalSteps - 1, nextStep)));
  };

  const scheduleAdvance = (callback: () => void, delay: number) => {
    clearAdvanceTimer();
    setAutoAdvancing(true);
    timerRef.current = window.setTimeout(() => {
      setAutoAdvancing(false);
      callback();
    }, delay);
  };

  const onSubmit = async (finalAnswers: Record<string, number>) => {
    if (submitting) {
      return;
    }

    clearAdvanceTimer();
    setSubmitting(true);
    const result = calculateAssessmentResult(finalAnswers, assessmentQuestions, profileRef.current, language);
    completedRef.current = true;
    clearAssessmentDraftFromStorage();
    if (studyMode) {
      updateLocalStudyProgress({
        lastVisitedPath: postAssessmentHref,
        lastAssessmentPath: postAssessmentHref,
        lastAssessmentLevel: result.level,
        lastAssessmentCompletedAt: new Date().toISOString(),
        assessmentDraftInProgress: false,
        assessmentDraftStepIndex: undefined,
        assessmentDraftUpdatedAt: undefined
      });
    }
    writeAssessmentResultToStorage(result);

    if (studyMode && session) {
      await persistStudyArtifact(session, "assessment", sanitizeAssessmentArtifact(result));
    } else if (user?.id && configured) {
      const saveResult = await saveAssessmentResult(user.id, result);
      if (saveResult.error) {
        console.error("[assessment] failed to save result", saveResult.error);
      }
    }

    const rankedDimensions = [...result.dimensions].sort((left, right) => right.average - left.average);
    const weakestDimensions = [...result.dimensions].sort((left, right) => left.average - right.average);
    logEvent("assessment.completed", {
      durationMs: startedAtRef.current ? Date.now() - startedAtRef.current : null,
      approximateLevelBand: result.level,
      strongestAreaCodes: rankedDimensions.slice(0, 2).map((dimension) => dimension.key),
      weakestAreaCodes: weakestDimensions.slice(0, 2).map((dimension) => dimension.key)
    }, { page: "/assessment" });

    router.push(postAssessmentHref);
  };

  const handleChoiceSelect = (value: number) => {
    if (!currentQuestion || submitting) {
      return;
    }

    if (currentQuestion.type !== "choice") {
      return;
    }

    const selectedOption = currentQuestion.options.find((option) => option.value === value);
    const nextAnswers = { ...answersRef.current, [currentQuestion.id]: value };

    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
    logEvent("assessment.step_answered", {
      stepIndex,
      stepType: currentQuestion.phase,
      questionId: currentQuestion.id,
      answerCode: getAssessmentOptionLabel(currentQuestion.id, value, selectedOption?.label ?? String(value), language),
      autoAdvanced: true
    }, { page: "/assessment" });

    if (stepIndex === totalSteps - 1) {
      scheduleAdvance(() => {
        void onSubmit(nextAnswers);
      }, AUTO_ADVANCE_DELAY);
      return;
    }

    scheduleAdvance(() => moveToStep(stepIndex + 1), AUTO_ADVANCE_DELAY);
  };

  const handleSliderChange = (value: number) => {
    clearAdvanceTimer();
    sliderTouchedRef.current = true;
    setProfile((prev) => ({
      ...prev,
      yearsPlaying: value,
      yearsLabel: formatAssessmentYearsLabel(value, language)
    }));
  };

  const commitSliderStep = () => {
    if (!currentQuestion || currentQuestion.type !== "slider" || !sliderTouchedRef.current || submitting) {
      return;
    }

    sliderTouchedRef.current = false;
    logEvent("assessment.step_answered", {
      stepIndex,
      stepType: "profile",
      questionId: currentQuestion.id,
      answerCode: profileRef.current.yearsLabel ?? formatAssessmentYearsLabel(profileRef.current.yearsPlaying ?? 2, language),
      autoAdvanced: true
    }, { page: "/assessment" });
    scheduleAdvance(() => moveToStep(stepIndex + 1), SLIDER_ADVANCE_DELAY);
  };

  if (entryState !== "questionnaire") {
    return (
      <PageContainer>
        <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--line)] bg-white p-6 text-sm text-slate-600">
          {t("assessment.loading")}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">{t("assessment.title")}</h1>
          <p className="text-slate-600">{t("assessment.subtitle")}</p>
          {draftRestored ? (
            <p className="text-sm text-brand-700">{t("assessment.resumeDraft")}</p>
          ) : null}
        </div>

        <AssessmentProgress
          current={stepIndex + 1}
          total={totalSteps}
          hint={stepIndex >= totalSteps - 3 ? t("assessment.progress.almostDone") : undefined}
        />

        {currentQuestion ? (
          <QuestionCard
            question={currentQuestion}
            selectedValue={selectedValue}
            disabled={autoAdvancing || submitting}
            onSelect={handleChoiceSelect}
            onSliderChange={handleSliderChange}
            onSliderCommit={commitSliderStep}
            onSliderBeginInteract={() => {
              sliderTouchedRef.current = true;
              clearAdvanceTimer();
            }}
          />
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-400">{t("assessment.tapToContinue")}</div>
          {stepIndex > 0 ? (
            <Button
              variant="ghost"
              className="px-3"
              disabled={submitting}
              onClick={() => moveToStep(stepIndex - 1)}
            >
              {t("assessment.previous")}
            </Button>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
