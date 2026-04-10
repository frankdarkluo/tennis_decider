import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AppShellProvider, useAppShell } from "@/components/app/AppShellProvider";

function AppShellProbe() {
  const appShell = useAppShell();

  return (
    <div>
      <span data-testid="app-shell-loading">{String(appShell.loading)}</span>
      <span data-testid="app-shell-language">{appShell.language}</span>
    </div>
  );
}

describe("app shell isolation", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("ignores leftover legacy study-session storage when hydrating the app shell", async () => {
    window.localStorage.setItem("tennislevel_study_session", JSON.stringify({
      sessionId: "study_1",
      language: "en",
      studyMode: true
    }));

    render(
      <AppShellProvider>
        <AppShellProbe />
      </AppShellProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("app-shell-loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("app-shell-language").textContent).toBe("zh");
  });

  it("keeps the default consumer-first shell state when no legacy session exists", async () => {
    render(
      <AppShellProvider>
        <AppShellProbe />
      </AppShellProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("app-shell-loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("app-shell-language").textContent).toBe("zh");
  });
});
