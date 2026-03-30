import { describe, expect, it } from "vitest";
import { runStudyDocConsistencyChecks } from "@/lib/study/docConsistency";

describe("study doc consistency", () => {
  it("reports a clean result when required docs, env keys, and snapshot values align", () => {
    const result = runStudyDocConsistencyChecks({
      rootDir: "/repo",
      envExampleText: [
        "NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com",
        "NEXT_PUBLIC_STUDY_SNAPSHOT_VERSION=2026-03-29-v1",
        "NEXT_PUBLIC_STUDY_FIXED_SEED=20260329"
      ].join("\n"),
      readFile: (filePath) => {
        if (filePath === "/repo/README.md") {
          return "NEXT_PUBLIC_STUDY_SNAPSHOT_VERSION=2026-03-29-v1\nNEXT_PUBLIC_STUDY_FIXED_SEED=20260329";
        }

        if (filePath === "/repo/TennisLevel_ACTIONABILITY_AND_SORT_FREEZE_PLAN.md") {
          return "NEXT_PUBLIC_STUDY_SNAPSHOT_VERSION=2026-03-29-v1\nNEXT_PUBLIC_STUDY_FIXED_SEED=20260329";
        }

        if (filePath === "/repo/src/data/studySnapshot/metadata.2026-03-29-v1.json") {
          return JSON.stringify({ snapshotVersion: "2026-03-29-v1", fixedSeed: "20260329" });
        }

        return "";
      },
      fileExists: (filePath) => [
        "/repo/AGENTS.md",
        "/repo/Efficiency.md",
        "/repo/TennisLevel_ACTIONABILITY_AND_SORT_FREEZE_PLAN.md",
        "/repo/TennisLevel_USER_RESEARCH_BACKLOG_P0_P1_P2_v2.md",
        "/repo/TennisLevel_EVENT_TRACKING_PLAN_NO_VIDEO.md",
        "/repo/src/data/studySnapshot/metadata.2026-03-29-v1.json"
      ].includes(filePath),
      snapshotVersion: "2026-03-29-v1",
      fixedSeed: "20260329"
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
