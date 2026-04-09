import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

const {
  mockUsePathname,
  initEventLoggerMock,
  setEventLoggerUserMock,
  setEventLoggerPageMock,
  logPageEnterMock,
  logPageLeaveMock,
  logPageVisibilityChangeMock,
  syncPageFocusStateMock,
  markPageInteractionMock,
  flushEventQueueMock,
  logSessionAbandonedMock,
  writeLastStudyPathMock
} = vi.hoisted(() => ({
  mockUsePathname: vi.fn(),
  initEventLoggerMock: vi.fn(),
  setEventLoggerUserMock: vi.fn(),
  setEventLoggerPageMock: vi.fn(),
  logPageEnterMock: vi.fn(),
  logPageLeaveMock: vi.fn(),
  logPageVisibilityChangeMock: vi.fn(),
  syncPageFocusStateMock: vi.fn(),
  markPageInteractionMock: vi.fn(),
  flushEventQueueMock: vi.fn(),
  logSessionAbandonedMock: vi.fn(),
  writeLastStudyPathMock: vi.fn()
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname()
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "user_1" }
  })
}));

vi.mock("@/components/study/StudyProvider", () => ({
  useStudy: () => {
    throw new Error("EventLoggerProvider should not depend on study context");
  }
}));

vi.mock("@/lib/eventLogger", () => ({
  initEventLogger: initEventLoggerMock,
  setEventLoggerUser: setEventLoggerUserMock,
  setEventLoggerPage: setEventLoggerPageMock,
  logPageEnter: logPageEnterMock,
  logPageLeave: logPageLeaveMock,
  logPageVisibilityChange: logPageVisibilityChangeMock,
  syncPageFocusState: syncPageFocusStateMock,
  markPageInteraction: markPageInteractionMock,
  flushEventQueue: flushEventQueueMock,
  logSessionAbandoned: logSessionAbandonedMock,
  logEvent: vi.fn()
}));

vi.mock("@/lib/study/localData", () => ({
  writeLastStudyPath: writeLastStudyPathMock
}));

async function loadEventLoggerProvider() {
  const module = await import("@/components/research/EventLoggerProvider");
  return module.EventLoggerProvider;
}

describe("event logger provider cleanup", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/diagnose");
  });

  afterEach(() => {
    cleanup();
  });

  it("does not require study context just to mount the global event logger boundary", async () => {
    const EventLoggerProvider = await loadEventLoggerProvider();

    render(React.createElement(EventLoggerProvider, null, React.createElement("div", null, "child")));

    expect(initEventLoggerMock).toHaveBeenCalled();
    expect(setEventLoggerUserMock).toHaveBeenCalledWith("user_1");
    expect(setEventLoggerPageMock).toHaveBeenCalledWith("/diagnose");
    expect(logPageEnterMock).toHaveBeenCalledWith("/diagnose", {
      referrerRoute: null,
      sourceContext: "product_flow"
    });
  });

  it("flushes on unload without writing study-only path or abandonment state", async () => {
    const EventLoggerProvider = await loadEventLoggerProvider();

    render(React.createElement(EventLoggerProvider, null, React.createElement("div", null, "child")));
    window.dispatchEvent(new Event("beforeunload"));

    expect(flushEventQueueMock).toHaveBeenCalledWith(true);
    expect(writeLastStudyPathMock).not.toHaveBeenCalled();
    expect(logSessionAbandonedMock).not.toHaveBeenCalled();
  });
});
