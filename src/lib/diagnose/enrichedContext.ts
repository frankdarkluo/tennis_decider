import { toDiagnosisInput } from "@/lib/scenarioReconstruction/toDiagnosisInput";
import { inferSkillCategory } from "@/lib/scenarioReconstruction/inferSkillCategory";
import type {
  DeepDiagnosisHandoff,
  EnrichedDiagnosisContext,
  EnrichedDiagnosisMode,
  EnrichedIncomingBallDepth,
  EnrichedOutcome,
  EnrichedPressureContext,
  EnrichedServeSubtype,
  EnrichedStrokeFamily,
  EnrichedSubjectiveFeeling
} from "@/types/enrichedDiagnosis";
import type { PlanContext } from "@/types/plan";
import type { ScenarioState } from "@/types/scenario";

function normalizeMode(value: string | null | undefined): EnrichedDiagnosisMode {
  return value === "deep" ? "deep" : "standard";
}

function normalizeStrokeFamily(value: string | null | undefined): EnrichedStrokeFamily | undefined {
  if (
    value === "forehand" ||
    value === "backhand" ||
    value === "serve" ||
    value === "return" ||
    value === "volley" ||
    value === "overhead" ||
    value === "slice"
  ) {
    return value;
  }

  if (value === "return" || value === "unknown" || value === "general") {
    return "general";
  }

  return undefined;
}

function inferServeSubtype(rawText: string): EnrichedServeSubtype | undefined {
  if (/(?:二发|第二发|second serve|second-serve|secondserve)/i.test(rawText)) {
    return "second_serve";
  }

  if (/(?:一发(?!力)|第一发|first serve|first-serve|firstserve)/i.test(rawText)) {
    return "first_serve";
  }

  return undefined;
}

function normalizePressureContext(value: string | null | undefined): EnrichedPressureContext | undefined {
  if (value === "none" || value === "general_match_pressure" || value === "key_points") {
    return value;
  }

  return undefined;
}

function normalizeMovement(value: string | null | undefined): "stationary" | "moving" | undefined {
  if (value === "stationary" || value === "moving") {
    return value;
  }

  return undefined;
}

function normalizeOutcome(value: string | null | undefined): EnrichedOutcome | undefined {
  if (value === "net" || value === "long" || value === "short" || value === "float" || value === "miss_in" || value === "double_fault") {
    return value;
  }

  return undefined;
}

function normalizeIncomingBallDepth(value: string | null | undefined): EnrichedIncomingBallDepth | undefined {
  if (value === "shallow" || value === "medium" || value === "deep" || value === "unknown") {
    return value;
  }

  return undefined;
}

function normalizeSubjectiveFeeling(value: string | null | undefined): EnrichedSubjectiveFeeling | undefined {
  if (value === "tight" || value === "rushed" || value === "late" || value === "hesitant" || value === "low_confidence" || value === "awkward" || value === "unknown") {
    return value;
  }

  return undefined;
}

function inferSubjectiveFeeling(scenario: ScenarioState): EnrichedSubjectiveFeeling | undefined {
  if (scenario.subjective_feeling.tight) return "tight";
  if (scenario.subjective_feeling.rushed) return "rushed";
  if (scenario.subjective_feeling.late_contact) return "late";
  if (scenario.subjective_feeling.hesitant) return "hesitant";
  if (scenario.subjective_feeling.awkward) return "awkward";
  if (scenario.subjective_feeling.nervous) return "low_confidence";
  return undefined;
}

function inferPressureContext(scenario: ScenarioState): EnrichedPressureContext | undefined {
  if (scenario.context.pressure === "high") {
    return "key_points";
  }

  if (scenario.context.pressure === "some" || scenario.context.session_type === "match") {
    return "general_match_pressure";
  }

  if (scenario.context.pressure === "none") {
    return "none";
  }

  return undefined;
}

function inferOutcome(scenario: ScenarioState, serveSubtype?: EnrichedServeSubtype): EnrichedOutcome | undefined {
  if (scenario.stroke === "serve" && serveSubtype === "second_serve" && scenario.outcome.primary_error === "no_control") {
    return "double_fault";
  }

  if (scenario.stroke === "serve" && serveSubtype === "first_serve" && scenario.outcome.primary_error === "net") {
    return "miss_in";
  }

  if (scenario.outcome.primary_error === "net") return "net";
  if (scenario.outcome.primary_error === "long") return "long";
  if (scenario.outcome.primary_error === "weak") return "float";
  if (scenario.outcome.primary_error === "no_control") return "double_fault";
  return undefined;
}

