import { describe, expect, it } from "vitest";
import { contents } from "@/data/contents";
import { creators } from "@/data/creators";
import {
  formatCompactViewCount,
  getContentFocusLine,
  getContentPrimaryTitle,
  getContentSecondaryTitle,
  getEnglishGloss,
  getFeaturedVideoPrimaryTitle,
  getFeaturedVideoSecondaryTitle,
  getFeaturedVideoTarget
} from "@/lib/content/display";
import { getPlanTemplate } from "@/lib/plans";

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

  it("formats view counts by locale", () => {
    expect(formatCompactViewCount(150977, "zh")).toBe("15.1万");
    expect(formatCompactViewCount(150977, "en")).toMatch(/^151K$/i);
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
});
