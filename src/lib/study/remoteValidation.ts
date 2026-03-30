import {
  CURRENT_STUDY_ID,
  STUDY_FIXED_SEED,
  STUDY_SNAPSHOT_VERSION
} from "./config";
import { StudyLanguage, StudySession } from "../../types/study";

export type StudyValidationFixture = {
  participant: {
    study_id: string;
    participant_id: string;
    latest_session_id: string;
    language: StudyLanguage;
    condition: string;
    latest_snapshot_id: string;
    latest_build_version: string;
    updated_at: string;
  };
  session: {
    study_id: string;
    participant_id: string;
    session_id: string;
    study_mode: true;
    language: StudyLanguage;
    condition: string;
    snapshot_id: string;
    snapshot_seed: string;
    build_version: string;
    started_at: string;
    ended_at: string | null;
  };
  event: {
    session_id: string;
    participant_id: string;
    study_mode: true;
    language: StudyLanguage;
    condition: string;
    snapshot_id: string;
    snapshot_seed: string;
    build_version: string;
    timestamp: string;
    page: string;
    event_type: "study.validation_ping";
    event_data: Record<string, unknown>;
    duration_ms: number;
  };
  rating: {
    study_id: string;
    participant_id: string;
    session_id: string;
    task_id: "task_1_problem_entry";
    metric_name: "actionability";
    score: 6;
    language: StudyLanguage;
    submitted_at: string;
  };
  artifact: {
    study_id: string;
    participant_id: string;
    session_id: string;
    study_mode: true;
    language: StudyLanguage;
    condition: string;
    snapshot_id: string;
    snapshot_seed: string;
    build_version: string;
    artifact_type: "study_resume";
    payload: Record<string, unknown>;
    created_at: string;
  };
  survey: {
    session_id: string;
    participant_id: string;
    study_id: string;
    study_mode: true;
    language: StudyLanguage;
    condition: string;
    snapshot_id: string;
    snapshot_seed: string;
    build_version: string;
    responses: Record<string, unknown>;
    sus_score: number;
  };
};

export type StudyValidationResult = {
  name: string;
  ok: boolean;
  message: string;
};

export type StudyValidationDiagnosis = {
  ready: boolean;
  missingTables: string[];
  missingColumns: Array<{ table: string; column: string }>;
  recommendedSqlFiles: string[];
  nextAction: string;
};

export function createStudyValidationSession(input?: {
  participantId?: string;
  language?: StudyLanguage;
  timestamp?: string;
}): StudySession {
  const timestamp = input?.timestamp ?? new Date().toISOString();
  const token = timestamp.replace(/[^0-9]/g, "").slice(0, 14);
  const language = input?.language ?? "en";
  const participantId = input?.participantId ?? `VALIDATE_${token}`;

  return {
    studyId: CURRENT_STUDY_ID,
    participantId,
    sessionId: `validate_${token}`,
    studyMode: true,
    language,
    condition: `lang_${language}`,
    snapshotId: STUDY_SNAPSHOT_VERSION,
    snapshotSeed: STUDY_FIXED_SEED,
    buildVersion: STUDY_SNAPSHOT_VERSION,
    startedAt: timestamp,
    endedAt: null
  };
}

