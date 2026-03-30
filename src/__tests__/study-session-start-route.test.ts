import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudySession } from "@/types/study";

const upsert = vi.fn();
const from = vi.fn();
const getSupabaseServerClient = vi.fn();

vi.mock("@/lib/supabaseServer", () => ({
  getSupabaseServerClient
}));

describe("POST /api/study/session/start", () => {
  const session: StudySession = {
    studyId: "sportshci_2026_no_video_v1",
    participantId: "P001",
    sessionId: "session_1",
    studyMode: true,
    language: "zh",
    condition: "lang_zh",
    snapshotId: "2026-03-29-v1",
    snapshotSeed: "20260329",
    buildVersion: "2026-03-29-v1",
    startedAt: "2026-03-29T00:00:00.000Z",
    endedAt: null
  };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    from.mockImplementation(() => ({ upsert }));
    getSupabaseServerClient.mockReturnValue({ from });
    upsert.mockResolvedValue({ error: null });
  });

  it("upserts the participant registry before writing the study session", async () => {
    const { POST } = await import("@/app/api/study/session/start/route");
    const response = await POST(new Request("http://localhost/api/study/session/start", {
      method: "POST",
      body: JSON.stringify({ session }),
      headers: { "Content-Type": "application/json" }
    }));

    expect(response.status).toBe(200);
    expect(from).toHaveBeenNthCalledWith(1, "study_participants");
    expect(upsert).toHaveBeenNthCalledWith(1, expect.objectContaining({
      study_id: session.studyId,
      participant_id: session.participantId,
      latest_session_id: session.sessionId,
      language: session.language,
      condition: session.condition,
      latest_snapshot_id: session.snapshotId,
      latest_build_version: session.buildVersion
    }), expect.objectContaining({
      onConflict: "study_id,participant_id"
    }));
    expect(from).toHaveBeenNthCalledWith(2, "study_sessions");
  });
});
