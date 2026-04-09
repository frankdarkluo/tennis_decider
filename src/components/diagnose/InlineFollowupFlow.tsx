"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  getScenarioQuestionOptionLabel,
  getScenarioQuestionOptionSecondaryLabel,
  getScenarioQuestionSecondaryText,
  getScenarioQuestionText,
  getScenarioValueLabel,
  type ScenarioUiLanguage
} from "@/lib/scenarioReconstruction/bilingual";
import type { ScenarioQuestion, ScenarioState } from "@/types/scenario";

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-medium text-slate-700">
      {label}: {value}
    </div>
  );
}

export function InlineFollowupFlow({
  scenario,
  question,
  language,
  followupCount,
  followupCap,
  submitting,
  error,
  onAnswer
}: {
  scenario: ScenarioState;
  question: ScenarioQuestion;
  language: ScenarioUiLanguage;
  followupCount: number;
  followupCap: number;
  submitting: boolean;
  error: string | null;
  onAnswer: (answerKey: string) => void;
}) {
  const copy = language === "en"
    ? {
      badge: "Follow-up",
      title: "Add one more key clue before locking the diagnosis",
      detail: "Only continue when the current structured scene still misses a category-critical slot.",
      progress: `Question ${followupCount + 1} of ${followupCap}`,
      summary: "Current scene",
      stroke: "Stroke",
      context: "Context",
      movement: "Movement",
      outcome: "Outcome",
      depth: "Depth"
    }
    : {
      badge: "补关键信息",
      title: "再补一条关键线索后再锁定诊断",
      detail: "只有当前结构化场景还缺关键项时，才继续追问。",
      progress: `第 ${followupCount + 1} / ${followupCap} 题`,
      summary: "当前场景",
      stroke: "击球",
      context: "场景",
      movement: "移动",
      outcome: "结果",
      depth: "来球深度"
    };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
      <Card className="space-y-4 border-brand-200 bg-brand-50/40">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
              {copy.badge}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              {copy.progress}
            </span>
          </div>
          <p className="text-lg font-semibold text-slate-900">{copy.title}</p>
          <p className="text-sm leading-6 text-slate-600">{copy.detail}</p>
        </div>

        {error ? (
          <Card className="border-rose-200 bg-rose-50 text-sm text-rose-700">{error}</Card>
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
              aria-label={getScenarioQuestionOptionLabel(option, language)}
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
      </Card>

      <Card className="space-y-4">
        <p className="text-sm font-semibold text-slate-900">{copy.summary}</p>
        <div className="flex flex-wrap gap-2">
          <SummaryChip label={copy.stroke} value={getScenarioValueLabel(scenario.stroke, language)} />
          <SummaryChip label={copy.context} value={getScenarioValueLabel(scenario.context.session_type, language)} />
          <SummaryChip label={copy.movement} value={getScenarioValueLabel(scenario.context.movement, language)} />
          <SummaryChip label={copy.outcome} value={getScenarioValueLabel(scenario.outcome.primary_error, language)} />
          <SummaryChip label={copy.depth} value={getScenarioValueLabel(scenario.incoming_ball.depth, language)} />
        </div>
      </Card>
    </div>
  );
}
