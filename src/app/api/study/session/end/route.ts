import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { StudySession } from "@/types/study";

export async function POST(request: Request) {
  const { session } = (await request.json()) as { session?: StudySession };

  if (!session?.sessionId) {
    return NextResponse.json({ ok: false, message: "Missing sessionId." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase
    .from("study_sessions")
    .update({
      ended_at: session.endedAt ?? new Date().toISOString()
    })
    .eq("session_id", session.sessionId);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, persisted: true });
}

