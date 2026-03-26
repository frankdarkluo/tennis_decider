import { contents } from "@/data/contents";
import { diagnosisRules } from "@/data/diagnosisRules";
import { AssessmentResult } from "@/types/assessment";
import { ContentItem } from "@/types/content";
import { DiagnosisConfidence, DiagnosisResult, DiagnosisRule } from "@/types/diagnosis";

export type DiagnoseOptions = {
  level?: string;
  assessmentResult?: AssessmentResult | null;
  maxRecommendations?: number;
  rules?: DiagnosisRule[];
  contentPool?: ContentItem[];
};

export type ProblemPreviewOption = {
  label: string;
  problemTag: string;
};

const DEFAULT_PROBLEM_TAG = "general-improvement";

const DEFAULT_SUMMARY =
  "我们先给你一个基础方向：先找最影响你的 1 个问题，先把稳定性和准备节奏建立起来，再逐步加强力量和变化。";

const DEFAULT_CAUSES = [
  "问题描述还比较宽泛，暂时无法精确定位到单一技术环节",
  "大多数初中级问题都和准备时机、击球点和动作节奏有关",
  "当前更需要先把问题缩小到一个具体场景"
];

const DEFAULT_FIXES = [
  "先只解决一个问题，不要同时改太多动作",
  "先追求稳定过网和更清楚的击球点",
  "下次描述问题时尽量带上场景，比如‘反手总下网’或‘二发没信心’"
];

const DEFAULT_DRILLS = [
  "每次训练只设 1 个主目标",
  "影子挥拍 20 次，感受准备和节奏",
  "慢节奏定点击球 20 球，先保证稳定过网"
];

const DEFAULT_CONTENT_IDS = ["content_cn_c_01", "content_cn_f_02", "content_gaiao_01"];

const PROBLEM_PREVIEW_OPTIONS: ProblemPreviewOption[] = [
  { label: "反手总是下网", problemTag: "backhand-into-net" },
  { label: "正手一发力就出界", problemTag: "forehand-out" },
  { label: "发球二发没信心", problemTag: "second-serve-confidence" },
  { label: "双打不知道站哪", problemTag: "doubles-positioning" },
  { label: "脚步总慢半拍", problemTag: "movement-slow" },
  { label: "比赛一紧张就乱", problemTag: "match-anxiety" },
  { label: "不知道自己该练什么", problemTag: "cant-self-practice" },
  { label: "练了很久没进步", problemTag: "plateau-no-progress" }
];

const LEVEL_PREFERENCE_MAP: Record<string, string[]> = {
  "2.5": ["2.5", "3.0"],
  "3.0": ["2.5", "3.0"],
  "3.5": ["3.0", "3.5"],
  "4.0": ["3.5", "4.0", "4.5"],
  "4.5": ["4.0", "4.5"]
};

const ASSESSMENT_DIMENSION_HINTS: Record<
  AssessmentResult["dimensions"][number]["key"],
  { skills: string[]; problemTags: string[] }
> = {
  forehand: {
    skills: ["forehand", "topspin"],
    problemTags: ["forehand-out", "forehand-no-power", "balls-too-short", "topspin-low"]
  },
  backhand: {
    skills: ["backhand", "slice"],
    problemTags: ["backhand-into-net", "slice-too-high", "late-contact", "trouble-with-slice"]
  },
  serve: {
    skills: ["serve"],
    problemTags: ["second-serve-confidence", "serve-toss-inconsistent", "serve-accuracy"]
  },
  net: {
    skills: ["net", "doubles"],
    problemTags: ["net-confidence", "doubles-positioning"]
  },
  movement: {
    skills: ["movement", "footwork"],
    problemTags: ["late-contact", "balls-too-short", "movement-slow"]
  },
  matchplay: {
    skills: ["matchplay", "mental", "return"],
    problemTags: ["match-anxiety", "return-under-pressure", "cant-self-practice", "cant-hit-lob", "plateau-no-progress"]
  }
};

