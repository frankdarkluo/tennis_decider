import { describe, expect, it } from "vitest";
import { diagnoseStudyValidationResults } from "@/lib/study/remoteValidation";

describe("diagnoseStudyValidationResults", () => {
  it("classifies missing tables and columns from remote Supabase validation output", () => {
    const diagnosis = diagnoseStudyValidationResults([
      {
        name: "study_participants",
        ok: false,
        message: "Could not find the table 'public.study_participants' in the schema cache"
      },
      {
        name: "study_sessions",
        ok: false,
        message: "Could not find the table 'public.study_sessions' in the schema cache"
      },
      {
        name: "event_logs",
        ok: false,
        message: "Could not find the 'build_version' column of 'event_logs' in the schema cache"
      },
      {
        name: "study_task_ratings",
        ok: false,
        message: "Could not find the table 'public.study_task_ratings' in the schema cache"
      },
      {
        name: "study_artifacts",
        ok: false,
        message: "Could not find the table 'public.study_artifacts' in the schema cache"
      },
      {
        name: "survey_responses",
        ok: false,
        message: "Could not find the 'build_version' column of 'survey_responses' in the schema cache"
      }
    ]);

    expect(diagnosis.ready).toBe(false);
    expect(diagnosis.missingTables).toEqual([
      "study_artifacts",
      "study_participants",
      "study_sessions",
      "study_task_ratings"
    ]);
    expect(diagnosis.missingColumns).toEqual([
      { table: "event_logs", column: "build_version" },
      { table: "survey_responses", column: "build_version" }
    ]);
    expect(diagnosis.recommendedSqlFiles).toEqual([
      "supabase/research_infra.sql",
      "supabase/study_mode.sql"
    ]);
    expect(diagnosis.nextAction).toContain("research_infra.sql");
    expect(diagnosis.nextAction).toContain("study_mode.sql");
  });
});
