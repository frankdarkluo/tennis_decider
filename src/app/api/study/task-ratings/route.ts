import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { StudyTaskRatingRecord } from "@/types/study";

export async function POST(request: Request) {
  const { rating } = (await request.json()) as { rating?: StudyTaskRatingRecord };

  if (!rating?.sessionId || !rating.participantId || !rating.taskId) {
    return NextResponse.json({ ok: false, message: "Missing study task rating payload." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase.from("study_task_ratings").insert({
    study_id: rating.studyId,
    participant_id: rating.participantId,
    session_id: rating.sessionId,
    task_id: rating.taskId,
    metric_name: rating.metricName,
    score: rating.score,
    language: rating.language,
    submitted_at: rating.submittedAt
  });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
