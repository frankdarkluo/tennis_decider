import { StudySnapshot } from "@/types/study";

export const STUDY_SNAPSHOT: StudySnapshot = {
  id: "study-2026-03-27-a",
  seed: "tennislevel-study-seed-2026-03-27",
  buildVersion: "2026.03.27-study-a",
  contentSetVersion: "content-2026-03-27",
  creatorSetVersion: "creators-2026-03-27",
  assessmentVersion: "adaptive-assessment-v2",
  diagnosisRulesVersion: "diagnosis-rules-v1",
  planTemplateVersion: "plan-templates-v1",
  localeBundleVersion: "core-locale-v1",
  rankingStrategyVersion: "study-seeded-v1"
};

export function getStudySnapshot() {
  return STUDY_SNAPSHOT;
}

