import { applyScenarioAnswer as applyAnswer } from "@/lib/scenarioReconstruction/answer";
import { inferSkillCategory } from "@/lib/scenarioReconstruction/inferSkillCategory";
import { createLocalQwenClient, type LocalQwenClient } from "@/lib/scenarioReconstruction/llm/client";
import { getSkillCategoryPolicy } from "@/lib/scenarioReconstruction/skillPolicy";
import type {
  DeepModeProgress,
  MissingSlotPath,
  ScenarioQuestion,
  ScenarioLanguage,
  ScenarioState,
  SlotResolutionMap
} from "@/types/scenario";

function detectLanguage(text: string): ScenarioLanguage {
  const hasChinese = /[\u4e00-\u9fff]/.test(text);
  const hasEnglish = /[A-Za-z]/.test(text);

  if (hasChinese && hasEnglish) {
    return "mixed";
  }

  if (hasEnglish) {
    return "en";
  }

  return "zh";
}

export function createEmptyScenario(rawUserInput: string): ScenarioState {
  return {
    raw_user_input: rawUserInput,
    language: detectLanguage(rawUserInput),
    stroke: "unknown",
    context: {
      session_type: "unknown",
      serve_variant: "unknown",
      pressure: "unknown",
      movement: "unknown",
      format: "unknown"
    },
    serve: {
      control_pattern: "unknown",
      mechanism_family: "unknown"
    },
    incoming_ball: {
      depth: "unknown",
      height: "unknown",
      pace: "unknown",
      spin: "unknown",
      direction: "unknown"
    },
    outcome: {
      primary_error: "unknown",
      frequency: "unknown"
    },
    subjective_feeling: {
      tight: false,
      rushed: false,
      awkward: false,
      hesitant: false,
      nervous: false,
      late_contact: false,
      no_timing: false,
      other: []
    },
    user_confidence: "unknown",
    slot_resolution: createInitialSlotResolution(),
    deep_progress: createInitialDeepProgress(),
    missing_slots: [],
    next_question_candidates: [],
    selected_next_question_id: null,
    asked_followup_ids: []
  };
}

export function createInitialSlotResolution(): SlotResolutionMap {
  return {
    stroke: "unasked",
    "context.session_type": "unasked",
    "context.serve_variant": "unasked",
    "context.movement": "unasked",
    "outcome.primary_error": "unasked",
    "serve.control_pattern": "unasked",
    "serve.mechanism_family": "unasked",
    "incoming_ball.depth": "unasked",
    "subjective_feeling.rushed": "unasked"
  };
}

export function createInitialDeepProgress(): DeepModeProgress {
  return {
    deepReady: false,
    stoppedByCap: false,
    requiredRemaining: [],
    optionalRemaining: [],
    unresolvedRequiredBecauseOfSkip: [],
    unresolvedRequiredBecauseUnavailable: []
  };
}

function includesAny(text: string, candidates: string[]) {
  return candidates.some((candidate) => text.includes(candidate));
}

function mentionsServeFamily(text: string) {
  return includesAny(text, [
    "发球",
    "一发",
    "二发",
    "第二发",
    "serve",
    "first serve",
    "first-serve",
    "firstserve",
    "second serve",
    "second-serve",
    "secondserve"
  ]);
}

export function getMissingSlots(scenario: ScenarioState): MissingSlotPath[] {
  return [...getDeepRequiredSlots(scenario), ...getDeepOptionalSlots(scenario)];
}

function isSlotKnownFromScenario(scenario: ScenarioState, slot: MissingSlotPath) {
  if (slot === "stroke") {
    return scenario.stroke !== "unknown";
  }

  if (slot === "context.session_type") {
    return scenario.context.session_type !== "unknown";
  }

  if (slot === "context.serve_variant") {
    return scenario.context.serve_variant !== "unknown";
  }

  if (slot === "context.movement") {
    return scenario.context.movement !== "unknown";
  }

  if (slot === "outcome.primary_error") {
    return scenario.outcome.primary_error !== "unknown";
  }

  if (slot === "serve.control_pattern") {
    return scenario.serve.control_pattern !== "unknown";
  }

  if (slot === "serve.mechanism_family") {
    return scenario.serve.mechanism_family !== "unknown";
  }

  if (slot === "incoming_ball.depth") {
    return scenario.incoming_ball.depth !== "unknown";
  }

  if (slot === "subjective_feeling.rushed") {
    return (
      scenario.subjective_feeling.rushed ||
      scenario.subjective_feeling.tight ||
      scenario.subjective_feeling.nervous
    );
  }

  return false;
}

