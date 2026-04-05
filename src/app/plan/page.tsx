"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { hasStoredCompletedAssessmentResult } from "@/lib/assessmentStorage";
import { parseEnrichedDiagnosisContext } from "@/lib/diagnose/enrichedContext";
import { logEvent } from "@/lib/eventLogger";
import { buildPlanHref, getPlanTemplate, normalizePlanDraftSnapshot, parsePlanContentIds, parsePlanContext } from "@/lib/plans";
import { saveGeneratedPlan } from "@/lib/userData";
import { useI18n } from "@/lib/i18n/config";
import { persistStudyArtifact } from "@/lib/study/client";
import { readLocalStudyPlanDraft, updateLocalStudyProgress, writeLocalStudyPlanDraft } from "@/lib/study/localData";
import { sanitizePlanArtifact } from "@/lib/study/privacy";
import { getStudySnapshot } from "@/lib/study/snapshot";
// hasStudyTaskRating removed: actionability prompt not shown on plan page
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
// ActionabilityPrompt intentionally not rendered on the plan page per product request.

function normalizeLevelParam(level: string | null): PlanLevel {
  if (level === "2.5" || level === "3.0" || level === "3.5" || level === "4.0" || level === "4.5") {
    return level;
  }

  return "3.0";
}

function PlanPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, configured } = useAuth();
  const { openLoginModal } = useAuthModal();
  const { environment, studyMode, session, language, pendingStudySetup } = useStudy();
  const { t } = useI18n();
  const [storedAssessmentExists, setStoredAssessmentExists] = useState(false);
  const restoredDraft = useMemo(() => normalizePlanDraftSnapshot(readLocalStudyPlanDraft()), []);
  const defaultProblemTag = params.get("problemTag") ?? restoredDraft?.problemTag ?? "no-plan";
  function mapReportedLevelToPlan(levelStr: string | null | undefined): string | null {
    if (!levelStr) return null;
    switch (levelStr) {
      case "below_3.0":
        return "2.5";
      case "3.0":
        return "3.0";
      case "3.5":
        return "3.5";
      case "4.0":
        return "4.0";
      case "above_4.0":
        return "4.5";
      default:
        return null;
    }
  }

  const sessionReportedLevel = studyMode && session?.background?.selfReportedLevel
    ? mapReportedLevelToPlan(session.background.selfReportedLevel)
    : null;

  const defaultLevel = normalizeLevelParam(params.get("level") ?? restoredDraft?.level ?? sessionReportedLevel ?? null);
  const preferredContentIdsParam = params.get("contentIds");
  const primaryNextStepParam = params.get("primaryNextStep");
  const planContextParam = params.get("planContext");
  const deepContextParam = params.get("deepContext");

  const [problemTag, setProblemTag] = useState(defaultProblemTag);
  const [level, setLevel] = useState<PlanLevel>(defaultLevel);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const studyPersistedKeyRef = useRef<string | null>(null);
  const preferredContentIds = useMemo(
    () => preferredContentIdsParam
      ? parsePlanContentIds(preferredContentIdsParam)
      : restoredDraft?.preferredContentIds ?? [],
    [preferredContentIdsParam, restoredDraft?.preferredContentIds]
  );
  const primaryNextStep = useMemo(() => {
    const normalized = primaryNextStepParam?.trim() ?? restoredDraft?.primaryNextStep?.trim() ?? "";
    return normalized.length > 0 ? normalized : undefined;
  }, [primaryNextStepParam, restoredDraft?.primaryNextStep]);
  const planContext = useMemo(
    () => parsePlanContext(planContextParam) ?? restoredDraft?.planContext ?? null,
    [planContextParam, restoredDraft?.planContext]
  );
  const deepContext = useMemo(
    () => parseEnrichedDiagnosisContext(deepContextParam) ?? restoredDraft?.deepContext ?? null,
    [deepContextParam, restoredDraft?.deepContext]
  );

  const plan = useMemo(
    () => getPlanTemplate(problemTag, level, language, preferredContentIds, { primaryNextStep, planContext, deepContext, environment }),
    [deepContext, environment, language, problemTag, level, preferredContentIds, primaryNextStep, planContext]
  );
  const todayPlan = plan.days[0];
  const laterPlans = plan.days.slice(1);
  const explicitSource = params.get("source") ?? restoredDraft?.sourceType ?? null;
  const sourceType: SavedPlanSource = explicitSource === "diagnosis" || explicitSource === "assessment" || explicitSource === "default"
    ? explicitSource
    : params.get("problemTag")
      ? "diagnosis"
      : params.get("level")
        ? "assessment"
        : "default";
  const sourceLabelBase = preferredContentIds.length > 0
    ? `${params.get("problemTag") ?? params.get("level") ?? `${problemTag}:${level}`}:${preferredContentIds.join(",")}`
    : params.get("problemTag") ?? params.get("level") ?? `${problemTag}:${level}`;
  const sourceLabel = primaryNextStep ? `${sourceLabelBase}::${primaryNextStep}` : sourceLabelBase;
  const planHref = useMemo(
    () => buildPlanHref({
      problemTag: plan.problemTag,
      level: plan.level,
      preferredContentIds,
      sourceType,
      primaryNextStep,
      planContext: planContext ?? undefined,
      deepContext: deepContext ?? undefined
    }),
    [deepContext, plan.level, plan.problemTag, preferredContentIds, primaryNextStep, planContext, sourceType]
  );
  const blockedByPendingStudySetup = pendingStudySetup && !session;
  useEffect(() => {
    setStoredAssessmentExists(hasStoredCompletedAssessmentResult());
  }, []);

  const blockedByAssessmentGate = !studyMode && !storedAssessmentExists;

  useEffect(() => {
    if (!blockedByPendingStudySetup) {
      return;
    }

    router.replace("/study/start");
  }, [blockedByPendingStudySetup, router]);

  useEffect(() => {
    if (!blockedByAssessmentGate) {
      return;
    }

    router.replace("/assessment");
  }, [blockedByAssessmentGate, router]);

  const regenerate = () => {
    setLevel((prev) => (prev === "2.5" ? "3.0" : prev === "3.0" ? "3.5" : prev === "3.5" ? "4.0" : prev === "4.0" ? "4.5" : "2.5"));
  };

  const hasSource = Boolean(params.get("problemTag") || params.get("level") || restoredDraft);
  const backtrackHref = sourceType === "assessment" ? "/assessment/result" : "/diagnose";
  const backtrackLabel = sourceType === "assessment" ? t("plan.backAssessment") : t("plan.backDiagnosis");

  useEffect(() => {
    setSaveStatus("idle");
    setSaveMessage("");
  }, [level, problemTag]);

  useEffect(() => {
    logEvent("plan.viewed", {
      sourceRoute: sourceType === "diagnosis" ? "/diagnose" : sourceType === "assessment" ? "/assessment/result" : null,
      problemTag: plan.problemTag,
      levelBand: plan.level
    }, { page: "/plan" });
  }, [plan.level, plan.problemTag, sourceType]);

  useEffect(() => {
    if (blockedByPendingStudySetup || blockedByAssessmentGate || !hasSource) {
      return;
    }

    logEvent("plan.generated", {
      planId: `${plan.problemTag}:${plan.level}`,
      problemTag: plan.problemTag,
      levelBand: plan.level,
      origin: sourceType === "default" ? "direct" : sourceType
    }, { page: "/plan" });
  }, [blockedByAssessmentGate, blockedByPendingStudySetup, hasSource, plan.level, plan.problemTag, sourceLabel, sourceType]);

  useEffect(() => {
    if (blockedByPendingStudySetup || blockedByAssessmentGate || !studyMode || !session || !hasSource) {
      return;
    }

    const persistKey = `${session.sessionId}:${plan.problemTag}:${plan.level}:${sourceType}:${sourceLabel}`;
    if (studyPersistedKeyRef.current === persistKey) {
      return;
    }

    studyPersistedKeyRef.current = persistKey;
    updateLocalStudyProgress({
      lastVisitedPath: planHref,
      lastPlanHref: planHref,
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
      setSaveStatus("saved");
      setSaveMessage(t("plan.saveRecorded"));
    });
  }, [blockedByAssessmentGate, blockedByPendingStudySetup, hasSource, plan, planHref, session, sourceLabel, sourceType, studyMode, t]);

  useEffect(() => {
    if (blockedByPendingStudySetup || blockedByAssessmentGate || !hasSource) {
      return;
    }

    writeLocalStudyPlanDraft({
      problemTag: plan.problemTag,
      level: plan.level,
      preferredContentIds,
      sourceType,
      primaryNextStep,
      planContext: planContext ?? undefined,
      deepContext: deepContext ?? undefined,
      updatedAt: new Date().toISOString()
    });
  }, [blockedByAssessmentGate, blockedByPendingStudySetup, deepContext, hasSource, plan.level, plan.problemTag, preferredContentIds, primaryNextStep, planContext, sourceType]);

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
    logEvent("plan.saved", { planId: `${plan.problemTag}:${plan.level}` }, { page: "/plan" });
  };

  if (blockedByPendingStudySetup || blockedByAssessmentGate) {
    return (
      <PageContainer>
        <p className="text-slate-600">{t("plan.loading")}</p>
      </PageContainer>
    );
  }

  if (!hasSource && problemTag === "no-plan") {
    return (
      <PageContainer>
        <div className="space-y-5">
          <PageBreadcrumbs items={[
            {
              href: backtrackHref,
              label: backtrackLabel,
              onClick: () => logEvent("plan.backtrack_clicked", {
                target: sourceType === "assessment" ? "assessment" : "diagnose"
              }, { page: "/plan" })
            },
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
          {
            href: backtrackHref,
            label: backtrackLabel,
            onClick: () => logEvent("plan.backtrack_clicked", {
              target: sourceType === "assessment" ? "assessment" : "diagnose"
            }, { page: "/plan" })
          },
          { href: "/", label: t("plan.backHome") }
        ]} />
        <div>
          <h1 className="text-3xl font-black text-slate-900">{t("plan.title")}</h1>
          <p className="mt-2 text-slate-600">{t("plan.subtitle")}</p>
        </div>

        <PlanSummary
          headline={primaryNextStep || plan.summary || plan.target}
          supportingText={t("plan.supporting", { value: language === "en" ? plan.level : toChineseLevel(plan.level) })}
        />

        {todayPlan ? (
          <DayPlanCard
            day={todayPlan}
            isToday
            onViewDetails={(dayNumber) => logEvent("plan.day_expanded", { dayIndex: dayNumber }, { page: "/plan" })}
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
                  onViewDetails={(dayNumber) => logEvent("plan.day_expanded", { dayIndex: dayNumber }, { page: "/plan" })}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void handleSavePlan()} disabled={saveStatus === "saving" || saveStatus === "saved"}>
            {saveStatus === "saving" ? t("plan.saving") : saveStatus === "saved" ? t("plan.saved") : t("plan.save")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              logEvent("plan.regenerated", {
                previousPlanId: `${plan.problemTag}:${plan.level}`,
                reason: "manual_regenerate"
              }, { page: "/plan" });
              regenerate();
            }}
          >
            {t("plan.regenerate")}
          </Button>
        </div>
        {(sourceType === "assessment" || (studyMode && session)) ? (
          <div className="flex flex-wrap gap-2">
            {sourceType === "assessment" ? (
              <Link
                href="/diagnose"
                onClick={() => logEvent("cta_click", {
                  ctaLabel: t("plan.nextDiagnose"),
                  ctaLocation: "plan_follow_up",
                  targetPage: "/diagnose"
                }, { page: "/plan" })}
              >
                <Button variant="secondary">{t("plan.nextDiagnose")}</Button>
              </Link>
            ) : null}
            {studyMode && session ? (
              <Link
                href="/profile"
                onClick={() => logEvent("cta_click", {
                  ctaLabel: t("plan.openProfile"),
                  ctaLocation: "plan_follow_up",
                  targetPage: "/profile"
                }, { page: "/plan" })}
              >
                <Button variant="ghost">{t("plan.openProfile")}</Button>
              </Link>
            ) : null}
          </div>
        ) : null}
        {saveMessage ? (
          <div className={saveStatus === "error"
            ? "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            : "rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700"}
          >
            {saveMessage}
          </div>
        ) : null}
        {/* ActionabilityPrompt removed from plan page per product request */}
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
