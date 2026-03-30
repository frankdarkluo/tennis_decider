import { describe, expect, it } from "vitest";
import {
  createStudyValidationFixture,
  createStudyValidationSession
} from "@/lib/study/remoteValidation";

describe("study remote validation helpers", () => {
  it("creates a participant-first validation fixture from a synthetic session", () => {
    const session = createStudyValidationSession({
      participantId: "P_VALIDATE_001",
      language: "en",
      timestamp: "2026-03-29T12:00:00.000Z"
    });

    const fixture = createStudyValidationFixture(session);

    expect(session).toMatchObject({
      studyId: "sportshci_2026_no_video_v1",
      participantId: "P_VALIDATE_001",
      sessionId: expect.stringContaining("validate_"),
      condition: "lang_en"
    });
    expect(fixture.participant).toMatchObject({
      participant_id: "P_VALIDATE_001",
      latest_session_id: session.sessionId
    });
    expect(fixture.session).toMatchObject({
      session_id: session.sessionId,
      participant_id: "P_VALIDATE_001"
    });
    expect(fixture.event.event_type).toBe("study.validation_ping");
    expect(fixture.rating.metric_name).toBe("actionability");
    expect(fixture.artifact.artifact_type).toBe("study_resume");
    expect(fixture.survey.participant_id).toBe("P_VALIDATE_001");
  });
});
