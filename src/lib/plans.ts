import { getDimensionLabel } from "@/lib/assessment";
import { contents } from "@/data/contents";
import { diagnosisRules } from "@/data/diagnosisRules";
import { expandedContents } from "@/data/expandedContents";
import { planTemplates } from "@/data/planTemplates";
import { AssessmentDimension, AssessmentResult, DimensionSummary } from "@/types/assessment";
import { ContentItem } from "@/types/content";
import { DayPlan, GeneratedPlan, PlanLevel, PlanTemplate } from "@/types/plan";
import { SavedPlanSource } from "@/types/userData";

type PlanLocale = "zh" | "en";
type PlanPoolSource = "curated" | "expanded";

const MAX_PLAN_CANDIDATES = 7;
const MIN_PLAN_CANDIDATES = 5;

const PLAN_TAG_ALIASES: Record<string, string> = {
  "second-serve-confidence": "second-serve-reliability",
  "serve-toss-inconsistent": "serve-toss-consistency",
  "slice-too-high": "backhand-slice-floating",
  "trouble-with-slice": "incoming-slice-trouble",
};

const PLAN_COMPATIBILITY_FALLBACKS: Record<string, string> = {
  "pressure-tightness": "match-anxiety",
  "stamina-drop": "movement-slow"
};

const PLAN_DAY_REVIEW_TERMS = ["review", "录像", "复盘", "休息", "track"];

const defaultDaysZh = [1, 2, 3, 4, 5, 6, 7].map((day) => ({
  day,
  focus: `第 ${day} 天稳定性训练`,
  contentIds: [],
  drills: ["基础挥拍 20 次", "稳定过网练习 20 球"],
  duration: "20 分钟"
}));

const defaultDaysEn = [1, 2, 3, 4, 5, 6, 7].map((day) => ({
  day,
  focus: `Day ${day} stability training`,
  contentIds: [],
  drills: ["20 basic swing reps", "20 target shots — focus on clearing the net"],
  duration: "20 minutes"
}));

const allPlanContents = [...contents, ...expandedContents];
const curatedContentIds = new Set(contents.map((content) => content.id));
const planContentById = new Map(allPlanContents.map((content) => [content.id, content]));

const planDayKeywordSignals = [
  {
    matches: ["发球", "二发", "一发", "抛球", "serve", "second serve", "toss"],
    skills: ["serve"],
    problemTags: ["serve-basics", "serve-rhythm", "second-serve-reliability", "serve-toss-consistency", "serve-accuracy"]
  },
  {
    matches: ["正手", "上旋", "弧线", "forehand", "topspin", "arc", "depth"],
    skills: ["forehand", "topspin"],
    problemTags: ["forehand-out", "topspin-low", "balls-too-short", "forehand-no-power"]
  },
  {
    matches: ["反手", "切削", "backhand", "slice"],
    skills: ["backhand", "slice"],
    problemTags: ["backhand-into-net", "backhand-slice-floating", "late-contact", "incoming-slice-trouble"]
  },
  {
    matches: ["脚步", "移动", "准备", "启动", "footwork", "movement", "prepare", "split step"],
    skills: ["movement", "footwork"],
    problemTags: ["late-contact", "movement-slow", "slow-preparation"]
  },
  {
    matches: ["跑动正手", "移动中正手", "running forehand", "forehand on the run"],
    skills: ["movement", "footwork", "forehand"],
    problemTags: ["running-forehand", "movement-slow", "forehand-out"]
  },
  {
    matches: ["跑动反手", "移动中反手", "running backhand", "backhand on the run"],
    skills: ["movement", "footwork", "backhand"],
    problemTags: ["running-backhand", "movement-slow", "backhand-into-net"]
  },
  {
    matches: ["网前", "截击", "上网", "volley", "net"],
    skills: ["net"],
    problemTags: ["net-confidence", "volley-errors", "doubles-net-fear"]
  },
  {
    matches: ["冒高", "漂", "floating volley", "float the volley"],
    skills: ["net"],
    problemTags: ["volley-floating", "volley-errors", "net-confidence"]
  },
  {
    matches: ["下网", "压低", "through the volley", "volley into net"],
    skills: ["net"],
    problemTags: ["volley-into-net", "volley-errors", "net-confidence"]
  },
  {
    matches: ["高压", "smash", "overhead"],
    skills: ["net", "movement", "footwork"],
    problemTags: ["overhead-timing", "late-contact", "no-clear-technique"]
  },
  {
    matches: ["高球", "月亮球", "moonball", "lob"],
    skills: ["matchplay", "defense", "topspin"],
    problemTags: ["moonball-trouble", "cant-hit-lob", "balls-too-short"]
  },
  {
    matches: ["双打", "站位", "轮转", "搭档", "doubles", "positioning", "partner", "rotation"],
    skills: ["doubles"],
    problemTags: ["doubles-positioning", "doubles-net-fear"]
  },
  {
    matches: ["比赛", "紧张", "流程", "复盘", "match", "pressure", "routine", "review", "nerves"],
    skills: ["matchplay", "mental"],
    problemTags: ["match-anxiety", "cant-self-practice"]
  },
  {
    matches: ["手紧", "呼吸", "tightness", "breathe"],
    skills: ["mental", "matchplay"],
    problemTags: ["pressure-tightness", "match-anxiety"]
  },
  {
    matches: ["自练", "自己练", "记录", "self-practice", "solo", "track"],
    skills: ["training"],
    problemTags: ["cant-self-practice", "no-clear-technique", "plateau-no-progress"]
  },
  {
    matches: ["模版", "节奏", "basic template", "training template", "general improvement"],
    skills: ["training", "basics", "consistency"],
    problemTags: ["general-improvement", "cant-self-practice", "no-clear-technique"]
  }
] as const;

