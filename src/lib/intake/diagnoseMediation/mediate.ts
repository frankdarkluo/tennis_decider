import { createLocalQwenClient } from "@/lib/scenarioReconstruction/llm/client";
import { shouldMediateDiagnoseComplaint } from "./gate";
import { validateDiagnoseMediationResult } from "./validate";
import type {
  DiagnoseGateDecision,
  ObserveDiagnoseMediation,
  DiagnoseMediationReason,
  DiagnoseMediationResult,
  SkillCategory
} from "./types";

export type DiagnoseMediationModel = (input: {
  complaint: string;
  locale: "zh" | "en";
  lockedCategory: SkillCategory | null;
}) => Promise<unknown>;

export type DiagnoseMediationRequest = {
  complaint: string;
  locale: "zh" | "en";
  gateDecision?: DiagnoseGateDecision;
  runModel?: DiagnoseMediationModel;
  observe?: ObserveDiagnoseMediation;
};

type CategoryCue = {
  category: SkillCategory;
  cues: RegExp[];
};

const CATEGORY_CUES: CategoryCue[] = [
  {
    category: "serve",
    cues: [/\bserve\b/i, /发球/, /一发/, /二发/]
  },
  {
    category: "volley",
    cues: [/\bvolley\b/i, /截击/, /网前/]
  },
  {
    category: "overhead",
    cues: [/\boverhead\b/i, /高压/, /smash/i]
  },
  {
    category: "slice",
    cues: [/\bslice\b/i, /切削/, /削球/]
  },
  {
    category: "groundstroke_on_move",
    cues: [/\brunning forehand\b/i, /\bon the run\b/i, /跑动/, /移动中/, /\bmove[d]?\b/i]
  },
  {
    category: "groundstroke_set",
    cues: [/\bbackhand\b/i, /\bforehand\b/i, /正手/, /反手/, /底线/, /\bgroundstroke\b/i]
  }
];

function normalizeComplaint(rawComplaint: string) {
  return rawComplaint.trim().replace(/\s+/g, " ");
}

function hasMatch(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

function detectCategories(text: string) {
  return CATEGORY_CUES.filter((entry) => hasMatch(text, entry.cues)).map((entry) => entry.category);
}

function makeFallback(reason: DiagnoseMediationReason): DiagnoseMediationResult {
  return {
    mode: "fallback",
    reason,
    displayText: null,
    normalizedComplaint: null,
    clarificationQuestion: null
  };
}

function isLockViolated(result: DiagnoseMediationResult, lockedCategory: SkillCategory | null) {
  if (!lockedCategory) {
    return false;
  }

  const text = [result.displayText, result.normalizedComplaint, result.clarificationQuestion]
    .filter((value): value is string => typeof value === "string")
    .join(" ");
  const matchedCategories = detectCategories(text);

  return matchedCategories.some((category) => category !== lockedCategory);
}

export async function mediateDiagnoseComplaint(input: DiagnoseMediationRequest): Promise<DiagnoseMediationResult> {
  const gateDecision = input.gateDecision ?? shouldMediateDiagnoseComplaint(input.complaint, input.locale);
  const runModel = input.runModel ?? (async ({ complaint, locale, lockedCategory }: {
    complaint: string;
    locale: "zh" | "en";
    lockedCategory: SkillCategory | null;
  }) => {
    const client = createLocalQwenClient();
    return client.mediateDiagnoseComplaint(complaint, locale, lockedCategory);
  });

  if (!gateDecision.shouldMediate) {
    return {
      mode: "skip",
      reason: gateDecision.reason,
      displayText: null,
      normalizedComplaint: null,
      clarificationQuestion: null
    };
  }

  try {
    const modelOutput = await runModel({
      complaint: normalizeComplaint(input.complaint),
      locale: input.locale,
      lockedCategory: gateDecision.lockedCategory
    });
    const validated = validateDiagnoseMediationResult(modelOutput);

    if (!validated.ok) {
      input.observe?.({
        type: "validator_rejected",
        rejectionReason: validated.rejectionReason
      });
      input.observe?.({
        type: "fallback",
        reason: "low_confidence"
      });
      return makeFallback("low_confidence");
    }

    if (isLockViolated(validated.value, gateDecision.lockedCategory)) {
      input.observe?.({
        type: "fallback",
        reason: "low_confidence"
      });
      return makeFallback("low_confidence");
    }

    return validated.value;
  } catch {
    input.observe?.({
      type: "fallback",
      reason: "model_unavailable"
    });
    return makeFallback("model_unavailable");
  }
}
