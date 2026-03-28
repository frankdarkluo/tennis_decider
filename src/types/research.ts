export type EventType =
  | "study_session_start"
  | "study_session_end"
  | "study_artifact_save"
  | "study_data_clear"
  | "page_enter"
  | "page_leave"
  | "video_upload_start"
  | "video_upload_success"
  | "video_validation_fail"
  | "video_analysis_start"
  | "video_analysis_success"
  | "video_analysis_fail"
  | "video_limit_reached"
  | "video_retry_recommended"
  | "video_result_save"
  | "platform_search"
  | "platform_video_click"
  | "video_plan_generate"
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
  | "language_switch"
  | "login_trigger"
  | "login_complete"
  | "logout_click"
  | "study_consent";

export type EventLog = {
  eventId: string;
  sessionId: string;
  userId: string | null;
  participantId: string | null;
  studyMode: boolean;
  language?: "zh" | "en" | null;
  condition?: string | null;
  snapshotId?: string | null;
  snapshotSeed?: string | null;
  buildVersion?: string | null;
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
  participant_id?: string | null;
  study_mode?: boolean;
  language?: "zh" | "en" | null;
  snapshot_id?: string | null;
  snapshot_seed?: string | null;
  build_version?: string | null;
  responses: SurveyResponses;
  sus_score: number | null;
  created_at: string;
};

export type ResearchExportTable =
  | "event_logs"
  | "survey_responses"
  | "assessment_results"
  | "diagnosis_history"
  | "video_diagnosis_history"
  | "study_sessions"
  | "study_artifacts";
