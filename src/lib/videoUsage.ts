"use client";

const LOCAL_VIDEO_USAGE_KEY = "tennislevel-video-usage";
const FREE_VIDEO_LIMIT = 3;

export type LocalVideoUsage = {
  successCount: number;
  failedCount: number;
  isPro: boolean;
  maxFree: number;
};

const DEFAULT_USAGE: LocalVideoUsage = {
  successCount: 0,
  failedCount: 0,
  isPro: false,
  maxFree: FREE_VIDEO_LIMIT
};

export function readLocalVideoUsage(): LocalVideoUsage {
  if (typeof window === "undefined") {
    return DEFAULT_USAGE;
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_VIDEO_USAGE_KEY);
    if (!raw) {
      return DEFAULT_USAGE;
    }

    const parsed = JSON.parse(raw) as Partial<LocalVideoUsage>;
    return {
      successCount: parsed.successCount ?? 0,
      failedCount: parsed.failedCount ?? 0,
      isPro: parsed.isPro ?? false,
      maxFree: parsed.maxFree ?? FREE_VIDEO_LIMIT
    };
  } catch {
    return DEFAULT_USAGE;
  }
}

export function writeLocalVideoUsage(record: LocalVideoUsage) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCAL_VIDEO_USAGE_KEY, JSON.stringify(record));
}

export function incrementLocalVideoUsage(type: "success" | "fail") {
  const current = readLocalVideoUsage();
  const next = {
    ...current,
    successCount: current.successCount + (type === "success" ? 1 : 0),
    failedCount: current.failedCount + (type === "fail" ? 1 : 0)
  };

  writeLocalVideoUsage(next);
  return next;
}

export function getRemainingVideoTrials(record: Pick<LocalVideoUsage, "successCount" | "maxFree" | "isPro">) {
  if (record.isPro) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(0, record.maxFree - record.successCount);
}

export function getFreeVideoLimit() {
  return FREE_VIDEO_LIMIT;
}