function inferIncomingBallDepth(scenario: ScenarioState): EnrichedIncomingBallDepth | undefined {
  if (scenario.incoming_ball.depth === "short") return "shallow";
  if (scenario.incoming_ball.depth === "mid") return "medium";
  if (scenario.incoming_ball.depth === "deep") return "deep";
  if (scenario.incoming_ball.depth === "unknown") return "unknown";
  return undefined;
}

function computeDeepModeReady(context: Omit<DeepDiagnosisHandoff, "isDeepModeReady">): boolean {
  return context.mode === "deep" && !context.stoppedByCap && context.unresolvedRequiredSlots.length === 0;
}

export function normalizeDeepDiagnosisHandoff(
  context: Partial<DeepDiagnosisHandoff> | null | undefined
): DeepDiagnosisHandoff | null {
  if (!context) {
    return null;
  }

  const sourceInput = context.sourceInput?.trim();
  const sceneSummaryZh = context.sceneSummaryZh?.trim();
  const sceneSummaryEn = context.sceneSummaryEn?.trim();
  if (!sourceInput || !sceneSummaryZh || !sceneSummaryEn || !context.skillCategory) {
    return null;
  }

  const normalized: Omit<DeepDiagnosisHandoff, "isDeepModeReady"> = {
    mode: normalizeMode(context.mode),
    sourceInput,
    sceneSummaryZh,
    sceneSummaryEn,
    ...(context.level?.trim() ? { level: context.level.trim() } : {}),
    skillCategory: context.skillCategory,
    skillCategoryConfidence: context.skillCategoryConfidence ?? "low",
    ...(normalizeStrokeFamily(context.strokeFamily) ? { strokeFamily: normalizeStrokeFamily(context.strokeFamily) } : {}),
    ...(inferServeSubtype(sourceInput) ?? context.serveSubtype ? { serveSubtype: inferServeSubtype(sourceInput) ?? context.serveSubtype } : {}),
    ...(context.sessionType === "practice" || context.sessionType === "match" ? { sessionType: context.sessionType } : {}),
    ...(normalizePressureContext(context.pressureContext) ? { pressureContext: normalizePressureContext(context.pressureContext) } : {}),
    ...(normalizeMovement(context.movement) ? { movement: normalizeMovement(context.movement) } : {}),
    ...(normalizeOutcome(context.outcome) ? { outcome: normalizeOutcome(context.outcome) } : {}),
    ...(normalizeIncomingBallDepth(context.incomingBallDepth) ? { incomingBallDepth: normalizeIncomingBallDepth(context.incomingBallDepth) } : {}),
    ...(normalizeSubjectiveFeeling(context.subjectiveFeeling) ? { subjectiveFeeling: normalizeSubjectiveFeeling(context.subjectiveFeeling) } : {}),
    unresolvedRequiredSlots: Array.isArray(context.unresolvedRequiredSlots) ? context.unresolvedRequiredSlots : [],
    stoppedByCap: Boolean(context.stoppedByCap)
  };

  return {
    ...normalized,
    isDeepModeReady: typeof context.isDeepModeReady === "boolean"
      ? context.isDeepModeReady && computeDeepModeReady(normalized)
      : computeDeepModeReady(normalized)
  };
}

export function normalizeEnrichedDiagnosisContext(
  context: Partial<EnrichedDiagnosisContext> | null | undefined
): EnrichedDiagnosisContext | null {
  if (!context?.problemTag?.trim()) {
    return null;
  }

  const handoff = normalizeDeepDiagnosisHandoff(context);
  if (!handoff) {
    return null;
  }

  return {
    ...handoff,
    problemTag: context.problemTag.trim()
  };
}

export function parseEnrichedDiagnosisContext(raw: string | null | undefined): EnrichedDiagnosisContext | null {
  if (!raw) {
    return null;
  }

  try {
    return normalizeEnrichedDiagnosisContext(JSON.parse(raw) as Partial<EnrichedDiagnosisContext>);
  } catch {
    return null;
  }
}

export function encodeEnrichedDiagnosisContext(context?: EnrichedDiagnosisContext | null): string | null {
  const normalized = normalizeEnrichedDiagnosisContext(context);
  return normalized ? JSON.stringify(normalized) : null;
}

