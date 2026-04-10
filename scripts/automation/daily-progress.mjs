#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  buildDailyCodexPrompt,
  filterGitStatusToModifiedSince,
  formatDateKey,
  hasMeaningfulDailySource,
  readTextIfExists,
  shouldRunDailyWindow
} from "./lib/docsAutomation.mjs";

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, value = "1"] = arg.replace(/^--/, "").split("=");
  return [key, value];
}));

const now = new Date();
const dateKey = formatDateKey(now);
const force = args.has("force");
const lastRunDateKey = args.get("last-run-date-key") ?? "";

if (!shouldRunDailyWindow({
  dateKey,
  hour: now.getHours(),
  minute: now.getMinutes(),
  lastRunDateKey,
  force
})) {
  process.exit(10);
}

const repoRoot = path.resolve(new URL("../..", import.meta.url).pathname);
const dayStart = new Date(now);
dayStart.setHours(0, 0, 0, 0);
const since = dayStart.toISOString();
const targetPath = `docs/progress/${dateKey}.md`;
const commitLog = runGit(["log", "--since", since, "--oneline", "--", "src", "public", "scripts", "supabase", "docs", "*.md"]);
const gitStatus = filterGitStatusToModifiedSince(runGit(["status", "--short"]), {
  sinceMs: dayStart.getTime(),
  resolveModifiedTimeMs(filePath) {
    try {
      return fs.statSync(path.join(repoRoot, filePath)).mtimeMs;
    } catch {
      return 0;
    }
  }
});

if (!force && !hasMeaningfulDailySource({ commitLog, gitStatus })) {
  process.exit(11);
}

process.stdout.write(buildDailyCodexPrompt({
  dateKey,
  promptPath: "docs/prompts/DAILY_PROGRESS_PROMPT.md",
  organizePromptPath: "docs/prompts/ORGANIZE.md",
  targetPath,
  commitLog,
  gitStatus,
  existingNote: readTextIfExists(path.join(repoRoot, targetPath)),
  validationOutput: ""
}));

function runGit(args) {
  try {
    return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" });
  } catch {
    return "";
  }
}
