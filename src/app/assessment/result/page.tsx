"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AssessmentResult } from "@/types/assessment";
import { getDefaultAssessmentResult } from "@/lib/assessment";
import {
  readAssessmentResultFromStorage,
  writeAssessmentResultToStorage
} from "@/lib/assessmentStorage";
import { logEvent } from "@/lib/eventLogger";
import { getLatestAssessmentResult, saveAssessmentResult } from "@/lib/userData";
import { useI18n } from "@/lib/i18n/config";
import { updateLocalStudyProgress } from "@/lib/study/localData";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { ResultSummary } from "@/components/assessment/ResultSummary";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/auth/AuthProvider";
import { useStudy } from "@/components/study/StudyProvider";

type AssessmentResultSource = "loading" | "remote" | "synced" | "local";

export default function AssessmentResultPage() {
  const { user, configured, loading } = useAuth();
  const { studyMode } = useStudy();
  const { language, t } = useI18n();
  const [result, setResult] = useState<AssessmentResult>(getDefaultAssessmentResult(language));
  const [source, setSource] = useState<AssessmentResultSource>("loading");

  useEffect(() => {
    if (loading) {
      return;
    }

    let active = true;

    async function loadResult() {
      const localResult = readAssessmentResultFromStorage();
      const fallbackResult = localResult ?? getDefaultAssessmentResult(language);

      if (!studyMode && user?.id && configured) {
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
    if (source === "loading" || result.answeredCount === 0) {
      return;
    }

    logEvent("assessment_complete", {
      level: result.level,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      uncertainItems: result.observationNeeded
    });
  }, [result, source]);

  useEffect(() => {
    if (!studyMode || result.answeredCount === 0) {
      return;
    }

    updateLocalStudyProgress({
      lastVisitedPath: "/assessment/result",
      lastAssessmentPath: "/assessment/result",
      lastAssessmentLevel: result.level,
      lastAssessmentCompletedAt: new Date().toISOString()
    });
  }, [result, studyMode]);

  return (
    <PageContainer>
      <div className="space-y-5">
        <PageBreadcrumbs items={[
          { href: "/assessment", label: t("assessment.result.retry") },
          { href: "/", label: t("assessment.result.home") }
        ]} />
        {source === "loading" ? (
          <Card className="text-sm text-slate-600">{t("assessment.loading")}</Card>
        ) : null}
        <ResultSummary result={result} />
        {source !== "loading" ? (
          result.answeredCount > 0 ? (
            <div className="flex flex-wrap gap-3">
              <Link href="/diagnose" onClick={() => logEvent("cta_click", { ctaLabel: t("cta.diagnoseResult"), ctaLocation: "assessment_result", targetPage: "/diagnose" })}>
                <Button>{t("assessment.result.ctaDiagnose")}</Button>
              </Link>
              <Link href={`/library?level=${result.level}`} onClick={() => logEvent("cta_click", { ctaLabel: t("cta.viewContent"), ctaLocation: "assessment_result", targetPage: "/library" })}>
                <Button variant="secondary">{t("assessment.result.ctaLibrary")}</Button>
              </Link>
            </div>
          ) : (
            <Link href="/assessment" onClick={() => logEvent("cta_click", { ctaLabel: t("cta.completeAssessment"), ctaLocation: "assessment_result", targetPage: "/assessment" })}>
              <Button>{t("assessment.result.ctaStart")}</Button>
            </Link>
          )
        ) : null}
      </div>
    </PageContainer>
  );
}
