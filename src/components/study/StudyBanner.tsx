"use client";

import Link from "next/link";
import { useStudy } from "@/components/study/StudyProvider";
import { useI18n } from "@/lib/i18n/config";

export function StudyBanner() {
  const { studyMode, session, language } = useStudy();
  const { t } = useI18n();

  if (!studyMode || !session) {
    return null;
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
      <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold">{t("study.banner.badge")}</span>
          <span>{t("study.banner.participant")}: {session.participantId}</span>
          <span>{t("study.banner.session")}: {session.sessionId.slice(0, 8)}</span>
          <span>{t("study.banner.language")}: {language.toUpperCase()}</span>
          <span>{t("study.banner.snapshot")}: {session.snapshotId}</span>
        </div>
        <Link href="/study/end" className="font-semibold underline underline-offset-2">
          {t("study.banner.end")}
        </Link>
      </div>
    </div>
  );
}
