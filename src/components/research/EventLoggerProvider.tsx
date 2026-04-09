"use client";

import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  flushEventQueue,
  initEventLogger,
  logEvent,
  logPageEnter,
  logPageLeave,
  logPageVisibilityChange,
  markPageInteraction,
  setEventLoggerPage,
  setEventLoggerUser,
  syncPageFocusState
} from "@/lib/eventLogger";

export function EventLoggerProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const previousPathRef = useRef<string | null>(null);

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

    const previousPath = previousPathRef.current;

    if (previousPath) {
      logPageLeave(previousPath, { nextRoute: pathname });
    }

    setEventLoggerPage(pathname);
    logPageEnter(pathname, {
      referrerRoute: previousPath ?? null,
      sourceContext: "product_flow"
    });
    previousPathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const handleVisibilityChange = () => {
      logPageVisibilityChange(pathname);
    };
    const handleFocusChange = () => {
      syncPageFocusState(pathname);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocusChange);
    window.addEventListener("blur", handleFocusChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocusChange);
      window.removeEventListener("blur", handleFocusChange);
    };
  }, [pathname]);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    let lastScrollMarkAt = 0;

    const handleInteraction = () => {
      markPageInteraction(pathname);
    };
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollMarkAt < 1000) {
        return;
      }

      lastScrollMarkAt = now;
      markPageInteraction(pathname);
    };

    window.addEventListener("pointerdown", handleInteraction, { passive: true });
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const handleBeforeUnload = () => {
      logPageLeave(pathname, { nextRoute: "unload" });
      flushEventQueue(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname]);

  useEffect(() => {
    const handleError = () => {
      logEvent("page.error", {
        errorCode: "unexpected_state",
        errorScope: "client"
      }, { page: pathname ?? "/" });
    };

    const handleRejection = () => {
      logEvent("page.error", {
        errorCode: "unhandled_rejection",
        errorScope: "client"
      }, { page: pathname ?? "/" });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, [pathname]);

  return children;
}
