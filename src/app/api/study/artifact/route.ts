import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { StudyArtifactRecord } from "@/types/study";

export async function POST(request: Request) {
  const { artifact } = (await request.json()) as { artifact?: StudyArtifactRecord };

  if (!artifact?.sessionId || !artifact.participantId || !artifact.artifactType) {
    return NextResponse.json({ ok: false, message: "Missing study artifact payload." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase.from("study_artifacts").insert({
    participant_id: artifact.participantId,
    session_id: artifact.sessionId,
    study_mode: true,
    language: artifact.language,
    condition: artifact.condition ?? `lang_${artifact.language}`,
    snapshot_id: artifact.snapshotId,
    snapshot_seed: artifact.snapshotSeed,
    build_version: artifact.buildVersion,
    artifact_type: artifact.artifactType,
    payload: artifact.payload,
    created_at: artifact.createdAt
  });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