export function createStudyValidationFixture(session: StudySession): StudyValidationFixture {
  const timestamp = session.startedAt;

  return {
    participant: {
      study_id: session.studyId,
      participant_id: session.participantId,
      latest_session_id: session.sessionId,
      language: session.language,
      condition: session.condition,
      latest_snapshot_id: session.snapshotId,
      latest_build_version: session.buildVersion,
      updated_at: timestamp
    },
    session: {
      study_id: session.studyId,
      participant_id: session.participantId,
      session_id: session.sessionId,
      study_mode: true,
      language: session.language,
      condition: session.condition,
      snapshot_id: session.snapshotId,
      snapshot_seed: session.snapshotSeed,
      build_version: session.buildVersion,
      started_at: timestamp,
      ended_at: null
    },
    event: {
      session_id: session.sessionId,
      participant_id: session.participantId,
      study_mode: true,
      language: session.language,
      condition: session.condition,
      snapshot_id: session.snapshotId,
      snapshot_seed: session.snapshotSeed,
      build_version: session.buildVersion,
      timestamp,
      page: "/study/start",
      event_type: "study.validation_ping",
      event_data: {
        studyId: session.studyId,
        appMode: "study",
        tsClient: Date.parse(timestamp),
        source: "scripts/verify-study-remote.ts"
      },
      duration_ms: 321
    },
    rating: {
      study_id: session.studyId,
      participant_id: session.participantId,
      session_id: session.sessionId,
      task_id: "task_1_problem_entry",
      metric_name: "actionability",
      score: 6,
      language: session.language,
      submitted_at: timestamp
    },
    artifact: {
      study_id: session.studyId,
      participant_id: session.participantId,
      session_id: session.sessionId,
      study_mode: true,
      language: session.language,
      condition: session.condition,
      snapshot_id: session.snapshotId,
      snapshot_seed: session.snapshotSeed,
      build_version: session.buildVersion,
      artifact_type: "study_resume",
      payload: {
        source: "scripts/verify-study-remote.ts",
        validatedAt: timestamp
      },
      created_at: timestamp
    },
    survey: {
      session_id: session.sessionId,
      participant_id: session.participantId,
      study_id: session.studyId,
      study_mode: true,
      language: session.language,
      condition: session.condition,
      snapshot_id: session.snapshotId,
      snapshot_seed: session.snapshotSeed,
      build_version: session.buildVersion,
      responses: {
        q6: 4,
        q7: 4,
        q23: "Synthetic validation response"
      },
      sus_score: 68
    }
  };
}

export function diagnoseStudyValidationResults(results: StudyValidationResult[]): StudyValidationDiagnosis {
  const missingTables = new Set<string>();
  const missingColumns = new Map<string, { table: string; column: string }>();

  results.forEach((result) => {
    if (result.ok) {
      return;
    }

    const tableMatch = result.message.match(/table 'public\.([^']+)'/i);
    if (tableMatch) {
      missingTables.add(tableMatch[1]);
    }

    const columnMatch = result.message.match(/'([^']+)' column of '([^']+)'/i);
    if (columnMatch) {
      const entry = {
        column: columnMatch[1],
        table: columnMatch[2]
      };
      missingColumns.set(`${entry.table}.${entry.column}`, entry);
    }
  });

  const sortedMissingTables = Array.from(missingTables).sort();
  const sortedMissingColumns = Array.from(missingColumns.values()).sort((left, right) => {
    const tableCompare = left.table.localeCompare(right.table);
    if (tableCompare !== 0) {
      return tableCompare;
    }

    return left.column.localeCompare(right.column);
  });
  const needsResearchInfra = sortedMissingColumns.some((entry) => (
    entry.table === "event_logs" || entry.table === "survey_responses"
  ));
  const needsStudyMode = sortedMissingTables.some((table) => (
    table.startsWith("study_")
  )) || sortedMissingColumns.some((entry) => (
    entry.column === "build_version"
  ));
  const recommendedSqlFiles = [
    needsResearchInfra ? "supabase/research_infra.sql" : null,
    needsStudyMode ? "supabase/study_mode.sql" : null
  ].filter((value): value is string => Boolean(value));

  return {
    ready: results.every((result) => result.ok),
    missingTables: sortedMissingTables,
    missingColumns: sortedMissingColumns,
    recommendedSqlFiles,
    nextAction: recommendedSqlFiles.length > 0
      ? `Run ${recommendedSqlFiles.join(" then ")}, then rerun npm run validate:study-remote.`
      : "Inspect the raw validation errors and compare them against the live Supabase schema."
  };
}
