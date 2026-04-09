import { shouldShowConsumerShell } from "@/lib/appMode";
import type { StudySession } from "@/types/study";

type BoundaryInput = {
  pathname: string | null | undefined;
  studyMode: boolean;
  session: StudySession | null | undefined;
  pendingStudySetup: boolean;
};

const UNGATED_CONSUMER_ROUTE_PREFIXES = ["/diagnose", "/plan"] as const;

function isUngatedConsumerCorePath(pathname: string | null | undefined) {
  if (!pathname) {
    return false;
  }

  if (pathname === "/") {
    return true;
  }

  return UNGATED_CONSUMER_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function getAppBoundaryState({ pathname, studyMode, session, pendingStudySetup }: BoundaryInput) {
  const activeStudySession = studyMode && session ? session : null;

  return {
    activeStudySession,
    isUngatedConsumerCorePath: isUngatedConsumerCorePath(pathname),
    shouldBlockForPendingStudySetup: false,
    showConsumerShell: shouldShowConsumerShell(pathname)
  };
}
