import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { toEventLogInsert } from "@/lib/study/eventPersistence";
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

  const { error } = await supabase.from("event_logs").insert(toEventLogInsert(event));

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
