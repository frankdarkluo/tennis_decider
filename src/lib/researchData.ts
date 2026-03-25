import { getSupabaseBrowserClient } from "@/lib/supabase";
import { ResearchExportTable, SurveyResponses } from "@/types/research";

function getClient() {
  return getSupabaseBrowserClient();
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return fallback;
}

export async function saveSurveyResponse(input: {
  sessionId: string | null;
  userId: string | null;
  responses: SurveyResponses;
  susScore: number;
}) {
  const supabase = getClient();

  if (!supabase) {
    return { error: "Supabase 尚未配置完成，暂时无法提交问卷。" };
  }

  const { error } = await supabase.from("survey_responses").insert({
    session_id: input.sessionId,
    user_id: input.userId,
    responses: input.responses,
    sus_score: input.susScore
  });

  if (error) {
    return { error: getErrorMessage(error, "提交问卷时发生未知错误。") };
  }

  return {};
}

export async function fetchAllExportRows(table: ResearchExportTable) {
  const supabase = getClient();

  if (!supabase) {
    return { data: [] as Record<string, unknown>[], error: "Supabase 尚未配置完成。" };
  }

  const pageSize = 1000;
  const rows: Record<string, unknown>[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      return {
        data: [] as Record<string, unknown>[],
        error: getErrorMessage(error, `导出 ${table} 时发生未知错误。`)
      };
    }

    const batch = (data as Record<string, unknown>[] | null) ?? [];
    rows.push(...batch);

    if (batch.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return { data: rows };
}

export function downloadJsonFile(fileName: string, payload: string) {
  if (typeof window === "undefined") {
    return;
  }

  const blob = new Blob([payload], { type: "application/json;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