const TITLE_MAP: Record<string, string> = {
  "backhand-into-net": "你的问题更接近：反手稳定性不足",
  "forehand-out": "你的问题更接近：正手控制不足",
  "second-serve-confidence": "你的问题更接近：二发信心和节奏不足",
  "serve-toss-inconsistent": "你的问题更接近：发球抛球不稳定",
  "late-contact": "你的问题更接近：准备偏慢 / 击球点偏晚",
  "net-confidence": "你的问题更接近：网前信心和动作控制不足",
  "match-anxiety": "你的问题更接近：比赛紧张导致执行下降",
  "forehand-no-power": "你的问题更接近：正手发力链条不顺",
  "balls-too-short": "你的问题更接近：击球深度不足",
  "return-under-pressure": "你的问题更接近：接发球准备和策略不足",
  "slice-too-high": "你的问题更接近：切削控制不足",
  "topspin-low": "你的问题更接近：正手上旋和弧线不足",
  "serve-accuracy": "你的问题更接近：发球进区率和落点控制不足",
  "movement-slow": "你的问题更接近：脚步启动和到位偏慢",
  "doubles-positioning": "你的问题更接近：双打站位和轮转不清晰",
  "trouble-with-slice": "你的问题更接近：下旋来球处理不顺",
  "cant-hit-lob": "你的问题更接近：防守高球选择不足",
  "plateau-no-progress": "你的问题更接近：训练聚焦不够，进入平台期",
  "cant-self-practice": "你的问题更接近：训练规划不清晰",
  "general-improvement": "你的问题暂时更接近：通用提升方向"
};

