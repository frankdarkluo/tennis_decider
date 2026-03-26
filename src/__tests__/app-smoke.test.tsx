import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import HomePage from "@/app/page";
import AssessmentPage from "@/app/assessment/page";
import DiagnosePage from "@/app/diagnose/page";
import VideoDiagnosePage from "@/app/video-diagnose/page";
import LibraryPage from "@/app/library/page";
import RankingsPage from "@/app/rankings/page";
import PlanPage from "@/app/plan/page";
import ProfilePage from "@/app/profile/page";
import StudyPage from "@/app/study/page";
import SurveyPage from "@/app/survey/page";
import { assessmentQuestions } from "@/data/assessmentQuestions";
import { calculateSUS } from "@/lib/survey";

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();
const mockSearchParamsAdapter = {
  get: (key: string) => mockSearchParams.get(key)
};

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

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  useSearchParams: () => mockSearchParamsAdapter
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    configured: false,
    sendMagicLink: vi.fn(),
    signOut: vi.fn()
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
}));

vi.mock("@/components/auth/AuthModalProvider", () => ({
  useAuthModal: () => ({
    openLoginModal: vi.fn(),
    closeLoginModal: vi.fn()
  }),
  AuthModalProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
}));

describe("app smoke tests", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockPush.mockReset();
    mockSearchParams = new URLSearchParams();
    window.localStorage.clear();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    consoleErrorSpy.mockRestore();
  });

  it("renders home page without crashing", () => {
    render(React.createElement(HomePage));

    expect(screen.getByText("一句话，帮你找到下一步该练什么")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders assessment page and allows stepping through all 8 questions", async () => {
    render(React.createElement(AssessmentPage));

    expect(assessmentQuestions).toHaveLength(8);
    expect(screen.getByText("1 分钟快速了解你的网球能力区间")).toBeInTheDocument();

    for (const [index, question] of assessmentQuestions.entries()) {
      expect(screen.getByText(question.question)).toBeInTheDocument();
      fireEvent.click(screen.getByText(question.options[0].label));

      if (index < assessmentQuestions.length - 1) {
        fireEvent.click(screen.getByRole("button", { name: "下一题" }));
      } else {
        fireEvent.click(screen.getByRole("button", { name: "提交评估" }));
      }
    }

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/assessment/result");
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders diagnose page with input box", async () => {
    render(React.createElement(DiagnosePage));

    expect(await screen.findByPlaceholderText(/我反手总是下网/)).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders library page and shows non-empty content list", async () => {
    render(React.createElement(LibraryPage));

    expect(await screen.findByText("内容库")).toBeInTheDocument();
    expect(screen.getByText("反手总下网：前点击球与拍面控制")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders video diagnose page without crashing", async () => {
    render(React.createElement(VideoDiagnosePage));

    expect(await screen.findByText("上传一段视频，让系统更像教练一样看你打球")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders rankings page without crashing", () => {
    render(React.createElement(RankingsPage));

    expect(screen.getByText("教学博主榜")).toBeInTheDocument();
    expect(screen.getByText("盖奥网球")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders plan page without crashing", async () => {
    mockSearchParams = new URLSearchParams("problemTag=backhand-into-net&level=3.0");

    render(React.createElement(PlanPage));

    expect(await screen.findByText("你的 7 天提升计划")).toBeInTheDocument();
    expect(screen.getByText("问题摘要")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders profile page login prompt when user is not signed in", () => {
    render(React.createElement(ProfilePage));

    expect(screen.getByText("登录后查看你的记录")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders survey page without crashing", () => {
    render(React.createElement(SurveyPage));

    expect(screen.getByText("TennisLevel 使用体验问卷")).toBeInTheDocument();
    expect(screen.getByText("Part 2：SUS 系统可用性量表")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders study page and shows consent modal on first visit", async () => {
    render(React.createElement(StudyPage));

    expect(await screen.findByText("欢迎参加 TennisLevel 用户体验测试")).toBeInTheDocument();
    expect(screen.getByText("用户体验研究知情同意书")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("calculates SUS score using the standard formula", () => {
    expect(calculateSUS([3, 3, 3, 3, 3, 3, 3, 3, 3, 3])).toBe(50);
  });
});
