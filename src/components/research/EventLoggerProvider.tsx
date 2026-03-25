"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  initEventLogger,
  logPageEnter,
  logPageLeave,
  setEventLoggerPage,
  setEventLoggerUser
} from "@/lib/eventLogger";

export function EventLoggerProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

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
    logPageEnter(pathname);

    return () => {
      logPageLeave(pathname);
    };
  }, [pathname]);

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
