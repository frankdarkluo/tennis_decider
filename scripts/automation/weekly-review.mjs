#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  buildWeeklyCodexPrompt,
  getWeekStartDateKey,
  readTextIfExists,
  shouldRunWeeklyWindow
} from "./lib/docsAutomation.mjs";

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, value = "1"] = arg.replace(/^--/, "").split("=");
  return [key, value];
}));

const now = new Date();
const weekKey = getIsoWeekKey(now);
const force = args.has("force");
const lastRunWeekKey = args.get("last-run-week-key") ?? "";

if (!shouldRunWeeklyWindow({
  weekKey,
  weekday: now.getDay(),
  hour: now.getHours(),
  minute: now.getMinutes(),
  lastRunWeekKey,
  force
})) {
  process.exit(10);
}

const repoRoot = path.resolve(new URL("../..", import.meta.url).pathname);
const weekStart = getWeekStartDateKey(now);
const targetPath = `docs/weekly/${weekKey}.md`;
const progressNotes = readProgressNotesForWeek(weekStart);
const commitLog = runGit(["log", "--since", `${weekStart}T00:00:00`, "--oneline", "--", "src", "public", "scripts", "supabase", "docs", "*.md"]);
const gitStatus = runGit(["status", "--short"]);

if (!force && Object.keys(progressNotes).length === 0 && commitLog.trim().length === 0 && gitStatus.trim().length === 0) {
  process.exit(11);
}

process.stdout.write(buildWeeklyCodexPrompt({
  weekKey,
  promptPath: "docs/prompts/WEEKLY_REVIEW_PROMPT.md",
  organizePromptPath: "docs/prompts/ORGANIZE.md",
  targetPath,
  commitLog,
  gitStatus,
  progressNotes,
  validationOutput: ""
}));

function readProgressNotesForWeek(weekStartDateKey) {
  const notesDir = path.join(repoRoot, "docs", "progress");
  if (!fs.existsSync(notesDir)) {
    return {};
  }

  const weekStartDate = new Date(`${weekStartDateKey}T00:00:00`);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  return Object.fromEntries(
    fs.readdirSync(notesDir)
      .filter((fileName) => /^\d{4}-\d{2}-\d{2}\.md$/.test(fileName))
      .filter((fileName) => {
        const noteDate = new Date(`${fileName.replace(/\.md$/, "")}T00:00:00`);
        return noteDate >= weekStartDate && noteDate <= weekEndDate;
      })
      .sort()
      .map((fileName) => {
        const notePath = path.join("docs", "progress", fileName);
        return [notePath, readTextIfExists(path.join(repoRoot, notePath))];
      })
  );
}

function getIsoWeekKey(date) {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const week1 = new Date(target.getFullYear(), 0, 4);
  const week = 1 + Math.round(((target.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${target.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function runGit(args) {
  try {
    return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" });
  } catch {
    return "";
  }
}
