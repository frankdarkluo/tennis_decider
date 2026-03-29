import { describe, expect, it } from "vitest";
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

    expect(snapshot.snapshotVersion).toBe("2026-03-29-v1");
    expect(snapshot.sortingMode).toBe("deterministic_study");
    expect(contents.length).toBeGreaterThan(0);
    expect(creators.length).toBeGreaterThan(0);
    expect(snapshot.contentSetVersion).toBe(`content-${snapshot.snapshotVersion}`);
    expect(snapshot.creatorSetVersion).toBe(`creators-${snapshot.snapshotVersion}`);
  });
});
