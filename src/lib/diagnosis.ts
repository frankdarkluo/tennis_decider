import { contents } from "@/data/contents";
import { diagnosisRules } from "@/data/diagnosisRules";
import { DiagnosisResult, DiagnosisRule } from "@/types/diagnosis";
import { textIncludesAll } from "@/lib/utils";

export function normalizeInput(text: string) {
  return text.trim().toLowerCase().replace(/[，。！？、,!?]/g, " ").replace(/\s+/g, " ");
}

function scoreRule(input: string, rule: DiagnosisRule) {
  let score = 0;
  for (const keyword of rule.keywords) {
    if (input.includes(keyword.toLowerCase())) {
      score += 1;
    }
  }
  if (textIncludesAll(input, rule.keywords.map((k) => k.toLowerCase()))) {
    score += 1;
  }
  return score;
}

export function diagnoseText(text: string): DiagnosisResult {
  const normalized = normalizeInput(text);

  if (!normalized) {
    return {
      matched: false,
      problemTag: "no-plan",
      categories: ["training"],
      causes: ["尚未输入问题描述"],
      fixes: ["先用一句话描述你的困惑，例如“反手总下网”"],
      drills: ["先完成一次诊断，再查看针对练习建议"],
      recommendedContentIds: contents.slice(0, 3).map((item) => item.id),
      fallbackText: "输入越具体，诊断越准确。"
    };
  }

  let best: DiagnosisRule | null = null;
  let bestScore = 0;

  for (const rule of diagnosisRules) {
    const currentScore = scoreRule(normalized, rule);
    if (currentScore > bestScore) {
      bestScore = currentScore;
      best = rule;
    }
  }

  if (!best || bestScore <= 0) {
    return {
      matched: false,
      problemTag: "no-plan",
      categories: ["general"],
      causes: ["当前描述较泛，未匹配到高置信度规则"],
      fixes: ["补充“技术项 + 具体表现”，如“正手一发力就出界”"],
      drills: ["先做 15 分钟基础稳定性练习", "记录最常见失误类型"],
      recommendedContentIds: contents.slice(0, 3).map((item) => item.id),
      fallbackText: "已为你提供通用推荐，可继续细化描述获取更精准结果。"
    };
  }

  return {
    matched: true,
    matchedRuleId: best.id,
    problemTag: best.problemTag,
    categories: best.category,
    causes: best.causes,
    fixes: best.fixes,
    drills: best.drills,
    recommendedContentIds: best.recommendedContentIds
  };
}