export function buildDeepDiagnosisHandoff(input: {
  mode: EnrichedDiagnosisMode;
  sourceInput: string;
  scenario: ScenarioState;
  level?: string;
}): DeepDiagnosisHandoff {
  const inferred = inferSkillCategory(input.scenario);
  const serveSubtype = inferServeSubtype(input.sourceInput);
  const handoff = normalizeDeepDiagnosisHandoff({
    mode: input.mode,
    sourceInput: input.sourceInput,
    sceneSummaryZh: toDiagnosisInput({ scenario: input.scenario, locale: "zh" }),
    sceneSummaryEn: toDiagnosisInput({ scenario: input.scenario, locale: "en" }),
    level: input.level,
    skillCategory: inferred.category,
    skillCategoryConfidence: inferred.confidence,
    strokeFamily: normalizeStrokeFamily(input.scenario.stroke),
    serveSubtype,
    sessionType: input.scenario.context.session_type === "match" || input.scenario.context.session_type === "practice"
      ? input.scenario.context.session_type
      : undefined,
    pressureContext: inferPressureContext(input.scenario),
    movement: normalizeMovement(input.scenario.context.movement),
    outcome: inferOutcome(input.scenario, serveSubtype),
    incomingBallDepth: inferIncomingBallDepth(input.scenario) ?? "unknown",
    subjectiveFeeling: inferSubjectiveFeeling(input.scenario),
    unresolvedRequiredSlots: [...input.scenario.deep_progress.requiredRemaining],
    stoppedByCap: input.scenario.deep_progress.stoppedByCap,
    isDeepModeReady: input.scenario.deep_progress.deepReady
  });

  if (!handoff) {
    throw new Error("Failed to build deep diagnosis handoff");
  }

  return handoff;
}

export function buildEnrichedDiagnosisContext(input: {
  handoff: DeepDiagnosisHandoff;
  problemTag: string;
}): EnrichedDiagnosisContext {
  const context = normalizeEnrichedDiagnosisContext({
    ...input.handoff,
    problemTag: input.problemTag
  });

  if (!context) {
    throw new Error("Failed to build enriched diagnosis context");
  }

  return context;
}

export function buildEnrichedSpecificityReasons(
  context: EnrichedDiagnosisContext,
  locale: "zh" | "en"
): string[] {
  const reasons: string[] = [];

  if (context.serveSubtype === "second_serve" && context.pressureContext === "key_points" && context.movement === "stationary") {
    reasons.push(locale === "en"
      ? "Scene reconstruction confirms this is a stationary second-serve problem on key points."
      : "这是关键分下的原地二发问题。");
  } else if (context.serveSubtype === "second_serve") {
    reasons.push(locale === "en" ? "Scene reconstruction confirms this is a second-serve problem, not a generic serve issue." : "这是二发问题，不是泛化的发球问题。");
  } else if (context.strokeFamily === "serve") {
    reasons.push(locale === "en" ? "Scene reconstruction confirms this is a serve-family problem rather than a general complaint." : "这是发球这一类问题，而不是整体状态波动。");
  }

  if (context.pressureContext === "key_points" && !(context.serveSubtype === "second_serve" && context.movement === "stationary")) {
    reasons.push(locale === "en" ? "Scene reconstruction keeps the key-point pressure context." : "这是关键分下的问题。");
  }

  if ((context.movement === "stationary" || context.movement === "moving") && !(context.serveSubtype === "second_serve" && context.pressureContext === "key_points")) {
    reasons.push(locale === "en"
      ? `Scene reconstruction localizes it to a ${context.movement === "stationary" ? "stationary" : "moving"} execution pattern.`
      : `这是${context.movement === "stationary" ? "原地" : "跑动中"}的执行问题。`);
  }

  if (context.outcome === "net" || context.outcome === "long" || context.outcome === "double_fault") {
    reasons.push(locale === "en"
      ? `Scene reconstruction preserves the explicit miss pattern: ${context.outcome === "net" ? "into the net" : context.outcome === "long" ? "long" : "double fault"}.`
      : `场景还原保留了明确失误结果：${context.outcome === "net" ? "下网" : context.outcome === "long" ? "出界" : "双误"}。`);
  }

  if (context.subjectiveFeeling && context.subjectiveFeeling !== "unknown") {
    reasons.push(locale === "en" ? "Scene reconstruction keeps the player's subjective feel instead of dropping it." : "场景还原保留了你的主观感觉，而不是把它丢掉。");
  }

  return reasons.slice(0, 3);
}

