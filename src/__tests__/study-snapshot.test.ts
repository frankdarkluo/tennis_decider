import { describe, expect, it } from "vitest";
import {
  studySnapshotContentsByVersion,
  studySnapshotCreatorsByVersion,
  studySnapshotMetadataByVersion
} from "@/data/studySnapshot";
import {
  getStudySnapshot,
  getStudySnapshotContents,
  getStudySnapshotCreators
} from "@/lib/study/snapshot";

describe("study snapshot", () => {
  it("loads the current study metadata with matching content and creator snapshots", () => {
    const snapshot = getStudySnapshot();
    const contents = getStudySnapshotContents();
    const creators = getStudySnapshotCreators();
    const contentVersions = Object.keys(studySnapshotContentsByVersion).sort();
    const creatorVersions = Object.keys(studySnapshotCreatorsByVersion).sort();
    const metadataVersions = Object.keys(studySnapshotMetadataByVersion).sort();

    expect(snapshot.snapshotVersion).toBe("2026-03-31-v1");
    expect(snapshot.sortingMode).toBe("deterministic_study");
    expect(contentVersions).toEqual(creatorVersions);
    expect(contentVersions).toEqual(metadataVersions);
    expect(contentVersions).toContain("2026-03-31-v1");
    expect(contents.length).toBeGreaterThan(0);
    expect(creators.length).toBeGreaterThan(0);
    expect(snapshot.contentSetVersion).toBe(`content-${snapshot.snapshotVersion}`);
    expect(snapshot.creatorSetVersion).toBe(`creators-${snapshot.snapshotVersion}`);
  });

  it("uses the newer creator tag taxonomy in the active study snapshot", () => {
    const creators = getStudySnapshotCreators();
    const racketBrothers = creators.find((entry) => entry.id === "creator_racketbrothers");
    const fuzzyYellowBalls = creators.find((entry) => entry.id === "creator_fuzzy_yellow_balls");

    expect(racketBrothers?.tags).toEqual(["网前专修", "实战拆解", "讲解透彻"]);
    expect(fuzzyYellowBalls?.tags).toEqual(["战术拆局", "实战拆解", "进阶突破"]);
  });
});