export function normalizeDiagnosisInput(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[，。！？、；：“”‘’（）()【】\[\],.!?;:"'`~\-_/]+/g, " ")
    .replace(/\s+/g, " ");
}

export function getMatchedKeywords(input: string, rule: DiagnosisRule): string[] {
  const normalized = normalizeDiagnosisInput(input);
  return rule.keywords.filter((keyword) => normalized.includes(normalizeDiagnosisInput(keyword)));
}

export function getMatchedSynonyms(input: string, rule: DiagnosisRule): string[] {
  const normalized = normalizeDiagnosisInput(input);
  return (rule.synonyms ?? []).filter((phrase) => normalized.includes(normalizeDiagnosisInput(phrase)));
}

export function scoreDiagnosisRule(input: string, rule: DiagnosisRule): number {
  const matchedKeywords = getMatchedKeywords(input, rule);
  const matchedSynonyms = getMatchedSynonyms(input, rule);
  if (matchedKeywords.length === 0 && matchedSynonyms.length === 0) return 0;

  const keywordScore = matchedKeywords.length * 10;
  const synonymScore = matchedSynonyms.length * 7;
  const allMatchedBonus = matchedKeywords.length === rule.keywords.length ? 3 : 0;

  return keywordScore + synonymScore + allMatchedBonus;
}

export function getDiagnosisConfidence(score: number): DiagnosisConfidence {
  if (score >= 24) return "较高";
  if (score >= 12) return "中等";
  return "较低";
}

export function findBestDiagnosisRule(
  input: string,
  rules: DiagnosisRule[] = diagnosisRules
): {
  rule: DiagnosisRule | null;
  matchedKeywords: string[];
  matchedSynonyms: string[];
  score: number;
} {
  let bestRule: DiagnosisRule | null = null;
  let bestKeywords: string[] = [];
  let bestSynonyms: string[] = [];
  let bestScore = 0;

  for (const rule of rules) {
    const score = scoreDiagnosisRule(input, rule);
    if (score > bestScore) {
      bestScore = score;
      bestRule = rule;
      bestKeywords = getMatchedKeywords(input, rule);
      bestSynonyms = getMatchedSynonyms(input, rule);
    }
  }

  return {
    rule: bestRule,
    matchedKeywords: bestKeywords,
    matchedSynonyms: bestSynonyms,
    score: bestScore
  };
}

function scoreContentAgainstLevel(item: ContentItem, preferredLevels: string[], level?: string): number {
  if (!level) {
    return 0;
  }

  let score = 0;

  if (item.levels.includes(level)) {
    score += 4;
  }

  for (const preferredLevel of preferredLevels) {
    if (item.levels.includes(preferredLevel)) {
      score += 2;
    }
  }

  return score;
}

function prioritizeContentsByLevel(
  items: ContentItem[],
  maxRecommendations: number,
  level?: string
): ContentItem[] {
  if (!level) {
    return items.slice(0, maxRecommendations);
  }

  const preferredLevels = LEVEL_PREFERENCE_MAP[level] ?? [level];

  return items
    .map((item, index) => ({
      item,
      index,
      score: scoreContentAgainstLevel(item, preferredLevels, level)
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.index - b.index;
    })
    .map(({ item }) => item)
    .slice(0, maxRecommendations);
}

function getGenericFallbackContents(
  contentPool: ContentItem[] = contents,
  maxRecommendations = 3,
  level?: string
): ContentItem[] {
  const genericContents = DEFAULT_CONTENT_IDS
    .map((id) => contentPool.find((item) => item.id === id))
    .filter((item): item is ContentItem => Boolean(item));

  return prioritizeContentsByLevel(genericContents, maxRecommendations, level);
}

function getWeakestAssessmentDimension(assessmentResult?: AssessmentResult | null) {
  if (!assessmentResult) {
    return null;
  }

  const scoredDimensions = assessmentResult.dimensions.filter((dimension) => dimension.answeredCount > 0);

  if (scoredDimensions.length === 0) {
    return null;
  }

  return [...scoredDimensions].sort((a, b) => a.average - b.average)[0] ?? null;
}

export function getContentsByIds(
  ids: string[],
  contentPool: ContentItem[] = contents,
  maxRecommendations = 3,
  level?: string
): ContentItem[] {
  const mapped = ids
    .map((id) => contentPool.find((item) => item.id === id))
    .filter((item): item is ContentItem => Boolean(item));

  return prioritizeContentsByLevel(mapped, maxRecommendations, level);
}

export function getFallbackContents(
  _input: string,
  contentPool: ContentItem[] = contents,
  maxRecommendations = 3,
  level?: string,
  assessmentResult?: AssessmentResult | null
): ContentItem[] {
  const weakestDimension = getWeakestAssessmentDimension(assessmentResult);

  if (weakestDimension) {
    const hints = ASSESSMENT_DIMENSION_HINTS[weakestDimension.key];
    const candidates = contentPool.filter((item) => {
      const matchesProblemTag = item.problemTags.some((problemTag) => hints.problemTags.includes(problemTag));
      const matchesSkill = item.skills.some((skill) => hints.skills.includes(skill));

      return matchesProblemTag || matchesSkill;
    });

    if (candidates.length > 0) {
      return prioritizeContentsByLevel(candidates, maxRecommendations, level);
    }
  }

  return getGenericFallbackContents(contentPool, maxRecommendations, level);
}

export function getDiagnosisTitle(problemTag: string): string {
  return TITLE_MAP[problemTag] ?? TITLE_MAP[DEFAULT_PROBLEM_TAG];
}

export function buildDiagnosisSummary(
  causes: string[],
  fixes: string[],
  fallbackUsed = false
): string {
  if (fallbackUsed) return DEFAULT_SUMMARY;

  const cause = causes[0] ?? "准备和节奏上还需要更清晰的定位";
  const fix = fixes[0] ?? "先把问题缩小到一个更具体的动作点";

  return `你现在最值得先改的，不是一次性解决所有问题，而是先围绕“${cause}”去处理。建议先从“${fix}”开始。`;
}

export function diagnoseProblem(input: string, options: DiagnoseOptions = {}): DiagnosisResult {
  const {
    level,
    assessmentResult,
    maxRecommendations = 3,
    rules = diagnosisRules,
    contentPool = contents
  } = options;

  const normalizedInput = normalizeDiagnosisInput(input);

  if (!normalizedInput) {
    return getDefaultDiagnosisResult(level, contentPool, maxRecommendations);
  }

  const { rule, matchedKeywords, matchedSynonyms, score } = findBestDiagnosisRule(normalizedInput, rules);

  if (!rule || score <= 0) {
    const fallbackContents = getFallbackContents(
      normalizedInput,
      contentPool,
      maxRecommendations,
      level,
      assessmentResult
    );
    const fallbackMode = assessmentResult ? "assessment" : "no-assessment";

    return {
      input,
      normalizedInput,
      matchedRuleId: null,
      matchedKeywords: [],
      matchedSynonyms: [],
      matchScore: 0,
      confidence: "较低",
      category: ["general", "improvement"],
      problemTag: DEFAULT_PROBLEM_TAG,
      title: fallbackMode === "assessment" ? "我们先从你当前最值得补的一环开始" : "先给你一组通用提升方向",
      summary:
        fallbackMode === "assessment"
          ? "我们暂时没有精确匹配到你的问题，但根据你的水平和当前短板，这些内容可能更适合你先看。"
          : "试试先做一次 1 分钟评估，我们能给你更准的建议。先从这些通用提升内容开始也可以。",
      causes: DEFAULT_CAUSES,
      fixes: DEFAULT_FIXES,
      drills: DEFAULT_DRILLS,
      recommendedContents: fallbackContents,
      searchQueries: null,
      fallbackUsed: true,
      fallbackMode,
      level
    };
  }

  const recommendedContents = getContentsByIds(
    rule.recommendedContentIds,
    contentPool,
    maxRecommendations,
    level
  );

  const finalContents =
    recommendedContents.length > 0
      ? recommendedContents
      : getFallbackContents(normalizedInput, contentPool, maxRecommendations, level, assessmentResult);
  const fallbackMode = recommendedContents.length === 0
    ? assessmentResult
      ? "assessment"
      : "no-assessment"
    : null;

  return {
    input,
    normalizedInput,
    matchedRuleId: rule.id,
    matchedKeywords,
    matchedSynonyms,
    matchScore: score,
    confidence: getDiagnosisConfidence(score),
    category: rule.category,
    problemTag: rule.problemTag,
    title: getDiagnosisTitle(rule.problemTag),
    summary: buildDiagnosisSummary(rule.causes, rule.fixes),
    causes: rule.causes,
    fixes: rule.fixes,
    drills: rule.drills,
    recommendedContents: finalContents,
    searchQueries: rule.searchQueries,
    fallbackUsed: recommendedContents.length === 0,
    fallbackMode,
    level
  };
}

export function getDefaultDiagnosisResult(
  level?: string,
  contentPool: ContentItem[] = contents,
  maxRecommendations = 3
): DiagnosisResult {
  const recommendedContents = getContentsByIds(
    DEFAULT_CONTENT_IDS,
    contentPool,
    maxRecommendations,
    level
  );

  return {
    input: "",
    normalizedInput: "",
    matchedRuleId: null,
    matchedKeywords: [],
    matchedSynonyms: [],
    matchScore: 0,
    confidence: "较低",
    category: ["general", "improvement"],
    problemTag: DEFAULT_PROBLEM_TAG,
    title: "直接描述你的问题",
    summary: "用一句话说出你的困惑，我们会先给你一个基础判断和推荐方向。",
    causes: DEFAULT_CAUSES,
    fixes: DEFAULT_FIXES,
    drills: DEFAULT_DRILLS,
    recommendedContents,
    searchQueries: null,
    fallbackUsed: true,
    fallbackMode: null,
    level
  };
}

export function getProblemPreviewTags(): string[] {
  return PROBLEM_PREVIEW_OPTIONS.map((item) => item.label);
}

export function getProblemPreviewOptions(): ProblemPreviewOption[] {
  return PROBLEM_PREVIEW_OPTIONS;
}
