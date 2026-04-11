"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AssessmentResult } from "@/types/assessment";
import { getDefaultAssessmentResult, getAssessmentLevelBand } from "@/lib/assessment";
import {
  readAssessmentResultFromStorage,
  writeAssessmentResultToStorage
} from "@/lib/assessmentStorage";
import { logEvent } from "@/lib/eventLogger";
import { getLatestAssessmentResult, saveAssessmentResult } from "@/lib/userData";
import { useI18n } from "@/lib/i18n/config";
import { buildAssessmentPlanContext, buildPlanHref } from "@/lib/plans";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { ResultSummary } from "@/components/assessment/ResultSummary";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/auth/AuthProvider";

type AssessmentResultSource = "loading" | "remote" | "synced" | "local";

export default function AssessmentResultPage() {
  const { user, configured, loading } = useAuth();
  const { language, t } = useI18n();
  const [result, setResult] = useState<AssessmentResult>(getDefaultAssessmentResult(language));
  const [source, setSource] = useState<AssessmentResultSource>("loading");
  const levelBand = getAssessmentLevelBand(result);
  const assessmentPlan = result.profileVector ? buildAssessmentPlanContext(result.profileVector) : null;
  const planHref = assessmentPlan
    ? buildPlanHref({
      problemTag: assessmentPlan.problemTag,
      level: levelBand ?? "3.5",
      preferredContentIds: assessmentPlan.candidateIds,
      sourceType: "assessment",
      planContext: assessmentPlan.planContext
    })
    : null;

  useEffect(() => {
    if (loading) {
      return;
    }

    let active = true;

    async function loadResult() {
      const localResult = readAssessmentResultFromStorage();
      const fallbackResult = localResult ?? getDefaultAssessmentResult(language);

      if (user?.id && configured) {
        const remoteResult = await getLatestAssessmentResult(user.id);

        if (!active) {
          return;
        }

        if (remoteResult.data) {
          setResult(remoteResult.data);
          writeAssessmentResultToStorage(remoteResult.data);
          setSource("remote");
          return;
        }

        if (localResult && localResult.answeredCount > 0) {
          const syncResult = await saveAssessmentResult(user.id, localResult);

          if (!active) {
            return;
          }

          setResult(localResult);
          setSource(syncResult.error ? "local" : "synced");
          return;
        }
      }

      setResult(fallbackResult);
      setSource("local");
    }

    void loadResult();

    return () => {
      active = false;
    };
  }, [configured, loading, user?.id]);

  useEffect(() => {
    if (source === "loading") {
      return;
    }

    logEvent("assessment_result.viewed", {
      approximateLevelBand: levelBand,
      hasResult: Boolean(result.profileVector)
    }, { page: "/assessment/result" });
  }, [levelBand, result.profileVector, source]);

  return (
    <PageContainer>
      <div className="space-y-5">
        <PageBreadcrumbs items={[
          { href: "/assessment?retake=1", label: t("assessment.result.retry") },
          { href: "/", label: t("assessment.result.home") }
        ]} />
        {source === "loading" ? (
          <Card className="text-sm text-slate-600">{t("assessment.loading")}</Card>
        ) : null}
        <ResultSummary result={result} />
        {source !== "loading" ? (
          result.profileVector ? (
            <>
              <div className="flex flex-wrap gap-3">
                {planHref ? (
                  <Link
                    href={planHref}
                    onClick={() => logEvent("assessment_result.next_action_clicked", { action: "generate_training_plan" }, { page: "/assessment/result" })}
                  >
                    <Button>{t("assessment.result.ctaPlan")}</Button>
                  </Link>
                ) : null}
                <Link
                  href="/diagnose"
                  onClick={() => logEvent("assessment_result.next_action_clicked", { action: "diagnose_specific_problem" }, { page: "/assessment/result" })}
                >
                  <Button>{t("assessment.result.ctaDiagnose")}</Button>
                </Link>
                <Link
                  href={`/library?level=${levelBand ?? "3.5"}`}
                  onClick={() => logEvent("assessment_result.next_action_clicked", { action: "browse_content" }, { page: "/assessment/result" })}
                >
                  <Button variant="secondary">{t("assessment.result.ctaLibrary")}</Button>
                </Link>
              </div>
            </>
          ) : (
            <Link
              href="/assessment?retake=1"
              onClick={() => logEvent("assessment_result.next_action_clicked", { action: "retake_assessment" }, { page: "/assessment/result" })}
            >
              <Button>{t("assessment.result.ctaStart")}</Button>
            </Link>
          )
        ) : null}
      </div>
    </PageContainer>
  );
}