const ASSESSMENT_DIMENSION_PLAN_HINTS: Record<
  AssessmentDimension,
  { primaryProblemTag: string; relatedProblemTags: string[]; skills: string[] }
> = {
  basics: {
    primaryProblemTag: "cant-self-practice",
    relatedProblemTags: ["late-contact", "plateau-no-progress", "general-improvement"],
    skills: ["basics", "training", "forehand", "backhand"]
  },
  forehand: {
    primaryProblemTag: "forehand-out",
    relatedProblemTags: ["topspin-low", "forehand-no-power", "balls-too-short"],
    skills: ["forehand", "topspin"]
  },
  backhand: {
    primaryProblemTag: "backhand-into-net",
    relatedProblemTags: ["backhand-slice-floating", "late-contact", "incoming-slice-trouble"],
    skills: ["backhand", "slice"]
  },
  serve: {
    primaryProblemTag: "second-serve-reliability",
    relatedProblemTags: ["serve-toss-consistency", "serve-accuracy"],
    skills: ["serve"]
  },
  net: {
    primaryProblemTag: "net-confidence",
    relatedProblemTags: ["doubles-positioning"],
    skills: ["net", "doubles"]
  },
  movement: {
    primaryProblemTag: "late-contact",
    relatedProblemTags: ["movement-slow", "balls-too-short"],
    skills: ["movement", "footwork"]
  },
  matchplay: {
    primaryProblemTag: "match-anxiety",
    relatedProblemTags: ["plateau-no-progress", "cant-self-practice", "return-under-pressure"],
    skills: ["matchplay", "mental", "return"]
  },
  rally: {
    primaryProblemTag: "backhand-into-net",
    relatedProblemTags: ["forehand-out", "balls-too-short", "general-improvement"],
    skills: ["consistency", "forehand", "backhand"]
  },
  awareness: {
    primaryProblemTag: "match-anxiety",
    relatedProblemTags: ["cant-self-practice", "plateau-no-progress"],
    skills: ["matchplay", "mental", "training"]
  },
  fundamentals: {
    primaryProblemTag: "cant-self-practice",
    relatedProblemTags: ["late-contact", "general-improvement"],
    skills: ["basics", "grip", "forehand", "backhand"]
  },
  receiving: {
    primaryProblemTag: "late-contact",
    relatedProblemTags: ["return-under-pressure", "movement-slow", "backhand-into-net"],
    skills: ["return", "movement", "backhand", "footwork"]
  },
  consistency: {
    primaryProblemTag: "cant-self-practice",
    relatedProblemTags: ["plateau-no-progress", "balls-too-short", "general-improvement"],
    skills: ["consistency", "training", "basics"]
  },
  both_sides: {
    primaryProblemTag: "backhand-into-net",
    relatedProblemTags: ["forehand-out", "general-improvement"],
    skills: ["forehand", "backhand", "consistency"]
  },
  direction: {
    primaryProblemTag: "forehand-out",
    relatedProblemTags: ["balls-too-short", "general-improvement"],
    skills: ["forehand", "backhand", "training"]
  },
  rhythm: {
    primaryProblemTag: "late-contact",
    relatedProblemTags: ["movement-slow", "incoming-slice-trouble"],
    skills: ["movement", "footwork", "backhand"]
  },
  net_play: {
    primaryProblemTag: "net-confidence",
    relatedProblemTags: ["doubles-positioning"],
    skills: ["net", "doubles"]
  },
  depth_variety: {
    primaryProblemTag: "balls-too-short",
    relatedProblemTags: ["topspin-low", "forehand-no-power"],
    skills: ["forehand", "topspin", "training"]
  },
  forcing: {
    primaryProblemTag: "forehand-no-power",
    relatedProblemTags: ["forehand-out", "balls-too-short"],
    skills: ["forehand", "topspin", "matchplay"]
  },
  tactics: {
    primaryProblemTag: "match-anxiety",
    relatedProblemTags: ["doubles-positioning", "cant-self-practice"],
    skills: ["matchplay", "mental", "doubles"]
  }
};

