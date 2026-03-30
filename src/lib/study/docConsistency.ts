import fs from "node:fs";
import path from "node:path";

type DocConsistencyInput = {
  rootDir: string;
  envExampleText?: string;
  readFile?: (filePath: string) => string;
  fileExists?: (filePath: string) => boolean;
  snapshotVersion: string;
  fixedSeed: string;
};

type DocConsistencyResult = {
  ok: boolean;
  errors: string[];
};

const REQUIRED_DOCS = [
  "AGENTS.md",
  "Efficiency.md",
  "TennisLevel_ACTIONABILITY_AND_SORT_FREEZE_PLAN.md",
  "TennisLevel_USER_RESEARCH_BACKLOG_P0_P1_P2_v2.md",
  "TennisLevel_EVENT_TRACKING_PLAN_NO_VIDEO.md"
] as const;

const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_ADMIN_EMAILS",
  "NEXT_PUBLIC_STUDY_SNAPSHOT_VERSION",
  "NEXT_PUBLIC_STUDY_FIXED_SEED"
] as const;

function includesValue(text: string, key: string, value: string) {
  return text.includes(`${key}=${value}`);
}

export function runStudyDocConsistencyChecks(input: DocConsistencyInput): DocConsistencyResult {
  const readFile = input.readFile ?? ((filePath: string) => fs.readFileSync(filePath, "utf8"));
  const fileExists = input.fileExists ?? ((filePath: string) => fs.existsSync(filePath));
  const errors: string[] = [];

  REQUIRED_DOCS.forEach((relativePath) => {
    const filePath = path.join(input.rootDir, relativePath);
    if (!fileExists(filePath)) {
      errors.push(`Missing required doc: ${relativePath}`);
    }
  });

  const envExampleText = input.envExampleText ?? readFile(path.join(input.rootDir, ".env.example"));
  REQUIRED_ENV_KEYS.forEach((key) => {
    if (!envExampleText.includes(`${key}=`)) {
      errors.push(`Missing env key in .env.example: ${key}`);
    }
  });

  if (!includesValue(envExampleText, "NEXT_PUBLIC_STUDY_SNAPSHOT_VERSION", input.snapshotVersion)) {
    errors.push(`.env.example snapshot version mismatch: expected ${input.snapshotVersion}`);
  }

  if (!includesValue(envExampleText, "NEXT_PUBLIC_STUDY_FIXED_SEED", input.fixedSeed)) {
    errors.push(`.env.example fixed seed mismatch: expected ${input.fixedSeed}`);
  }

  const readme = readFile(path.join(input.rootDir, "README.md"));
  const freezePlan = readFile(path.join(input.rootDir, "TennisLevel_ACTIONABILITY_AND_SORT_FREEZE_PLAN.md"));
  const metadataPath = path.join(input.rootDir, "src/data/studySnapshot", `metadata.${input.snapshotVersion}.json`);

  if (!fileExists(metadataPath)) {
    errors.push(`Missing snapshot metadata file: metadata.${input.snapshotVersion}.json`);
  } else {
    const metadata = JSON.parse(readFile(metadataPath)) as { snapshotVersion?: string; fixedSeed?: string | number };
    if (String(metadata.snapshotVersion ?? "") !== input.snapshotVersion) {
      errors.push(`Snapshot metadata version mismatch: expected ${input.snapshotVersion}`);
    }
    if (String(metadata.fixedSeed ?? "") !== input.fixedSeed) {
      errors.push(`Snapshot metadata fixedSeed mismatch: expected ${input.fixedSeed}`);
    }
  }

  if (!includesValue(readme, "NEXT_PUBLIC_STUDY_SNAPSHOT_VERSION", input.snapshotVersion)) {
    errors.push(`README snapshot version mismatch: expected ${input.snapshotVersion}`);
  }

  if (!includesValue(readme, "NEXT_PUBLIC_STUDY_FIXED_SEED", input.fixedSeed)) {
    errors.push(`README fixed seed mismatch: expected ${input.fixedSeed}`);
  }

  if (!includesValue(freezePlan, "NEXT_PUBLIC_STUDY_SNAPSHOT_VERSION", input.snapshotVersion)) {
    errors.push(`Freeze plan snapshot version mismatch: expected ${input.snapshotVersion}`);
  }

  if (!includesValue(freezePlan, "NEXT_PUBLIC_STUDY_FIXED_SEED", input.fixedSeed)) {
    errors.push(`Freeze plan fixed seed mismatch: expected ${input.fixedSeed}`);
  }

  return {
    ok: errors.length === 0,
    errors
  };
}
