import fs from "node:fs";
import path from "node:path";
import { contents } from "../src/data/contents";
import { expandedContents } from "../src/data/expandedContents";
import { creators } from "../src/data/creators";

const snapshotVersion = process.env.NEXT_PUBLIC_STUDY_SNAPSHOT_VERSION?.trim() || "2026-03-29-v1";
const fixedSeed = process.env.NEXT_PUBLIC_STUDY_FIXED_SEED?.trim() || "20260329";
const outputDir = path.resolve(__dirname, "../src/data/studySnapshot");

const snapshotContents = [...contents, ...expandedContents];
const snapshotCreators = creators;

const metadata = {
  id: snapshotVersion,
  seed: fixedSeed,
  buildVersion: snapshotVersion,
  snapshotVersion,
  fixedSeed,
  sortingMode: "deterministic_study",
  createdAt: new Date().toISOString(),
  contentCount: snapshotContents.length,
  creatorCount: snapshotCreators.length,
  contentSetVersion: `content-${snapshotVersion}`,
  creatorSetVersion: `creators-${snapshotVersion}`,
  assessmentVersion: "adaptive-assessment-v2",
  diagnosisRulesVersion: "diagnosis-rules-v1",
  planTemplateVersion: "plan-templates-v1",
  localeBundleVersion: "core-locale-v1",
  rankingStrategyVersion: "study-seeded-v1",
  buildSha: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.trim() || null,
  randomSurfacingDisabled: true,
  viewCountBoostDisabled: true
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, `contents.${snapshotVersion}.json`),
  `${JSON.stringify(snapshotContents, null, 2)}\n`,
  "utf8"
);
fs.writeFileSync(
  path.join(outputDir, `creators.${snapshotVersion}.json`),
  `${JSON.stringify(snapshotCreators, null, 2)}\n`,
  "utf8"
);
fs.writeFileSync(
  path.join(outputDir, `metadata.${snapshotVersion}.json`),
  `${JSON.stringify(metadata, null, 2)}\n`,
  "utf8"
);

console.log(`snapshotVersion=${snapshotVersion}`);
console.log(`contents=${snapshotContents.length}`);
console.log(`creators=${snapshotCreators.length}`);
