import type { ContentItem } from "@/types/content";
import type { Creator } from "@/types/creator";
import type { StudySnapshot } from "@/types/study";
import contents20260329v1 from "./contents.2026-03-29-v1.json";
import creators20260331v1 from "./creators.2026-03-31-v1.json";
import metadata20260331v1 from "./metadata.2026-03-31-v1.json";

export const studySnapshotContentsByVersion: Record<string, ContentItem[]> = {
  "2026-03-29-v1": contents20260329v1 as ContentItem[],
  "2026-03-31-v1": contents20260329v1 as ContentItem[]
};

export const studySnapshotCreatorsByVersion: Record<string, Creator[]> = {
  "2026-03-31-v1": creators20260331v1 as Creator[]
};

export const studySnapshotMetadataByVersion: Record<string, StudySnapshot> = {
  "2026-03-31-v1": metadata20260331v1 as StudySnapshot
};
