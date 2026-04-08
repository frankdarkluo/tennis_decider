"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScenarioQuestionCard } from "@/components/diagnose/scenario/ScenarioQuestionCard";
import { ScenarioSummaryCard } from "@/components/diagnose/scenario/ScenarioSummaryCard";
import { createEmptyScenario } from "@/lib/scenarioReconstruction/runtime";
import { toDiagnosisInput } from "@/lib/scenarioReconstruction/toDiagnosisInput";
import { type ScenarioUiLanguage } from "@/lib/scenarioReconstruction/bilingual";
import type { MissingSlotPath, ScenarioQuestion, ScenarioState } from "@/types/scenario";

type ScenarioRouteResponse = {
  scenario: ScenarioState;
  missing_slots: MissingSlotPath[];
  eligible_questions: ScenarioQuestion[];
  selected_question: ScenarioQuestion | null;
  done: boolean;
};

async function postScenarioRoute<TBody>(url: string, body: TBody) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message ?? "Scenario route failed");
  }

  return payload as ScenarioRouteResponse;
}

export function DeepScenarioModule({
  sourceText,
  language,
  visible,
  resetSignal,
  onApplyScenario
}: {
  sourceText: string;
  language: ScenarioUiLanguage;
  visible: boolean;
  resetSignal: number;
  onApplyScenario: (input: { scenario: ScenarioState; diagnosisInput: string }) => void;
}) {
  const [scenario, setScenario] = useState<ScenarioState>(() => createEmptyScenario(""));
  const [missingSlots, setMissingSlots] = useState<MissingSlotPath[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<ScenarioQuestion | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const currentInput = sourceText.trim();
  const previousInputRef = useRef(currentInput);
  const diagnosisInput = useMemo(
    () => toDiagnosisInput({ scenario, locale: language }),
    [language, scenario]
  );

  function resetScenarioState() {
    setScenario(createEmptyScenario(""));
    setMissingSlots([]);
    setSelectedQuestion(null);
    setDone(false);
    setSubmitting(false);
    setError(null);
    setStarted(false);
  }

  useEffect(() => {
    resetScenarioState();
  }, [resetSignal]);

  useEffect(() => {
    if (previousInputRef.current === currentInput) {
      return;
    }

    previousInputRef.current = currentInput;

    if (!started) {
      return;
    }

    resetScenarioState();
  }, [currentInput, started]);

  if (!visible) {
    return null;
  }

  async function handleStart() {
    if (!currentInput) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = await postScenarioRoute("/api/scenario-reconstruction/parse", {
        text: currentInput,
        ui_language: language
      });
      setScenario(payload.scenario);
      setMissingSlots(payload.missing_slots);
      setSelectedQuestion(payload.selected_question);
      setDone(payload.done);
      setStarted(true);
    } catch {
      setError(language === "en" ? "Scenario reconstruction failed. Please try again." : "场景还原失败，请稍后再试。");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAnswer(answerKey: string) {
    if (!selectedQuestion) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = await postScenarioRoute("/api/scenario-reconstruction/answer-followup", {
        scenario,
        question_id: selectedQuestion.id,
        answer: answerKey,
        ui_language: language
      });
      setScenario(payload.scenario);
      setMissingSlots(payload.missing_slots);
      setSelectedQuestion(payload.selected_question);
      setDone(payload.done);
    } catch {
      setError(language === "en" ? "Scenario reconstruction failed. Please try again." : "场景还原失败，请稍后再试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="space-y-4 border-brand-200 bg-brand-50/40">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
            {language === "en" ? "Deep mode" : "深入模式"}
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {language === "en" ? "Scenario reconstruction" : "场景还原"}
          </span>
        </div>
        <p className="text-sm leading-6 text-slate-600">
          {language === "en"
            ? "Use the current complaint to reconstruct the scene before final diagnosis."
            : "先用当前问题还原场景，再进入最终诊断。"}
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">{language === "en" ? "Current complaint" : "当前问题"}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {currentInput || (language === "en" ? "Enter a complaint above first." : "请先在上方输入一句问题。")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={handleStart} disabled={!currentInput || submitting}>
            {language === "en" ? "Start reconstruction" : "开始场景还原"}
          </Button>
          <Button
            variant="secondary"
            disabled={submitting}
            onClick={resetScenarioState}
          >
            {language === "en" ? "Reset scene" : "重置场景"}
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="border-rose-200 bg-rose-50 text-sm text-rose-700">{error}</Card>
      ) : null}

      {started ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <ScenarioQuestionCard
            question={selectedQuestion}
            done={done}
            language={language}
            submitting={submitting}
            onAnswer={handleAnswer}
            onContinueToAnalysis={() => onApplyScenario({ scenario, diagnosisInput })}
          />
          <ScenarioSummaryCard scenario={scenario} missingSlots={missingSlots} language={language} />
        </div>
      ) : null}
    </Card>
  );
}
