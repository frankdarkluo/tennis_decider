import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  ResearchExportTable,
  StudyFlushFallbackBucketSummary,
  StudyFlushFailureReason,
  StudyDerivedMetric,
  SurveyResponses
} from "@/types/research";
import {
  StudyExportBundle,
  StudyLanguage,
  StudyOpenFeedbackRow,
  StudyParticipantRecord,
  StudySnapshot,
  StudyTaskId,
  StudyTaskRatingRecord
} from "@/types/study";

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

type StudyEventsPageResponse = {
  ok?: boolean;
  message?: string;
  data?: Record<string, unknown>[];
  page?: {
    nextCursor?: number | null;
  };
};

function buildStudyEventsPageUrl(limit: number, cursor: number) {
  const search = new URLSearchParams({
    limit: String(limit),
    cursor: String(cursor)
  });

  return `/api/study/events?${search.toString()}`;
}

async function fetchEventLogsViaPagedApi(options: {
  pageSize: number;
  accessToken?: string | null;
}) {
  const rows: Record<string, unknown>[] = [];
  let cursor = 0;

  while (true) {
    const response = await fetch(buildStudyEventsPageUrl(options.pageSize, cursor), {
      headers: options.accessToken
        ? {
          Authorization: `Bearer ${options.accessToken}`
        }
        : undefined
    });

    let body: StudyEventsPageResponse | null = null;
    try {
      body = (await response.json()) as StudyEventsPageResponse;
    } catch {
      body = null;
    }

    if (!response.ok || !body?.ok) {
      return {
        data: [] as Record<string, unknown>[],
        error: body?.message ?? "导出 event_logs 时发生未知错误。"
      };
    }

    const batch = Array.isArray(body.data) ? body.data : [];
    rows.push(...batch);

    const nextCursor = typeof body.page?.nextCursor === "number"
      ? body.page.nextCursor
      : null;

    if (nextCursor === null || nextCursor <= cursor || batch.length === 0) {
      break;
    }

    cursor = nextCursor;
  }

  return { data: rows };
}

