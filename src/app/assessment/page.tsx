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
import { writeAssessmentResultToStorage } from "@/lib/assessmentStorage";
import { logEvent } from "@/lib/eventLogger";
import { saveAssessmentResult } from "@/lib/userData";
import { AssessmentProfile, AssessmentQuestion } from "@/types/assessment";
import { PageContainer } from "@/components/layout/PageContainer";
import { AssessmentProgress } from "@/components/assessment/AssessmentProgress";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";

const AUTO_ADVANCE_DELAY = 300;
const SLIDER_ADVANCE_DELAY = 500;
const TOTAL_STEPS = 8;

function formatYearsLabel(value: number) {
  if (value === 0.5) {
    return "半年";
  }

  if (value >= 10) {
    return "10年+";
  }

  return `${value}年`;
}

export default function AssessmentPage() {
  const router = useRouter();
  const { user, configured } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [profile, setProfile] = useState<AssessmentProfile>({
    yearsPlaying: 2,
    yearsLabel: "2年"
  });
  const [submitting, setSubmitting] = useState(false);
  const [autoAdvancing, setAutoAdvancing] = useState(false);
  const timerRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const answersRef = useRef<Record<string, number>>({});
  const stepRef = useRef(0);
  const profileRef = useRef<AssessmentProfile>(profile);
  const sliderTouchedRef = useRef(false);

  const profileQuestions = useMemo(
    () => assessmentQuestions.filter((question) => question.phase === "profile"),
    []
  );
  const coarseQuestions = useMemo(() => getCoarseQuestions(assessmentQuestions), []);
  const coarseScore = coarseQuestions.reduce((sum, question) => sum + Number(answers[question.id] ?? 0), 0);
  const branch = determineBranch(coarseScore);
  const fineQuestions = useMemo(() => getFineQuestionsForBranch(branch, assessmentQuestions), [branch]);

  const currentQuestion: AssessmentQuestion | null = useMemo(() => {
    if (stepIndex < 2) {
      return profileQuestions[stepIndex] ?? null;
    }

    if (stepIndex < 5) {
      return coarseQuestions[stepIndex - 2] ?? null;
    }

    return fineQuestions[stepIndex - 5] ?? null;
  }, [coarseQuestions, fineQuestions, profileQuestions, stepIndex]);

  const selectedValue = useMemo(() => {
    if (!currentQuestion) {
      return undefined;
    }

    if (currentQuestion.type === "slider") {
      return profile.yearsPlaying ?? currentQuestion.sliderConfig.default;
    }

    if (currentQuestion.type === "gender") {
      if (profile.gender === "male") {
        return 1;
      }

      if (profile.gender === "female") {
        return 2;
      }

      return undefined;
    }

    return answers[currentQuestion.id];
  }, [answers, currentQuestion, profile.gender, profile.yearsPlaying]);

  useEffect(() => {
    answersRef.current = answers;
    stepRef.current = stepIndex;
    profileRef.current = profile;
  }, [answers, profile, stepIndex]);

  useEffect(() => {
    logEvent("assessment_start", {
      totalSteps: TOTAL_STEPS,
      scoredQuestions: 6,
      mode: "adaptive"
    });

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      if (!completedRef.current && stepRef.current > 0) {
        logEvent("assessment_abandon", {
          lastStepIndex: stepRef.current + 1,
          totalSteps: TOTAL_STEPS,
          answeredCount: Object.keys(answersRef.current).length
        });
      }
    };
  }, []);

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
    setStepIndex(Math.max(0, Math.min(TOTAL_STEPS - 1, nextStep)));
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
    const result = calculateAssessmentResult(finalAnswers, assessmentQuestions, profileRef.current);
    completedRef.current = true;
    writeAssessmentResultToStorage(result);

    if (user?.id && configured) {
      const saveResult = await saveAssessmentResult(user.id, result);
      if (saveResult.error) {
        console.error("[assessment] failed to save result", saveResult.error);
      }
    }

    router.push("/assessment/result");
  };

  const handleChoiceSelect = (value: number) => {
    if (!currentQuestion || submitting) {
      return;
    }

    if (currentQuestion.type === "gender") {
      const gender = value === 1 ? "male" : "female";
      setProfile((prev) => ({ ...prev, gender }));
      logEvent("assessment_answer", {
        questionId: currentQuestion.id,
        selectedOption: value === 1 ? "男" : "女",
        step: "profile"
      });
      scheduleAdvance(() => moveToStep(stepIndex + 1), AUTO_ADVANCE_DELAY);
      return;
    }

    if (currentQuestion.type !== "choice") {
      return;
    }

    const selectedOption = currentQuestion.options.find((option) => option.value === value);
    const nextAnswers = { ...answersRef.current, [currentQuestion.id]: value };

    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
    logEvent("assessment_answer", {
      questionId: currentQuestion.id,
      selectedOption: selectedOption?.label ?? value,
      phase: currentQuestion.phase
    });

    if (stepIndex === TOTAL_STEPS - 1) {
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
      yearsLabel: formatYearsLabel(value)
    }));
  };

  const commitSliderStep = () => {
    if (!currentQuestion || currentQuestion.type !== "slider" || !sliderTouchedRef.current || submitting) {
      return;
    }

    sliderTouchedRef.current = false;
    logEvent("assessment_answer", {
      questionId: currentQuestion.id,
      selectedOption: profileRef.current.yearsLabel ?? formatYearsLabel(profileRef.current.yearsPlaying ?? 2),
      step: "profile"
    });
    scheduleAdvance(() => moveToStep(stepIndex + 1), SLIDER_ADVANCE_DELAY);
  };

  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">1 分钟测一下你的水平</h1>
          <p className="text-slate-600">答几个小问题，先给你一个区间。</p>
        </div>

        <AssessmentProgress
          current={stepIndex + 1}
          total={TOTAL_STEPS}
          hint={stepIndex >= 5 ? "快完成了" : undefined}
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
          <div className="text-sm text-slate-400">点一下就继续</div>
          {stepIndex > 0 ? (
            <Button
              variant="ghost"
              className="px-3"
              disabled={submitting}
              onClick={() => moveToStep(stepIndex - 1)}
            >
              上一步
            </Button>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
