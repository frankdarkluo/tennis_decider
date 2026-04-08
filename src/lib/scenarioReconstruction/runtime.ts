import { applyScenarioAnswer as applyAnswer } from "@/lib/scenarioReconstruction/answer";
import { inferSkillCategory } from "@/lib/scenarioReconstruction/inferSkillCategory";
import { createLocalQwenClient, type LocalQwenClient } from "@/lib/scenarioReconstruction/llm/client";
import { getSkillCategoryPolicy } from "@/lib/scenarioReconstruction/skillPolicy";
import type {
  MissingSlotPath,
  ScenarioQuestion,
  ScenarioLanguage,
  ScenarioState
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
    missing_slots: [],
    next_question_candidates: [],
    selected_next_question_id: null,
    asked_followup_ids: []
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
  const inferred = inferSkillCategory(scenario);
  const policy = getSkillCategoryPolicy(inferred.category);
  const isMissing = (slot: MissingSlotPath) => {
    if (slot === "stroke") {
      return scenario.stroke === "unknown";
    }

    if (slot === "context.session_type") {
      return scenario.context.session_type === "unknown";
    }

    if (slot === "context.serve_variant") {
      return scenario.context.serve_variant === "unknown";
    }

    if (slot === "context.movement") {
      return scenario.context.movement === "unknown";
    }

    if (slot === "outcome.primary_error") {
      return scenario.outcome.primary_error === "unknown";
    }

    if (slot === "incoming_ball.depth") {
      return scenario.incoming_ball.depth === "unknown";
    }

    if (slot === "subjective_feeling.rushed") {
      return !scenario.subjective_feeling.rushed && !scenario.subjective_feeling.tight;
    }

    return false;
  };

  const requiredMissing = policy.requiredSlots.filter(isMissing);

  if (requiredMissing.length > 0) {
    return requiredMissing;
  }

  return policy.optionalSlots.filter(isMissing);
}

export function parseScenarioTextDeterministically(rawUserInput: string): ScenarioState {
  const normalized = rawUserInput.trim().toLowerCase();
  const scenario = createEmptyScenario(rawUserInput.trim());

  if (!normalized) {
    scenario.missing_slots = getMissingSlots(scenario);
    return scenario;
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
  } else if (includesAny(normalized, ["没力量", "no power"])) {
    scenario.outcome.primary_error = "no_power";
  } else if (includesAny(normalized, ["不受控", "out of control"])) {
    scenario.outcome.primary_error = "no_control";
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

  scenario.missing_slots = getMissingSlots(scenario);
  return scenario;
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
    asked_followup_ids: Array.isArray(partialScenario.asked_followup_ids)
      ? partialScenario.asked_followup_ids
      : baseScenario.asked_followup_ids
  };

  nextScenario.missing_slots = getMissingSlots(nextScenario);
  return nextScenario;
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
  const inferred = inferSkillCategory(scenario);
  const policy = getSkillCategoryPolicy(inferred.category);
  const missing = getMissingSlots(scenario);

  return policy.isDone({
    scenario,
    missingSlots: missing
  });
}

export function applyScenarioAnswer(scenario: ScenarioState, questionId: string, answerKey: string) {
  const nextScenario = applyAnswer(scenario, questionId, answerKey);
  nextScenario.missing_slots = getMissingSlots(nextScenario);
  return nextScenario;
}

export function finalizeScenarioProgress(
  scenario: ScenarioState,
  eligibleQuestions: ScenarioQuestion[],
  selectedQuestion: ScenarioQuestion | null
) {
  // done=true means the current follow-up interaction is complete under the
  // active policy. Optional or non-blocking missing slots may still remain,
  // but they should no longer be exposed as active follow-up candidates.
  const done = isScenarioMinimallyAnalyzable(scenario);
  const activeEligibleQuestions = done ? [] : eligibleQuestions;
  const activeSelectedQuestion = done ? null : selectedQuestion;

  return {
    scenario: {
      ...scenario,
      next_question_candidates: activeEligibleQuestions.map((question) => question.id),
      selected_next_question_id: activeSelectedQuestion?.id ?? null
    },
    missingSlots: scenario.missing_slots,
    eligibleQuestions: activeEligibleQuestions,
    selectedQuestion: activeSelectedQuestion,
    done
  };
}
