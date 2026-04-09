import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { DiagnosisResult } from "@/types/diagnosis";

const translationMap = {
  "diagnose.result.badge": "你的问题是：",
  "diagnose.result.today": "今天先记住一件事：",
  "diagnose.result.expand1": "展开看更多 ↓",
  "diagnose.result.why": "为什么会这样",
  "diagnose.result.featured": "先看这个",
  "diagnose.result.plan": "根据这个问题生成 7 步训练计划",
  "diagnose.result.library": "去内容库找更多练习",
  "diagnose.result.rankings": "去博主榜找适合的人"
} as const;

function t(key: string) {
  return translationMap[key as keyof typeof translationMap] ?? key;
}

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

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: "zh",
    t
  })
}));

vi.mock("@/components/app/AppShellProvider", () => ({
  useAppShell: () => ({
    environment: "testing",
    activeSession: { sessionId: "study_1", participantId: "P001", language: "zh" },
    studyMode: true,
    loading: false,
    language: "zh",
    canChangeLanguage: false,
    setLanguage: vi.fn(),
    syncStudySession: vi.fn()
  })
}));

vi.mock("@/components/study/StudyProvider", () => ({
  useStudy: () => {
    throw new Error("deep diagnose result should not depend on useStudy");
  }
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn()
}));

