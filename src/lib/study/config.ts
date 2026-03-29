export const ACTIVE_STUDY_SESSION_KEY = "tennislevel_study_session";
export const STUDY_SESSION_HISTORY_KEY = "tennislevel_study_session_history";
export const STUDY_ARTIFACTS_KEY = "tennislevel_study_artifacts";
export const STUDY_BOOKMARKS_KEY = "tennislevel_study_bookmarks";
export const STUDY_PROGRESS_KEY = "tennislevel_study_progress";
export const STUDY_LAST_PATH_KEY = "tennislevel_study_last_path";
export const STUDY_TASK_RATINGS_KEY = "tennislevel_study_task_ratings";
export const CURRENT_STUDY_ID = "sportshci_2026_no_video_v1";

function readPublicEnv(name: string, fallback: string) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : fallback;
}

function readPublicBooleanEnv(name: string, fallback: boolean) {
  const value = process.env[name]?.trim().toLowerCase();

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return fallback;
}

export const STUDY_SNAPSHOT_VERSION = readPublicEnv("NEXT_PUBLIC_STUDY_SNAPSHOT_VERSION", "2026-03-29-v1");
export const STUDY_FIXED_SEED = readPublicEnv("NEXT_PUBLIC_STUDY_FIXED_SEED", "20260329");
export const STUDY_FREEZE_LIBRARY = readPublicBooleanEnv("NEXT_PUBLIC_STUDY_FREEZE_LIBRARY", true);
export const STUDY_FREEZE_RANKINGS = readPublicBooleanEnv("NEXT_PUBLIC_STUDY_FREEZE_RANKINGS", true);
export const STUDY_DISABLE_RANDOM_SURFACING = readPublicBooleanEnv("NEXT_PUBLIC_STUDY_DISABLE_RANDOM_SURFACING", true);
export const STUDY_DISABLE_VIEWCOUNT_BOOST = readPublicBooleanEnv("NEXT_PUBLIC_STUDY_DISABLE_VIEWCOUNT_BOOST", true);
