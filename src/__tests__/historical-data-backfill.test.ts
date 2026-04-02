import { describe, expect, it } from "vitest";
import { contents } from "@/data/contents";
import { creators } from "@/data/creators";
import { diagnosisRules } from "@/data/diagnosisRules";
import { expandedContents } from "@/data/expandedContents";
import { planTemplates } from "@/data/planTemplates";
import {
  CONTENT_ENGLISH_OVERRIDES,
  CREATOR_ENGLISH_OVERRIDES
} from "@/lib/content/localization";

describe("historical data backfill boundaries", () => {
  it("adds explicit environment tags to all source records", () => {
    for (const rule of diagnosisRules) {
      expect(rule.environment, `diagnosis rule ${rule.id} missing environment`).toBeTruthy();
    }

    for (const template of planTemplates) {
      expect(template.environment, `plan template ${template.problemTag}:${template.level} missing environment`).toBeTruthy();
    }

    for (const item of contents) {
      expect(item.environment, `content ${item.id} missing environment`).toBeTruthy();
    }

    for (const item of expandedContents) {
      expect(item.environment, `expanded content ${item.id} missing environment`).toBeTruthy();
    }

    for (const creator of creators) {
      expect(creator.environment, `creator ${creator.id} missing environment`).toBeTruthy();
    }
  });

  it("retires the content english override map once inline fields are backfilled", () => {
    expect(Object.keys(CONTENT_ENGLISH_OVERRIDES)).toEqual([]);

    const inlineBilingualContentCount = [...contents, ...expandedContents]
      .filter((item) => item.displayTitleEn && item.focusLineEn)
      .length;

    expect(inlineBilingualContentCount).toBeGreaterThanOrEqual(49);
  });

  it("keeps only featured-video compatibility data in creator english overrides after top-level migration", () => {
    for (const [creatorId, override] of Object.entries(CREATOR_ENGLISH_OVERRIDES)) {
      expect(
        Object.keys(override),
        `creator override ${creatorId} still has top-level bilingual fields`
      ).toEqual(["featuredVideos"]);
      expect(override.featuredVideos).toBeTruthy();
    }

    const inlineBilingualCreatorCount = creators.filter(
      (creator) => Boolean(
        creator.shortDescriptionEn
        && creator.bioEn
        && creator.suitableForEn
        && creator.suitableForEn.length > 0
      )
    ).length;

    expect(inlineBilingualCreatorCount).toBeGreaterThanOrEqual(55);
  });
});
