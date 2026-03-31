"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useStudy } from "@/components/study/StudyProvider";
import { PageContainer } from "@/components/layout/PageContainer";
import { HeroSection } from "@/components/home/HeroSection";
import { HotContentSection } from "@/components/home/HotContentSection";
import { HotCreatorsSection } from "@/components/home/HotCreatorsSection";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  hasCompletedAssessmentResult,
  readAssessmentResultFromStorage,
  writeAssessmentResultToStorage
} from "@/lib/assessmentStorage";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { getLatestAssessmentResult } from "@/lib/userData";

type HomeGateState = "checking" | "study_session_required" | "assessment_required" | "ready";

export default function HomePage() {
  const { user, configured, loading } = useAuth();
  const { studyMode, session } = useStudy();
  const { t } = useI18n();
  const [gateState, setGateState] = useState<HomeGateState>("checking");

  useEffect(() => {
    if (studyMode && !session) {
      setGateState("study_session_required");
      return;
    }

    if (loading) {
      return;
    }

    let active = true;

    async function resolveGate() {
      const localResult = readAssessmentResultFromStorage();
      let hasCompletedAssessment = hasCompletedAssessmentResult(localResult);

      if (!hasCompletedAssessment && !studyMode && user?.id && configured) {
        const remoteResult = await getLatestAssessmentResult(user.id);

        if (!active) {
          return;
        }

        if (hasCompletedAssessmentResult(remoteResult.data)) {
          hasCompletedAssessment = true;
          writeAssessmentResultToStorage(remoteResult.data);
        }
      }

      if (!active) {
        return;
      }

      setGateState(hasCompletedAssessment ? "ready" : "assessment_required");
    }

    void resolveGate();

    return () => {
      active = false;
    };
  }, [configured, loading, session, studyMode, user?.id]);

  if (gateState === "checking") {
    return (
      <PageContainer>
        <Card className="mx-auto max-w-2xl text-sm text-slate-600">{t("assessment.loading")}</Card>
      </PageContainer>
    );
  }

  if (gateState === "study_session_required") {
    return (
      <PageContainer>
        <Card className="mx-auto max-w-2xl space-y-4">
          <h1 className="text-2xl font-black text-slate-900">{t("study.start.title")}</h1>
          <p className="text-sm leading-6 text-slate-600">{t("study.start.subtitle")}</p>
          <Link href="/study/start">
            <Button>{t("study.start.button")}</Button>
          </Link>
        </Card>
      </PageContainer>
    );
  }

  if (gateState === "assessment_required") {
    return (
      <PageContainer>
        <Card className="mx-auto max-w-2xl space-y-4">
          <h1 className="text-2xl font-black text-slate-900">{t("assessment.empty.title")}</h1>
          <p className="text-sm leading-6 text-slate-600">{t("assessment.empty.subtitle")}</p>
          <Link
            href="/assessment"
            onClick={() => {
              logEvent("home.entry_selected", { entryMode: "assessment" }, { page: "/" });
              logEvent("home.assessment_cta_clicked", { ctaPosition: "required_gate" }, { page: "/" });
            }}
          >
            <Button>{t("assessment.result.ctaStart")}</Button>
          </Link>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        <HeroSection />

        <div className="grid gap-5 md:grid-cols-2">
          <HotContentSection />
          <HotCreatorsSection />
        </div>

        <Link
          href="/assessment"
          className="group block"
          onClick={() => {
            logEvent("home.entry_selected", { entryMode: "assessment" }, { page: "/" });
            logEvent("home.assessment_cta_clicked", { ctaPosition: "bottom_card" }, { page: "/" });
          }}
        >
          <Card className="flex cursor-pointer flex-col items-start justify-between gap-4 transition-shadow group-hover:shadow-md md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold text-brand-700">{t("home.assessment.ctaHint")}</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">{t("home.assessment.ctaTitle")}</h3>
            </div>
            <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--line)] bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 transition group-hover:bg-slate-50">
              {t("home.assessment.ctaButton")}
            </span>
          </Card>
        </Link>
      </div>
    </PageContainer>
  );
}
