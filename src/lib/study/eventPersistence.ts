import { EventLog } from "@/types/research";

export function toEventLogInsert(event: EventLog) {
  return {
    session_id: event.sessionId,
    user_id: event.userId,
    participant_id: event.participantId,
    study_mode: event.studyMode,
    language: event.language,
    condition: event.condition,
    snapshot_id: event.snapshotId,
    snapshot_seed: event.snapshotSeed,
    build_version: event.buildVersion,
    timestamp: event.timestamp,
    page: event.route,
    event_type: event.eventName,
    event_data: {
      studyId: event.studyId,
      appMode: event.appMode,
      tsClient: event.tsClient,
      tsServer: event.tsServer ?? null,
      snapshotVersion: event.snapshotVersion ?? null,
      buildSha: event.buildSha ?? null,
      ...event.payload
    },
    duration_ms: event.durationMs
  };
}
