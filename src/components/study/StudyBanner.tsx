"use client";

import Link from "next/link";
import { useStudy } from "@/components/study/StudyProvider";

export function StudyBanner() {
  const { studyMode, session, language } = useStudy();

  if (!studyMode || !session) {
    return null;
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
      <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold">Study mode</span>
          <span>Participant: {session.participantId}</span>
          <span>Session: {session.sessionId.slice(0, 8)}</span>
          <span>Lang: {language.toUpperCase()}</span>
          <span>Snapshot: {session.snapshotId}</span>
        </div>
        <Link href="/study/end" className="font-semibold underline underline-offset-2">
          End session
        </Link>
      </div>
    </div>
  );
}
