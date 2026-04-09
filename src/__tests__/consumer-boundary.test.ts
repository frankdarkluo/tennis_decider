import { describe, expect, it } from "vitest";
import { getAppBoundaryState } from "@/lib/appShell/consumerBoundary";

describe("consumer boundary", () => {
  it("does not let pending study setup gate accepted consumer core routes", () => {
    expect(getAppBoundaryState({
      pathname: "/",
      studyMode: false,
      session: null,
      pendingStudySetup: true
    }).shouldBlockForPendingStudySetup).toBe(false);

    expect(getAppBoundaryState({
      pathname: "/diagnose",
      studyMode: false,
      session: null,
      pendingStudySetup: true
    }).shouldBlockForPendingStudySetup).toBe(false);

    expect(getAppBoundaryState({
      pathname: "/plan",
      studyMode: false,
      session: null,
      pendingStudySetup: true
    }).shouldBlockForPendingStudySetup).toBe(false);
  });

  it("no longer reserves deleted study route prefixes or pending-study gating in the app boundary", () => {
    expect(getAppBoundaryState({
      pathname: "/study/start",
      studyMode: false,
      session: null,
      pendingStudySetup: true
    }).showConsumerShell).toBe(true);

    expect(getAppBoundaryState({
      pathname: "/survey",
      studyMode: false,
      session: null,
      pendingStudySetup: true
    }).showConsumerShell).toBe(true);

    expect(getAppBoundaryState({
      pathname: "/assessment",
      studyMode: false,
      session: null,
      pendingStudySetup: true
    }).shouldBlockForPendingStudySetup).toBe(false);
  });

  it("treats an active study session as the explicit boundary for study-only side effects", () => {
    const activeSession = { sessionId: "study_1" };

    expect(getAppBoundaryState({
      pathname: "/diagnose",
      studyMode: true,
      session: activeSession,
      pendingStudySetup: true
    }).activeStudySession).toEqual(activeSession);

    expect(getAppBoundaryState({
      pathname: "/diagnose",
      studyMode: false,
      session: activeSession,
      pendingStudySetup: false
    }).activeStudySession).toBeNull();
  });
});
