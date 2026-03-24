import { contents } from "@/data/contents";
import { diagnosisRules } from "@/data/diagnosisRules";
import { ContentItem } from "@/types/content";
import { DiagnosisConfidence, DiagnosisResult, DiagnosisRule } from "@/types/diagnosis";

export type DiagnoseOptions = {
  level?: string;
  maxRecommendations?: number;
  rules?: DiagnosisRule[];
  contentPool?: ContentItem[];
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

export function getContentsByIds(
  ids: string[],
  contentPool: ContentItem[] = contents,
  maxRecommendations = 3,
  level?: string
): ContentItem[] {
  const mapped = ids
    .map((id) => contentPool.find((item) => item.id === id))
    .filter((item): item is ContentItem => Boolean(item));

  const filteredByLevel =
    level && mapped.some((item) => item.levels.includes(level))
      ? mapped.filter((item) => item.levels.includes(level))
      : mapped;

  return filteredByLevel.slice(0, maxRecommendations);
}

export function getFallbackContents(
  input: string,
  contentPool: ContentItem[] = contents,
  maxRecommendations = 3,
  level?: string
): ContentItem[] {
  const normalized = normalizeDiagnosisInput(input);

  const byUseCases = contentPool.filter((item) =>
    (item.useCases ?? []).some((useCase) => normalized.includes(normalizeDiagnosisInput(useCase)))
  );
  if (byUseCases.length > 0) {
    const levelFiltered =
      level && byUseCases.some((item) => item.levels.includes(level))
        ? byUseCases.filter((item) => item.levels.includes(level))
        : byUseCases;
    return levelFiltered.slice(0, maxRecommendations);
  }

  const skillHints = [
    { key: "发球", skill: "serve" },
    { key: "二发", skill: "serve" },
    { key: "反手", skill: "backhand" },
    { key: "正手", skill: "forehand" },
    { key: "网前", skill: "net" },
    { key: "截击", skill: "net" },
    { key: "步伐", skill: "movement" },
    { key: "移动", skill: "movement" },
    { key: "比赛", skill: "matchplay" },
    { key: "双打", skill: "doubles" }
  ];

  const hintedSkill = skillHints.find((item) => normalized.includes(item.key))?.skill;

  let candidates = hintedSkill
    ? contentPool.filter((item) => item.skills.includes(hintedSkill))
    : contentPool;

  if (level && candidates.some((item) => item.levels.includes(level))) {
    candidates = candidates.filter((item) => item.levels.includes(level));
  }

  if (candidates.length === 0) {
    candidates = DEFAULT_CONTENT_IDS
      .map((id) => contentPool.find((item) => item.id === id))
      .filter((item): item is ContentItem => Boolean(item));
  }

  return candidates.slice(0, maxRecommendations);
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
      level
    );

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
      title: getDiagnosisTitle(DEFAULT_PROBLEM_TAG),
      summary: buildDiagnosisSummary(DEFAULT_CAUSES, DEFAULT_FIXES, true),
      causes: DEFAULT_CAUSES,
      fixes: DEFAULT_FIXES,
      drills: DEFAULT_DRILLS,
      recommendedContents: fallbackContents,
      fallbackUsed: true,
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
      : getFallbackContents(normalizedInput, contentPool, maxRecommendations, level);

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
    fallbackUsed: recommendedContents.length === 0,
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
    fallbackUsed: true,
    level
  };
}

export function getProblemPreviewTags(): string[] {
  return ["反手总是下网", "发球没有旋转", "正手一发力就出界", "不知道怎么打双打", "比赛一紧张就乱"];
}
