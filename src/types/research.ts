export type EventName =
  | "study.started"
  | "study.background_submitted"
  | "session.started"
  | "session.completed"
  | "session.abandoned"
  | "page.view"
  | "page.leave"
  | "page.visibility_changed"
  | "page.error"
  | "home.entry_selected"
  | "home.problem_started"
  | "home.quick_tag_clicked"
  | "home.problem_submitted"
  | "home.hot_content_clicked"
  | "home.hot_creator_clicked"
  | "home.assessment_cta_clicked"
  | "assessment.started"
  | "assessment.step_answered"
  | "assessment.branch_resolved"
  | "assessment.completed"
  | "assessment.exited"
  | "assessment_result.viewed"
  | "assessment_result.next_action_clicked"
  | "task.actionability_prompt_viewed"
  | "task.actionability_submitted"
  | "diagnose.started"
  | "diagnose.input_method_selected"
  | "diagnose.submitted"
  | "diagnose.rule_matched"
  | "diagnose.fallback_used"
  | "diagnose.result_viewed"
  | "diagnose.layer_opened"
  | "diagnose.recommended_content_clicked"
  | "diagnose.search_suggestion_clicked"
  | "diagnose.plan_cta_clicked"
  | "diagnose.why_this_viewed"
  | "library.viewed"
  | "library.snapshot_loaded"
  | "library.sort_context_logged"
  | "library.search_used"
  | "library.filter_changed"
  | "library.batch_loaded"
  | "content.card_opened"
  | "content.outbound_clicked"
  | "content.bookmark_toggled"
  | "content.why_this_viewed"
  | "content.language_badge_clicked"
  | "rankings.viewed"
  | "rankings.snapshot_loaded"
  | "rankings.sort_context_logged"
  | "rankings.region_changed"
  | "rankings.search_used"
  | "creator.card_opened"
  | "creator.modal_viewed"
  | "creator.why_this_viewed"
  | "creator.featured_video_clicked"
  | "creator.homepage_cta_clicked"
  | "plan.viewed"
  | "plan.generated"
  | "plan.day_expanded"
  | "plan.regenerated"
  | "plan.saved"
  | "plan.backtrack_clicked"
  | "profile.viewed"
  | "profile.section_opened"
  | "profile.history_item_opened"
  | "profile.local_data_cleared"
  | "sus.completed"
  | "study.open_feedback_submitted";

export type LegacyEventType =
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

export type EventType = EventName | LegacyEventType;

export type StudyEventPayload = Record<string, unknown>;

export type EventLog = {
  eventId: string;
  studyId: string;
  sessionId: string;
  userId: string | null;
  participantId: string | null;
  appMode: "study" | "product";
  studyMode: boolean;
  language?: "zh" | "en" | null;
  condition?: string | null;
  snapshotVersion?: string | null;
  buildSha?: string | null;
  snapshotId?: string | null;
  snapshotSeed?: string | null;
  buildVersion?: string | null;
  timestamp: string;
  tsClient: number;
  tsServer?: string;
  route: string;
  page: string;
  eventName: EventType;
  eventType: EventType;
  payload: StudyEventPayload;
  eventData: StudyEventPayload;
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

export type StudyDerivedMetric = {
  studyId: string;
  participantId: string | null;
  sessionId: string;
  susScore: number | null;
  openFeedbackCount: number;
  firstEntryMode: string | null;
  routesVisited: string[];
  pageCount: number;
  firstCoreFeatureUsed: string | null;
  dwellMsByRoute: Record<string, number>;
  focusedDwellMsByRoute: Record<string, number>;
  activeDwellMsByRoute: Record<string, number>;
  longestDwellRoute: string | null;
  longestFocusedDwellRoute: string | null;
  longestActiveDwellRoute: string | null;
  totalSessionMs: number;
  assessmentCompleted: boolean;
  diagnoseCompleted: boolean;
  planGenerated: boolean;
  planSaved: boolean;
  diagnoseMaxLayerOpened: number;
  contentClickCount: number;
  creatorClickCount: number;
  outboundClickCount: number;
  bookmarkCount: number;
  fallbackUsed: boolean;
  diagnoseWhyThisViewedCount: number;
  contentWhyThisViewedCount: number;
  creatorWhyThisViewedCount: number;
  whyThisViewedCount: number;
};

export type ResearchExportTable =
  | "event_logs"
  | "survey_responses"
  | "assessment_results"
  | "diagnosis_history"
  | "video_diagnosis_history"
  | "study_participants"
  | "study_sessions"
  | "study_artifacts"
  | "study_task_ratings";
