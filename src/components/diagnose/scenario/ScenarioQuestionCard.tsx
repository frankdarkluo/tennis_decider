import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  getScenarioQuestionOptionLabel,
  getScenarioQuestionOptionSecondaryLabel,
  getScenarioQuestionSecondaryText,
  getScenarioQuestionText,
  getScenarioUiText,
  type ScenarioUiLanguage
} from "@/lib/scenarioReconstruction/bilingual";
import type { DeepModeProgress, ScenarioQuestion } from "@/types/scenario";

export function ScenarioQuestionCard({
  question,
  progress,
  language,
  submitting,
  onAnswer,
  onContinueToAnalysis,
  backToDiagnoseHref
}: {
  question: ScenarioQuestion | null;
  progress: DeepModeProgress;
  language: ScenarioUiLanguage;
  submitting: boolean;
  onAnswer: (answerKey: string) => void;
  onContinueToAnalysis?: () => void;
  backToDiagnoseHref?: string;
}) {
  const isCapped = progress.stoppedByCap;
  const isDeepReady = progress.deepReady;
  const isGathering = !isCapped && !isDeepReady;

  return (
    <Card className="space-y-4">
      <p className="text-sm font-semibold text-slate-900">{getScenarioUiText("question", language)}</p>
      {isDeepReady || isCapped || !question ? (
        <div className="space-y-4">
          {isDeepReady && onContinueToAnalysis ? (
            <div className="space-y-3 rounded-2xl border border-brand-200 bg-brand-50/80 p-4">
              <p className="text-sm font-semibold text-brand-800">{getScenarioUiText("questionDone", language)}</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={onContinueToAnalysis} disabled={submitting}>
                  {getScenarioUiText("continueAnalysis", language)}
                </Button>
                {backToDiagnoseHref ? (
                  <Link href={backToDiagnoseHref}>
                    <Button variant="secondary">{getScenarioUiText("doneBackDiagnosis", language)}</Button>
                  </Link>
                ) : null}
              </div>
              <p className="text-sm leading-6 text-slate-600">{getScenarioUiText("questionDoneDetail", language)}</p>
            </div>
          ) : isCapped ? (
            <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
              <p className="text-sm font-semibold text-amber-800">{getScenarioUiText("questionCapped", language)}</p>
              <p className="text-sm leading-6 text-slate-600">{getScenarioUiText("questionCappedDetail", language)}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm leading-6 text-slate-600">{getScenarioUiText("questionGathering", language)}</p>
              <p className="text-sm leading-6 text-slate-500">{getScenarioUiText("questionGatheringDetail", language)}</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {isGathering ? (
            <div className="rounded-2xl border border-brand-200 bg-brand-50/60 px-4 py-3">
              <p className="text-sm font-semibold text-brand-800">{getScenarioUiText("questionGathering", language)}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{getScenarioUiText("questionGatheringDetail", language)}</p>
            </div>
          ) : null}
          <div className="space-y-2">
            <p className="text-lg font-semibold text-slate-900">{getScenarioQuestionText(question, language)}</p>
            <p className="text-sm text-slate-500">{getScenarioQuestionSecondaryText(question, language)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {question.options.map((option) => (
              <Button
                key={option.key}
                variant="secondary"
                disabled={submitting}
                className="h-auto min-h-11 flex-col items-start px-4 py-3 text-left"
                onClick={() => onAnswer(option.key)}
              >
                <span>{getScenarioQuestionOptionLabel(option, language)}</span>
                <span className="text-xs font-medium text-slate-500">
                  {getScenarioQuestionOptionSecondaryLabel(option, language)}
                </span>
              </Button>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