function isSlotResolvedForDeepMode(scenario: ScenarioState, slot: MissingSlotPath) {
  if (isSlotKnownFromScenario(scenario, slot)) {
    return true;
  }

  const state = scenario.slot_resolution[slot];
  return state === "skipped" || state === "cannot_answer";
}

function shouldTreatSlotAsRequired(scenario: ScenarioState, slot: MissingSlotPath) {
  const inferred = inferSkillCategory(scenario);
  const policy = getSkillCategoryPolicy(inferred.category);
  return policy.includeSlotAsRequired?.({ scenario, slot }) ?? true;
}

export function getDeepRequiredSlots(scenario: ScenarioState): MissingSlotPath[] {
  const inferred = inferSkillCategory(scenario);
  const policy = getSkillCategoryPolicy(inferred.category);

  return policy.deepRequiredSlots.filter((slot) => {
    if (!shouldTreatSlotAsRequired(scenario, slot)) {
      return false;
    }

    return !isSlotResolvedForDeepMode(scenario, slot);
  });
}

export function getDeepOptionalSlots(scenario: ScenarioState): MissingSlotPath[] {
  const inferred = inferSkillCategory(scenario);
  const policy = getSkillCategoryPolicy(inferred.category);

  return policy.deepOptionalSlots.filter((slot) => !isSlotResolvedForDeepMode(scenario, slot));
}

function syncSlotResolutionFromScenario(scenario: ScenarioState) {
  const next = { ...scenario.slot_resolution };

  (Object.keys(next) as MissingSlotPath[]).forEach((slot) => {
    if (isSlotKnownFromScenario(scenario, slot)) {
      next[slot] = "answered";
    }
  });

  scenario.slot_resolution = next;
}

export function getDeepModeProgress(scenario: ScenarioState): DeepModeProgress {
  const inferred = inferSkillCategory(scenario);
  const policy = getSkillCategoryPolicy(inferred.category);
  const requiredRemaining = getDeepRequiredSlots(scenario);
  const optionalRemaining = getDeepOptionalSlots(scenario);
  const unresolvedRequiredBecauseOfSkip = policy.deepRequiredSlots.filter(
    (slot) => shouldTreatSlotAsRequired(scenario, slot) && scenario.slot_resolution[slot] === "skipped"
  );
  const unresolvedRequiredBecauseUnavailable = policy.deepRequiredSlots.filter(
    (slot) => shouldTreatSlotAsRequired(scenario, slot) && scenario.slot_resolution[slot] === "cannot_answer"
  );
  const stoppedByCap = scenario.asked_followup_ids.length >= policy.maxDeepFollowups && requiredRemaining.length > 0;

  return {
    deepReady: requiredRemaining.length === 0 && !stoppedByCap,
    stoppedByCap,
    requiredRemaining,
    optionalRemaining,
    unresolvedRequiredBecauseOfSkip,
    unresolvedRequiredBecauseUnavailable
  };
}

export function recalculateScenarioState(scenario: ScenarioState) {
  syncSlotResolutionFromScenario(scenario);
  scenario.missing_slots = getMissingSlots(scenario);
  scenario.deep_progress = getDeepModeProgress(scenario);
  return scenario;
}

export function ensureScenarioInternals(scenario: ScenarioState): ScenarioState {
  const baseScenario = createEmptyScenario(scenario.raw_user_input ?? "");
  const withInternals: ScenarioState = {
    ...baseScenario,
    ...scenario,
    context: {
      ...baseScenario.context,
      ...(scenario.context ?? {})
    },
    serve: {
      ...baseScenario.serve,
      ...(scenario.serve ?? {})
    },
    incoming_ball: {
      ...baseScenario.incoming_ball,
      ...(scenario.incoming_ball ?? {})
    },
    outcome: {
      ...baseScenario.outcome,
      ...(scenario.outcome ?? {})
    },
    subjective_feeling: {
      ...baseScenario.subjective_feeling,
      ...(scenario.subjective_feeling ?? {}),
      other: Array.isArray(scenario.subjective_feeling?.other)
        ? scenario.subjective_feeling.other
        : baseScenario.subjective_feeling.other
    },
    slot_resolution: {
      ...baseScenario.slot_resolution,
      ...(scenario.slot_resolution ?? {})
    },
    deep_progress: scenario.deep_progress ?? createInitialDeepProgress(),
    missing_slots: Array.isArray(scenario.missing_slots) ? scenario.missing_slots : [],
    next_question_candidates: Array.isArray(scenario.next_question_candidates) ? scenario.next_question_candidates : [],
    selected_next_question_id: scenario.selected_next_question_id ?? null,
    asked_followup_ids: Array.isArray(scenario.asked_followup_ids) ? scenario.asked_followup_ids : []
  };

  return recalculateScenarioState(withInternals);
}

