import { contents } from "../src/data/contents";
import { expandedContents } from "../src/data/expandedContents";
import { creators } from "../src/data/creators";
import { diagnosisRules } from "../src/data/diagnosisRules";
import { planTemplates } from "../src/data/planTemplates";

type ValidationIssue = {
  scope: string;
  message: string;
};

const issues: ValidationIssue[] = [];

const allContents = [...contents, ...expandedContents];
const contentIds = new Set(allContents.map((item) => item.id));
const creatorIds = new Set(creators.map((creator) => creator.id));
const problemTags = new Set(diagnosisRules.map((rule) => rule.problemTag));

for (const rule of diagnosisRules) {
  for (const contentId of rule.recommendedContentIds) {
    if (!contentIds.has(contentId)) {
      issues.push({
        scope: `diagnosisRules:${rule.id}`,
        message: `recommendedContentId "${contentId}" 在 contents.ts 中不存在`
      });
    }
  }
}

for (const item of allContents) {
  if (!creatorIds.has(item.creatorId)) {
    issues.push({
      scope: `content:${item.id}`,
      message: `creatorId "${item.creatorId}" 在 creators.ts 中不存在`
    });
  }

  if (!item.url.trim()) {
    issues.push({
      scope: `content:${item.id}`,
      message: "url 为空"
    });
  }
}

for (const template of planTemplates) {
  if (!problemTags.has(template.problemTag)) {
    issues.push({
      scope: `planTemplates:${template.problemTag}:${template.level}`,
      message: `problemTag "${template.problemTag}" 没有对应的 diagnosis rule`
    });
  }
}

const summaryLines = [
  `诊断规则: ${diagnosisRules.length} 条`,
  `静态内容: ${contents.length} 条`,
  `扩展内容: ${expandedContents.length} 条`,
  `总内容条目: ${allContents.length} 条`,
  `博主数量: ${creators.length} 位`,
  `训练计划: ${planTemplates.length} 套`
];

console.log("数据校验开始");
for (const line of summaryLines) {
  console.log(`- ${line}`);
}

if (issues.length === 0) {
  console.log("校验通过: 未发现数据一致性问题。");
  process.exit(0);
}

console.error(`校验失败: 共发现 ${issues.length} 个问题。`);
for (const issue of issues) {
  console.error(`- [${issue.scope}] ${issue.message}`);
}

process.exit(1);
