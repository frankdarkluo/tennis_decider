import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contents } from "@/data/contents";
import { creators } from "@/data/creators";
import { CREATOR_FEATURED_VIDEO_CHINESE_SUBTITLE_OVERRIDES } from "@/lib/content/chineseSubtitleOverrides";
import {
  formatCompactViewCount,
  getContentFocusLine,
  getContentPrimaryTitle,
  getContentSecondaryTitle,
  getEnglishGloss,
  getFeaturedVideoPrimaryTitle,
  getFeaturedVideoSecondaryTitle,
  getFeaturedVideoTarget,
  resolveFeaturedVideoChineseTitleSuggestion,
  resolveChineseSecondaryTitleForEnglishContent
} from "@/lib/content/display";
import { findBestDiagnosisRule } from "@/lib/diagnosis";
import { formatLocalizedDate, formatLocalizedDateTime } from "@/lib/i18n/format";
import { getPlanTemplate } from "@/lib/plans";
import { ContentItem } from "@/types/content";

describe("content display helpers", () => {
  it("renders an English primary title and Chinese secondary title for Bilibili items", () => {
    const item = contents.find((entry) => entry.id === "content_gaiao_02");

    expect(item).toBeTruthy();
    if (!item) {
      throw new Error("Missing content_gaiao_02");
    }

    expect(getContentPrimaryTitle(item, "en")).toBe("Serve fundamentals: build rhythm before power");
    expect(getContentSecondaryTitle(item, "en")).toContain("网球发球");
  });

  it("keeps English fallback titles free of mixed Chinese text", () => {
    const item = contents.find((entry) => entry.id === "content_gaiao_04");

    expect(item).toBeTruthy();
    if (!item) {
      throw new Error("Missing content_gaiao_04");
    }

    const gloss = getEnglishGloss(item);
    expect(gloss).toBe("Forehand topspin: start with the right grip and arc");
    expect(/[\u3400-\u9fff]/.test(gloss)).toBe(false);
  });

  it("uses the English focus-line override for prioritized study content", () => {
    const item = contents.find((entry) => entry.id === "content_fr_01");

    expect(item).toBeTruthy();
    if (!item) {
      throw new Error("Missing content_fr_01");
    }

    expect(getContentFocusLine(item, "en")).toBe(
      "For backhands that keep finding the net or making contact too late."
    );
  });

  it("keeps English focus fallbacks visible for Chinese videos without manual English copy", () => {
    const item: ContentItem = {
      id: "synthetic_focus_fallback",
      title: "中文教学标题",
      creatorId: "creator_gaiao",
      platform: "Bilibili",
      type: "video",
      levels: ["2.5"],
      skills: ["basics"],
      problemTags: ["no-clear-technique"],
      language: "zh",
      summary: "中文字幕整理型资料库，基础内容全",
      reason: "基础动作总立不住",
      useCases: ["基础动作总立不住"],
      coachReason: "",
      url: "https://example.com/focus-fallback"
    };

    expect(getContentPrimaryTitle(item, "en")).toBe("Basics lesson");
    expect(getContentFocusLine(item, "en")).toBe("For players building clean fundamentals.");
  });

  it("uses creator featured-video English title and target overrides", () => {
    const creator = creators.find((entry) => entry.id === "creator_gaiao");
    const video = creator?.featuredVideos?.find((entry) => entry.id === "creator_gaiao_video_01");

    expect(creator).toBeTruthy();
    expect(video).toBeTruthy();
    if (!creator || !video) {
      throw new Error("Missing creator_gaiao featured video");
    }

    expect(getFeaturedVideoPrimaryTitle(video, "en", creator)).toBe("Detailed beginner forehand lesson");
    expect(getFeaturedVideoSecondaryTitle(video, "en", creator)).toBe("详细版 网球正手零基础教学");
    expect(getFeaturedVideoTarget(video, "en", creator)).toBe("When your forehand foundation never feels stable");
  });

  it("generates a polished Chinese subtitle suggestion for English creator videos", () => {
    const creator = creators.find((entry) => entry.id === "creator_venus_williams");
    const video = creator?.featuredVideos?.find((entry) => entry.id === "creator_venus_williams_video_01");

    expect(creator).toBeTruthy();
    expect(video).toBeTruthy();
    if (!creator || !video) {
      throw new Error("Missing creator_venus_williams featured video");
    }

    expect(resolveFeaturedVideoChineseTitleSuggestion(video, creator)).toMatchObject({
      title: "跟维纳斯·威廉姆斯学网球基础发球",
      source: "manual"
    });
    expect(getFeaturedVideoSecondaryTitle(video, "zh", creator)).toBe("跟维纳斯·威廉姆斯学网球基础发球");
  });

  it("builds creator-video suggestions from structured title patterns like masterclass episodes", () => {
    const suggestion = resolveFeaturedVideoChineseTitleSuggestion({
      id: "synthetic_masterclass_episode",
      title: "The return of serve: TENNIS MASTERCLASS by Patrick Mouratoglou, EPISODE 1",
      target: "接发启动总是偏慢"
    }, {
      name: "Patrick Mouratoglou",
      specialties: ["return", "serve"]
    });

    expect(suggestion).toMatchObject({
      title: "接发球精讲：莫拉托格鲁大师课第1集",
      source: "title_template"
    });
  });

  it("formats view counts by locale", () => {
    expect(formatCompactViewCount(150977, "zh")).toBe("15.1万");
    expect(formatCompactViewCount(150977, "en")).toMatch(/^151K$/i);
  });

  it("formats dates and times by locale", () => {
    const value = "2025-03-01T12:00:00.000Z";

    expect(formatLocalizedDate(value, "en")).toBeTruthy();
    expect(formatLocalizedDate(value, "zh")).toContain("2025");
    expect(formatLocalizedDateTime(value, "en")).toContain("2025");
    expect(formatLocalizedDateTime(value, "zh")).toContain("2025");
  });

  it("returns localized exact plan templates without changing fallback generation", () => {
    const exactEn = getPlanTemplate("backhand-into-net", "3.0", "en");
    const exactZh = getPlanTemplate("backhand-into-net", "3.0", "zh");
    const fallbackEn = getPlanTemplate("unknown-problem", "3.0", "en");

    expect(exactEn.source).toBe("template");
    expect(exactEn.title).toBe("7-Day Backhand Net-Clearance Plan");
    expect(exactEn.target).toBe("Fix the backhand net error first by building earlier, more forward contact.");
    expect(exactEn.days[0]).toMatchObject({
      focus: "Prepare earlier",
      drills: ["20 shoulder-turn prep reps", "15 no-ball preparation reps"],
      duration: "20 min"
    });

    expect(exactZh.title).toBe("反手过网稳定性 7 天计划");
    expect(exactZh.days[0]).toMatchObject({
      focus: "更早准备",
      drills: ["转肩准备 20 次", "不击球准备动作 15 次"],
      duration: "20 分钟"
    });

    expect(fallbackEn.source).toBe("fallback");
    expect(fallbackEn.days[0].focus).toBe("Day 1 stability training");
  });

  it("matches newly added English diagnosis triggers", () => {
    expect(findBestDiagnosisRule("I do not know where to stand in doubles").rule?.problemTag).toBe("doubles-positioning");
    expect(findBestDiagnosisRule("I practice a lot but never get better").rule?.problemTag).toBe("plateau-no-progress");
    expect(findBestDiagnosisRule("My serve toss is all over the place").rule?.problemTag).toBe("serve-toss-inconsistent");
    expect(findBestDiagnosisRule("My shots keep landing short").rule?.problemTag).toBe("balls-too-short");
  });

  it("prefers hand-polished Chinese secondary titles for English content in zh mode", () => {
    const item = contents.find((entry) => entry.id === "content_ttt_01");

    expect(item).toBeTruthy();
    if (!item) {
      throw new Error("Missing content_ttt_01");
    }

    expect(getContentPrimaryTitle(item, "zh")).toBe("Simple Tennis Serve Technique Masterclass for Beginners");
    expect(getContentSecondaryTitle(item, "zh")).toBe("网球发球入门精讲");
    expect(resolveChineseSecondaryTitleForEnglishContent(item).source).toBe("manual");
  });

  it("uses the title-template layer before falling back to metadata or generic skill labels", () => {
    const item: ContentItem = {
      id: "synthetic_title_template",
      title: "How To Control Groundstroke Depth",
      creatorId: "creator_essential_tennis",
      platform: "YouTube",
      type: "video",
      levels: ["3.0"],
      skills: ["forehand"],
      problemTags: ["balls-too-short"],
      language: "en",
      summary: "适合相持里总把球打浅的球员。",
      reason: "补足底线深度控制。",
      useCases: ["相持里总落在发球线附近"],
      coachReason: "",
      url: "https://example.com/template"
    };

    expect(resolveChineseSecondaryTitleForEnglishContent(item)).toMatchObject({
      title: "底线球深度控制讲解",
      source: "title_template"
    });
  });

  it("uses the metadata layer when the English title does not map cleanly", () => {
    const item: ContentItem = {
      id: "synthetic_metadata_title",
      title: "Sharpen your timing under pressure",
      creatorId: "creator_top_tennis_training",
      platform: "YouTube",
      type: "video",
      levels: ["3.0"],
      skills: ["serve"],
      problemTags: ["serve-toss-inconsistent"],
      language: "en",
      summary: "适合抛球一乱发球动作就跟着散的球员。",
      reason: "帮助你把发球节奏重新稳定下来。",
      useCases: ["发球抛球总偏左偏右"],
      coachReason: "",
      url: "https://example.com/metadata"
    };

    expect(resolveChineseSecondaryTitleForEnglishContent(item)).toMatchObject({
      title: "发球：重点解决抛球总偏左偏右",
      source: "metadata"
    });
  });

  it("falls back to a generic skill label only after all subtitle attempts fail", () => {
    const item: ContentItem = {
      id: "synthetic_generic_title",
      title: "Tennis tips",
      creatorId: "creator_top_tennis_training",
      platform: "YouTube",
      type: "video",
      levels: ["3.0"],
      skills: ["serve"],
      problemTags: ["serve-rhythm"],
      language: "en",
      summary: "",
      reason: "",
      useCases: [""],
      coachReason: "",
      url: "https://example.com/generic"
    };

    expect(resolveChineseSecondaryTitleForEnglishContent(item)).toMatchObject({
      title: "发球技术",
      source: "generic_skill"
    });
    expect(getContentSecondaryTitle(item, "zh")).toBe("发球技术");
  });

  it("tracks videos that still need manual Chinese subtitles in the translation backlog", () => {
    const pendingContentIds = contents
      .filter((entry) => entry.language === "en" && !entry.secondaryTitleZh?.trim())
      .map((entry) => entry.id);
    const pendingFeaturedIds = creators.flatMap((creator) => (creator.featuredVideos ?? []).flatMap((video) => {
      const title = video.originalTitle?.trim() || video.sourceTitle?.trim() || video.title?.trim() || "";
      const hasCJK = /[\u3400-\u9fff]/.test(title);
      const hasLatin = /[A-Za-z]/.test(title);

      if (!hasLatin || hasCJK || video.displayTitleZh?.trim() || CREATOR_FEATURED_VIDEO_CHINESE_SUBTITLE_OVERRIDES[video.id]?.trim()) {
        return [];
      }

      return [video.id];
    }));
    const backlog = fs.readFileSync(path.join(process.cwd(), "CONTENT_TRANSLATION_BACKLOG.md"), "utf8");

    if (pendingContentIds.length === 0) {
      expect(backlog).toContain("_None right now._");
    }

    for (const id of pendingContentIds) {
      expect(backlog).toContain(id);
    }

    expect(pendingFeaturedIds.length).toBeGreaterThan(0);
    for (const id of pendingFeaturedIds.slice(0, 10)) {
      expect(backlog).toContain(id);
    }

    expect(backlog).toContain(`- Content items pending manual subtitles: ${pendingContentIds.length}`);
    expect(backlog).toContain(`- Creator featured videos pending manual subtitles: ${pendingFeaturedIds.length}`);
  });
});
