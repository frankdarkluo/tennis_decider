import { describe, expect, it } from "vitest";
import type { ContentItem } from "@/types/content";
import {
  buildLibraryItemsForMode,
  sortLibraryItemsForMode
} from "@/lib/library/studyOrder";
import { getStudySnapshotContents } from "@/lib/study/snapshot";

function createItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: overrides.id ?? "item_1",
    title: overrides.title ?? "Alpha",
    creatorId: overrides.creatorId ?? "creator_1",
    platform: overrides.platform ?? "YouTube",
    type: overrides.type ?? "video",
    levels: overrides.levels ?? ["3.0"],
    skills: overrides.skills ?? ["forehand"],
    problemTags: overrides.problemTags ?? [],
    language: overrides.language ?? "en",
    summary: overrides.summary ?? "summary",
    reason: overrides.reason ?? "reason",
    useCases: overrides.useCases ?? ["training"],
    url: overrides.url ?? `https://example.com/${overrides.id ?? "item_1"}`,
    ...overrides
  };
}

describe("study library ordering", () => {
  it("uses frozen snapshot contents in study mode instead of rebuilding from live library sources", () => {
    const snapshotContents = getStudySnapshotContents();

    const studyItems = buildLibraryItemsForMode({
      studyMode: true
    });

    expect(studyItems).toHaveLength(snapshotContents.length);
    expect(studyItems.map((item) => item.id)).toEqual(snapshotContents.map((item) => item.id));
    expect(studyItems.some((item) => item.id.startsWith("content_featured_"))).toBe(false);
  });

  it("keeps study ordering stable when only view counts change", () => {
    const baseItems = [
      createItem({ id: "alpha", title: "Alpha", viewCount: 10 }),
      createItem({ id: "bravo", title: "Bravo", viewCount: 1000 }),
      createItem({ id: "charlie", title: "Charlie", viewCount: 100000 })
    ];

    const changedViewCounts = baseItems.map((item, index) => ({
      ...item,
      viewCount: [900000, 50, 1][index]
    }));

    const originalOrder = sortLibraryItemsForMode(baseItems, {
      studyMode: true,
      seed: "study-seed"
    }).map((item) => item.id);
    const changedOrder = sortLibraryItemsForMode(changedViewCounts, {
      studyMode: true,
      seed: "study-seed"
    }).map((item) => item.id);

    expect(changedOrder).toEqual(originalOrder);
  });
});
