import { ProblemTag } from "@/types/problemTag";

export const DEFAULT_PROBLEM_TAG: ProblemTag = "general-improvement";

export const DIAGNOSIS_CONTENT_PROBLEM_TAG_ALIASES: Partial<Record<ProblemTag, ProblemTag[]>> = {
  "second-serve-confidence": ["second-serve-reliability"],
  "serve-toss-inconsistent": ["serve-toss-consistency"],
  "slice-too-high": ["backhand-slice-floating", "slice-depth-control"],
  "trouble-with-slice": ["incoming-slice-trouble"],
  "slow-preparation": ["late-contact"],
  "volley-errors": ["volley-floating", "volley-into-net", "volley-contact-instability"],
  "doubles-net-fear": ["net-confidence", "doubles-poach-hesitation"]
};

export const ASSESSMENT_DIMENSION_HINTS: Record<string, { skills: string[]; problemTags: ProblemTag[] }> = {
  basics: {
    skills: ["basics", "forehand", "backhand"],
    problemTags: ["general-improvement", "cant-self-practice", "plateau-no-progress", "late-contact"]
  },
  forehand: {
    skills: ["forehand", "topspin"],
    problemTags: ["forehand-out", "forehand-no-power", "balls-too-short", "topspin-low"]
  },
  backhand: {
    skills: ["backhand", "slice"],
    problemTags: ["backhand-into-net", "backhand-slice-floating", "late-contact", "incoming-slice-trouble"]
  },
  serve: {
    skills: ["serve"],
    problemTags: ["second-serve-reliability", "serve-toss-consistency", "serve-accuracy"]
  },
  net: {
    skills: ["net", "doubles"],
    problemTags: ["net-confidence", "volley-contact-instability", "half-volley-late-contact", "doubles-positioning", "doubles-poach-hesitation"]
  },
  movement: {
    skills: ["movement", "footwork"],
    problemTags: ["late-contact", "balls-too-short", "movement-slow", "on-the-run-late-contact", "recovery-delay"]
  },
  matchplay: {
    skills: ["matchplay", "mental", "return"],
    problemTags: ["match-anxiety", "return-under-pressure", "cant-self-practice", "cant-hit-lob", "plateau-no-progress", "safe-short-collapse", "key-point-indecision"]
  },
  rally: {
    skills: ["basics", "consistency", "forehand", "backhand"],
    problemTags: ["rally-consistency", "general-improvement", "plateau-no-progress", "backhand-into-net", "forehand-out"]
  },
  awareness: {
    skills: ["matchplay", "mental", "training"],
    problemTags: ["match-anxiety", "cant-self-practice", "plateau-no-progress"]
  },
  fundamentals: {
    skills: ["basics", "grip", "forehand", "backhand"],
    problemTags: ["general-improvement", "late-contact", "cant-self-practice"]
  },
  receiving: {
    skills: ["return", "backhand", "defense", "footwork"],
    problemTags: ["late-contact", "return-under-pressure", "backhand-into-net", "movement-slow"]
  },
  consistency: {
    skills: ["consistency", "basics", "training"],
    problemTags: ["general-improvement", "plateau-no-progress", "balls-too-short"]
  },
  both_sides: {
    skills: ["forehand", "backhand", "consistency"],
    problemTags: ["backhand-into-net", "forehand-out", "general-improvement"]
  },
  direction: {
    skills: ["forehand", "backhand", "training"],
    problemTags: ["forehand-out", "balls-too-short", "general-improvement"]
  },
  rhythm: {
    skills: ["movement", "footwork", "backhand"],
    problemTags: ["movement-slow", "late-contact", "incoming-slice-trouble"]
  },
  net_play: {
    skills: ["net", "doubles"],
    problemTags: ["net-confidence", "doubles-positioning"]
  },
  depth_variety: {
    skills: ["forehand", "topspin", "training"],
    problemTags: ["balls-too-short", "topspin-low", "forehand-no-power"]
  },
  forcing: {
    skills: ["forehand", "topspin", "matchplay"],
    problemTags: ["forehand-no-power", "balls-too-short", "general-improvement"]
  },
  tactics: {
    skills: ["matchplay", "mental", "doubles"],
    problemTags: ["passive-point-construction", "doubles-positioning", "doubles-formation-confusion", "key-point-indecision", "cant-self-practice"]
  }
};