function toGenerated(template: PlanTemplate, locale: PlanLocale): GeneratedPlan {
  const isEn = locale === "en";

  return {
    source: "template",
    level: template.level,
    problemTag: template.problemTag,
    title: isEn ? template.titleEn : template.title,
    target: isEn ? template.targetEn : template.target,
    days: template.days.map<DayPlan>((day) => ({
      day: day.day,
      focus: isEn ? day.focusEn : day.focus,
      contentIds: day.contentIds,
      drills: isEn ? day.drillsEn : day.drills,
      duration: isEn ? day.durationEn : day.duration
    }))
  };
}

function normalizePlanLevel(level: PlanLevel): PlanTemplate["level"] {
  if (level === "2.5") {
    return "3.0";
  }

  if (level === "4.5") {
    return "4.0";
  }

  return level;
}

function normalizePlanProblemTag(problemTag: string): string {
  return PLAN_TAG_ALIASES[problemTag] ?? problemTag;
}

function getPlanPoolSource(contentId: string): PlanPoolSource {
  return curatedContentIds.has(contentId) ? "curated" : "expanded";
}

function isCuratedContent(item: ContentItem): boolean {
  return getPlanPoolSource(item.id) === "curated";
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function getPlanLookupProblemTags(problemTag: string): string[] {
  const canonicalProblemTag = normalizePlanProblemTag(problemTag);
  const compatibilityFallback = PLAN_COMPATIBILITY_FALLBACKS[canonicalProblemTag];

  return uniqueStrings([
    canonicalProblemTag,
    compatibilityFallback ?? ""
  ]);
}

function overlapCount(left: string[], right: string[]): number {
  if (left.length === 0 || right.length === 0) {
    return 0;
  }

  const rightSet = new Set(right);
  return left.reduce((count, value) => count + (rightSet.has(value) ? 1 : 0), 0);
}

function getContentSearchText(content: ContentItem) {
  return [
    content.title,
    content.displayTitleEn,
    content.focusLineEn,
    content.summary,
    content.reason,
    ...content.useCases
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getContextMismatchPenalty(content: ContentItem, desiredSkills: string[]) {
  const text = getContentSearchText(content);
  let penalty = 0;

  if (desiredSkills.includes("serve") && !desiredSkills.includes("return")) {
    if (content.skills.includes("return") && (text.includes("return") || text.includes("接发"))) {
      penalty += 10;
    }
  }

  if ((desiredSkills.includes("backhand") || desiredSkills.includes("forehand")) && !desiredSkills.includes("net")) {
    if (content.skills.includes("net") && (text.includes("volley") || text.includes("截击") || text.includes("网前"))) {
      penalty += 8;
    }
  }

  return penalty;
}

function compareContentPriority(
  left: { item: ContentItem; score: number; index: number },
  right: { item: ContentItem; score: number; index: number }
) {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  const leftCurated = isCuratedContent(left.item);
  const rightCurated = isCuratedContent(right.item);
  if (leftCurated !== rightCurated) {
    return leftCurated ? -1 : 1;
  }

  const leftViews = left.item.viewCount ?? 0;
  const rightViews = right.item.viewCount ?? 0;
  if (rightViews !== leftViews) {
    return rightViews - leftViews;
  }

  return left.index - right.index;
}

function getLevelPreferenceScore(content: ContentItem, level: PlanLevel) {
  const normalizedLevel = normalizePlanLevel(level);
  const preferredLevels =
    level === "2.5"
      ? ["2.5", "3.0"]
      : level === "3.5"
        ? ["3.0", "3.5"]
        : level === "4.5"
          ? ["4.0", "4.5"]
          : [normalizedLevel, level];

  let score = 0;
  if (content.levels.includes(level)) {
    score += 5;
  }

  if (content.levels.includes(normalizedLevel)) {
    score += 4;
  }

  score += preferredLevels.reduce((sum, candidate) => sum + (content.levels.includes(candidate) ? 2 : 0), 0);
  return score;
}

function getRecommendedRuleContentIds(problemTag: string): string[] {
  return uniqueStrings(
    getPlanLookupProblemTags(problemTag).flatMap((lookupProblemTag) =>
      diagnosisRules
        .filter((rule) => rule.problemTag === lookupProblemTag)
        .flatMap((rule) => rule.recommendedContentIds)
    )
  );
}

function getTemplateSeedContentIds(problemTag: string, level: PlanLevel): string[] {
  const templateLevel = normalizePlanLevel(level);
  for (const lookupProblemTag of getPlanLookupProblemTags(problemTag)) {
    const template = planTemplates.find((item) => item.problemTag === lookupProblemTag && item.level === templateLevel)
      ?? planTemplates.find((item) => item.problemTag === lookupProblemTag);

    if (template) {
      return uniqueStrings(template.days.flatMap((day) => day.contentIds));
    }
  }

  return [];
}

function getDaySignals(day: DayPlan) {
  const items = day.contentIds
    .map((id) => planContentById.get(id))
    .filter((item): item is ContentItem => Boolean(item));
  const dayText = `${day.focus} ${day.drills.join(" ")}`.toLowerCase();
  const keywordSignals = planDayKeywordSignals.filter((entry) =>
    entry.matches.some((match) => dayText.includes(match.toLowerCase()))
  );

  const seededSkills = uniqueStrings(items.flatMap((item) => item.skills));
  const seededProblemTags = uniqueStrings(items.flatMap((item) => item.problemTags));
  const keywordSkills = uniqueStrings(keywordSignals.flatMap((entry) => entry.skills));
  const keywordProblemTags = uniqueStrings(keywordSignals.flatMap((entry) => entry.problemTags));

  return {
    seededContentId: day.contentIds[0] ?? null,
    skills: seededSkills.length > 0 ? seededSkills : keywordSkills,
    problemTags: seededProblemTags.length > 0 ? seededProblemTags : keywordProblemTags,
    relatedSkills: uniqueStrings([...seededSkills, ...keywordSkills]),
    relatedProblemTags: uniqueStrings([...seededProblemTags, ...keywordProblemTags]),
    matchedTerms: uniqueStrings(keywordSignals.flatMap((entry) => entry.matches.map((match) => match.toLowerCase())))
  };
}

function scorePreferredContentForDay(
  content: ContentItem,
  day: DayPlan,
  problemTag: string,
  level: PlanLevel,
  reuseCount = 0
) {
  const signals = getDaySignals(day);
  const contentText = getContentSearchText(content);
  const desiredSkills = uniqueStrings([...signals.skills, ...signals.relatedSkills]);
  let score = 0;

  const daySignalScore =
    overlapCount(content.skills, signals.skills) * 3 +
    overlapCount(content.problemTags, signals.problemTags) * 4 +
    (content.id === signals.seededContentId ? 8 : 0) +
    (isCuratedContent(content) ? 1 : 0);

  score += daySignalScore;
  score += overlapCount(content.problemTags, signals.relatedProblemTags) * 2;
  score += overlapCount(content.skills, signals.relatedSkills);
  score += overlapCount(content.skills, signals.skills) * 3;
  score += signals.matchedTerms.reduce((count, term) => count + (contentText.includes(term) ? 2 : 0), 0);

  if (content.problemTags.includes(problemTag)) {
    score += 2;
  }

  score += getLevelPreferenceScore(content, level);
  score -= getContextMismatchPenalty(content, desiredSkills);

  const isReviewDay = signals.matchedTerms.some((term) => PLAN_DAY_REVIEW_TERMS.includes(term));
  if (reuseCount > 0) {
    score -= reuseCount * (isReviewDay ? 3 : 12);
  }

  return score;
}

function scoreContentForCandidatePool(input: {
  item: ContentItem;
  index: number;
  problemTag: string;
  level: PlanLevel;
  explicitContentIdSet: Set<string>;
  seedProblemTags: string[];
  seedSkills: string[];
  secondaryProblemTags: string[];
  secondarySkills: string[];
  templateSeedContentIdSet: Set<string>;
}) {
  const {
    item,
    index,
    problemTag,
    level,
    explicitContentIdSet,
    seedProblemTags,
    seedSkills,
    secondaryProblemTags,
    secondarySkills,
    templateSeedContentIdSet
  } = input;

  let score = 0;

  if (explicitContentIdSet.has(item.id)) {
    score += 80;
  }

  if (templateSeedContentIdSet.has(item.id)) {
    score += 24;
  }

  if (item.problemTags.includes(problemTag)) {
    score += 28;
  }

  score += overlapCount(item.problemTags, seedProblemTags) * 12;
  score += overlapCount(item.skills, seedSkills) * 9;
  score += overlapCount(item.problemTags, secondaryProblemTags) * 6;
  score += overlapCount(item.skills, secondarySkills) * 4;
  score += getLevelPreferenceScore(item, level);
  score -= getContextMismatchPenalty(item, seedSkills);

  return {
    item,
    index,
    score
  };
}

function fillCandidatePoolIfNeeded(
  candidateIds: string[],
  level: PlanLevel,
  seedSkills: string[],
  seedProblemTags: string[]
) {
  if (candidateIds.length >= MIN_PLAN_CANDIDATES) {
    return candidateIds.slice(0, MAX_PLAN_CANDIDATES);
  }

  const existingIds = new Set(candidateIds);
  const backfill = allPlanContents
    .map((item, index) => {
      const problemTagOverlap = overlapCount(item.problemTags, seedProblemTags);
      const skillOverlap = overlapCount(item.skills, seedSkills);
      let score = 0;
      score += problemTagOverlap * 6;
      score += skillOverlap * 5;
      score += getLevelPreferenceScore(item, level);

      return { item, index, score, problemTagOverlap, skillOverlap };
    })
    .filter(({ item, score, problemTagOverlap, skillOverlap }) =>
      !existingIds.has(item.id) &&
      (
        problemTagOverlap > 0 ||
        (skillOverlap > 0 && score >= 10)
      )
    )
    .sort(compareContentPriority)
    .map(({ item }) => item.id);

  return uniqueStrings([...candidateIds, ...backfill]).slice(0, MAX_PLAN_CANDIDATES);
}

function getAssessmentDimensionKeySet(result: AssessmentResult): AssessmentDimension[] {
  const directKeys = result.dimensions.map((dimension) => dimension.key);
  const labelKeys = result.observationNeeded
    .map((label) =>
      (Object.keys(ASSESSMENT_DIMENSION_PLAN_HINTS) as AssessmentDimension[])
        .find((key) => getDimensionLabel(key, "zh") === label || getDimensionLabel(key, "en") === label)
    )
    .filter((key): key is AssessmentDimension => Boolean(key));

  return uniqueStrings([...directKeys, ...labelKeys]) as AssessmentDimension[];
}

function getWeakestAssessmentDimension(result: AssessmentResult): DimensionSummary | null {
  const scored = result.dimensions.filter((dimension) => dimension.answeredCount > 0);

  if (scored.length === 0) {
    return null;
  }

  return [...scored].sort((left, right) => left.average - right.average || left.label.localeCompare(right.label))[0] ?? null;
}

export function buildDiagnosisPlanCandidateIds(input: {
  problemTag: string;
  level: PlanLevel;
  recommendedContentIds?: string[];
  maxCandidates?: number;
}): string[] {
  const normalizedProblemTag = normalizePlanProblemTag(input.problemTag);
  const lookupProblemTags = getPlanLookupProblemTags(input.problemTag);
  const explicitContentIds = uniqueStrings([
    ...(input.recommendedContentIds ?? []),
    ...getRecommendedRuleContentIds(input.problemTag)
  ]);
  const explicitItems = explicitContentIds
    .map((id) => planContentById.get(id))
    .filter((item): item is ContentItem => Boolean(item));
  const templateSeedContentIds = getTemplateSeedContentIds(input.problemTag, input.level);
  const templateSeedItems = templateSeedContentIds
    .map((id) => planContentById.get(id))
    .filter((item): item is ContentItem => Boolean(item));
  const seedProblemTags = uniqueStrings([
    normalizedProblemTag,
    ...lookupProblemTags,
    ...explicitItems.flatMap((item) => item.problemTags),
    ...templateSeedItems.flatMap((item) => item.problemTags)
  ]);
  const seedSkills = uniqueStrings([
    ...explicitItems.flatMap((item) => item.skills),
    ...templateSeedItems.flatMap((item) => item.skills)
  ]);
  const explicitContentIdSet = new Set(explicitContentIds);
  const templateSeedContentIdSet = new Set(templateSeedContentIds);

  const rankedCandidateIds = allPlanContents
    .map((item, index) =>
      scoreContentForCandidatePool({
        item,
        index,
        problemTag: normalizedProblemTag,
        level: input.level,
        explicitContentIdSet,
        seedProblemTags,
        seedSkills,
        secondaryProblemTags: [],
        secondarySkills: [],
        templateSeedContentIdSet
      })
    )
    .filter(({ item, score }) => score > 0 || explicitContentIdSet.has(item.id))
    .sort(compareContentPriority)
    .map(({ item }) => item.id);

  const orderedIds = uniqueStrings([
    ...explicitContentIds.filter((id) => planContentById.has(id)),
    ...templateSeedContentIds.filter((id) => planContentById.has(id)),
    ...rankedCandidateIds
  ]);

  return fillCandidatePoolIfNeeded(
    orderedIds,
    input.level,
    seedSkills,
    seedProblemTags
  ).slice(0, input.maxCandidates ?? MAX_PLAN_CANDIDATES);
}

export function buildAssessmentPlanContext(result: AssessmentResult): {
  problemTag: string;
  candidateIds: string[];
} {
  const weakestDimension = getWeakestAssessmentDimension(result);
  const weakestKey = weakestDimension?.key ?? "basics";
  const primaryHint = ASSESSMENT_DIMENSION_PLAN_HINTS[weakestKey];
  const allDimensionKeys = getAssessmentDimensionKeySet(result);
  const secondaryKeys = allDimensionKeys.filter((key) => key !== weakestKey);
  const secondaryHints = secondaryKeys.map((key) => ASSESSMENT_DIMENSION_PLAN_HINTS[key]);
  const explicitContentIds = getRecommendedRuleContentIds(primaryHint.primaryProblemTag);
  const templateSeedContentIds = getTemplateSeedContentIds(primaryHint.primaryProblemTag, result.level);
  const explicitItems = explicitContentIds
    .map((id) => planContentById.get(id))
    .filter((item): item is ContentItem => Boolean(item));
  const templateSeedItems = templateSeedContentIds
    .map((id) => planContentById.get(id))
    .filter((item): item is ContentItem => Boolean(item));
  const secondaryProblemTags = uniqueStrings(
    secondaryHints.flatMap((hint) => [hint.primaryProblemTag, ...hint.relatedProblemTags])
  );
  const secondarySkills = uniqueStrings(secondaryHints.flatMap((hint) => hint.skills));
  const seedProblemTags = uniqueStrings([
    primaryHint.primaryProblemTag,
    ...primaryHint.relatedProblemTags,
    ...explicitItems.flatMap((item) => item.problemTags),
    ...templateSeedItems.flatMap((item) => item.problemTags),
    ...secondaryProblemTags
  ]);
  const seedSkills = uniqueStrings([
    ...primaryHint.skills,
    ...explicitItems.flatMap((item) => item.skills),
    ...templateSeedItems.flatMap((item) => item.skills),
    ...secondarySkills
  ]);
  const explicitContentIdSet = new Set(explicitContentIds);
  const templateSeedContentIdSet = new Set(templateSeedContentIds);

  const rankedCandidateIds = allPlanContents
    .map((item, index) =>
      scoreContentForCandidatePool({
        item,
        index,
        problemTag: primaryHint.primaryProblemTag,
        level: result.level,
        explicitContentIdSet,
        seedProblemTags,
        seedSkills,
        secondaryProblemTags,
        secondarySkills,
        templateSeedContentIdSet
      })
    )
    .filter(({ item, score }) => score > 0 || explicitContentIdSet.has(item.id))
    .sort(compareContentPriority)
    .map(({ item }) => item.id);

  const orderedIds = uniqueStrings([
    ...explicitContentIds.filter((id) => planContentById.has(id)),
    ...templateSeedContentIds.filter((id) => planContentById.has(id)),
    ...rankedCandidateIds
  ]);

  return {
    problemTag: primaryHint.primaryProblemTag,
    candidateIds: fillCandidatePoolIfNeeded(
      orderedIds,
      result.level,
      seedSkills,
      seedProblemTags
    )
  };
}

function applyPreferredContentIds(
  plan: GeneratedPlan,
  level: PlanLevel,
  preferredContentIds: string[]
): GeneratedPlan {
  const preferredItems = uniqueStrings(preferredContentIds)
    .map((id) => planContentById.get(id))
    .filter((item): item is ContentItem => Boolean(item));

  if (preferredItems.length === 0) {
    return plan;
  }

  const usageCounts = new Map<string, number>();

  return {
    ...plan,
    days: plan.days.map((day) => {
      const daySignals = getDaySignals(day);
      const hasSpecificDayIntent =
        day.contentIds.length > 0 ||
        daySignals.problemTags.length > 0 ||
        daySignals.skills.length > 0 ||
        daySignals.matchedTerms.length > 0;
      const isReviewLikeDay = daySignals.matchedTerms.some((term) => PLAN_DAY_REVIEW_TERMS.includes(term));
      const rankedCandidates = preferredItems
        .map((item, index) => ({
          item,
          index,
          score: scorePreferredContentForDay(
            item,
            day,
            plan.problemTag,
            level,
            usageCounts.get(item.id) ?? 0
          )
        }))
        .filter((entry) => entry.score > 0)
        .sort(compareContentPriority);
      const rankedUnusedCandidates = rankedCandidates.filter((entry) => (usageCounts.get(entry.item.id) ?? 0) === 0);
      const bestOverallCandidate = rankedCandidates[0] ?? null;
      const bestUnusedCandidate = rankedUnusedCandidates[0] ?? null;
      const bestOverallReuseCount = bestOverallCandidate ? (usageCounts.get(bestOverallCandidate.item.id) ?? 0) : 0;
      const bestOverallMatchesSeed = bestOverallCandidate ? day.contentIds.includes(bestOverallCandidate.item.id) : false;
      const bestUnusedMatchesSeed = bestUnusedCandidate ? day.contentIds.includes(bestUnusedCandidate.item.id) : false;

      const assignedEntry = !bestOverallCandidate
        ? bestUnusedCandidate
        : !bestUnusedCandidate || bestOverallReuseCount === 0
          ? bestOverallCandidate
          : bestOverallMatchesSeed && !bestUnusedMatchesSeed
            ? bestOverallCandidate
          : (() => {
              const scoreGap = bestOverallCandidate.score - bestUnusedCandidate.score;
              const acceptableGap = !hasSpecificDayIntent ? 2 : isReviewLikeDay ? 3 : 3;
              const minimumUnusedScore = !hasSpecificDayIntent ? 12 : isReviewLikeDay ? 8 : 10;
              const shouldUseUnused =
                bestUnusedCandidate.score >= minimumUnusedScore &&
                scoreGap <= acceptableGap;

              return shouldUseUnused ? bestUnusedCandidate : bestOverallCandidate;
            })();
      const assignedContent = assignedEntry?.item ?? null;

      if (assignedContent) {
        usageCounts.set(assignedContent.id, (usageCounts.get(assignedContent.id) ?? 0) + 1);
      }

      const existingPreferredIds = preferredItems
        .filter((item) => day.contentIds.includes(item.id) && item.id !== assignedContent?.id)
        .map((item) => item.id);

      return {
        ...day,
        contentIds: uniqueStrings([
          ...(assignedContent ? [assignedContent.id] : []),
          ...existingPreferredIds,
          ...day.contentIds
        ])
      };
    })
  };
}

export function encodePlanContentIds(contentIds: string[]): string | null {
  const normalized = uniqueStrings(contentIds.map((value) => value.trim()));
  return normalized.length > 0 ? normalized.join(",") : null;
}

export function parsePlanContentIds(raw: string | null | undefined): string[] {
  if (!raw) {
    return [];
  }

  return uniqueStrings(raw.split(",").map((value) => value.trim()));
}

export function buildPlanHref(input: {
  problemTag?: string;
  level?: string;
  preferredContentIds?: string[];
  sourceType?: SavedPlanSource;
}): string {
  const params = new URLSearchParams();

  if (input.problemTag) {
    params.set("problemTag", input.problemTag);
  }

  if (input.level) {
    params.set("level", input.level);
  }

  if (input.sourceType) {
    params.set("source", input.sourceType);
  }

  const contentIds = encodePlanContentIds(input.preferredContentIds ?? []);
  if (contentIds) {
    params.set("contentIds", contentIds);
  }

  const query = params.toString();
  return query ? `/plan?${query}` : "/plan";
}

export function getPlanTemplate(
  problemTag: string,
  level: PlanLevel,
  locale: PlanLocale = "zh",
  preferredContentIds: string[] = []
): GeneratedPlan {
  const normalizedProblemTag = normalizePlanProblemTag(problemTag);
  const templateLevel = normalizePlanLevel(level);
  const exact = getPlanLookupProblemTags(problemTag)
    .map((lookupProblemTag) => planTemplates.find((item) => item.problemTag === lookupProblemTag && item.level === templateLevel))
    .find((item): item is PlanTemplate => Boolean(item));
  if (exact) {
    const plan = applyPreferredContentIds(
      {
        ...toGenerated(exact, locale),
        level
      },
      level,
      preferredContentIds
    );

    return {
      ...plan,
      problemTag
    };
  }

  const sameTag = getPlanLookupProblemTags(problemTag)
    .map((lookupProblemTag) => planTemplates.find((item) => item.problemTag === lookupProblemTag))
    .find((item): item is PlanTemplate => Boolean(item));
  if (sameTag) {
    const plan = applyPreferredContentIds(
      {
        ...toGenerated(sameTag, locale),
        level
      },
      level,
      preferredContentIds
    );

    return {
      ...plan,
      problemTag
    };
  }

  const defaultDays = locale === "en" ? defaultDaysEn : defaultDaysZh;

  return applyPreferredContentIds(
    {
      source: "fallback",
      level,
      problemTag,
      title: locale === "en" ? "7-day general improvement plan" : "通用 7 天基础提升计划",
      target: locale === "en"
        ? "Build a steady swing and a practical training rhythm within one week"
        : "在一周内建立稳定击球与可执行训练节奏",
      summary: locale === "en"
        ? "Not enough context to customize yet. Starting with a general, actionable 7-day training rhythm."
        : "当前上下文不足，先使用一份通用且可执行的 7 天训练节奏。",
      days: defaultDays
    },
    level,
    preferredContentIds
  );
}

const DIMENSION_TO_PROBLEM_TAG: Record<string, string> = {
  "正手": "forehand-out",
  "反手": "backhand-into-net",
  "发球": "second-serve-reliability",
  "网前": "net-confidence",
  "移动": "late-contact",
  "比赛意识": "match-anxiety",
  "forehand": "forehand-out",
  "backhand": "backhand-into-net",
  "serve": "second-serve-reliability",
  "net play": "net-confidence",
  "movement": "late-contact",
  "match play": "match-anxiety",
  "match awareness": "match-anxiety"
};

export function getPlanFromDiagnosis(input: {
  level?: PlanLevel;
  problemTag?: string;
  title?: string;
  fixes?: string[];
  locale?: PlanLocale;
}): GeneratedPlan {
  const level = input.level ?? "3.5";
  const locale = input.locale ?? "zh";
  const problemTag = input.problemTag ?? "general-improvement";
  const base = getPlanTemplate(problemTag, level, locale);

  if (locale === "en") {
    return {
      ...base,
      title: input.title ? `${input.title}: 7-day improvement plan` : base.title,
      target: input.fixes?.[0] ? `Focus on "${input.fixes[0]}" and build a consistent 7-day training rhythm.` : base.target,
      summary: "This plan is built around your primary issue. Focus on execution over the week — do not try to fix everything at once."
    };
  }

  return {
    ...base,
    title: input.title ? `${input.title}：7 天提升计划` : base.title,
    target: input.fixes?.[0] ? `先围绕"${input.fixes[0]}"建立连续 7 天的小步训练。` : base.target,
    summary: "这份计划围绕你当前最主要的问题设计，先追求连续执行，不求一次改完。"
  };
}

export function getPlanFromAssessment(input: {
  level?: PlanLevel;
  weaknesses?: string[];
  observationNeeded?: string[];
  locale?: PlanLocale;
}): GeneratedPlan {
  const level = input.level ?? "3.5";
  const locale = input.locale ?? "zh";
  const mapped =
    (input.weaknesses?.[0] && DIMENSION_TO_PROBLEM_TAG[input.weaknesses[0]]) ||
    (input.observationNeeded?.[0] && DIMENSION_TO_PROBLEM_TAG[input.observationNeeded[0]]) ||
    "general-improvement";

  const base = getPlanTemplate(mapped, level, locale);

  if (locale === "en") {
    return {
      ...base,
      summary: input.observationNeeded?.length
        ? `The plan will shore up weak spots first, with ${input.observationNeeded.join(" and ")} as watch areas.`
        : "The plan focuses on the weakest areas from the assessment to build training rhythm."
    };
  }

  return {
    ...base,
    summary: input.observationNeeded?.length
      ? `计划会先补强短板，同时把 ${input.observationNeeded.join("、")} 作为待观察维度。`
      : "计划会优先围绕评估中的相对短板建立训练节奏。"
  };
}

export function getPlanPreviewTags(locale: PlanLocale = "zh"): string[] {
  if (locale === "en") {
    return ["Backhand into the net", "No confidence on second serve", "Forehand keeps going out", "Match nerves", "Not sure what to practise"];
  }

  return ["反手总下网", "二发没信心", "正手总出界", "比赛容易紧张", "不会自己练"];
}
