import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { contents } from "@/data/contents";
import { expandedContents } from "@/data/expandedContents";
import type { DiagnosisResult } from "@/types/diagnosis";
import type { VideoDiagnosisResult } from "@/types/videoDiagnosis";

const translationMap = {
  "content.targetPrefix": "针对:",
  "content.secondaryTitle": "原始标题",
  "content.subtitle.yes": "有英文字幕",
  "content.subtitle.no": "无英文字幕",
  "content.subtitle.unknown": "字幕未知",
  "content.subtitle.notNeeded": "原生英文",
  "content.lang.zh": "ZH",
  "content.lang.en": "EN",
  "content.open": "点击观看",
  "content.recommendationWhy": "为什么选这条",
  "content.recommendationTarget": "对应技术点",
  "content.recommendationTrust": "可信线索",
  "content.trust.directSource": "直链来源",
  "content.trust.searchLink": "搜索链接",
  "content.trust.teaching": "教学讲解",
  "content.trust.matchExample": "比赛案例",
  "content.trust.commentary": "讲解评论",
  "diagnose.result.badge": "诊断",
  "diagnose.result.today": "今天先记住一件事：",
  "diagnose.result.expand1": "展开看更多 ↓",
  "diagnose.result.why": "为什么会这样",
  "diagnose.result.featured": "先看这个",
  "diagnose.result.plan": "根据这个问题生成 7 步训练计划",
  "diagnose.result.library": "去内容库找更多练习",
  "diagnose.result.rankings": "去博主榜找适合的人",
  "video.result.badge": "视频诊断",
  "video.result.title": "主要问题：",
  "video.result.focus": "先改这个",
  "video.result.cautionTitle": "结果提醒",
  "video.result.expand1": "展开更多",
  "video.result.see": "看到了什么",
  "video.result.because": "为什么这样判断",
  "video.result.featured": "推荐先看",
  "video.result.plan": "生成计划",
  "video.result.planFallback": "先看通用计划",
  "video.result.expand2": "查看更多",
  "video.result.more": "更多内容",
  "video.result.creators": "推荐创作者",
  "video.result.open": "打开"
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
    loading: false,
    language: "zh",
    canChangeLanguage: false,
    setLanguage: vi.fn()
  })
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn()
}));

function getBrokenThumbnailContent() {
  const item = expandedContents.find((entry) => entry.id === "content_expanded_bilibili_creator_leontv_cn_bv1q6aseye63");

  if (!item) {
    throw new Error("Missing test content item");
  }

  return {
    ...item,
    thumbnail: "https://broken-thumbnail.example.invalid/thumb.jpg"
  };
}

function getFeaturedForehandContent() {
  const item = contents.find((entry) => entry.id === "content_cn_d_01");

  if (!item) {
    throw new Error("Missing screenshot-like forehand content item");
  }

  return item;
}

describe("diagnose recommendation thumbnail reliability", () => {
  it("renders a real thumbnail for the standard featured diagnose card when curated data includes one", async () => {
    const { DiagnoseResult } = await import("@/components/diagnose/DiagnoseResult");
    const recommendedItem = getFeaturedForehandContent();

    const result: DiagnosisResult = {
      input: "正手一发力就出界",
      normalizedInput: "正手一发力就出界",
      matchedRuleId: "rule_forehand_out",
      matchedKeywords: ["正手"],
      matchedSynonyms: [],
      matchScore: 12,
      confidence: "中等",
      effortMode: "standard",
      evidenceLevel: "high",
      needsNarrowing: false,
      narrowingPrompts: [],
      narrowingSuggestions: [],
      primaryNextStep: "先增加上旋弧线",
      problemTag: "forehand-out",
      category: ["forehand"],
      title: "正手控制不足",
      summary: "先增加上旋弧线。",
      detailedSummary: null,
      causes: ["挥拍路径太平"],
      fixes: ["先把拍头从拍后往上带"],
      drills: ["正手高过网定点击球"],
      recommendedContents: [recommendedItem],
      searchQueries: null,
      fallbackUsed: false,
      fallbackMode: null,
      level: "3.5",
      categoryConsistency: "consistent",
      categoryConflict: null,
      enrichedContext: null
    };

    render(<DiagnoseResult result={result} />);

    fireEvent.click(screen.getByRole("button", { name: "展开看更多 ↓" }));

    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src");
    expect(image.getAttribute("src")).toContain("/thumbnails/bilibili/");
    expect(screen.queryByTestId("video-thumbnail-fallback")).not.toBeInTheDocument();
  });

  it("falls back cleanly when a deep/video recommendation thumbnail fails", async () => {
    const { VideoAnalysisResult } = await import("@/components/video/VideoAnalysisResult");
    const recommendedItem = getBrokenThumbnailContent();

    const result: VideoDiagnosisResult = {
      userDescription: "我的反手不稳定",
      selectedStroke: "backhand",
      selectedScene: "match",
      observation: {
        strokeType: "backhand",
        sceneType: "match",
        bodyPosture: "稍微后仰",
        contactPoint: "偏晚",
        footwork: "到位偏慢",
        swingPath: "向上不够完整",
        overallAssessment: "反手击球点偏晚",
        keyIssues: ["击球点晚"],
        estimatedLevel: "3.5",
        confidence: 0.78
      },
      diagnosis: {
        input: "反手总打不扎实",
        normalizedInput: "反手总打不扎实",
        matchedRuleId: "rule_backhand_into_net",
        matchedKeywords: ["反手"],
        matchedSynonyms: [],
        matchScore: 12,
        confidence: "中等",
        effortMode: "deep",
        evidenceLevel: "high",
        needsNarrowing: false,
        narrowingPrompts: [],
        narrowingSuggestions: [],
        primaryNextStep: "先把反手击球点提到身前",
        problemTag: "backhand-into-net",
        category: ["backhand"],
        title: "反手稳定性不足",
        summary: "先把反手击球点提到身前。",
        detailedSummary: null,
        causes: ["击球点偏晚"],
        fixes: ["先找前点击球"],
        drills: ["慢送球反手定点击球"],
        recommendedContents: [recommendedItem],
        searchQueries: null,
        fallbackUsed: false,
        fallbackMode: null,
        level: "3.5",
        categoryConsistency: "consistent",
        categoryConflict: null,
        enrichedContext: null
      },
      primaryProblem: {
        label: "反手不稳",
        description: "反手总打不扎实",
        cause: "击球点偏晚",
        fix: "先把击球点提到身前"
      },
      secondaryProblems: [],
      recommendedContents: [recommendedItem],
      recommendedCreators: [],
      trainingPlan: {
        problemTag: "backhand-into-net",
        level: "3.5",
        overview: "先把击球点提到身前",
        days: []
      },
      searchSuggestions: [],
      confidence: 0.78,
      confidenceBand: "中等",
      chargeable: true
    };

    render(<VideoAnalysisResult result={result} />);

    fireEvent.click(screen.getByRole("button", { name: "展开更多" }));

    const image = screen.getByRole("img");
    fireEvent.error(image);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    const fallback = screen.getByTestId("video-thumbnail-fallback");
    expect(within(fallback).queryByText("正")).not.toBeInTheDocument();
    expect(within(fallback).queryByText("【")).not.toBeInTheDocument();
  });
});