export async function saveSurveyResponse(input: {
  sessionId: string | null;
  userId: string | null;
  responses: SurveyResponses;
  susScore: number;
  studyId?: string;
  participantId?: string;
  studyMode?: boolean;
  language?: string;
  condition?: string | null;
  snapshotId?: string;
  snapshotSeed?: string;
  buildVersion?: string;
}) {
  const supabase = getClient();

  if (!supabase) {
    return { error: "Supabase 尚未配置完成，暂时无法提交问卷。" };
  }

  const { error } = await supabase.from("survey_responses").insert({
    session_id: input.sessionId,
    user_id: input.userId,
    responses: input.responses,
    sus_score: input.susScore,
    study_id: input.studyId ?? null,
    participant_id: input.participantId ?? null,
    study_mode: input.studyMode ?? false,
    language: input.language ?? null,
    condition: input.condition ?? null,
    snapshot_id: input.snapshotId ?? null,
    snapshot_seed: input.snapshotSeed ?? null,
    build_version: input.buildVersion ?? null
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

  if (table === "event_logs") {
    const { data } = await supabase.auth.getSession();
    return fetchEventLogsViaPagedApi({
      pageSize,
      accessToken: data.session?.access_token ?? null
    });
  }

  const rows: Record<string, unknown>[] = [];
  let from = 0;
  const orderColumnByTable: Record<ResearchExportTable, string> = {
    event_logs: "timestamp",
    survey_responses: "created_at",
    assessment_results: "created_at",
    diagnosis_history: "created_at",
    video_diagnosis_history: "created_at",
    study_participants: "updated_at",
    study_sessions: "started_at",
    study_artifacts: "created_at",
    study_task_ratings: "submitted_at"
  };

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(orderColumnByTable[table], { ascending: true })
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

type NormalizedEventRow = {
  studyId: string;
  participantId: string | null;
  sessionId: string;
  eventName: string;
  route: string;
  tsClient: number;
  payload: Record<string, unknown>;
};

function toNumber(value: unknown) {
  return typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
}

function normalizeEventRow(row: Record<string, unknown>): NormalizedEventRow | null {
  const payload = (row.event_data ?? row.payload) as Record<string, unknown> | null;
  const sessionId = String(row.session_id ?? row.sessionId ?? "");
  const eventName = String(row.event_type ?? row.eventName ?? "");
  const route = String(row.page ?? row.route ?? payload?.route ?? "");

  if (!sessionId || !eventName || !route) {
    return null;
  }

  const timestampValue = row.timestamp ?? row.occurred_at ?? null;
  const fallbackTs = typeof timestampValue === "string" ? Date.parse(timestampValue) : Date.now();
  const tsClient = Number(payload?.tsClient ?? row.tsClient ?? fallbackTs);

  return {
    studyId: String(row.study_id ?? payload?.studyId ?? ""),
    participantId: row.participant_id ? String(row.participant_id) : null,
    sessionId,
    eventName,
    route,
    tsClient: Number.isFinite(tsClient) ? tsClient : fallbackTs,
    payload: payload ?? {}
  };
}

function normalizeFlushFallbackReason(value: unknown): StudyFlushFailureReason | null {
  if (value === "network_error" || value === "http_non_2xx" || value === "beacon_rejected") {
    return value;
  }

  return null;
}

export function summarizeStudyFlushFallbackBuckets(
  rows: unknown[]
): StudyFlushFallbackBucketSummary {
  const summary: StudyFlushFallbackBucketSummary = {
    total: 0,
    byReason: {
      network_error: 0,
      http_non_2xx: 0,
      beacon_rejected: 0
    },
    byMode: {
      sync: 0,
      async: 0
    },
    httpStatusCounts: {}
  };

  rows.forEach((row) => {
    if (!row || typeof row !== "object") {
      return;
    }

    const entry = row as Record<string, unknown>;
    const reason = normalizeFlushFallbackReason(entry.reason);
    if (!reason) {
      return;
    }

    summary.total += 1;
    summary.byReason[reason] += 1;

    const mode = entry.mode === "sync" ? "sync" : entry.mode === "async" ? "async" : null;
    if (mode) {
      summary.byMode[mode] += 1;
    }

    const httpStatus = toNumber(entry.httpStatus);
    if (Number.isFinite(httpStatus)) {
      const bucketKey = String(httpStatus);
      summary.httpStatusCounts[bucketKey] = (summary.httpStatusCounts[bucketKey] ?? 0) + 1;
    }
  });

  return summary;
}

export function deriveStudyMetrics(
  events: Record<string, unknown>[],
  surveyRows: Record<string, unknown>[] = []
): StudyDerivedMetric[] {
  const grouped = new Map<string, NormalizedEventRow[]>();

  events.forEach((row) => {
    const normalized = normalizeEventRow(row);
    if (!normalized) {
      return;
    }

    const bucket = grouped.get(normalized.sessionId) ?? [];
    bucket.push(normalized);
    grouped.set(normalized.sessionId, bucket);
  });

  const surveyMetricsBySession = surveyRows.reduce<Map<string, { susScore: number | null; openFeedbackCount: number }>>((acc, row) => {
    const artifactType = String(row.artifact_type ?? row.artifactType ?? "");
    if (artifactType && artifactType !== "survey") {
      return acc;
    }

    const sessionId = String(row.session_id ?? row.sessionId ?? "");
    if (!sessionId) {
      return acc;
    }

    const payload = (row.payload ?? row) as Record<string, unknown>;
    const susScoreRaw = toNumber(payload.susScore ?? row.sus_score ?? row.susScore);
    const responses = (payload.responses ?? row.responses ?? {}) as Record<string, unknown>;
    const openFeedbackCount = ["q23", "q24", "q25"].filter((questionId) => {
      const value = responses[questionId];
      return typeof value === "string" && value.trim().length > 0;
    }).length;

    acc.set(sessionId, {
      susScore: Number.isFinite(susScoreRaw) ? susScoreRaw : null,
      openFeedbackCount
    });
    return acc;
  }, new Map());

  return Array.from(grouped.entries()).map(([sessionId, rows]) => {
    const ordered = [...rows].sort((left, right) => left.tsClient - right.tsClient);
    const firstEvent = ordered[0];
    const surveyMetrics = surveyMetricsBySession.get(sessionId);
    const routesVisited = Array.from(new Set(
      ordered
        .filter((row) => row.eventName === "page.view")
        .map((row) => row.route)
    ));
    const dwellMsByRoute = ordered.reduce<Record<string, number>>((acc, row) => {
      if (row.eventName !== "page.leave") {
        return acc;
      }

      const dwell = toNumber(row.payload.dwellMs);
      if (!Number.isFinite(dwell)) {
        return acc;
      }

      acc[row.route] = (acc[row.route] ?? 0) + dwell;
      return acc;
    }, {});
    const focusedDwellMsByRoute = ordered.reduce<Record<string, number>>((acc, row) => {
      if (row.eventName !== "page.leave") {
        return acc;
      }

      const focusedDwell = toNumber(row.payload.focusedDwellMs);
      if (!Number.isFinite(focusedDwell)) {
        return acc;
      }

      acc[row.route] = (acc[row.route] ?? 0) + focusedDwell;
      return acc;
    }, {});
    const activeDwellMsByRoute = ordered.reduce<Record<string, number>>((acc, row) => {
      if (row.eventName !== "page.leave") {
        return acc;
      }

      const activeDwell = toNumber(row.payload.activeDwellMs);
      if (!Number.isFinite(activeDwell)) {
        return acc;
      }

      acc[row.route] = (acc[row.route] ?? 0) + activeDwell;
      return acc;
    }, {});

    const longestDwellRoute = Object.entries(dwellMsByRoute)
      .sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
    const longestFocusedDwellRoute = Object.entries(focusedDwellMsByRoute)
      .sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
    const longestActiveDwellRoute = Object.entries(activeDwellMsByRoute)
      .sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;

    const firstCoreFeatureUsed = ordered.find((row) => [
      "assessment.started",
      "diagnose.started",
      "library.viewed",
      "rankings.viewed",
      "plan.generated"
    ].includes(row.eventName))?.eventName ?? null;

    const totalSessionFromEvent = ordered.find((row) => row.eventName === "session.completed");
    const totalSessionMs = Number.isFinite(toNumber(totalSessionFromEvent?.payload.totalDurationMs))
      ? Number(totalSessionFromEvent?.payload.totalDurationMs)
      : Math.max(0, ordered[ordered.length - 1].tsClient - firstEvent.tsClient);
    const diagnoseWhyThisViewedCount = ordered.filter((row) => row.eventName === "diagnose.why_this_viewed").length;
    const contentWhyThisViewedCount = ordered.filter((row) => row.eventName === "content.why_this_viewed").length;
    const creatorWhyThisViewedCount = ordered.filter((row) => row.eventName === "creator.why_this_viewed").length;

    return {
      studyId: firstEvent.studyId,
      participantId: firstEvent.participantId,
      sessionId,
      susScore: surveyMetrics?.susScore ?? null,
      openFeedbackCount: surveyMetrics?.openFeedbackCount ?? 0,
      firstEntryMode: String(
        ordered.find((row) => row.eventName === "home.entry_selected")?.payload.entryMode ?? ""
      ) || null,
      routesVisited,
      pageCount: ordered.filter((row) => row.eventName === "page.view").length,
      firstCoreFeatureUsed,
      dwellMsByRoute,
      focusedDwellMsByRoute,
      activeDwellMsByRoute,
      longestDwellRoute,
      longestFocusedDwellRoute,
      longestActiveDwellRoute,
      totalSessionMs,
      assessmentCompleted: ordered.some((row) => row.eventName === "assessment.completed"),
      diagnoseCompleted: ordered.some((row) => row.eventName === "diagnose.result_viewed"),
      planGenerated: ordered.some((row) => row.eventName === "plan.generated"),
      planSaved: ordered.some((row) => row.eventName === "plan.saved"),
      diagnoseMaxLayerOpened: ordered.reduce((max, row) => {
        if (row.eventName !== "diagnose.layer_opened") {
          return max;
        }

        const layer = toNumber(row.payload.layer);
        return Number.isFinite(layer) ? Math.max(max, layer) : max;
      }, 0),
      contentClickCount: ordered.filter((row) => (
        row.eventName === "content.card_opened" || row.eventName === "diagnose.recommended_content_clicked"
      )).length,
      creatorClickCount: ordered.filter((row) => (
        row.eventName === "creator.card_opened"
        || row.eventName === "creator.featured_video_clicked"
        || row.eventName === "creator.homepage_cta_clicked"
      )).length,
      outboundClickCount: ordered.filter((row) => row.eventName === "content.outbound_clicked").length,
      bookmarkCount: ordered.filter((row) => (
        row.eventName === "content.bookmark_toggled" && row.payload.bookmarked === true
      )).length,
      fallbackUsed: ordered.some((row) => row.eventName === "diagnose.fallback_used"),
      diagnoseWhyThisViewedCount,
      contentWhyThisViewedCount,
      creatorWhyThisViewedCount,
      whyThisViewedCount: diagnoseWhyThisViewedCount + contentWhyThisViewedCount + creatorWhyThisViewedCount
    };
  });
}

export function buildStudyExportBundle(input: {
  snapshot: StudySnapshot;
  participants?: Record<string, unknown>[];
  sessions: Record<string, unknown>[];
  artifacts: Record<string, unknown>[];
  surveyResponses?: Record<string, unknown>[];
  taskRatings?: Record<string, unknown>[];
  events: Record<string, unknown>[];
  participantId?: string;
  sessionId?: string;
  snapshotId?: string;
}): StudyExportBundle {
  const participantId = input.participantId?.trim() ?? "";
  const sessionId = input.sessionId?.trim() ?? "";
  const snapshotId = input.snapshotId?.trim() ?? "";

  const matches = (row: Record<string, unknown>) => {
    const rowParticipantId = String(row.participant_id ?? "");
    const rowSessionId = String(row.session_id ?? row.latest_session_id ?? "");
    const rowSnapshotId = String(row.snapshot_id ?? row.latest_snapshot_id ?? "");

    if (participantId && rowParticipantId !== participantId) {
      return false;
    }
    if (sessionId && rowSessionId !== sessionId) {
      return false;
    }
    if (snapshotId && rowSnapshotId !== snapshotId) {
      return false;
    }

    return true;
  };

  const filteredTaskRatings = (input.taskRatings ?? [])
    .filter(matches)
    .map(normalizeTaskRatingRow)
    .filter((rating): rating is StudyTaskRatingRecord => Boolean(rating));
  const filteredArtifacts = input.artifacts.filter(matches);
  const filteredSurveyResponses = (input.surveyResponses ?? []).filter(matches);
  const filteredParticipants = (input.participants ?? [])
    .filter(matches)
    .map(normalizeStudyParticipantRow)
    .filter((participant): participant is StudyParticipantRecord => Boolean(participant));
  const filteredEvents = input.events.filter(matches);

  const surveyRows = [...filteredArtifacts, ...filteredSurveyResponses];

  return {
    snapshot: input.snapshot,
    participants: filteredParticipants,
    sessions: input.sessions.filter(matches) as StudyExportBundle["sessions"],
    artifacts: filteredArtifacts as StudyExportBundle["artifacts"],
    surveyResponses: filteredSurveyResponses,
    events: filteredEvents as StudyExportBundle["events"],
    taskRatings: filteredTaskRatings,
    openFeedbackRows: deriveOpenFeedbackRows(surveyRows, filteredEvents),
    derivedMetrics: deriveStudyMetrics(filteredEvents, surveyRows),
    actionabilitySummary: summarizeActionabilityRatings(filteredTaskRatings)
  };
}

function deriveTaskContextForSession(events: Record<string, unknown>[], sessionId: string): StudyOpenFeedbackRow["taskContext"] {
  const sessionEvents = events.filter((row) => String(row.session_id ?? row.sessionId ?? "") === sessionId);

  if (sessionEvents.some((row) => {
    const eventName = String(row.event_type ?? row.eventName ?? "");
    return eventName === "plan.generated" || eventName === "plan.saved";
  })) {
    return "task_3_action_or_revisit";
  }

  if (sessionEvents.some((row) => String(row.event_type ?? row.eventName ?? "") === "assessment.completed")) {
    return "task_2_assessment_entry";
  }

  if (sessionEvents.some((row) => String(row.event_type ?? row.eventName ?? "") === "diagnose.result_viewed")) {
    return "task_1_problem_entry";
  }

  return sessionEvents.length > 0 ? "cross_task" : null;
}

function deriveOpenFeedbackRows(
  surveyRows: Record<string, unknown>[],
  events: Record<string, unknown>[]
): StudyOpenFeedbackRow[] {
  return surveyRows.flatMap((row) => {
    const artifactType = String(row.artifact_type ?? row.artifactType ?? "");
    if (artifactType && artifactType !== "survey") {
      return [];
    }

    const sessionId = String(row.session_id ?? row.sessionId ?? "");
    const participantId = String(row.participant_id ?? row.participantId ?? "");
    const studyId = String(row.study_id ?? row.studyId ?? "unknown_study");
    const language = String(row.language ?? "zh");
    if (!sessionId || !participantId || !language) {
      return [];
    }

    const payload = (row.payload ?? row) as Record<string, unknown>;
    const responses = (payload.responses ?? row.responses ?? {}) as Record<string, unknown>;
    const submittedAt = String(row.created_at ?? row.createdAt ?? "1970-01-01T00:00:00.000Z");
    const taskContext = deriveTaskContextForSession(events, sessionId);

    return (["q23", "q24", "q25"] as const).flatMap((questionId) => {
      const answer = String(responses[questionId] ?? "").trim();
      if (!answer) {
        return [];
      }

      return [{
        studyId,
        participantId,
        sessionId,
        questionId,
        answer,
        answerLength: answer.length,
        taskContext,
        language: language as StudyLanguage,
        submittedAt
      } satisfies StudyOpenFeedbackRow];
    });
  });
}

function toMean(scores: number[]) {
  if (scores.length === 0) {
    return null;
  }

  const total = scores.reduce((sum, score) => sum + score, 0);
  return total / scores.length;
}

function normalizeTaskRatingRow(row: Record<string, unknown>): StudyTaskRatingRecord | null {
  const studyId = String(row.study_id ?? row.studyId ?? "unknown_study");
  const participantId = String(row.participant_id ?? row.participantId ?? "");
  const sessionId = String(row.session_id ?? row.sessionId ?? "");
  const taskId = String(row.task_id ?? row.taskId ?? "");
  const metricName = String(row.metric_name ?? row.metricName ?? "");
  const language = String(row.language ?? "");
  const submittedAt = String(row.submitted_at ?? row.submittedAt ?? "1970-01-01T00:00:00.000Z");
  const score = Number(row.score);

  if (!participantId || !sessionId || !taskId || !metricName || !language || !Number.isFinite(score)) {
    return null;
  }

  return {
    id: String(row.id ?? `${sessionId}:${taskId}:${submittedAt}`),
    studyId,
    participantId,
    sessionId,
    taskId: taskId as StudyTaskId,
    metricName: metricName as StudyTaskRatingRecord["metricName"],
    score: score as StudyTaskRatingRecord["score"],
    language: language as StudyLanguage,
    submittedAt
  };
}

function normalizeStudyParticipantRow(row: Record<string, unknown>): StudyParticipantRecord | null {
  const studyId = String(row.study_id ?? row.studyId ?? "unknown_study");
  const participantId = String(row.participant_id ?? row.participantId ?? "");
  const latestSessionId = String(row.latest_session_id ?? row.latestSessionId ?? row.session_id ?? row.sessionId ?? "");
  const language = String(row.language ?? "");
  const latestSnapshotId = String(row.latest_snapshot_id ?? row.latestSnapshotId ?? row.snapshot_id ?? row.snapshotId ?? "");
  const latestBuildVersion = String(row.latest_build_version ?? row.latestBuildVersion ?? row.build_version ?? row.buildVersion ?? "");

  if (!participantId || !latestSessionId || !language || !latestSnapshotId || !latestBuildVersion) {
    return null;
  }

  return {
    id: String(row.id ?? `${studyId}:${participantId}`),
    studyId,
    participantId,
    latestSessionId,
    language: language as StudyLanguage,
    condition: row.condition ? String(row.condition) : null,
    latestSnapshotId,
    latestBuildVersion,
    createdAt: String(row.created_at ?? row.createdAt ?? "1970-01-01T00:00:00.000Z"),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? "1970-01-01T00:00:00.000Z")
  };
}

export function summarizeActionabilityRatings(taskRatings: StudyTaskRatingRecord[]) {
  const actionabilityRatings = taskRatings.filter((rating) => rating.metricName === "actionability");
  const overallScores = actionabilityRatings.map((rating) => rating.score);
  const byTask: Partial<Record<StudyTaskId, { count: number; mean: number | null }>> = {};
  const byLanguage: Partial<Record<StudyLanguage, { count: number; mean: number | null }>> = {};

  actionabilityRatings.forEach((rating) => {
    const taskBucket = actionabilityRatings
      .filter((entry) => entry.taskId === rating.taskId)
      .map((entry) => entry.score);
    byTask[rating.taskId] = {
      count: taskBucket.length,
      mean: toMean(taskBucket)
    };

    const languageBucket = actionabilityRatings
      .filter((entry) => entry.language === rating.language)
      .map((entry) => entry.score);
    byLanguage[rating.language] = {
      count: languageBucket.length,
      mean: toMean(languageBucket)
    };
  });

  return {
    overall: {
      count: overallScores.length,
      mean: toMean(overallScores)
    },
    byTask,
    byLanguage
  };
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