export function parseScenarioTextDeterministically(rawUserInput: string): ScenarioState {
  const normalized = rawUserInput.trim().toLowerCase();
  const scenario = createEmptyScenario(rawUserInput.trim());

  if (!normalized) {
    return recalculateScenarioState(scenario);
  }

  if (includesAny(normalized, ["反手", "backhand"])) {
    scenario.stroke = "backhand";
  } else if (includesAny(normalized, ["正手", "forehand"])) {
    scenario.stroke = "forehand";
  } else if (mentionsServeFamily(normalized)) {
    scenario.stroke = "serve";
  } else if (includesAny(normalized, ["接发", "return"])) {
    scenario.stroke = "return";
  } else if (includesAny(normalized, ["截击", "volley", "网前"])) {
    scenario.stroke = "volley";
  } else if (includesAny(normalized, ["高压", "smash", "overhead"])) {
    scenario.stroke = "overhead";
  } else if (includesAny(normalized, ["切削", "slice"])) {
    scenario.stroke = "slice";
  }

  const mentionsPressureContext = includesAny(normalized, [
    "关键分",
    "盘点",
    "局点",
    "破发点",
    "deuce",
    "break point",
    "big points",
    "key points",
    "under pressure"
  ]);
  const mentionsMatch = includesAny(normalized, ["比赛", "match", "matches", "big points"]) || mentionsPressureContext;
  const mentionsPractice = includesAny(normalized, ["练习", "practice"]);

  if (mentionsMatch && mentionsPractice) {
    scenario.context.session_type = "both";
  } else if (mentionsMatch) {
    scenario.context.session_type = "match";
  } else if (mentionsPractice) {
    scenario.context.session_type = "practice";
  }

  if (includesAny(normalized, ["跑动", "移动", "moving"])) {
    scenario.context.movement = "moving";
  } else if (includesAny(normalized, ["原地", "set"])) {
    scenario.context.movement = "stationary";
  }

  if (scenario.stroke === "serve" && scenario.context.movement === "unknown") {
    scenario.context.movement = "stationary";
  }

  if (/(?:二发|第二发|second serve|second-serve|secondserve)/i.test(normalized)) {
    scenario.context.serve_variant = "second_serve";
  } else if (/(?:一发(?!力)|第一发|first serve|first-serve|firstserve)/i.test(normalized)) {
    scenario.context.serve_variant = "first_serve";
  }

  if (includesAny(normalized, ["下网", "into the net", "net"])) {
    scenario.outcome.primary_error = "net";
  } else if (includesAny(normalized, ["出界", "long"])) {
    scenario.outcome.primary_error = "long";
  } else if (includesAny(normalized, ["偏左", "偏右", "wide"])) {
    scenario.outcome.primary_error = "wide";
  } else if (includesAny(normalized, ["没力量", "no power"])) {
    scenario.outcome.primary_error = "no_power";
  } else if (includesAny(normalized, ["不受控", "不太受控", "控制不住", "out of control"])) {
    scenario.outcome.primary_error = "no_control";
  }

  if (scenario.stroke === "serve") {
    if (scenario.outcome.primary_error === "net") {
      scenario.serve.control_pattern = "net";
    } else if (scenario.outcome.primary_error === "long") {
      scenario.serve.control_pattern = "long";
    } else if (scenario.outcome.primary_error === "wide") {
      scenario.serve.control_pattern = "wide";
    } else if (includesAny(normalized, ["没节奏", "节奏乱", "时机乱", "timing breaks down", "no rhythm"])) {
      scenario.serve.control_pattern = "no_rhythm";
    }

    if (includesAny(normalized, ["抛球", "toss"])) {
      scenario.serve.mechanism_family = "toss";
    } else if (includesAny(normalized, ["击球点", "触球", "contact"])) {
      scenario.serve.mechanism_family = "contact";
    } else if (includesAny(normalized, ["节奏", "时机", "timing", "rhythm"])) {
      scenario.serve.mechanism_family = "rhythm";
    } else if (includesAny(normalized, ["偏左", "偏右", "落点", "placement", "direction"])) {
      scenario.serve.mechanism_family = "direction_control";
    }
  }

  if (includesAny(normalized, ["深", "deep"])) {
    scenario.incoming_ball.depth = "deep";
  } else if (includesAny(normalized, ["短", "short"])) {
    scenario.incoming_ball.depth = "short";
  }

  if (includesAny(normalized, ["紧", "tight"])) {
    scenario.subjective_feeling.tight = true;
  }

  if (includesAny(normalized, ["急", "rushed"])) {
    scenario.subjective_feeling.rushed = true;
  }

  if (includesAny(normalized, ["nervous", "紧张"])) {
    scenario.subjective_feeling.nervous = true;
    scenario.context.pressure = "high";
  }

  if (mentionsPressureContext && scenario.context.pressure === "unknown") {
    scenario.context.pressure = "high";
  }

  return recalculateScenarioState(scenario);
}

