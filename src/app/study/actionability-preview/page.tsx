"use client";

import { useState } from "react";
import Link from "next/link";
import { ActionabilityPrompt } from "@/components/study/ActionabilityPrompt";
import { useStudy } from "@/components/study/StudyProvider";
import { useI18n } from "@/lib/i18n/config";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function StudyActionabilityPreviewPage() {
  const { session } = useStudy();
  const { t } = useI18n();
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);

  return (
    <PageContainer>
      <div className="space-y-5">
        <PageBreadcrumbs items={[
          { href: "/study/start", label: t("study.actionability.preview.back") },
          { href: "/", label: t("assessment.result.home") }
        ]} />

        <Card className="space-y-2">
          <p className="text-sm font-semibold text-brand-700">{t("study.actionability.preview.badge")}</p>
          <h1 className="text-3xl font-black text-slate-900">{t("study.actionability.preview.title")}</h1>
          <p className="text-sm text-slate-600">{t("study.actionability.preview.body")}</p>
        </Card>

        {!session ? (
          <Card className="space-y-4">
            <p className="text-sm text-slate-600">{t("study.actionability.preview.startRequired")}</p>
            <Link href="/study/start">
              <Button>{t("study.start.button")}</Button>
            </Link>
          </Card>
        ) : (
          <>
            <ActionabilityPrompt taskId="task_1_problem_entry" onSubmitted={setSubmittedScore} />
            {submittedScore ? (
              <Card className="text-sm text-brand-700">
                {t("study.actionability.preview.saved", { value: submittedScore })}
              </Card>
            ) : null}
          </>
        )}
      </div>
    </PageContainer>
  );
}
