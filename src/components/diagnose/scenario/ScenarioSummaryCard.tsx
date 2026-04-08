import { Card } from "@/components/ui/Card";
import {
  getScenarioFeelingSummary,
  getScenarioMissingSlotLabel,
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
  language
}: {
  scenario: ScenarioState;
  language: ScenarioUiLanguage;
}) {
  const requiredRemaining = scenario.deep_progress.requiredRemaining;
  const optionalRemaining = scenario.deep_progress.optionalRemaining;
  const skippedRequired = scenario.deep_progress.unresolvedRequiredBecauseOfSkip;
  const unavailableRequired = scenario.deep_progress.unresolvedRequiredBecauseUnavailable;

  function renderChipGroup(label: string, slots: MissingSlotPath[], tone: "amber" | "slate" | "rose") {
    if (slots.length === 0) {
      return null;
    }

    const styles = {
      amber: "border-amber-200 bg-amber-50 text-amber-800",
      slate: "border-slate-200 bg-slate-50 text-slate-700",
      rose: "border-rose-200 bg-rose-50 text-rose-700"
    }[tone];

    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</p>
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => (
            <span key={`${label}-${slot}`} className={`rounded-full border px-3 py-1 text-xs font-medium ${styles}`}>
              {getScenarioMissingSlotLabel(slot, language)}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="space-y-4">
      <p className="text-sm font-semibold text-slate-900">{getScenarioUiText("summary", language)}</p>
      <div className="space-y-2">
        <SummaryRow label={getScenarioUiText("summaryStroke", language)} value={getScenarioValueLabel(scenario.stroke, language)} />
        <SummaryRow label={getScenarioUiText("summarySession", language)} value={getScenarioValueLabel(scenario.context.session_type, language)} />
        <SummaryRow label={getScenarioUiText("summaryMovement", language)} value={getScenarioValueLabel(scenario.context.movement, language)} />
        <SummaryRow label={getScenarioUiText("summaryOutcome", language)} value={getScenarioValueLabel(scenario.outcome.primary_error, language)} />
        {scenario.stroke === "serve" ? (
          <SummaryRow
            label={getScenarioUiText("summaryServeControl", language)}
            value={getScenarioValueLabel(scenario.serve.control_pattern, language)}
          />
        ) : null}
        {scenario.stroke === "serve" ? (
          <SummaryRow
            label={getScenarioUiText("summaryServeMechanism", language)}
            value={getScenarioValueLabel(scenario.serve.mechanism_family, language)}
          />
        ) : null}
        <SummaryRow label={getScenarioUiText("summaryDepth", language)} value={getScenarioValueLabel(scenario.incoming_ball.depth, language)} />
        <SummaryRow label={getScenarioUiText("summaryFeeling", language)} value={getScenarioFeelingSummary(scenario, language)} />
      </div>
      {requiredRemaining.length === 0 &&
      optionalRemaining.length === 0 &&
      skippedRequired.length === 0 &&
      unavailableRequired.length === 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
            {getScenarioUiText("summaryMissing", language)}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              {getScenarioUiText("questionDone", language)}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {renderChipGroup(getScenarioUiText("summaryRequiredMissing", language), requiredRemaining, "amber")}
          {renderChipGroup(getScenarioUiText("summaryOptionalMissing", language), optionalRemaining, "slate")}
          {renderChipGroup(getScenarioUiText("summarySkipped", language), skippedRequired, "slate")}
          {renderChipGroup(getScenarioUiText("summaryUnavailable", language), unavailableRequired, "rose")}
        </div>
      )}
    </Card>
  );
}
