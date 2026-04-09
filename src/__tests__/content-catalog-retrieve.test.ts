import { afterEach, describe, expect, it, vi } from "vitest";
import type { ContentItem } from "@/types/content";
import { retrieveCatalogContentsByIds, retrieveCatalogRecommendations } from "@/lib/content-catalog/retrieve";

function createContentItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: overrides.id ?? "content_1",
    title: overrides.title ?? "Default title",
    creatorId: overrides.creatorId ?? "creator_1",
    platform: overrides.platform ?? "YouTube",
    type: overrides.type ?? "video",
    levels: overrides.levels ?? ["3.0"],
    skills: overrides.skills ?? ["serve"],
    problemTags: overrides.problemTags ?? ["serve-rhythm"],
    language: overrides.language ?? "en",
    summary: overrides.summary ?? "summary",
    reason: overrides.reason ?? "reason",
    useCases: overrides.useCases ?? ["use case"],
    coachReason: overrides.coachReason ?? "coach reason",
    url: overrides.url ?? `https://www.youtube.com/watch?v=${overrides.id ?? "content_1"}`,
    environment: overrides.environment ?? ["testing", "production"],
    ...overrides
  };
}

describe("content catalog retrieval", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("filters by environment, skill, problem, and level while preferring direct curated sources", () => {
    const directCurated = createContentItem({
      id: "direct_curated",
      creatorId: "creator_a",
      skills: ["serve"],
      problemTags: ["serve-rhythm"],
      levels: ["3.0"],
      url: "https://www.youtube.com/watch?v=directCurated"
    });
    const searchCurated = createContentItem({
      id: "search_curated",
      creatorId: "creator_b",
      skills: ["serve"],
      problemTags: ["serve-rhythm"],
      levels: ["3.0"],
      url: "https://youtube.com/results?search_query=serve+rhythm"
    });
    const directExpanded = createContentItem({
      id: "content_expanded_direct",
      creatorId: "creator_c",
      skills: ["serve"],
      problemTags: ["serve-rhythm"],
      levels: ["3.0"],
      url: "https://www.youtube.com/watch?v=expandedDirect"
    });
    const wrongSkill = createContentItem({
      id: "wrong_skill",
      skills: ["backhand"],
      problemTags: ["backhand-into-net"],
      levels: ["3.0"],
      url: "https://www.youtube.com/watch?v=wrongSkill"
    });
    const wrongEnvironment = createContentItem({
      id: "wrong_environment",
      skills: ["serve"],
      problemTags: ["serve-rhythm"],
      levels: ["3.0"],
      environment: "testing",
      url: "https://www.youtube.com/watch?v=wrongEnvironment"
    });

    const recommended = retrieveCatalogRecommendations({
      source: "diagnosis",
      contentPool: [directCurated, searchCurated, wrongSkill, wrongEnvironment],
      expandedContentPool: [directExpanded],
      environment: "production",
      skillCategories: ["serve"],
      problemTags: ["serve-rhythm"],
      level: "3.0",
      maxResults: 3
    });

    expect(recommended.map((item) => item.id)).toEqual(["direct_curated", "content_expanded_direct"]);
  });

  it("enforces the recommendation cap and keeps search links out of direct recommendation lookup", () => {
    const results = retrieveCatalogContentsByIds({
      ids: ["search_curated", "direct_a", "direct_b", "direct_c"],
      contentPool: [
        createContentItem({
          id: "search_curated",
          url: "https://search.bilibili.com/all?keyword=serve"
        }),
        createContentItem({
          id: "direct_a",
          levels: ["3.0"],
          url: "https://www.bilibili.com/video/BV1aA4111111"
        }),
        createContentItem({
          id: "direct_b",
          levels: ["3.5"],
          url: "https://www.bilibili.com/video/BV1bB4111111"
        }),
        createContentItem({
          id: "direct_c",
          levels: ["3.0"],
          url: "https://www.youtube.com/watch?v=direct_c"
        })
      ],
      level: "3.0",
      maxResults: 2
    });

    expect(results.map((item) => item.id)).toEqual(["direct_a", "direct_c"]);
  });

  it("lets diagnosis and plan call the same shared retrieval boundary", async () => {
    vi.resetModules();
    const retrieveModule = await import("@/lib/content-catalog/retrieve");
    const retrieveCatalogRecommendationsMock = vi
      .spyOn(retrieveModule, "retrieveCatalogRecommendations")
      .mockReturnValue([]);
    const retrieveCatalogContentsByIdsMock = vi
      .spyOn(retrieveModule, "retrieveCatalogContentsByIds")
      .mockReturnValue([]);

    const diagnosis = await import("@/lib/diagnosis");
    const plans = await import("@/lib/plans");

    diagnosis.getContentsByIds(["content_gaiao_01"], undefined, 3, "3.0");
    plans.buildDiagnosisPlanCandidateIds({
      problemTag: "second-serve-reliability",
      level: "3.0",
      diagnosisInput: "My second serve loses rhythm under pressure",
      maxCandidates: 5
    });

    expect(retrieveCatalogContentsByIdsMock).toHaveBeenCalledTimes(1);
    expect(retrieveCatalogRecommendationsMock).toHaveBeenCalledTimes(1);
  });
});
