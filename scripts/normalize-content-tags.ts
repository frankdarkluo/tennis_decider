import fs from "node:fs";
import path from "node:path";

import { contents } from "../src/data/contents";
import { expandedContents } from "../src/data/expandedContents";
import {
  CONTENT_PROBLEM_TAG_ALIASES,
  getMissingCanonicalTagPairs,
  getNormalizedProblemTagSignature,
  isDirectLibraryVideo,
  normalizeProblemTags,
  uniqueStrings
} from "./lib/contentNormalization";

type MissingTagIssue = {
  id: string;
  source: "curated" | "expanded";
  missingPairs: Array<{ legacyTag: string; canonicalTag: string }>;
};

const checkMode = process.argv.includes("--check");
const applyMode = process.argv.includes("--apply");
const includeExpandedOutput = process.argv.includes("--include-expanded");
const strictExpanded = process.argv.includes("--strict-expanded");

function arraysEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

function buildNormalizedExpandedContents() {
  return expandedContents.map((item) => ({
    ...item,
    problemTags: normalizeProblemTags(item.problemTags)
  }));
}

function writeExpandedContentsWithCanonicalTags(normalizedExpanded: typeof expandedContents) {
  const outputPath = path.resolve(__dirname, "../src/data/expandedContents.ts");
  const source = [
    'import type { ContentItem } from "@/types/content";',
    "",
    `export const expandedContents: ContentItem[] = ${JSON.stringify(normalizedExpanded, null, 2)};`,
    ""
  ].join("\n");

  fs.writeFileSync(outputPath, source, "utf8");
}

const normalizedExpandedContents = buildNormalizedExpandedContents();
let effectiveExpandedContents = expandedContents;

if (applyMode) {
  const changedCount = normalizedExpandedContents.reduce((count, item, index) => {
    return count + (arraysEqual(item.problemTags, expandedContents[index]?.problemTags ?? []) ? 0 : 1);
  }, 0);

  if (changedCount === 0) {
    console.log("apply 模式: expandedContents 无需补齐，未写入文件。");
  } else {
    writeExpandedContentsWithCanonicalTags(normalizedExpandedContents);
    console.log(`apply 模式: 已为 expandedContents 补齐 canonical 标签，更新 ${changedCount} 条。`);
  }

  effectiveExpandedContents = normalizedExpandedContents;
}

const allItems = [
  ...contents.map((item) => ({ ...item, source: "curated" as const })),
  ...effectiveExpandedContents.map((item) => ({ ...item, source: "expanded" as const }))
];

const missingIssues: MissingTagIssue[] = [];
const legacyTagUsageCount = new Map<string, number>();
const normalizedExpansionCountBySource = new Map<"curated" | "expanded", number>([
  ["curated", 0],
  ["expanded", 0]
]);

for (const item of allItems) {
  for (const tag of item.problemTags) {
    if (CONTENT_PROBLEM_TAG_ALIASES[tag]) {
      legacyTagUsageCount.set(tag, (legacyTagUsageCount.get(tag) ?? 0) + 1);
    }
  }

  const normalizedTags = normalizeProblemTags(item.problemTags);
  if (normalizedTags.length > item.problemTags.length) {
    normalizedExpansionCountBySource.set(
      item.source,
      (normalizedExpansionCountBySource.get(item.source) ?? 0) + 1
    );
  }

  const missingPairs = getMissingCanonicalTagPairs(item.problemTags);
  if (missingPairs.length > 0) {
    missingIssues.push({
      id: item.id,
      source: item.source,
      missingPairs
    });
  }
}

const curatedDirectMissing = missingIssues.filter((issue) => {
  if (issue.source !== "curated") {
    return false;
  }

  const item = contents.find((entry) => entry.id === issue.id);
  return Boolean(item && isDirectLibraryVideo(item));
});

const expandedMissing = missingIssues.filter((issue) => issue.source === "expanded");

const expandedConcentrationMap = new Map<string, string[]>();
for (const item of effectiveExpandedContents) {
  const signature = getNormalizedProblemTagSignature(item.problemTags);
  const key = `${item.creatorId}::${signature}`;
  const group = expandedConcentrationMap.get(key) ?? [];
  group.push(item.id);
  expandedConcentrationMap.set(key, group);
}

const concentratedExpandedGroups = [...expandedConcentrationMap.entries()]
  .filter(([, ids]) => ids.length >= 8)
  .sort((left, right) => right[1].length - left[1].length);

console.log("离线标签归一化报告");
console.log(`- curated 条目: ${contents.length}`);
console.log(`- expanded 条目: ${effectiveExpandedContents.length}`);
console.log(`- legacy 标签使用总数: ${[...legacyTagUsageCount.values()].reduce((sum, count) => sum + count, 0)}`);
console.log(`- 归一化后标签扩展条目( curated ): ${normalizedExpansionCountBySource.get("curated") ?? 0}`);
console.log(`- 归一化后标签扩展条目( expanded ): ${normalizedExpansionCountBySource.get("expanded") ?? 0}`);
console.log(`- curated 直链缺失 canonical 标签: ${curatedDirectMissing.length}`);
console.log(`- expanded 缺失 canonical 标签: ${expandedMissing.length}`);
console.log(`- expanded 高集中簇(>=8): ${concentratedExpandedGroups.length}`);

if (legacyTagUsageCount.size > 0) {
  console.log("legacy 标签分布:");
  [...legacyTagUsageCount.entries()]
    .sort((left, right) => right[1] - left[1])
    .forEach(([legacyTag, count]) => {
      const canonicalTags = CONTENT_PROBLEM_TAG_ALIASES[legacyTag] ?? [];
      console.log(`- ${legacyTag} (${count}) -> ${canonicalTags.join(",")}`);
    });
}

if (curatedDirectMissing.length > 0) {
  console.error("curated 直链缺失 canonical 标签清单:");
  for (const issue of curatedDirectMissing) {
    const pairs = uniqueStrings(issue.missingPairs.map((pair) => `${pair.legacyTag}->${pair.canonicalTag}`));
    console.error(`- ${issue.id}: ${pairs.join(", ")}`);
  }
}

if (includeExpandedOutput && expandedMissing.length > 0) {
  console.warn("expanded 缺失 canonical 标签样例(最多50条):");
  for (const issue of expandedMissing.slice(0, 50)) {
    const pairs = uniqueStrings(issue.missingPairs.map((pair) => `${pair.legacyTag}->${pair.canonicalTag}`));
    console.warn(`- ${issue.id}: ${pairs.join(", ")}`);
  }
}

if (concentratedExpandedGroups.length > 0) {
  console.warn("expanded 高集中簇样例(最多20条):");
  for (const [groupKey, ids] of concentratedExpandedGroups.slice(0, 20)) {
    console.warn(`- ${groupKey}: ${ids.length} 条`);
  }
}

if (!checkMode) {
  process.exit(0);
}

if (curatedDirectMissing.length === 0 && (!strictExpanded || expandedMissing.length === 0)) {
  console.log("check 模式通过: 没有发现阻断性 canonical 标签缺失。");
  process.exit(0);
}

const failCount = strictExpanded
  ? curatedDirectMissing.length + expandedMissing.length
  : curatedDirectMissing.length;
console.error(`check 模式失败: ${failCount} 个条目存在 canonical 标签缺失。`);
process.exit(1);
