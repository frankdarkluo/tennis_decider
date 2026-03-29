import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  ResearchExportTable,
  StudyDerivedMetric,
  SurveyResponses
} from "@/types/research";
import { StudyExportBundle, StudySnapshot } from "@/types/study";

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
  const orderColumnByTable: Record<ResearchExportTable, string> = {
    event_logs: "timestamp",
    survey_responses: "created_at",
    assessment_results: "created_at",
    diagnosis_history: "created_at",
    video_diagnosis_history: "created_at",
    study_sessions: "started_at",
    study_artifacts: "created_at"
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

export function deriveStudyMetrics(events: Record<string, unknown>[]): StudyDerivedMetric[] {
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

  return Array.from(grouped.entries()).map(([sessionId, rows]) => {
    const ordered = [...rows].sort((left, right) => left.tsClient - right.tsClient);
    const firstEvent = ordered[0];
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

    const longestDwellRoute = Object.entries(dwellMsByRoute)
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

    return {
      studyId: firstEvent.studyId,
      participantId: firstEvent.participantId,
      sessionId,
      firstEntryMode: String(
        ordered.find((row) => row.eventName === "home.entry_selected")?.payload.entryMode ?? ""
      ) || null,
      routesVisited,
      pageCount: ordered.filter((row) => row.eventName === "page.view").length,
      firstCoreFeatureUsed,
      dwellMsByRoute,
      longestDwellRoute,
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
      whyThisViewedCount: ordered.filter((row) => row.eventName === "diagnose.why_this_viewed").length
    };
  });
}

export function buildStudyExportBundle(input: {
  snapshot: StudySnapshot;
  sessions: Record<string, unknown>[];
  artifacts: Record<string, unknown>[];
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
    const rowSessionId = String(row.session_id ?? "");
    const rowSnapshotId = String(row.snapshot_id ?? "");

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

  return {
    snapshot: input.snapshot,
    sessions: input.sessions.filter(matches) as StudyExportBundle["sessions"],
    artifacts: input.artifacts.filter(matches) as StudyExportBundle["artifacts"],
    events: input.events.filter(matches) as StudyExportBundle["events"],
    derivedMetrics: deriveStudyMetrics(input.events.filter(matches))
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
