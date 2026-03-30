import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { StudyProvider } from "@/components/study/StudyProvider";
import { Header } from "@/components/layout/Header";
import { I18nProvider, useI18n } from "@/lib/i18n/config";
import { createStudySession, writeActiveStudySession } from "@/lib/study/session";

const mockUsePathname = vi.fn(() => "/");
const mockSignOut = vi.fn();
const mockOpenLoginModal = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname()
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("a", { href, ...props }, children)
}));

vi.mock("next/image", () => ({
  default: ({ priority: _priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) =>
    React.createElement("img", props)
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    configured: false,
    sendMagicLink: vi.fn(),
    signOut: mockSignOut
  })
}));

vi.mock("@/components/auth/AuthModalProvider", () => ({
  useAuthModal: () => ({
    openLoginModal: mockOpenLoginModal,
    closeLoginModal: vi.fn()
  })
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn(),
  setEventLoggerStudySession: vi.fn()
}));

vi.mock("@/lib/study/client", () => ({
  persistStudySessionEnd: vi.fn(),
  persistStudySessionStart: vi.fn()
}));

function LanguageProbe() {
  const { language, t, setLanguage } = useI18n();

  return (
    <div>
      <span data-testid="language-value">{language}</span>
      <span data-testid="translated-home">{t("nav.home")}</span>
      <button type="button" onClick={() => setLanguage("en")}>switch-to-en</button>
      <button type="button" onClick={() => setLanguage("zh")}>switch-to-zh</button>
    </div>
  );
}

describe("language switcher", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    mockSignOut.mockReset();
    mockOpenLoginModal.mockReset();
    mockUsePathname.mockReset();
    mockUsePathname.mockReturnValue("/");
  });

  afterEach(() => {
    document.documentElement.lang = "zh-CN";
  });

  it("switches the site language through the shared providers and persists it", () => {
    render(
      <StudyProvider>
        <I18nProvider>
          <LanguageProbe />
        </I18nProvider>
      </StudyProvider>
    );

    expect(screen.getByTestId("language-value").textContent).toBe("zh");
    expect(screen.getByTestId("translated-home").textContent).toBe("首页");

    fireEvent.click(screen.getByText("switch-to-en"));

    expect(screen.getByTestId("language-value").textContent).toBe("en");
    expect(screen.getByTestId("translated-home").textContent).toBe("Home");
    expect(window.localStorage.getItem("tennislevel.app_language")).toBe("en");
    expect(document.documentElement.lang).toBe("en");
  });

  it("renders zh | en buttons in the header and switches to English", () => {
    render(
      <StudyProvider>
        <I18nProvider>
          <Header />
        </I18nProvider>
      </StudyProvider>
    );

    const englishButtons = screen.getAllByRole("button", { name: "切换网站语言为英文" });
    fireEvent.click(englishButtons[0]!);

    const homeLinks = screen.getAllByRole("link", { name: "Home" });
    expect(homeLinks.length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Switch site language to Chinese" }).length).toBeGreaterThan(0);
  });

  it("keeps the study language locked when an active study session already exists", () => {
    writeActiveStudySession(createStudySession({
      participantId: "P001",
      language: "zh"
    }));

    render(
      <StudyProvider>
        <I18nProvider>
          <LanguageProbe />
        </I18nProvider>
      </StudyProvider>
    );

    expect(screen.getByTestId("language-value").textContent).toBe("zh");

    fireEvent.click(screen.getByText("switch-to-en"));

    expect(screen.getByTestId("language-value").textContent).toBe("zh");
    expect(window.localStorage.getItem("tennislevel.app_language")).toBe("zh");
  });

  it("prefers the active study session language over stale app-language storage", () => {
    window.localStorage.setItem("tennislevel.app_language", "zh");
    writeActiveStudySession(createStudySession({
      participantId: "P002",
      language: "en"
    }));

    render(
      <StudyProvider>
        <I18nProvider>
          <LanguageProbe />
        </I18nProvider>
      </StudyProvider>
    );

    expect(screen.getByTestId("language-value").textContent).toBe("en");
    expect(screen.getByTestId("translated-home").textContent).toBe("Home");
  });
});
