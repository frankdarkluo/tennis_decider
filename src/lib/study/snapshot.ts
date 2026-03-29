import {
  STUDY_DISABLE_RANDOM_SURFACING,
  STUDY_DISABLE_VIEWCOUNT_BOOST,
  STUDY_FIXED_SEED,
  STUDY_SNAPSHOT_VERSION
} from "@/lib/study/config";
import {
  studySnapshotContentsByVersion,
  studySnapshotCreatorsByVersion,
  studySnapshotMetadataByVersion
} from "@/data/studySnapshot";
import { ContentItem } from "@/types/content";
import { Creator } from "@/types/creator";
import { StudySnapshot } from "@/types/study";

function getSnapshotMetadata(version: string): StudySnapshot {
  const metadata = studySnapshotMetadataByVersion[version];

  if (!metadata) {
    throw new Error(`Unsupported study snapshot version: ${version}`);
  }

  return {
    ...metadata,
    id: metadata.id ?? version,
    seed: metadata.seed ?? STUDY_FIXED_SEED,
    buildVersion: metadata.buildVersion ?? version,
    snapshotVersion: metadata.snapshotVersion ?? version,
    fixedSeed: metadata.fixedSeed ?? STUDY_FIXED_SEED,
    randomSurfacingDisabled: STUDY_DISABLE_RANDOM_SURFACING,
    viewCountBoostDisabled: STUDY_DISABLE_VIEWCOUNT_BOOST
  };
}

export const STUDY_SNAPSHOT: StudySnapshot = getSnapshotMetadata(STUDY_SNAPSHOT_VERSION);

export function getStudySnapshot() {
  return STUDY_SNAPSHOT;
}

export function getStudySnapshotContents(): ContentItem[] {
  const contents = studySnapshotContentsByVersion[STUDY_SNAPSHOT_VERSION];

  if (!contents) {
    throw new Error(`Missing content snapshot for version: ${STUDY_SNAPSHOT_VERSION}`);
  }

  return contents;
}

export function getStudySnapshotCreators(): Creator[] {
  const creators = studySnapshotCreatorsByVersion[STUDY_SNAPSHOT_VERSION];

  if (!creators) {
    throw new Error(`Missing creator snapshot for version: ${STUDY_SNAPSHOT_VERSION}`);
  }

  return creators;
}
