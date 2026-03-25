import { getSupabaseBrowserClient } from "@/lib/supabase";
import { AssessmentResult } from "@/types/assessment";
import { DiagnosisResult } from "@/types/diagnosis";
import { GeneratedPlan } from "@/types/plan";
import {
  AssessmentResultRow,
  BookmarkRow,
  DiagnosisHistoryRow,
  PersistedAssessmentScores,
  SavedPlanRow,
  SavedPlanSource
} from "@/types/userData";

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

function serializeAssessmentResult(result: AssessmentResult) {
  const scores: PersistedAssessmentScores = {
    totalScore: result.totalScore,
    maxScore: result.maxScore,
    normalizedScore: result.normalizedScore,
    answeredCount: result.answeredCount,
    uncertainCount: result.uncertainCount,
    totalQuestions: result.totalQuestions,
    confidence: result.confidence,
    dimensions: result.dimensions
  };

  return {
    level: result.level,
    scores,
    strengths: result.strengths,
    weaknesses: result.weaknesses,
    uncertain: result.observationNeeded,
    summary: result.summary
  };
}

export function hydrateAssessmentResult(row: AssessmentResultRow): AssessmentResult {
  return {
    totalScore: row.scores.totalScore,
    maxScore: row.scores.maxScore,
    normalizedScore: row.scores.normalizedScore,
    answeredCount: row.scores.answeredCount,
    uncertainCount: row.scores.uncertainCount,
    totalQuestions: row.scores.totalQuestions,
    level: row.level,
    confidence: row.scores.confidence,
    dimensions: row.scores.dimensions,
    strengths: row.strengths ?? [],
    weaknesses: row.weaknesses ?? [],
    observationNeeded: row.uncertain ?? [],
    summary: row.summary ?? ""
  };
}

export async function saveAssessmentResult(userId: string, result: AssessmentResult) {
  const supabase = getClient();

  if (!supabase) {
    return { error: "Supabase 尚未配置完成，暂时无法保存评估结果。" };
  }

  const { error } = await supabase.from("assessment_results").insert({
    user_id: userId,
    ...serializeAssessmentResult(result)
  });

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function getLatestAssessmentResult(userId: string) {
  const supabase = getClient();

  if (!supabase) {
    return { data: null as AssessmentResult | null, error: "Supabase 尚未配置完成。" };
  }

  const { data, error } = await supabase
    .from("assessment_results")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { data: null as AssessmentResult | null, error: error.message };
  }

  if (!data) {
    return { data: null as AssessmentResult | null };
  }

  return { data: hydrateAssessmentResult(data as AssessmentResultRow) };
}

export async function saveDiagnosisHistory(userId: string, inputText: string, result: DiagnosisResult) {
  const supabase = getClient();

  if (!supabase) {
    return { error: "Supabase 尚未配置完成，暂时无法保存诊断历史。" };
  }

  const { error } = await supabase.from("diagnosis_history").insert({
    user_id: userId,
    input_text: inputText,
    matched_rule_id: result.matchedRuleId,
    problem_label: result.title
  });

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function getDiagnosisHistory(userId: string, limit = 5) {
  const supabase = getClient();

  if (!supabase) {
    return { data: [] as DiagnosisHistoryRow[], error: "Supabase 尚未配置完成。" };
  }

  const { data, error } = await supabase
    .from("diagnosis_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: [] as DiagnosisHistoryRow[], error: getErrorMessage(error, "读取诊断历史时发生未知错误。") };
  }

  return {
    data: (data as DiagnosisHistoryRow[] | null) ?? []
  };
}

export async function getBookmarkedContentIds(userId: string) {
  const supabase = getClient();

  if (!supabase) {
    return { data: [] as string[], error: "Supabase 尚未配置完成。" };
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .select("content_id")
    .eq("user_id", userId);

  if (error) {
    return { data: [] as string[], error: error.message };
  }

  return {
    data: (data as Pick<BookmarkRow, "content_id">[] | null)?.map((item) => item.content_id) ?? []
  };
}

export async function addBookmark(userId: string, contentId: string) {
  const supabase = getClient();

  if (!supabase) {
    return { error: "Supabase 尚未配置完成，暂时无法保存收藏。" };
  }

  const { error } = await supabase
    .from("bookmarks")
    .upsert(
      {
        user_id: userId,
        content_id: contentId
      },
      {
        onConflict: "user_id,content_id",
        ignoreDuplicates: true
      }
    );

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function removeBookmark(userId: string, contentId: string) {
  const supabase = getClient();

  if (!supabase) {
    return { error: "Supabase 尚未配置完成，暂时无法取消收藏。" };
  }

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("content_id", contentId);

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function saveGeneratedPlan(
  userId: string,
  plan: GeneratedPlan,
  sourceType: SavedPlanSource,
  sourceLabel?: string
) {
  const supabase = getClient();

  if (!supabase) {
    return { error: "Supabase 尚未配置完成，暂时无法保存训练计划。" };
  }

  const { error } = await supabase.from("saved_plans").insert({
    user_id: userId,
    plan_data: plan,
    source_type: sourceType,
    source_label: sourceLabel ?? null
  });

  if (error) {
    return { error: getErrorMessage(error, "保存训练计划时发生未知错误。") };
  }

  return {};
}

export async function getSavedPlans(userId: string, limit = 10) {
  const supabase = getClient();

  if (!supabase) {
    return { data: [] as SavedPlanRow[], error: "Supabase 尚未配置完成。" };
  }

  const { data, error } = await supabase
    .from("saved_plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: [] as SavedPlanRow[], error: getErrorMessage(error, "读取已保存训练计划时发生未知错误。") };
  }

  return {
    data: (data as SavedPlanRow[] | null) ?? []
  };
}