describe("deep diagnose result surface", () => {
  it("keeps one diagnosis surface and adds deep-specific scene context", async () => {
    const { DiagnoseResult } = await import("@/components/diagnose/DiagnoseResult");

    const result: DiagnosisResult = {
      input: "比赛里关键分时我原地的二发容易下网，而且会发紧。",
      normalizedInput: "比赛里关键分时我原地的二发容易下网，而且会发紧。",
      matchedRuleId: "rule_second_serve_confidence",
      matchedKeywords: ["二发", "下网"],
      matchedSynonyms: [],
      matchScore: 18,
      confidence: "中等",
      effortMode: "deep",
      evidenceLevel: "high",
      needsNarrowing: false,
      narrowingPrompts: [],
      narrowingSuggestions: [],
      primaryNextStep: "先建立安全二发节奏",
      problemTag: "second-serve-reliability",
      category: ["serve"],
      title: "二发稳定性不足",
      summary: "先建立安全二发节奏。",
      detailedSummary: null,
      causes: ["关键分时节奏更容易乱"],
      fixes: ["先建立安全二发节奏"],
      drills: ["二发过网裕度练习"],
      recommendedContents: [],
      searchQueries: null,
      fallbackUsed: false,
      fallbackMode: null,
      level: "3.5",
      categoryConsistency: "consistent",
      categoryConflict: null,
      enrichedContext: {
        mode: "deep",
        sourceInput: "关键分时我的二发容易下网",
        sceneSummaryZh: "比赛里我的原地二发容易下网，而且会发紧。",
        sceneSummaryEn: "In matches my stationary second serve keeps going into the net and it feels tight.",
        skillCategory: "serve",
        skillCategoryConfidence: "high",
        problemTag: "second-serve-reliability",
        level: "3.5",
        strokeFamily: "serve",
        serveSubtype: "second_serve",
        sessionType: "match",
        pressureContext: "key_points",
        movement: "stationary",
        outcome: "net",
        incomingBallDepth: "unknown",
        subjectiveFeeling: "tight",
        unresolvedRequiredSlots: [],
        stoppedByCap: false,
        isDeepModeReady: true
      }
    };

    render(<DiagnoseResult result={result} />);

    expect(screen.getByText("深入模式")).toBeInTheDocument();
    expect(screen.getByText("深入诊断基于原始文本 + 场景还原证据。")).toBeInTheDocument();
    expect(screen.getByText("二发在关键分原地发球时容易下网，而且会发紧。")).toBeInTheDocument();
    expect(screen.getByText("为什么这次判断更具体")).toBeInTheDocument();
    expect(screen.getByText("这是关键分下的原地二发问题。")).toBeInTheDocument();
    expect(screen.getByText("场景还原保留了明确失误结果：下网。")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "生成更具体的 7 步训练计划" })).toBeInTheDocument();
  });

  it("surfaces category conflicts honestly instead of treating them like a normal diagnosis", async () => {
    const { DiagnoseResult } = await import("@/components/diagnose/DiagnoseResult");

    const result: DiagnosisResult = {
      input: "比赛里我原地的发球容易出界，而且会发紧。",
      normalizedInput: "比赛里我原地的发球容易出界，而且会发紧。",
      matchedRuleId: null,
      matchedKeywords: [],
      matchedSynonyms: [],
      matchScore: 0,
      confidence: "较低",
      effortMode: "deep",
      evidenceLevel: "low",
      needsNarrowing: true,
      narrowingPrompts: ["先补一条更具体的发球线索。"],
      narrowingSuggestions: [{
        id: "category-conflict",
        severity: "high",
        reason: "serve scene drifted into a non-serve rule match",
        nextAction: "下一条线索继续沿发球这条线补。"
      }],
      primaryNextStep: "继续收窄发球场景。",
      problemTag: "general-improvement",
      category: ["serve"],
      title: "先沿发球这条线继续收窄，再锁定诊断",
      summary: "场景还原已经把问题收在“发球”这一类，但下游规则匹配没有稳定留在这条线上。",
      detailedSummary: null,
      causes: ["Deep Mode 和下游诊断没有稳定落在同一技术类别。"],
      fixes: ["再补一条更具体的发球线索后再继续诊断。"],
      drills: [],
      recommendedContents: [],
      searchQueries: null,
      fallbackUsed: true,
      fallbackMode: null,
      level: "3.5",
      categoryConsistency: "conflict",
      categoryConflict: {
        expectedSkillCategory: "serve",
        actualProblemTag: "forehand-out",
        actualCategory: ["forehand", "control"],
        reason: "serve scene drifted into a non-serve rule match"
      },
      enrichedContext: null
    };

    render(<DiagnoseResult result={result} />);

    expect(screen.getByText("技术类别冲突")).toBeInTheDocument();
    expect(screen.getByText(/下游诊断没有稳定留在同一类/)).toBeInTheDocument();
    expect(screen.getAllByText(/serve scene drifted into a non-serve rule match/).length).toBeGreaterThan(0);
  });

  it("turns deep-mode narrowing into a real scene-reconstruction CTA instead of a static hint", async () => {
    const { DiagnoseResult } = await import("@/components/diagnose/DiagnoseResult");
    const handleResume = vi.fn();

    const result: DiagnosisResult = {
      input: "我的原地的发球发坏不太受控，而且会发紧。",
      normalizedInput: "我的原地的发球发坏不太受控，而且会发紧。",
      matchedRuleId: "rule_serve_accuracy",
      matchedKeywords: ["发球"],
      matchedSynonyms: [],
      matchScore: 2,
      confidence: "较低",
      effortMode: "deep",
      evidenceLevel: "low",
      needsNarrowing: true,
      narrowingPrompts: ["先补一条更具体的发球线索。"],
      narrowingSuggestions: [{
        id: "serve-followup",
        severity: "high",
        reason: "需要继续补发球线索",
        nextAction: "继续在场景还原里补发球专属线索。"
      }],
      primaryNextStep: "继续补发球线索。",
      problemTag: "serve-accuracy",
      category: ["serve", "control"],
      title: "先补一条关键线索，再锁定诊断",
      summary: "当前更接近发球控制方向，但证据还不够。",
      detailedSummary: null,
      causes: ["发球场景还不够完整。"],
      fixes: ["先补更具体的发球线索。"],
      drills: [],
      recommendedContents: [],
      searchQueries: null,
      fallbackUsed: false,
      fallbackMode: null,
      level: "3.5",
      categoryConsistency: "consistent",
      categoryConflict: null,
      enrichedContext: {
        mode: "deep",
        sourceInput: "我的原地的发球发坏不太受控，而且会发紧。",
        sceneSummaryZh: "比赛里我的原地发球不太受控，而且会发紧。",
        sceneSummaryEn: "In matches my stationary serve feels out of control and tight.",
        skillCategory: "serve",
        skillCategoryConfidence: "high",
        problemTag: "serve-accuracy",
        level: "3.5",
        strokeFamily: "serve",
        sessionType: "match",
        pressureContext: "key_points",
        movement: "stationary",
        outcome: "long",
        serveControlPattern: "long",
        serveMechanismFamily: "direction_control",
        unresolvedRequiredSlots: [],
        stoppedByCap: false,
        isDeepModeReady: true
      }
    };

    render(<DiagnoseResult result={result} onResumeDeepMode={handleResume} />);

    fireEvent.click(screen.getByRole("button", { name: "继续补场景线索" }));

    expect(handleResume).toHaveBeenCalledTimes(1);
  });
});