export function buildEnrichedSceneRecap(
  context: EnrichedDiagnosisContext,
  locale: "zh" | "en"
): string {
  if (locale === "zh") {
    const target = context.serveSubtype === "second_serve"
      ? "二发"
      : context.serveSubtype === "first_serve"
        ? "一发"
        : context.strokeFamily === "serve"
          ? "发球"
          : context.strokeFamily === "backhand"
            ? "反手"
            : context.strokeFamily === "forehand"
              ? "正手"
              : "这个技术动作";
    const scene = context.pressureContext === "key_points"
      ? "关键分"
      : context.sessionType === "match"
        ? "比赛里"
        : context.sessionType === "practice"
          ? "练习里"
          : "";
    const movement = context.movement === "stationary" && context.strokeFamily === "serve"
      ? "原地发球时"
      : context.movement === "stationary"
        ? "原地执行时"
        : context.movement === "moving"
          ? "跑动中"
          : "";
    const outcome = context.outcome === "net"
      ? "容易下网"
      : context.outcome === "long"
        ? "容易出界"
        : context.outcome === "double_fault"
          ? "容易双误"
          : "容易失误";
    const feeling = context.subjectiveFeeling === "tight"
      ? "，而且会发紧。"
      : context.subjectiveFeeling === "rushed"
        ? "，而且会着急。"
        : "。";

    if (context.serveSubtype === "second_serve" && context.pressureContext === "key_points" && context.movement === "stationary") {
      return `二发在关键分原地发球时${outcome}${feeling}`;
    }

    return [scene, target, movement, outcome].filter(Boolean).join("") + feeling;
  }

  const target = context.serveSubtype === "second_serve"
    ? "second serve"
    : context.serveSubtype === "first_serve"
      ? "first serve"
      : context.strokeFamily === "serve"
        ? "serve"
        : context.strokeFamily === "backhand"
          ? "backhand"
          : context.strokeFamily === "forehand"
            ? "forehand"
            : "stroke";
  const scene = context.pressureContext === "key_points"
    ? "On key points"
    : context.sessionType === "match"
      ? "In matches"
      : context.sessionType === "practice"
        ? "In practice"
        : "";
  const movement = context.movement === "stationary"
    ? "from a stationary position"
    : context.movement === "moving"
      ? "while moving"
      : "";
  const outcome = context.outcome === "net"
    ? "keeps going into the net"
    : context.outcome === "long"
      ? "keeps flying long"
      : context.outcome === "double_fault"
        ? "keeps double-faulting"
        : "keeps breaking down";
  const feeling = context.subjectiveFeeling === "tight"
    ? " and it feels tight."
    : context.subjectiveFeeling === "rushed"
      ? " and it feels rushed."
      : ".";

  return [scene, "my", target, movement, outcome].filter(Boolean).join(" ") + feeling;
}

export function buildDeepDiagnosisEvidenceSummary(
  context: EnrichedDiagnosisContext,
  locale: "zh" | "en"
): string {
  return locale === "en"
    ? "Deep diagnosis is based on the original complaint plus scene-reconstruction evidence."
    : "深入诊断基于原始文本 + 场景还原证据。";
}

export function buildPlanContextFromEnrichedContext(context: EnrichedDiagnosisContext | null | undefined): PlanContext | null {
  if (!context?.isDeepModeReady) {
    return null;
  }

  return {
    source: "diagnosis",
    primaryProblemTag: context.problemTag,
    sessionType: context.sessionType === "match" || context.sessionType === "practice" ? context.sessionType : "unknown",
    pressureContext: context.pressureContext === "key_points"
      ? "high"
      : context.pressureContext === "general_match_pressure"
        ? "some"
        : "unknown",
    movementContext: context.movement === "stationary" || context.movement === "moving" ? context.movement : "unknown",
    incomingBallDepth: context.incomingBallDepth === "deep" ? "deep" : "unknown",
    outcomePattern: context.outcome === "net"
      ? "net"
      : context.outcome === "long"
        ? "long"
        : context.outcome === "double_fault" || context.outcome === "miss_in"
          ? "no_control"
          : context.outcome === "float"
            ? "weak"
            : "unknown",
    feelingModifiers: [
      context.subjectiveFeeling === "tight" ? "tight" : null,
      context.subjectiveFeeling === "low_confidence" ? "nervous" : null,
      context.subjectiveFeeling === "rushed" ? "rushed" : null
    ].filter((value): value is PlanContext["feelingModifiers"][number] => Boolean(value))
  };
}
