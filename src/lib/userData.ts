import { getSupabaseBrowserClient } from "@/lib/supabase";
import { migrateLegacyAssessmentResult } from "@/lib/assessment";
import { AssessmentResult } from "@/types/assessment";
import { DiagnosisResult } from "@/types/diagnosis";
import { GeneratedPlan } from "@/types/plan";
import { VideoDiagnosisResult, VLMObservation } from "@/types/videoDiagnosis";
import {
  AssessmentResultRow,
  BookmarkRow,
  DiagnosisHistoryRow,
  PersistedAssessmentScores,
  SavedPlanRow,
  SavedPlanSource,
  VideoDiagnosisHistoryRow,
  VideoUsageRow
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
    version: result.version,
    rawScore: result.profileVector?.rawScore ?? null,
    answeredCount: result.answeredCount,
    coreAnsweredCount: result.coreAnsweredCount,
    totalQuestions: result.totalQuestions,
    dimensionSummaries: result.dimensionSummaries,
    profileVector: result.profileVector,
    completedAt: result.completedAt
  };

  return {
    level: result.profileVector?.levelBand ?? null,
    scores,
    strengths: result.profileVector?.strongDimensions ?? [],
    weaknesses: result.profileVector?.weakDimensions ?? [],
    uncertain: [],
    summary: result.profileVector?.summary.headline ?? null
  };
}

export function hydrateAssessmentResult(row: AssessmentResultRow): AssessmentResult {
  const migrated = migrateLegacyAssessmentResult({
    ...row.scores,
    level: row.level,
    strengths: row.strengths,
    weaknesses: row.weaknesses,
    summary: row.summary,
    completedAt: row.scores.completedAt ?? row.created_at,
    created_at: row.created_at
  });

  if (migrated) {
    return migrated;
  }

  return {
    version: row.scores.version ?? "assessment_10_plus_2",
    answeredCount: row.scores.answeredCount,
    coreAnsweredCount: row.scores.coreAnsweredCount ?? Math.min(row.scores.answeredCount, 10),
    totalQuestions: row.scores.totalQuestions,
    profileVector: row.scores.profileVector ?? null,
    dimensionSummaries: row.scores.dimensionSummaries ?? [],
    completedAt: row.scores.completedAt ?? row.created_at
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

export async function getVideoUsage(userId: string) {
  const supabase = getClient();

  if (!supabase) {
    return {
      data: { successCount: 0, failedCount: 0, isPro: false, maxFree: 3 },
      error: "Supabase 尚未配置完成。"
    };
  }

  const { data, error } = await supabase
    .from("video_usage")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return {
      data: { successCount: 0, failedCount: 0, isPro: false, maxFree: 3 },
      error: getErrorMessage(error, "读取视频诊断次数时发生未知错误。")
    };
  }

  const row = data as VideoUsageRow | null;

  return {
    data: {
      successCount: row?.success_count ?? 0,
      failedCount: row?.failed_count ?? 0,
      isPro: row?.is_pro ?? false,
      maxFree: 3
    }
  };
}

export async function incrementVideoUsage(userId: string, type: "success" | "fail") {
  const supabase = getClient();

  if (!supabase) {
    return { error: "Supabase 尚未配置完成，暂时无法记录视频诊断次数。" };
  }

  const usage = await getVideoUsage(userId);
  if (usage.error) {
    return { error: usage.error };
  }

  const { error } = await supabase.from("video_usage").upsert(
    {
      user_id: userId,
      success_count: usage.data.successCount + (type === "success" ? 1 : 0),
      failed_count: usage.data.failedCount + (type === "fail" ? 1 : 0),
      is_pro: usage.data.isPro,
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "user_id"
    }
  );

  if (error) {
    return { error: getErrorMessage(error, "更新视频诊断次数时发生未知错误。") };
  }

  return {};
}

export async function saveVideoDiagnosisHistory(
  userId: string,
  input: {
    userDescription?: string;
    selectedStroke?: string;
    selectedScene?: string;
    observation: VLMObservation;
    result: VideoDiagnosisResult;
  }
) {
  const supabase = getClient();

  if (!supabase) {
    return { error: "Supabase 尚未配置完成，暂时无法保存视频诊断记录。" };
  }

  const { error } = await supabase.from("video_diagnosis_history").insert({
    user_id: userId,
    user_description: input.userDescription ?? null,
    selected_stroke: input.selectedStroke ?? null,
    selected_scene: input.selectedScene ?? null,
    observation: input.observation,
    result: input.result,
    confidence: input.result.confidence
  });

  if (error) {
    return { error: getErrorMessage(error, "保存视频诊断记录时发生未知错误。") };
  }

  return {};
}

export async function getVideoDiagnosisHistory(userId: string, limit = 5) {
  const supabase = getClient();

  if (!supabase) {
    return { data: [] as VideoDiagnosisHistoryRow[], error: "Supabase 尚未配置完成。" };
  }

  const { data, error } = await supabase
    .from("video_diagnosis_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: [] as VideoDiagnosisHistoryRow[], error: getErrorMessage(error, "读取视频诊断历史时发生未知错误。") };
  }

  return {
    data: (data as VideoDiagnosisHistoryRow[] | null) ?? []
  };
}
