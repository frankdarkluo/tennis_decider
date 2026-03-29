import { describe, expect, it } from "vitest";
import type { Creator } from "@/types/creator";
import {
  buildRankingsCreatorsForMode,
  sortRankingsCreatorsForMode
} from "@/lib/rankings/studyOrder";
import { getStudySnapshotCreators } from "@/lib/study/snapshot";

function createCreator(overrides: Partial<Creator> = {}): Creator {
  return {
    id: overrides.id ?? "creator_1",
    name: overrides.name ?? "Alpha Coach",
    shortDescription: overrides.shortDescription ?? "desc",
    tags: overrides.tags ?? ["consistency"],
    region: overrides.region ?? "domestic",
    platforms: overrides.platforms ?? ["Bilibili"],
    levels: overrides.levels ?? ["3.0"],
    specialties: overrides.specialties ?? ["forehand"],
    styleTags: overrides.styleTags ?? ["clear"],
    bio: overrides.bio ?? "bio",
    suitableFor: overrides.suitableFor ?? ["beginner"],
    featuredContentIds: overrides.featuredContentIds ?? ["content_1"],
    ...overrides
  };
}

describe("study rankings ordering", () => {
  it("uses frozen snapshot creators in study mode instead of live creator data", () => {
    const snapshotCreators = getStudySnapshotCreators();

    const studyCreators = buildRankingsCreatorsForMode({
      studyMode: true
    });

    expect(studyCreators).toHaveLength(snapshotCreators.length);
    expect(studyCreators.map((creator) => creator.id)).toEqual(snapshotCreators.map((creator) => creator.id));
  });

  it("keeps study rankings order stable when recommendation counts change", () => {
    const baseCreators = [
      createCreator({ id: "alpha", name: "Alpha Coach", featuredContentIds: ["a"] }),
      createCreator({ id: "bravo", name: "Bravo Coach", featuredContentIds: ["a", "b", "c"] }),
      createCreator({ id: "charlie", name: "Charlie Coach", featuredContentIds: ["a", "b"] })
    ];

    const changedCounts = [
      createCreator({ ...baseCreators[0], featuredContentIds: ["a", "b", "c", "d"] }),
      createCreator({ ...baseCreators[1], featuredContentIds: ["a"] }),
      createCreator({ ...baseCreators[2], featuredContentIds: ["a", "b", "c", "d", "e"] })
    ];

    const originalOrder = sortRankingsCreatorsForMode(baseCreators, {
      studyMode: true,
      seed: "study-seed",
      targetLevel: "3.0"
    }).map((creator) => creator.id);
    const changedOrder = sortRankingsCreatorsForMode(changedCounts, {
      studyMode: true,
      seed: "study-seed",
      targetLevel: "3.0"
    }).map((creator) => creator.id);

    expect(changedOrder).toEqual(originalOrder);
  });
});
