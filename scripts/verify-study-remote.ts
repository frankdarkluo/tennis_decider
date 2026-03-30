import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import {
  createStudyValidationFixture,
  createStudyValidationSession,
  diagnoseStudyValidationResults,
  StudyValidationResult
} from "../src/lib/study/remoteValidation";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function ensureSupabaseEnv() {
  loadEnvFile(path.resolve(process.cwd(), ".env.local"));
  loadEnvFile(path.resolve(process.cwd(), ".env"));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return { url, key };
}

async function main() {
  const { url, key } = ensureSupabaseEnv();
  const supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const session = createStudyValidationSession({ language: "en" });
  const fixture = createStudyValidationFixture(session);

  const operations = [
    {
      name: "study_participants",
      run: async () => supabase.from("study_participants").upsert(fixture.participant, {
        onConflict: "study_id,participant_id"
      })
    },
    {
      name: "study_sessions",
      run: async () => supabase.from("study_sessions").upsert(fixture.session)
    },
    {
      name: "event_logs",
      run: async () => supabase.from("event_logs").insert(fixture.event)
    },
    {
      name: "study_task_ratings",
      run: async () => supabase.from("study_task_ratings").insert(fixture.rating)
    },
    {
      name: "study_artifacts",
      run: async () => supabase.from("study_artifacts").insert(fixture.artifact)
    },
    {
      name: "survey_responses",
      run: async () => supabase.from("survey_responses").insert(fixture.survey)
    }
  ] as const;

  const results: StudyValidationResult[] = [];

  for (const operation of operations) {
    try {
      const { error } = await operation.run();
      results.push({
        name: operation.name,
        ok: !error,
        message: error?.message ?? "ok"
      });
    } catch (error) {
      results.push({
        name: operation.name,
        ok: false,
        message: error instanceof Error ? error.message : "unknown error"
      });
    }
  }

  const diagnosis = diagnoseStudyValidationResults(results);

  console.log(JSON.stringify({
    participantId: session.participantId,
    sessionId: session.sessionId,
    studyId: session.studyId,
    snapshotId: session.snapshotId,
    diagnosis,
    results
  }, null, 2));

  if (results.some((result) => !result.ok)) {
    process.exitCode = 1;
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
