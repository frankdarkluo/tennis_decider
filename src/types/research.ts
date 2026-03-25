export type EventType =
  | "page_enter"
  | "page_leave"
  | "assessment_start"
  | "assessment_answer"
  | "assessment_complete"
  | "assessment_abandon"
  | "diagnosis_submit"
  | "diagnosis_result"
  | "diagnosis_tag_click"
  | "diagnosis_no_match"
  | "content_click"
  | "content_external"
  | "content_bookmark"
  | "content_filter"
  | "creator_click"
  | "creator_filter"
  | "plan_generate"
  | "plan_save"
  | "plan_view_day"
  | "cta_click"
  | "login_trigger"
  | "login_complete"
  | "study_consent";

export type EventLog = {
  eventId: string;
  sessionId: string;
  userId: string | null;
  timestamp: string;
  page: string;
  eventType: EventType;
  eventData: Record<string, unknown>;
  durationMs: number | null;
};

export type SurveyResponses = Record<string, string | number>;

export type SurveyResponseRow = {
  id: string;
  session_id: string | null;
  user_id: string | null;
  responses: SurveyResponses;
  sus_score: number | null;
  created_at: string;
};

export type ResearchExportTable =
  | "event_logs"
  | "survey_responses"
  | "assessment_results"
  | "diagnosis_history";
