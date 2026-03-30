import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { StudySession } from "@/types/study";

export async function POST(request: Request) {
  const { session } = (await request.json()) as { session?: StudySession };

  if (!session?.participantId || !session.sessionId) {
    return NextResponse.json({ ok: false, message: "Missing study session payload." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const participantPayload = {
    study_id: session.studyId,
    participant_id: session.participantId,
    latest_session_id: session.sessionId,
    language: session.language,
    condition: session.condition ?? `lang_${session.language}`,
    latest_snapshot_id: session.snapshotId,
    latest_build_version: session.buildVersion,
    updated_at: new Date().toISOString()
  };
  const { error: participantError } = await supabase.from("study_participants").upsert(participantPayload, {
    onConflict: "study_id,participant_id"
  });

  if (participantError) {
    return NextResponse.json({ ok: false, message: participantError.message }, { status: 500 });
  }

  const { error } = await supabase.from("study_sessions").upsert({
    study_id: session.studyId,
    participant_id: session.participantId,
    session_id: session.sessionId,
    study_mode: true,
    language: session.language,
    condition: session.condition ?? `lang_${session.language}`,
    snapshot_id: session.snapshotId,
    snapshot_seed: session.snapshotSeed,
    build_version: session.buildVersion,
    started_at: session.startedAt,
    ended_at: session.endedAt ?? null
  });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
