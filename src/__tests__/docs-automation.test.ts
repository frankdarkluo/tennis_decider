import { describe, expect, it } from "vitest";

import {
  buildDailyCodexPrompt,
  buildWeeklyCodexPrompt,
  filterGitStatusToModifiedSince,
  getWeekStartDateKey,
  hasMeaningfulDailySource,
  resolveLogDir,
  shouldRunDailyWindow,
  shouldRunWeeklyWindow
} from "../../scripts/automation/lib/docsAutomation.mjs";

describe("docs automation helpers", () => {
  it("resolves the default log directory under the user's codex home", () => {
    expect(resolveLogDir({}, "/Users/example")).toBe(
      "/Users/example/.codex/automation-logs/tennis_level"
    );
  });

  it("allows the log directory to be overridden by CODEX_LOG_DIR", () => {
    expect(resolveLogDir({ CODEX_LOG_DIR: "/tmp/tennis-logs" }, "/Users/example")).toBe(
      "/tmp/tennis-logs"
    );
  });

  it("builds a daily codex prompt with docs-only scope and explicit organize triggers", () => {
    const prompt = buildDailyCodexPrompt({
      dateKey: "2026-04-01",
      promptPath: "docs/prompts/DAILY_PROGRESS_PROMPT.md",
      organizePromptPath: "docs/prompts/ORGANIZE.md",
      targetPath: "docs/progress/2026-04-01.md",
      commitLog: "feat: tighten docs graph",
      gitStatus: "M docs/index.md",
      existingNote: "# 2026-04-01 Progress",
      validationOutput: "build ok"
    });

    expect(prompt).toContain("read `docs/prompts/DAILY_PROGRESS_PROMPT.md`");
    expect(prompt).toContain("create or update only `docs/progress/2026-04-01.md`");
    expect(prompt).toContain("Do not modify files outside `docs/`.");
    expect(prompt).toContain("Invoke `docs/prompts/ORGANIZE.md` only if");
    expect(prompt).toContain("broken internal wiki links");
    expect(prompt).toContain("<git_commit_log>");
    expect(prompt).toContain("<git_status>");
    expect(prompt).toContain("<existing_daily_note>");
    expect(prompt).toContain("<validation_output>");
  });

  it("builds a weekly codex prompt with weekly inputs and docs-only scope", () => {
    const prompt = buildWeeklyCodexPrompt({
      weekKey: "2026-W14",
      promptPath: "docs/prompts/WEEKLY_REVIEW_PROMPT.md",
      organizePromptPath: "docs/prompts/ORGANIZE.md",
      targetPath: "docs/weekly/2026-W14.md",
      commitLog: "docs: add weekly backlinks",
      gitStatus: "M docs/weekly/2026-W14.md",
      progressNotes: {
        "docs/progress/2026-03-30.md": "# 2026-03-30 Progress",
        "docs/progress/2026-03-31.md": "# 2026-03-31 Progress"
      },
      validationOutput: ""
    });

    expect(prompt).toContain("read `docs/prompts/WEEKLY_REVIEW_PROMPT.md`");
    expect(prompt).toContain("create or update only `docs/weekly/2026-W14.md`");
    expect(prompt).toContain("Do not modify files outside `docs/`.");
    expect(prompt).toContain("<weekly_progress_notes>");
    expect(prompt).toContain("docs/progress/2026-03-30.md");
    expect(prompt).toContain("docs/progress/2026-03-31.md");
  });

  it("runs the daily job only in the target Edmonton minute and only once per day", () => {
    expect(
      shouldRunDailyWindow({
        dateKey: "2026-04-01",
        hour: 23,
        minute: 30,
        lastRunDateKey: ""
      })
    ).toBe(true);

    expect(
      shouldRunDailyWindow({
        dateKey: "2026-04-01",
        hour: 23,
        minute: 29,
        lastRunDateKey: ""
      })
    ).toBe(false);

    expect(
      shouldRunDailyWindow({
        dateKey: "2026-04-01",
        hour: 23,
        minute: 30,
        lastRunDateKey: "2026-04-01"
      })
    ).toBe(false);
  });

  it("runs the weekly job only in the Sunday target minute and only once per week", () => {
    expect(
      shouldRunWeeklyWindow({
        weekKey: "2026-W14",
        weekday: 0,
        hour: 23,
        minute: 0,
        lastRunWeekKey: ""
      })
    ).toBe(true);

    expect(
      shouldRunWeeklyWindow({
        weekKey: "2026-W14",
        weekday: 1,
        hour: 23,
        minute: 0,
        lastRunWeekKey: ""
      })
    ).toBe(false);

    expect(
      shouldRunWeeklyWindow({
        weekKey: "2026-W14",
        weekday: 0,
        hour: 23,
        minute: 0,
        lastRunWeekKey: "2026-W14"
      })
    ).toBe(false);
  });

  it("computes the Monday start date for the current ISO week", () => {
    expect(getWeekStartDateKey(new Date(2026, 3, 1, 12, 0, 0))).toBe("2026-03-30");
  });

  it("filters git status down to files modified inside the target window", () => {
    const gitStatus = [
      " M docs/index.md",
      " M docs/progress/2026-04-01.md",
      "?? docs/progress/2026-04-02.md"
    ].join("\n");

    const filtered = filterGitStatusToModifiedSince(gitStatus, {
      sinceMs: 1_000,
      resolveModifiedTimeMs(filePath) {
        const byPath = {
          "docs/index.md": 900,
          "docs/progress/2026-04-01.md": 1_500,
          "docs/progress/2026-04-02.md": 2_000
        };

        return byPath[filePath] ?? 0;
      }
    });

    expect(filtered).toBe([" M docs/progress/2026-04-01.md", "?? docs/progress/2026-04-02.md"].join("\n"));
  });

  it("treats only same-window commit or status signals as meaningful daily progress", () => {
    expect(hasMeaningfulDailySource({ commitLog: "", gitStatus: "" })).toBe(false);
    expect(hasMeaningfulDailySource({ commitLog: "feat: update study docs", gitStatus: "" })).toBe(true);
    expect(hasMeaningfulDailySource({ commitLog: "", gitStatus: " M docs/index.md" })).toBe(true);
  });
});
