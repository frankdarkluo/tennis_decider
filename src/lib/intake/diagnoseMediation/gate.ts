import type { DiagnoseGateDecision, SkillCategory } from "./types";

type CategoryCue = {
  category: SkillCategory;
  cues: RegExp[];
  clearOutcomeCues: RegExp[];
};

const CATEGORY_CUES: CategoryCue[] = [
  {
    category: "serve",
    cues: [/\bserve\b/i, /发球/, /一发/, /二发/],
    clearOutcomeCues: [/没信心/, /不稳/, /下网/, /出界/, /发坏/, /受控/, /no confidence/i, /into the net/i, /going long/i, /wide/i]
  },
  {
    category: "volley",
    cues: [/\bvolley\b/i, /截击/, /网前/],
    clearOutcomeCues: [/下网/, /浮/, /老.*net/i, /into the net/i, /going long/i, /wide/i]
  },
  {
    category: "overhead",
    cues: [/\boverhead\b/i, /高压/, /smash/i],
    clearOutcomeCues: [/going long/i, /出界/, /late/i, /behind/i, /long/i]
  },
  {
    category: "slice",
    cues: [/\bslice\b/i, /切削/, /削球/],
    clearOutcomeCues: [/下网/, /浮/, /sits up/i, /long/i, /出界/, /float/i]
  },
  {
    category: "groundstroke_set",
    cues: [/\bbackhand\b/i, /\bforehand\b/i, /正手/, /反手/, /底线/, /\bgroundstroke\b/i],
    clearOutcomeCues: [/下网/, /出界/, /long/i, /net/i, /wide/i, /不稳/, /没信心/, /no confidence/i, /into the net/i]
  },
  {
    category: "groundstroke_on_move",
    cues: [/\brunning forehand\b/i, /\bon the run\b/i, /跑动/, /移动中/, /\bmove[d]?\b/i],
    clearOutcomeCues: [/下网/, /出界/, /long/i, /net/i, /wide/i, /不稳/, /没信心/, /no confidence/i, /into the net/i]
  }
];

function normalizeComplaint(rawComplaint: string) {
  return rawComplaint.trim().replace(/\s+/g, " ");
}

function hasMatch(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

function countSignals(text: string, patterns: RegExp[]) {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

function detectStableCategory(text: string): SkillCategory | null {
  for (const entry of CATEGORY_CUES) {
    if (hasMatch(text, entry.cues)) {
      return entry.category;
    }
  }

  return null;
}

function hasClearOutcome(text: string, category: SkillCategory | null) {
  if (!category) {
    return false;
  }

  const entry = CATEGORY_CUES.find((item) => item.category === category);
  return entry ? hasMatch(text, entry.clearOutcomeCues) : false;
}

function isTranscriptNoise(text: string) {
  const fillerPatterns = [
    /就是/g,
    /那个/g,
    /然后/g,
    /吧/g,
    /嗯/g,
    /呃/g,
    /\blik(e|e)?\b/i,
    /\bkind of\b/i,
    /\bsort of\b/i,
    /\byou know\b/i
  ];
  const fillerHits = countSignals(text, fillerPatterns);
  const clauseCount = (text.match(/[，。,.！？!?;；]/g) ?? []).length;
  const longEnough = text.length >= 18;

  return longEnough && (fillerHits >= 2 || (fillerHits >= 1 && clauseCount >= 2));
}

export function shouldMediateDiagnoseComplaint(rawComplaint: string, _locale: "zh" | "en"): DiagnoseGateDecision {
  const text = normalizeComplaint(rawComplaint);
  const lockedCategory = detectStableCategory(text);

  if (isTranscriptNoise(text)) {
    return {
      shouldMediate: true,
      reason: "transcript_noise",
      lockedCategory
    };
  }

  if (lockedCategory && hasClearOutcome(text, lockedCategory)) {
    return {
      shouldMediate: false,
      reason: "clear_enough",
      lockedCategory
    };
  }

  if (lockedCategory) {
    return {
      shouldMediate: true,
      reason: "ambiguous",
      lockedCategory
    };
  }

  return {
    shouldMediate: true,
    reason: "too_vague",
    lockedCategory: null
  };
}
