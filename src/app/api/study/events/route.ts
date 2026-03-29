import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { toEventLogInsert } from "@/lib/study/eventPersistence";
import { EventLog } from "@/types/research";

export async function POST(request: Request) {
  const { events } = (await request.json()) as { events?: EventLog[] };

  if (!Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ ok: false, message: "Missing study events payload." }, { status: 400 });
  }

  const validEvents = events.filter((event) => Boolean(event?.sessionId && event.eventName));
  if (validEvents.length === 0) {
    return NextResponse.json({ ok: false, message: "No valid study events found." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, persisted: false, count: validEvents.length });
  }

  const { error } = await supabase.from("event_logs").insert(validEvents.map(toEventLogInsert));

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, persisted: true, count: validEvents.length });
}
