"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { logEvent } from "@/lib/eventLogger";
import { getPlanTemplate } from "@/lib/plans";
import { saveGeneratedPlan } from "@/lib/userData";
import { useI18n } from "@/lib/i18n/config";
import { persistStudyArtifact } from "@/lib/study/client";
import { updateLocalStudyProgress } from "@/lib/study/localData";
import { sanitizePlanArtifact } from "@/lib/study/privacy";
import { getStudySnapshot } from "@/lib/study/snapshot";
import { toChineseLevel } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { useStudy } from "@/components/study/StudyProvider";
import { PlanSummary } from "@/components/plan/PlanSummary";
import { DayPlanCard } from "@/components/plan/DayPlanCard";
import { Button } from "@/components/ui/Button";
import { SavedPlanSource } from "@/types/userData";
import { PlanLevel } from "@/types/plan";

function normalizeLevelParam(level: string | null): PlanLevel {
  if (level === "2.5" || level === "3.0" || level === "3.5" || level === "4.0" || level === "4.0+") {
    return level;
  }

  return "3.0";
}

function PlanPageContent() {
  const params = useSearchParams();
  const { user, configured } = useAuth();
  const { openLoginModal } = useAuthModal();
  const { studyMode, session, language } = useStudy();
  const { t } = useI18n();
  const defaultProblemTag = params.get("problemTag") ?? "no-plan";
  const defaultLevel = normalizeLevelParam(params.get("level"));

  const [problemTag, setProblemTag] = useState(defaultProblemTag);
  const [level, setLevel] = useState<PlanLevel>(defaultLevel);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const studyPersistedKeyRef = useRef<string | null>(null);

  const plan = useMemo(() => getPlanTemplate(problemTag, level, language), [language, problemTag, level]);
  const todayPlan = plan.days[0];
  const laterPlans = plan.days.slice(1);
  const sourceType: SavedPlanSource = params.get("problemTag")
    ? "diagnosis"
    : params.get("level")
      ? "assessment"
      : "default";
  const sourceLabel = params.get("problemTag") ?? params.get("level") ?? `${problemTag}:${level}`;

  const regenerate = () => {
    setLevel((prev) => (prev === "2.5" ? "3.0" : prev === "3.0" ? "3.5" : prev === "3.5" ? "4.0" : prev === "4.0" ? "4.0+" : "2.5"));
  };

  const hasSource = Boolean(params.get("problemTag") || params.get("level"));

  useEffect(() => {
    setSaveStatus("idle");
    setSaveMessage("");
  }, [level, problemTag]);

  useEffect(() => {
    if (!hasSource) {
      return;
    }

    logEvent("plan_generate", {
      sourceType,
      sourceLabel,
      level: plan.level
    });
  }, [hasSource, plan.level, sourceLabel, sourceType]);

  useEffect(() => {
    if (!studyMode || !session || !hasSource) {
      return;
    }

    const persistKey = `${session.sessionId}:${plan.problemTag}:${plan.level}:${sourceType}:${sourceLabel}`;
    if (studyPersistedKeyRef.current === persistKey) {
      return;
    }

    studyPersistedKeyRef.current = persistKey;
    updateLocalStudyProgress({
      lastVisitedPath: `/plan?problemTag=${encodeURIComponent(plan.problemTag)}&level=${encodeURIComponent(plan.level)}`,
      lastPlanHref: `/plan?problemTag=${encodeURIComponent(plan.problemTag)}&level=${encodeURIComponent(plan.level)}`,
      lastPlanTitle: plan.title,
      lastPlanProblemTag: plan.problemTag,
      lastPlanLevel: plan.level
    });

    void persistStudyArtifact(
      session,
      "plan",
      sanitizePlanArtifact(plan, {
        sourceType,
        sourceLabel,
        snapshotId: session.snapshotId,
        planTemplateVersion: getStudySnapshot().planTemplateVersion
      })
    ).then(() => {
      logEvent("study_artifact_save", { artifactType: "plan" });
      setSaveStatus("saved");
      setSaveMessage(t("plan.saveRecorded"));
    });
  }, [hasSource, plan, session, sourceLabel, sourceType, studyMode, t]);

  const handleSavePlan = async () => {
    if (studyMode && session) {
      setSaveStatus("saved");
      setSaveMessage(t("plan.saveAlreadyRecorded"));
      return;
    }

    if (!user?.id || !configured) {
      openLoginModal(t("plan.saveLogin"), "save_plan");
      return;
    }

    setSaveStatus("saving");
    setSaveMessage("");

    const saveResult = await saveGeneratedPlan(user.id, plan, sourceType, sourceLabel);

    if (saveResult.error) {
      setSaveStatus("error");
      setSaveMessage(saveResult.error);
      return;
    }

    setSaveStatus("saved");
    setSaveMessage(t("plan.saveAccount"));
    logEvent("plan_save", { planId: `${plan.problemTag}:${plan.level}` });
  };

  if (!hasSource && problemTag === "no-plan") {
    return (
      <PageContainer>
        <div className="space-y-5">
          <PageBreadcrumbs items={[
            { href: "/diagnose", label: t("plan.backDiagnosis") },
            { href: "/", label: t("plan.backHome") }
          ]} />
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white p-8 text-center">
            <p className="text-slate-700">{t("plan.empty")}</p>
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/assessment"><Button>{t("plan.assessment")}</Button></Link>
              <Link href="/diagnose"><Button variant="secondary">{t("plan.diagnose")}</Button></Link>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-5">
        <PageBreadcrumbs items={[
          { href: "/diagnose", label: t("plan.backDiagnosis") },
          { href: "/", label: t("plan.backHome") }
        ]} />
        <div>
          <h1 className="text-3xl font-black text-slate-900">{t("plan.title")}</h1>
          <p className="mt-2 text-slate-600">{t("plan.subtitle")}</p>
        </div>

        <PlanSummary
          headline={plan.summary ?? plan.target}
          supportingText={t("plan.supporting", { value: language === "en" ? plan.level : toChineseLevel(plan.level) })}
        />

        {todayPlan ? (
          <DayPlanCard
            day={todayPlan}
            isToday
            onViewDetails={(dayNumber) => logEvent("plan_view_day", { dayNumber })}
          />
        ) : null}

        {laterPlans.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">{t("plan.later")}</p>
            <div className="space-y-3">
              {laterPlans.map((day) => (
                <DayPlanCard
                  key={day.day}
                  day={day}
                  onViewDetails={(dayNumber) => logEvent("plan_view_day", { dayNumber })}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void handleSavePlan()} disabled={saveStatus === "saving" || saveStatus === "saved"}>
            {saveStatus === "saving" ? t("plan.saving") : saveStatus === "saved" ? t("plan.saved") : t("plan.save")}
          </Button>
          <Button variant="secondary" onClick={regenerate}>{t("plan.regenerate")}</Button>
        </div>
        {saveMessage ? (
          <div className={saveStatus === "error"
            ? "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            : "rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700"}
          >
            {saveMessage}
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}

export default function PlanPage() {
  const { t } = useI18n();

  return (
    <Suspense fallback={<PageContainer><p className="text-slate-600">{t("plan.loading")}</p></PageContainer>}>
      <PlanPageContent />
    </Suspense>
  );
}
