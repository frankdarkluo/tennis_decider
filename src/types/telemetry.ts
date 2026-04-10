export type EventName =
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
  | "diagnose.started"
  | "diagnose.input_method_selected"
  | "diagnose.submitted"
  | "diagnose.mediation_gate_decided"
  | "diagnose.mediation_mode_selected"
  | "diagnose.mediation_validator_rejected"
  | "diagnose.mediation_fallback"
  | "diagnose.mediation_clarification_completed"
  | "diagnose.rule_matched"
  | "diagnose.fallback_used"
  | "diagnose.result_viewed"
  | "diagnose.layer_opened"
  | "diagnose.recommended_content_clicked"
  | "diagnose.search_suggestion_clicked"
  | "diagnose.plan_cta_clicked"
  | "diagnose.why_this_viewed"
  | "library.viewed"
  | "library.search_used"
  | "library.filter_changed"
  | "library.batch_loaded"
  | "content.card_opened"
  | "content.outbound_clicked"
  | "content.bookmark_toggled"
  | "content.why_this_viewed"
  | "content.language_badge_clicked"
  | "creator_click"
  | "rankings.viewed"
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
  | "video_analysis_fail"
  | "video_analysis_start"
  | "video_analysis_success"
  | "video_limit_reached"
  | "video_plan_generate"
  | "video_result_save"
  | "video_retry_recommended"
  | "video_upload_start"
  | "video_upload_success"
  | "video_validation_fail"
  | "cta_click"
  | "language_switch"
  | "login_trigger"
  | "login_complete"
  | "logout_click";

export type LegacyEventType =
  | "page_enter"
  | "page_leave"
  | "assessment_start"
  | "assessment_answer"
  | "assessment_complete"
  | "assessment_abandon"
  | "diagnosis_submit"
  | "diagnosis_result"
  | "diagnosis_no_match"
  | "content_click"
  | "content_external"
  | "content_bookmark"
  | "content_filter"
  | "creator_filter"
  | "plan_generate"
  | "plan_save"
  | "plan_view_day";

export type EventType = EventName | LegacyEventType;
export type EventPayload = Record<string, unknown>;

export type EventLog = {
  eventId: string;
  sessionId: string;
  userId: string | null;
  timestamp: string;
  tsClient: number;
  route: string;
  page: string;
  eventName: EventType;
  eventType: EventType;
  payload: EventPayload;
  eventData: EventPayload;
  durationMs: number | null;
};
