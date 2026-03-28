import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { EventLog } from "@/types/research";

export async function POST(request: Request) {
  const { event } = (await request.json()) as { event?: EventLog };

  if (!event?.sessionId || !event.eventType) {
    return NextResponse.json({ ok: false, message: "Missing study event payload." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase.from("event_logs").insert({
    session_id: event.sessionId,
    user_id: event.userId,
    participant_id: event.participantId,
    study_mode: event.studyMode,
    language: event.language,
    condition: event.condition,
    snapshot_id: event.snapshotId,
    snapshot_seed: event.snapshotSeed,
    build_version: event.buildVersion,
    timestamp: event.timestamp,
    page: event.page,
    event_type: event.eventType,
    event_data: event.eventData,
    duration_ms: event.durationMs
  });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, persisted: true });
}

