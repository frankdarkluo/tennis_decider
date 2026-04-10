import fs from "node:fs";
import path from "node:path";

export function resolveLogDir(env = process.env, homeDir = process.env.HOME ?? "") {
  return env.CODEX_LOG_DIR || path.join(homeDir, ".codex", "automation-logs", "tennis_level");
}

export function shouldRunDailyWindow({
  dateKey,
  hour,
  minute,
  lastRunDateKey,
  force = false
}) {
  if (force) {
    return true;
  }

  return hour === 23 && minute === 30 && lastRunDateKey !== dateKey;
}

export function shouldRunWeeklyWindow({
  weekKey,
  weekday,
  hour,
  minute,
  lastRunWeekKey,
  force = false
}) {
  if (force) {
    return true;
  }

  return weekday === 0 && hour === 23 && minute === 0 && lastRunWeekKey !== weekKey;
}

export function getWeekStartDateKey(date = new Date()) {
  const target = new Date(date);
  const day = target.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  target.setDate(target.getDate() + diffToMonday);
  target.setHours(0, 0, 0, 0);
  return formatDateKey(target);
}

export function filterGitStatusToModifiedSince(gitStatus, { sinceMs, resolveModifiedTimeMs }) {
  return gitStatus
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .filter((line) => {
      const filePath = line.slice(3).trim();
      return resolveModifiedTimeMs(filePath) >= sinceMs;
    })
    .join("\n");
}

export function hasMeaningfulDailySource({ commitLog, gitStatus }) {
  return commitLog.trim().length > 0 || gitStatus.trim().length > 0;
}

export function buildDailyCodexPrompt({
  dateKey,
  promptPath,
  organizePromptPath,
  targetPath,
  commitLog,
  gitStatus,
  existingNote,
  validationOutput
}) {
  return [
    `Please read \`${promptPath}\` and create or update only \`${targetPath}\`.`,
    "Do not modify files outside `docs/`.",
    `Invoke \`${organizePromptPath}\` only if there are clear documentation graph issues such as broken internal wiki links, stale references, dangling skill / prompt / template references, or orphaned operational notes.`,
    "",
    `Date key: ${dateKey}`,
    "",
    "<git_commit_log>",
    commitLog.trim() || "(none)",
    "</git_commit_log>",
    "",
    "<git_status>",
    gitStatus.trim() || "(none)",
    "</git_status>",
    "",
    "<existing_daily_note>",
    existingNote.trim() || "(none)",
    "</existing_daily_note>",
    "",
    "<validation_output>",
    validationOutput.trim() || "(not captured)",
    "</validation_output>"
  ].join("\n");
}

export function buildWeeklyCodexPrompt({
  weekKey,
  promptPath,
  organizePromptPath,
  targetPath,
  commitLog,
  gitStatus,
  progressNotes,
  validationOutput
}) {
  const notes = Object.entries(progressNotes)
    .map(([notePath, note]) => [`## ${notePath}`, note.trim() || "(empty)"].join("\n"))
    .join("\n\n");

  return [
    `Please read \`${promptPath}\` and create or update only \`${targetPath}\`.`,
    "Do not modify files outside `docs/`.",
    `Invoke \`${organizePromptPath}\` only if there are clear documentation graph issues.`,
    "",
    `Week key: ${weekKey}`,
    "",
    "<weekly_commit_log>",
    commitLog.trim() || "(none)",
    "</weekly_commit_log>",
    "",
    "<git_status>",
    gitStatus.trim() || "(none)",
    "</git_status>",
    "",
    "<weekly_progress_notes>",
    notes || "(none)",
    "</weekly_progress_notes>",
    "",
    "<validation_output>",
    validationOutput.trim() || "(not captured)",
    "</validation_output>"
  ].join("\n");
}

export function readTextIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

export function formatDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
