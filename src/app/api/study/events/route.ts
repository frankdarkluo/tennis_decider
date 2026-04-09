import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

function parseLimit(rawValue: string | null) {
  const parsed = Number.parseInt(rawValue ?? "", 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1000;
  }

  return Math.min(parsed, 5000);
}

function parseCursor(rawValue: string | null) {
  const parsed = Number.parseInt(rawValue ?? "", 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function getSupabaseClientForRequest(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (
    authHeader &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }

  return getSupabaseServerClient();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"));
  const cursor = parseCursor(url.searchParams.get("cursor"));
  const supabase = getSupabaseClientForRequest(request);

  if (!supabase) {
    return NextResponse.json({
      ok: true,
      data: [],
      page: {
        limit,
        cursor,
        nextCursor: null,
        hasMore: false
      }
    });
  }

  const { data, error } = await supabase
    .from("event_logs")
    .select("*")
    .order("timestamp", { ascending: true })
    .order("id", { ascending: true })
    .range(cursor, cursor + limit - 1);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  const batch = (data as Record<string, unknown>[] | null) ?? [];
  const nextCursor = batch.length === limit ? cursor + batch.length : null;

  return NextResponse.json({
    ok: true,
    data: batch,
    page: {
      limit,
      cursor,
      nextCursor,
      hasMore: nextCursor !== null
    }
  });
}
