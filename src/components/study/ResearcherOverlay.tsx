"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useStudy } from "@/components/study/StudyProvider";
import { useI18n } from "@/lib/i18n/config";
import { readLocalStudyArtifacts, readLocalStudyTaskRatings } from "@/lib/study/localData";
import { StudyTaskId } from "@/types/study";

function readOverlayFlag() {
  return process.env.NEXT_PUBLIC_ENABLE_RESEARCHER_OVERLAY?.trim().toLowerCase() === "true";
}

function getTaskIdForPath(pathname: string | null): StudyTaskId | null {
  if (!pathname) {
    return null;
  }

  if (pathname.startsWith("/diagnose")) {
    return "task_1_problem_entry";
  }

  if (pathname.startsWith("/assessment/result")) {
    return "task_2_assessment_entry";
  }

  if (
    pathname.startsWith("/plan")
    || pathname.startsWith("/profile")
    || pathname.startsWith("/library")
    || pathname.startsWith("/rankings")
  ) {
    return "task_3_action_or_revisit";
  }

  return null;
}

export function ResearcherOverlay() {
  const pathname = usePathname();
  const { session } = useStudy();
  const { t } = useI18n();

  const summary = useMemo(() => {
    if (!session || !readOverlayFlag()) {
      return null;
    }

    const taskId = getTaskIdForPath(pathname);
    const taskRatings = readLocalStudyTaskRatings();
    const artifacts = readLocalStudyArtifacts();
    const actionabilitySubmitted = taskId
      ? taskRatings.some((rating) => rating.sessionId === session.sessionId && rating.taskId === taskId)
      : false;
    const susCompleted = artifacts.some((artifact) => artifact.sessionId === session.sessionId && artifact.artifactType === "survey");

    return {
      participantId: session.participantId,
      taskId,
      language: session.language,
      snapshotVersion: session.snapshotId,
      actionabilitySubmitted,
      susCompleted
    };
  }, [pathname, session]);

  if (!summary) {
    return null;
  }

  return (
    <aside className="pointer-events-none fixed bottom-4 right-4 z-50 w-72 rounded-2xl border border-slate-200 bg-white/95 p-4 text-xs shadow-xl backdrop-blur">
      <p className="font-semibold uppercase tracking-[0.18em] text-brand-700">{t("researcherOverlay.badge")}</p>
      <dl className="mt-3 space-y-2 text-slate-700">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">{t("researcherOverlay.participantId")}</dt>
          <dd className="font-semibold text-slate-900">{summary.participantId}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">{t("researcherOverlay.taskId")}</dt>
          <dd className="font-semibold text-slate-900">{summary.taskId ?? "-"}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">{t("researcherOverlay.language")}</dt>
          <dd className="font-semibold text-slate-900">{summary.language}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">{t("researcherOverlay.snapshotVersion")}</dt>
          <dd className="font-semibold text-slate-900">{summary.snapshotVersion}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">{t("researcherOverlay.actionability")}</dt>
          <dd className={summary.actionabilitySubmitted ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>
            {summary.actionabilitySubmitted ? t("researcherOverlay.done") : t("researcherOverlay.pending")}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">{t("researcherOverlay.sus")}</dt>
          <dd className={summary.susCompleted ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>
            {summary.susCompleted ? t("researcherOverlay.done") : t("researcherOverlay.pending")}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
