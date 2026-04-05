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
  "diagnose.result.plan": "根据这个问题生成 7 天训练计划",
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

vi.mock("@/components/study/StudyProvider", () => ({
  useStudy: () => ({
    studyMode: true,
    session: null,
    language: "zh",
    loading: false
  })
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
      enrichedContext: {
        mode: "deep",
        sourceInput: "关键分时我的二发容易下网",
        sceneSummaryZh: "比赛里我的原地二发容易下网，而且会发紧。",
        sceneSummaryEn: "In matches my stationary second serve keeps going into the net and it feels tight.",
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

    fireEvent.click(screen.getByText("展开看更多 ↓"));
    expect(screen.getByRole("link", { name: "生成更具体的 7 天训练计划" })).toBeInTheDocument();
  });
});
