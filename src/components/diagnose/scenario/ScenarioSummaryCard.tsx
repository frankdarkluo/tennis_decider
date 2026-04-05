import { Card } from "@/components/ui/Card";
import {
  getScenarioFeelingSummary,
  getScenarioUiText,
  getScenarioValueLabel,
  type ScenarioUiLanguage
} from "@/lib/scenarioReconstruction/bilingual";
import type { MissingSlotPath, ScenarioState } from "@/types/scenario";

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export function ScenarioSummaryCard({
  scenario,
  missingSlots,
  language
}: {
  scenario: ScenarioState;
  missingSlots: MissingSlotPath[];
  language: ScenarioUiLanguage;
}) {
  return (
    <Card className="space-y-4">
      <p className="text-sm font-semibold text-slate-900">{getScenarioUiText("summary", language)}</p>
      <div className="space-y-2">
        <SummaryRow label={getScenarioUiText("summaryStroke", language)} value={getScenarioValueLabel(scenario.stroke, language)} />
        <SummaryRow label={getScenarioUiText("summarySession", language)} value={getScenarioValueLabel(scenario.context.session_type, language)} />
        <SummaryRow label={getScenarioUiText("summaryMovement", language)} value={getScenarioValueLabel(scenario.context.movement, language)} />
        <SummaryRow label={getScenarioUiText("summaryOutcome", language)} value={getScenarioValueLabel(scenario.outcome.primary_error, language)} />
        <SummaryRow label={getScenarioUiText("summaryDepth", language)} value={getScenarioValueLabel(scenario.incoming_ball.depth, language)} />
        <SummaryRow label={getScenarioUiText("summaryFeeling", language)} value={getScenarioFeelingSummary(scenario, language)} />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
          {getScenarioUiText("summaryMissing", language)}
        </p>
        <div className="flex flex-wrap gap-2">
          {missingSlots.length > 0 ? missingSlots.map((slot) => (
            <span
              key={slot}
              className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800"
            >
              {slot}
            </span>
          )) : (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              {getScenarioUiText("questionDone", language)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