function mergeScenarioState(baseScenario: ScenarioState, partialScenario: Partial<ScenarioState> | null) {
  if (!partialScenario) {
    return baseScenario;
  }

  const nextScenario: ScenarioState = {
    ...baseScenario,
    stroke: partialScenario.stroke ?? baseScenario.stroke,
    language: partialScenario.language ?? baseScenario.language,
    context: {
      ...baseScenario.context,
      ...(partialScenario.context ?? {})
    },
    serve: {
      ...baseScenario.serve,
      ...(partialScenario.serve ?? {})
    },
    incoming_ball: {
      ...baseScenario.incoming_ball,
      ...(partialScenario.incoming_ball ?? {})
    },
    outcome: {
      ...baseScenario.outcome,
      ...(partialScenario.outcome ?? {})
    },
    subjective_feeling: {
      ...baseScenario.subjective_feeling,
      ...(partialScenario.subjective_feeling ?? {}),
      other: Array.isArray(partialScenario.subjective_feeling?.other)
        ? partialScenario.subjective_feeling.other
        : baseScenario.subjective_feeling.other
    },
    slot_resolution: {
      ...baseScenario.slot_resolution,
      ...(partialScenario.slot_resolution ?? {})
    },
    deep_progress: partialScenario.deep_progress ?? baseScenario.deep_progress,
    asked_followup_ids: Array.isArray(partialScenario.asked_followup_ids)
      ? partialScenario.asked_followup_ids
      : baseScenario.asked_followup_ids
  };

  return recalculateScenarioState(nextScenario);
}

export async function parseScenarioText(
  rawUserInput: string,
  options: { client?: LocalQwenClient } = {}
) {
  const deterministicScenario = parseScenarioTextDeterministically(rawUserInput);
  const client = options.client ?? createLocalQwenClient();

  try {
    const parsedScenario = await client.parseScenario(rawUserInput);
    return mergeScenarioState(deterministicScenario, parsedScenario);
  } catch {
    return deterministicScenario;
  }
}

export function isScenarioMinimallyAnalyzable(scenario: ScenarioState) {
  return getDeepModeProgress(scenario).deepReady;
}

export function applyScenarioAnswer(scenario: ScenarioState, questionId: string, answerKey: string) {
  const nextScenario = applyAnswer(ensureScenarioInternals(scenario), questionId, answerKey);
  return recalculateScenarioState(nextScenario);
}

export function finalizeScenarioProgress(
  scenario: ScenarioState,
  eligibleQuestions: ScenarioQuestion[],
  selectedQuestion: ScenarioQuestion | null
) {
  const normalizedScenario = recalculateScenarioState(scenario);
  const done = normalizedScenario.deep_progress.deepReady;
  const terminalStop = normalizedScenario.deep_progress.stoppedByCap;
  const activeEligibleQuestions = done || terminalStop ? [] : eligibleQuestions;
  const activeSelectedQuestion = done || terminalStop ? null : selectedQuestion;

  return {
    scenario: {
      ...normalizedScenario,
      next_question_candidates: activeEligibleQuestions.map((question) => question.id),
      selected_next_question_id: activeSelectedQuestion?.id ?? null
    },
    missingSlots: normalizedScenario.missing_slots,
    eligibleQuestions: activeEligibleQuestions,
    selectedQuestion: activeSelectedQuestion,
    done
  };
}
