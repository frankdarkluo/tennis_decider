import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AppShellProvider, useAppShell } from "@/components/app/AppShellProvider";
import { StudyProvider, useStudy } from "@/components/study/StudyProvider";
import { createStudySession, writeActiveStudySession } from "@/lib/study/session";

function StudyProbe() {
  const study = useStudy() as unknown as Record<string, unknown>;

  return (
    <div>
      <span data-testid="loading">{String(study.loading)}</span>
      <span data-testid="study-mode">{String(study.studyMode)}</span>
      <span data-testid="language">{String(study.language)}</span>
      <span data-testid="pending-study-setup">{String(study.pendingStudySetup)}</span>
      <span data-testid="start-study-session">{typeof study.startStudySession}</span>
      <span data-testid="end-study-session">{typeof study.endStudySession}</span>
    </div>
  );
}

function AppShellProbe() {
  const appShell = useAppShell();

  return (
    <div>
      <span data-testid="app-shell-loading">{String(appShell.loading)}</span>
      <span data-testid="app-shell-study-mode">{String(appShell.studyMode)}</span>
      <span data-testid="app-shell-language">{appShell.language}</span>
      <span data-testid="app-shell-session">{appShell.activeSession?.sessionId ?? "none"}</span>
    </div>
  );
}

describe("study provider cleanup", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("does not expose pending study setup or session lifecycle once explicit study routes are removed", async () => {
    render(
      <AppShellProvider>
        <StudyProvider>
          <StudyProbe />
        </StudyProvider>
      </AppShellProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("study-mode").textContent).toBe("false");
    expect(screen.getByTestId("language").textContent).toBe("zh");
    expect(screen.getByTestId("pending-study-setup").textContent).toBe("undefined");
    expect(screen.getByTestId("start-study-session").textContent).toBe("undefined");
    expect(screen.getByTestId("end-study-session").textContent).toBe("undefined");
  });

  it("loads the active legacy session through AppShellProvider before StudyProvider compatibility is applied", async () => {
    const session = createStudySession({
      participantId: "P001",
      language: "en"
    });
    writeActiveStudySession(session);

    render(
      <AppShellProvider>
        <AppShellProbe />
      </AppShellProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("app-shell-loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("app-shell-study-mode").textContent).toBe("true");
    expect(screen.getByTestId("app-shell-language").textContent).toBe("en");
    expect(screen.getByTestId("app-shell-session").textContent).toBe(session.sessionId);
  });
});
