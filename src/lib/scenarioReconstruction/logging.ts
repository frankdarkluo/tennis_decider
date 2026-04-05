import type { MissingSlotPath, ScenarioState } from "@/types/scenario";

type ScenarioDecisionLogEntry = {
  timestamp: string;
  input: string;
  parsed_scenario: ScenarioState;
  missing_slots: MissingSlotPath[];
  selected_question_id: string | null;
  ui_language: "zh" | "en";
};

declare global {
  var __TENNISLEVEL_SCENARIO_LOGS__: string[] | undefined;
}

function getScenarioLogBuffer() {
  if (!globalThis.__TENNISLEVEL_SCENARIO_LOGS__) {
    globalThis.__TENNISLEVEL_SCENARIO_LOGS__ = [];
  }

  return globalThis.__TENNISLEVEL_SCENARIO_LOGS__;
}

export function buildScenarioDecisionLogEntry(input: {
  scenario: ScenarioState;
  missingSlots: MissingSlotPath[];
  selectedQuestionId: string | null;
  uiLanguage: "zh" | "en";
}): ScenarioDecisionLogEntry {
  return {
    timestamp: new Date().toISOString(),
    input: input.scenario.raw_user_input,
    parsed_scenario: input.scenario,
    missing_slots: input.missingSlots,
    selected_question_id: input.selectedQuestionId,
    ui_language: input.uiLanguage
  };
}

export function recordScenarioDecision(entry: ScenarioDecisionLogEntry) {
  const serialized = JSON.stringify(entry);
  getScenarioLogBuffer().push(serialized);
  return serialized;
}

export function getScenarioDecisionLogs() {
  return [...getScenarioLogBuffer()];
}

export function clearScenarioDecisionLogs() {
  globalThis.__TENNISLEVEL_SCENARIO_LOGS__ = [];
}
