import { contents } from "@/data/contents";
import { expandedContents } from "@/data/expandedContents";
import type { ContentItem } from "@/types/content";
import type { GeneratedPlan, PlanBlueprintRole, PlanIntent } from "@/types/plan";

const contentById = new Map([...contents, ...expandedContents].map((item) => [item.id, item]));

function getPrimarySkillSignals(intent: PlanIntent): string[] {
  switch (intent.skillFamily) {
    case "serve":
      return ["serve"];
    case "return":
      return ["return"];
    case "forehand":
      return ["forehand", "topspin"];
    case "backhand":
      return ["backhand", "slice"];
    case "net":
      return ["net", "doubles"];
    case "overhead":
      return ["overhead", "net", "footwork"];
    case "movement":
      return ["movement", "footwork"];
    case "mental":
      return ["mental", "matchplay"];
    case "tactics":
      return ["matchplay", "doubles"];
    default:
      return [];
  }
}

function scoreCandidate(item: ContentItem, intent: PlanIntent): number {
  const primarySignals = getPrimarySkillSignals(intent);
  const directProblemMatch = item.problemTags.includes(intent.primaryProblemTag) ? 8 : 0;
  const primarySkillMatch = item.skills.some((skill) => primarySignals.includes(skill)) ? 5 : 0;
  const contextMatch = intent.planContext?.primaryProblemTag && item.problemTags.includes(intent.planContext.primaryProblemTag) ? 3 : 0;

  return directProblemMatch + primarySkillMatch + contextMatch;
}

function buildLinkedContentReason(intent: PlanIntent, role: PlanBlueprintRole): string {
  if (intent.locale === "en") {
    if (role === "review_reset") {
      return "Use this content to review the cleanest version of the pattern before the next pressure block.";
    }
    if (role === "transfer") {
      return "Use this content today because it shows how the rebuilt pattern should survive inside a playable point fragment.";
    }
    if (role === "consolidation") {
      return "Use this content as the carry-forward reference when you decide what to keep next week.";
    }

    return "Use this content today because it reinforces the exact pattern this step is trying to stabilize.";
  }

  if (role === "review_reset") {
    return "今天挂这条内容，是为了先回看最干净的动作版本，再进入下一轮带压力重复。";
  }
  if (role === "transfer") {
    return "今天挂这条内容，是为了确认这条重建后的动作怎样带进可打的真实片段。";
  }
  if (role === "consolidation") {
    return "今天挂这条内容，是为了给下周保留一条可继续沿用的参考。";
  }

  return "今天挂这条内容，是为了让你看到这一步正在练的动作主线到底该长什么样。";
}

export function applyBlueprintContentLinks(plan: GeneratedPlan, intent: PlanIntent): GeneratedPlan {
  const primarySignals = getPrimarySkillSignals(intent);
  const rankedCandidates = intent.candidateContentIds
    .map((id, index) => ({ id, index, item: contentById.get(id) }))
    .filter((entry): entry is { id: string; index: number; item: ContentItem } => Boolean(entry.item))
    .sort((left, right) => {
      const scoreGap = scoreCandidate(right.item, intent) - scoreCandidate(left.item, intent);

      if (scoreGap !== 0) {
        return scoreGap;
      }

      return left.index - right.index;
    });
  const familyLockedCandidates = rankedCandidates.filter(({ item }) =>
    item.problemTags.includes(intent.primaryProblemTag) || item.skills.some((skill) => primarySignals.includes(skill))
  );
  const candidateIds = (familyLockedCandidates.length >= 3 ? familyLockedCandidates : rankedCandidates)
    .map((entry) => entry.id);

  if (candidateIds.length === 0) {
    return plan;
  }

  return {
    ...plan,
    days: plan.days.map((day, index) => {
      const contentId = candidateIds[index % candidateIds.length] ?? null;
      const role = intent.microcycle[index];

      return {
        ...day,
        contentIds: contentId ? [contentId] : [],
        linkedContentReason: contentId && role ? buildLinkedContentReason(intent, role) : null
      };
    })
  };
}
