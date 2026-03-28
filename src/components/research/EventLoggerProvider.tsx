"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useStudy } from "@/components/study/StudyProvider";
import {
  initEventLogger,
  logPageEnter,
  logPageLeave,
  setEventLoggerPage,
  setEventLoggerUser
} from "@/lib/eventLogger";
import { writeLastStudyPath } from "@/lib/study/localData";

export function EventLoggerProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { studyMode } = useStudy();

  useEffect(() => {
    initEventLogger();
  }, []);

  useEffect(() => {
    setEventLoggerUser(user?.id ?? null);
  }, [user?.id]);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    setEventLoggerPage(pathname);
    if (studyMode && pathname !== "/study/end") {
      writeLastStudyPath(pathname);
    }
    logPageEnter(pathname);

    return () => {
      logPageLeave(pathname);
    };
  }, [pathname, studyMode]);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const handleBeforeUnload = () => {
      logPageLeave(pathname);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname]);

  return children;
}
