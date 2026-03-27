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
import { PageContainer } from "@/components/layout/PageContainer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { ResultSummary } from "@/components/assessment/ResultSummary";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/auth/AuthProvider";

type AssessmentResultSource = "loading" | "remote" | "synced" | "local";

export default function AssessmentResultPage() {
  const { user, configured, loading } = useAuth();
  const [result, setResult] = useState<AssessmentResult>(getDefaultAssessmentResult());
  const [source, setSource] = useState<AssessmentResultSource>("loading");

  useEffect(() => {
    if (loading) {
      return;
    }

    let active = true;

    async function loadResult() {
      const localResult = readAssessmentResultFromStorage();
      const fallbackResult = localResult ?? getDefaultAssessmentResult();

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

  return (
    <PageContainer>
      <div className="space-y-5">
        <PageBreadcrumbs items={[
          { href: "/assessment", label: "← 重新评估" },
          { href: "/", label: "回到首页" }
        ]} />
        {source === "loading" ? (
          <Card className="text-sm text-slate-600">正在同步你的评估记录...</Card>
        ) : null}
        <ResultSummary result={result} />
        {source !== "loading" ? (
          result.answeredCount > 0 ? (
            <div className="flex flex-wrap gap-3">
              <Link href="/diagnose" onClick={() => logEvent("cta_click", { ctaLabel: "去诊断一个具体问题", ctaLocation: "assessment_result", targetPage: "/diagnose" })}>
                <Button>去诊断一个具体问题 →</Button>
              </Link>
              <Link href={`/library?level=${result.level}`} onClick={() => logEvent("cta_click", { ctaLabel: "查看适合你的内容", ctaLocation: "assessment_result", targetPage: "/library" })}>
                <Button variant="secondary">查看适合你的内容 →</Button>
              </Link>
            </div>
          ) : (
            <Link href="/assessment" onClick={() => logEvent("cta_click", { ctaLabel: "去完成水平评估", ctaLocation: "assessment_result", targetPage: "/assessment" })}>
              <Button>去完成水平评估 →</Button>
            </Link>
          )
        ) : null}
      </div>
    </PageContainer>
  );
}
