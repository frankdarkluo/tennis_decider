import { describe, expect, it } from "vitest";
import { contents } from "@/data/contents";
import { expandedContents } from "@/data/expandedContents";
import { buildCatalogCorpus } from "@/lib/content-catalog/normalize";

describe("content catalog normalization", () => {
  it("normalizes curated and expanded corpus items into one canonical catalog shape", () => {
    const catalog = buildCatalogCorpus({
      curatedContents: contents,
      expandedContents
    });

    const curatedDirect = catalog.find((item) => item.id === "content_gaiao_01");
    const curatedSearch = catalog.find((item) => item.id === "content_zlx_02");
    const expandedDirect = catalog.find((item) => item.id === "content_expanded_bilibili_creator_austin_camp_bv1ewq8yyeii");

    expect(curatedDirect).toMatchObject({
      id: "content_gaiao_01",
      sourcePlatform: "Bilibili",
      canonicalUrl: "https://www.bilibili.com/video/BV1XM4y187mR",
      mediaType: "video",
      rightsStatus: "direct_source",
      ingestionMethod: "curated",
      skillCategories: ["forehand"],
      levelRange: ["2.5", "3.0"]
    });
    expect(curatedDirect?.qualityScore).toBeGreaterThan(0);

    expect(curatedSearch).toMatchObject({
      id: "content_zlx_02",
      rightsStatus: "search_link",
      ingestionMethod: "curated"
    });

    expect(expandedDirect).toMatchObject({
      id: "content_expanded_bilibili_creator_austin_camp_bv1ewq8yyeii",
      rightsStatus: "direct_source",
      ingestionMethod: "expanded"
    });
    expect((curatedDirect?.qualityScore ?? 0)).toBeGreaterThan(expandedDirect?.qualityScore ?? Number.POSITIVE_INFINITY);
  });
});
