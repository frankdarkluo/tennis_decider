import { afterEach, describe, expect, it, vi } from "vitest";
import { postStudyEventsWithRetry } from "../lib/study/events";
import { EventLog } from "../types/research";

function buildEvent(): EventLog {
  return {
    eventId: "evt_1",
    studyId: "sportshci_2026_no_video_v1",
    sessionId: "session_1",
    userId: null,
    participantId: "P001",
    appMode: "study",
    studyMode: true,
    language: "zh",
    condition: "lang_zh",
    snapshotVersion: "2026-03-31-v1",
    buildSha: "2026-03-31-v1",
    snapshotId: "2026-03-31-v1",
    snapshotSeed: "20260329",
    buildVersion: "2026-03-31-v1",
    timestamp: new Date().toISOString(),
    tsClient: Date.now(),
    route: "/plan",
    page: "/plan",
    eventName: "plan.viewed",
    eventType: "plan.viewed",
    payload: { source: "test" },
    eventData: { source: "test" },
    durationMs: null
  };
}

describe("study event posting reliability", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retries failed event batch post and eventually succeeds", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValueOnce({ ok: true } as Response);

    const result = await postStudyEventsWithRetry([buildEvent()], {
      retryCount: 2,
      retryDelayMs: 0
    });

    expect(result.ok).toBe(true);
    expect(result.attempts).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("uses beacon transport in sync mode when available", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const beaconSpy = vi.fn(() => true);
    Object.defineProperty(globalThis.navigator, "sendBeacon", {
      configurable: true,
      value: beaconSpy
    });

    const result = await postStudyEventsWithRetry([buildEvent()], {
      sync: true,
      retryCount: 1,
      retryDelayMs: 0
    });

    expect(result.ok).toBe(true);
    expect(result.transport).toBe("beacon");
    expect(beaconSpy).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns http_non_2xx fallback bucket when server keeps rejecting", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 503 } as Response);

    const result = await postStudyEventsWithRetry([buildEvent()], {
      retryCount: 0,
      retryDelayMs: 0
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failureReason).toBe("http_non_2xx");
      expect(result.httpStatus).toBe(503);
    }
  });

  it("returns network_error fallback bucket when fetch throws", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));

    const result = await postStudyEventsWithRetry([buildEvent()], {
      retryCount: 0,
      retryDelayMs: 0
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failureReason).toBe("network_error");
      expect(result.httpStatus).toBeNull();
    }
  });

  it("returns beacon_rejected fallback bucket when sync beacon is denied", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 500 } as Response);
    const beaconSpy = vi.fn(() => false);
    Object.defineProperty(globalThis.navigator, "sendBeacon", {
      configurable: true,
      value: beaconSpy
    });

    const result = await postStudyEventsWithRetry([buildEvent()], {
      sync: true,
      retryCount: 0,
      retryDelayMs: 0
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failureReason).toBe("beacon_rejected");
    }
  });
});
